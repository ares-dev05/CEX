import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import Spinner from './Spinner'
import {
  orderBookSelector,
  orderBookLoadedSelector,
  exchangeSelector,
  accountSelector,
  etherBalanceSelector,
  tokenBalanceSelector,
  orderFillingSelector,
  tokenSelector
} from '../store/selectors'
import interactions from "../store/interactions";
import { db } from "./firebase/firebase";


var selchild = [];
var buychild = [];
const renderOrder = (order, props, type, keys) => {
  let id = props.id;
  let red_id = '';
  let green_id = '';
  if (order.tokenAmount >= 1 && order.tokenAmount <= 100) {
    red_id = ''
    green_id = ''
  }
  if (order.tokenAmount > 100 && order.tokenAmount <= 200) {
    red_id = '-5'
    green_id = '-5'
  }
  if (order.tokenAmount > 200 && order.tokenAmount <= 300) {
    red_id = '-8'
    green_id = '-8'
  }
  if (order.tokenAmount > 300 && order.tokenAmount <= 400) {
    red_id = '-10'
    green_id = '-10'
  }
  if (order.tokenAmount > 400 && order.tokenAmount <= 500) {
    red_id = '-20'
    green_id = '-20'
  }
  if (order.tokenAmount > 500 && order.tokenAmount <= 600) {
    red_id = '-40'
    green_id = '-40'
  }
  if (order.tokenAmount > 600 && order.tokenAmount <= 700) {
    red_id = '-60'
    green_id = '-60'
  }
  if (order.tokenAmount > 700) {
    red_id = '-80'
    green_id = '-80'
  }
  const { fillOrder } = !interactions[id] ? interactions["mbappe"] : interactions[id];
  const { dispatch, exchange, token, account, tokenBalance, etherBalance } = props
  return (
    <OverlayTrigger
      key={order.id}
      placement='auto'
      overlay={
        <Tooltip id={order.id}>
          {`Click here to ${type}`}
        </Tooltip>
      }
    >
      {
        type === "buy" ? <tr
          key={order.id}
          onClick={(e) => fillaction(type, order.tokenAmount, order.tokenPrice, account)}
          className={`red-bg${red_id}`}>
          <td className="red">{order.tokenAmount}</td>
          <td className="red">{order.tokenPrice}</td>
          <td className="red">{eval(order.etherAmount.toFixed(3))}</td>
          <td className="red">{order.tokenCount}</td>
        </tr> : <tr
          key={order.id}
          onClick={(e) => fillaction(type, order.tokenAmount, order.tokenPrice, account)}
          className={`green-bg${green_id}`}>
          <td className="green">{order.tokenAmount}</td>
          <td className="green">{order.tokenPrice}</td>
          <td className="green">{eval(order.etherAmount.toFixed(3))}</td>
          <td>{order.tokenCount}</td>
        </tr>
      }
    </OverlayTrigger>
  )
}
const fillaction = async (type, tamount, tprice, account) => {
  var flags = 1;
  await db.collection('fill').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        flags = doc.data().flag;
      });
    })
  if (flags == 1) {
    flags = 0
    db.collection('fill').doc(account).set({
      ordertype: type,
      price: tprice,
      amount: tamount,
      flag: flags
    })
  } else {
    flags = 1
    db.collection('fill').doc(account).set({
      ordertype: type,
      price: tprice,
      amount: tamount,
      flag: flags
    })
  }
}
const showOrderBook = (props) => {
  var sellord = props.orderBook.sellOrders;
  var buyord = props.orderBook.buyOrders;
  selchild = [];
  buychild = [];
  for (var i = 0; i < sellord.length; i++) {
    var amount = 0;
    var ethamount = 0;
    var cnt = 0;
    var flag = false;
    for (var j = i; j < sellord.length; j++) {
      if (sellord[i].tokenPrice == sellord[j].tokenPrice) {
        ethamount += sellord[j].etherAmount;
        amount += sellord[j].tokenAmount
        cnt++;
      }
    }
    for (var k = 0; k < selchild.length; k++) {
      if (sellord[i].tokenPrice == selchild[k].tokenPrice) {
        flag = true;
        break;
      }
    }
    if (flag) continue;
    selchild.push({ tokenAmount: amount, etherAmount: ethamount, tokenPrice: sellord[i].tokenPrice, tokenCount: cnt })
    selchild.sort(function (x, y) {
      return y.tokenAmount - x.tokenAmount;
    });
  }
  for (var i = 0; i < buyord.length; i++) {
    var bamount = 0;
    var bethamount = 0;
    var bcnt = 0;
    var bflag = false;
    for (var j = i; j < buyord.length; j++) {
      if (buyord[i].tokenPrice == buyord[j].tokenPrice) {
        bethamount += buyord[j].etherAmount;
        bamount += buyord[j].tokenAmount
        bcnt++;
      }
    }
    for (var k = 0; k < buychild.length; k++) {
      if (buyord[i].tokenPrice == buychild[k].tokenPrice) {
        bflag = true;
        break;
      }
    }
    if (bflag) continue;
    buychild.push({ tokenAmount: bamount, etherAmount: bethamount, tokenPrice: buyord[i].tokenPrice, tokenCount: bcnt })
    buychild.sort(function (x, y) {
      return x.tokenAmount - y.tokenAmount;
    });
  }


  const { orderBook } = props
  return (
    <tbody>
      {selchild.map((order, key) => renderOrder(order, props, "buy", key))}
      <tr>
        <th>DAPP</th>
        <th>DAPP/ETH</th>
        <th>ETH</th>
        <th>count</th>
      </tr>
      {buychild.map((order, key) => renderOrder(order, props, "sell", key))}
    </tbody>
  )
}
class OrderBook extends Component {
  render() {
    return (
      <div className=" order-book mb15">
        <h2 className="heading">Order Book</h2>
        <table className="table">
          {this.props.showOrderBook ? showOrderBook(this.props) : <Spinner type='table' />}
        </table>
      </div>
    )
  }
}
function mapStateToProps(state) {
  const orderBookLoaded = orderBookLoadedSelector(state)
  const orderFilling = orderFillingSelector(state)

  return {
    tokenBalance: tokenBalanceSelector(state),
    orderBook: orderBookSelector(state),
    etherBalance: etherBalanceSelector(state),
    token: tokenSelector(state),
    showOrderBook: orderBookLoaded && !orderFilling,
    exchange: exchangeSelector(state),
    account: accountSelector(state)
  }
}
export default connect(mapStateToProps)(OrderBook);