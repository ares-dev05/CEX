import Web3 from 'web3'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Exchanges from "../store/exchanges";
import Tokens from "../store/tokens";
import { ETHER_ADDRESS } from '../helpers'
import { db } from "./firebase/firebase";


class Recentall extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transaction: [],
    }
    this.showmyRecent = this.showmyRecent.bind(this);
  }

  showmyRecent = async (props) => {
    let { transaction } = this.state;
    transaction = [];
    for (let i = 0; i < props.id.length; i++) {
      let exchangeName = 'exchange';
      let id = Object.entries(Exchanges)[i][0];
      exchangeName = Object.entries(Tokens)[i][0]
      const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
      const networkId = await web3.eth.net.getId();
      const exchange = Exchanges[id];
      const simpleExchange = new web3.eth.Contract(exchange.default.abi, exchange.default.networks[networkId].address)
      // Fetch filled orders with the "Trade" event stream
      const tradeStream = await simpleExchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
      // Format filled orders
      const filledOrders = tradeStream.map((event) => event.returnValues)
      for (let j = 0; j < filledOrders.length; j++) {
        transaction.push({ recent: filledOrders[j], name: exchangeName });
      }
    }
    await transaction.sort(function (x, y) {
      return y.recent.timestamp - x.recent.timestamp;
    });
    this.setState({ transaction });
  }
  componentDidMount() {
    db.collection('stateRealtime').doc('changeState').onSnapshot((snap) => {
      this.showmyRecent(this.props);
    })
    this.showmyRecent(this.props);
  }
  render() {
    let { transaction } = this.state;
    return (
      <>
        {transaction.length > 0 &&
          <>
            <tbody>
              {transaction.map((obj, key) => (
                key <= 100 && <tr className={`order-${obj.name}`} key={obj.name}>
                  <td >{obj.name}</td>
                  <td >{new Date(obj.recent.timestamp * 1000).toLocaleDateString("en-US")}</td>
                  {obj.recent.tokenGive == ETHER_ADDRESS ? <td >{obj.recent.amountGive / obj.recent.amountGet}</td> : <td >{obj.recent.amountGet / obj.recent.amountGive}</td>}
                  {obj.recent.tokenGive == ETHER_ADDRESS ? <td >{obj.recent.amountGet / (10 ** 18)}</td> : <td >{obj.recent.amountGive / (10 ** 18)}</td>}
                </tr>
              )
              )}
            </tbody>
          </>
        }
      </>
    )
  }
}
function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps)(Recentall);
