import Web3 from 'web3'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Exchanges from "../store/exchanges";
import Tokens from "../store/tokens";
import { ETHER_ADDRESS } from '../helpers';
import { db } from "./firebase/firebase";

class HistoryOrderIPO extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myOpenOrders: [],
    }
    this.showMyOpenOrders = this.showMyOpenOrders.bind(this);
  }
  showMyOpenOrders = async (props) => {
    let { myOpenOrders } = this.state;
    myOpenOrders = [];
    let i = 0, j = 0, k = 0;
    for (k = 0; k < props.id.length; k++) {
      let cancelorderId = [];
      let fillorderId = [];
      let exchangeName = 'exchamgeName';
      let id = Object.entries(Exchanges)[k][0];
      exchangeName = (Object.entries(Tokens)[k][0])
      const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
      const networkId = await web3.eth.net.getId();
      const exchange = Exchanges[id];
      const simpleExchange = new web3.eth.Contract(exchange.default.abi, exchange.default.networks[networkId].address)
      // Fetch cancelled orders with the "Cancel" event stream
      const cancelStream = await simpleExchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
      // Format cancelled orders
      const cancelledOrders = cancelStream.map((event) => event.returnValues)
      for (i = 0; i < cancelledOrders.length; i++) {
        cancelorderId.push(cancelledOrders[i].id);
      }
      // Fetch filled orders with the "Trade" event stream
      const tradeStream = await simpleExchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
      // Format filled orders
      const filledOrders = tradeStream.map((event) => event.returnValues)
      for (i = 0; i < filledOrders.length; i++) {
        fillorderId.push(filledOrders[i].id);
      }
      // Load order stream
      const orderStream = await simpleExchange.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest' })
      // Format order stream
      const allOrders = orderStream.map((event) => event.returnValues)
      for (i = 0; i < allOrders.length; i++) {
        var openOrderflag = false;
        for (j = 0; j < cancelorderId.length; j++) {
          if (allOrders[i].id === cancelorderId[j]) {
            openOrderflag = true;
          }
        }
        for (j = 0; j < fillorderId.length; j++) {
          if (allOrders[i].id === fillorderId[j]) {
            openOrderflag = true;
          }
        }
        if (openOrderflag) {
          continue;
        } else {
          myOpenOrders.push({ order: allOrders[i], name: exchangeName });
        }
      }
    }
    await myOpenOrders.sort(function (x, y) {
      return y.order.timestamp - x.order.timestamp;
    });
    this.setState({ myOpenOrders });
  }

  componentDidMount() {

    db.collection('stateRealtime').doc('changeState').onSnapshot((snap) => {
      this.showMyOpenOrders(this.props);
    })
    this.showMyOpenOrders(this.props);
  }
  render() {
    let { myOpenOrders } = this.state;
    return (
      <>
        {
          myOpenOrders.length > 0 ? <>
            {
              myOpenOrders.map((obj, key) => (
                <ul className="d-flex justify-content-between market-order-item" key=''>
                  <li className="amount-type" ><a href={`/players/${obj.name}`}>{obj.name}</a></li>
                  <li className="amount-type" >{new Date(obj.order.timestamp * 1000).toLocaleDateString("en-US")}</li>
                  {obj.order.tokenGive === ETHER_ADDRESS ? <li className="amount-type" >"Buy"</li> : <li className="amount-type" >"Sell"</li>}
                  {obj.order.tokenGive === ETHER_ADDRESS ? <li className="amount-type" >{obj.order.amountGive / obj.order.amountGet}</li> : <li className="amount-type" >{obj.order.amountGet / obj.order.amountGive}</li>}
                  {obj.order.tokenGive === ETHER_ADDRESS ? <li className="amount-type" >{obj.order.amountGet / (10 ** 18)}</li> : <li className="amount-type" >{obj.order.amountGive / (10 ** 18)}</li>}
                </ul>
              ))
            }
          </> : <div className='green'>No Open Order</div>
        }
      </>
    )
  }
}
function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps)(HistoryOrderIPO);
