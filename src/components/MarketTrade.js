import React, { Component, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import {
  exchangeSelector,
  tokenSelector,
  orderBookSelector,
  tokenBalanceSelector,
  accountSelector,
  etherBalanceSelector,
  web3Selector,
  buyOrderSelector,
  sellOrderSelector
} from '../store/selectors'
import {
  buyOrderAmountChanged,
  buyOrderPriceChanged,
  sellOrderAmountChanged,
  sellOrderPriceChanged,
} from '../store/actions'
import { db } from "./firebase/firebase";
import interactions from "../store/interactions";
import { Tabs, Tab } from 'react-bootstrap';
import Swal from 'sweetalert2'


const ShowForm = (props) => {
  const {
    dispatch,
    buyOrder,
    exchange,
    token,
    web3,
    account,
    sellOrder,
    showBuyTotal,
    showSellTotal,
    tokenBalance,
    etherBalance
  } = props
  const [ethAmount, setEthAmount] = useState("");
  const [ethPrice, setEthPrice] = useState("");

  const [sellethAmount, setsellEthAmount] = useState("");
  const [sellethPrice, setsellEthPrice] = useState("");

  const [methAmount, msetEthAmount] = useState("");
  const [methPrice, msetEthPrice] = useState("");

  const [msellethAmount, msetsellEthAmount] = useState("");
  const [msellethPrice, msetsellEthPrice] = useState("");

  const onbuyChangeEthAmount = (e) => {
    dispatch(buyOrderAmountChanged(e.target.value))
    setEthAmount(e.target.value);
  }

  const onbuyChangeEthPrice = (e) => {
    dispatch(buyOrderPriceChanged(e.target.value))
    setEthPrice(e.target.value);
  }
  const onsellChangeEthAmount = (e) => {
    dispatch(sellOrderAmountChanged(e.target.value))
    setsellEthAmount(e.target.value);
  }

  const onsellChangeEthPrice = (e) => {
    dispatch(sellOrderPriceChanged(e.target.value))
    setsellEthPrice(e.target.value);
  }

  const onbuyChangeEthAmountMarket = (e) => {
    dispatch(buyOrderAmountChanged(e.target.value))
    msetEthAmount(e.target.value);
    var minprice=0;
    if(props.orderBook.sellOrders.length>0){
      var minprice =props.orderBook.sellOrders[0].tokenPrice;
    }else{
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Retry to type limit amount. Can't use price 0!",
      });
      return;
    }
    for (var i=0;i<props.orderBook.sellOrders.length;i++){
        if(minprice>props.orderBook.sellOrders[i].tokenPrice){
          minprice=props.orderBook.sellOrders[i].tokenPrice
        }
    }
    dispatch(buyOrderPriceChanged(minprice))
    msetEthPrice(minprice);
  }
    const onsellChangeEthAmountMarket = (e) => {
    dispatch(sellOrderAmountChanged(e.target.value))
    msetsellEthAmount(e.target.value);
    var maxprice =0;
    if(props.orderBook.buyOrders>0){
      maxprice =props.orderBook.sellOrders[0].tokenPrice;
    }else{
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Retry to type limit amount. Can't use price 0!",
      })
      return;
    }
    for (var i=0;i<props.orderBook.buyOrders.length;i++){
        if(maxprice<props.orderBook.buyOrders[i].tokenPrice){
          maxprice=props.orderBook.buyOrders[i].tokenPrice
        }
    }
    dispatch(sellOrderPriceChanged(maxprice))
    msetsellEthPrice(maxprice);
  }
  useEffect(() => {
    db.collection('fill').doc(account).onSnapshot((snap) => {
      if (snap.data()) {
        let { price, amount, ordertype } = snap.data();
        if (ordertype == "buy") {
          if (ethPrice !== price) {
            dispatch(buyOrderPriceChanged(price))
            setEthPrice(price);
            db.collection('fill').doc(account).set({
              ordertype: 0,
              price: 0,
              amount: 0,
              flag: 0
            })
          }
          if (ethAmount !== amount) {
            dispatch(buyOrderAmountChanged(amount))
            setEthAmount(amount);
            db.collection('fill').doc(account).set({
              ordertype: 0,
              price: 0,
              amount: 0,
              flag: 0
            })
          }
        }
        if (ordertype == "sell") {
          if (sellethAmount !== price) {
            dispatch(sellOrderPriceChanged(price))
            setsellEthPrice(price);
            db.collection('fill').doc(account).set({
              ordertype: 0,
              price: 0,
              amount: 0,
              flag: 0
            })
          }
          if (sellethPrice !== amount) {
            dispatch(sellOrderAmountChanged(amount))
            setsellEthAmount(amount);
            db.collection('fill').doc(account).set({
              ordertype: 0,
              price: 0,
              amount: 0,
              flag: 0
            })
          }
        }
      }
    })
  }, []);

  let id = props.id;
  const { makeBuyOrder, makeSellOrder} = !interactions[id] ? interactions["mbappe"] : interactions[id];
  return (
    <Tabs defaultActiveKey="limit">
      <Tab eventKey="limit" title="Limit">
        <div className="d-flex justify-content-between">
          <div className="market-trade-buy">
            <form action="#" onSubmit={(event) => {
              event.preventDefault(id)
              makeBuyOrder(dispatch, exchange, token, web3, buyOrder, account, tokenBalance, etherBalance, props.orderBook.sellOrders,id)
            }}>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  onChange={(e) => onbuyChangeEthPrice(e)}
                  placeholder="Price"
                  value={ethPrice}
                  required
                />
                <div className="input-group-append">
                  <span className="input-group-text">Price</span>
                </div>
              </div>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  onChange={(e) => onbuyChangeEthAmount(e)}
                  value={ethAmount}
                  required
                />
                <span className="input-group-text">Amount</span>
              </div>

              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Total"
                  value={ethPrice * ethAmount}
                  required
                />
                <span className="input-group-text">TOTAL</span>
              </div>
              <button type="submit" className="btn buy">
                Buy
              </button>
            </form>
          </div>
          <div className="market-trade-sell">
            <form action="#" onSubmit={(event) => {
              event.preventDefault()
              makeSellOrder(dispatch, exchange, token, web3, sellOrder, account, tokenBalance, etherBalance, props.orderBook.buyOrders,id)
            }}>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Price"
                  value={sellethPrice}
                  onChange={(e) => onsellChangeEthPrice(e)}
                  required
                />
                <div className="input-group-append">
                  <span className="input-group-text">Price</span>
                </div>
              </div>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={sellethAmount}
                  onChange={(e) => onsellChangeEthAmount(e)}
                  required
                />
                <span className="input-group-text">Amount</span>
              </div>

              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Total"
                  value={sellethAmount * sellethPrice}
                  required
                />
                <span className="input-group-text">TOTAL</span>
              </div>
              <button type="submit" className="btn sell">Sell</button>
            </form>
          </div>
        </div>
      </Tab>
      <Tab eventKey="market" title="Market">
        <div className="d-flex justify-content-between">
          <div className="market-trade-buy">
            <form action="#" onSubmit={(event) => {
              event.preventDefault()
              makeBuyOrder(dispatch, exchange, token, web3, buyOrder, account, tokenBalance, etherBalance, props.orderBook.sellOrders,id)
            }}>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  onChange={(e) => onbuyChangeEthAmountMarket(e)}
                  value={methAmount}
                  required
                />
                <span className="input-group-text">SHARES</span>
              </div>

              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Total"
                  value={methPrice * methAmount}
                  required
                />
                <span className="input-group-text">TOTAL</span>
              </div>
              <button type="submit" className="btn buy">
                Buy
              </button>
            </form>
          </div>
          <div className="market-trade-sell">
            <form action="#" onSubmit={(event) => {
              event.preventDefault()
              makeSellOrder(dispatch, exchange, token, web3, sellOrder, account, tokenBalance, etherBalance, props.orderBook.buyOrders,id)
            }}>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={msellethAmount}
                  onChange={(e) => onsellChangeEthAmountMarket(e)}
                  required
                />
                <span className="input-group-text">SHARES</span>
              </div>

              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Total"
                  value={msellethAmount * msellethPrice}
                  required
                />
                <span className="input-group-text">TOTAL</span>
              </div>
              <button type="submit" className="btn sell">Sell</button>
            </form>
          </div>
        </div>
      </Tab>
    </Tabs>
  )
}

class MarketTrade extends Component {
  render() {

    return (
      <>
        <div className="market-trade">
          {this.props.showForm ? <ShowForm {...this.props}></ShowForm> : <Spinner />}
        </div>
      </>
    );
  }
}
function mapStateToProps(state) {
  const buyOrder = buyOrderSelector(state)
  const sellOrder = sellOrderSelector(state)

  return {
    tokenBalance: tokenBalanceSelector(state),
    account: accountSelector(state),
    exchange: exchangeSelector(state),
    etherBalance: etherBalanceSelector(state),
    token: tokenSelector(state),
    web3: web3Selector(state),
    orderBook: orderBookSelector(state),
    buyOrder,
    sellOrder,
    showForm: !buyOrder.making && !sellOrder.making,
    showBuyTotal: buyOrder.amount && buyOrder.price,
    showSellTotal: sellOrder.amount && sellOrder.price
  }
}

export default connect(mapStateToProps)(MarketTrade)