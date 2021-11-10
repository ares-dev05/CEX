import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import {
  myFilledOrdersLoadedSelector,
  myFilledOrdersSelector,
  myOpenOrdersLoadedSelector,
  myOpenOrdersSelector,
  exchangeSelector,
  accountSelector,
  tokenSelector,
  orderCancellingSelector
} from '../store/selectors'
import interactions from "../store/interactions";



const showMyFilledOrders = (props) => {
  const { myFilledOrders } = props
  return (
    <>
      {myFilledOrders.map((order) => {
        return (
          <ul className="d-flex justify-content-between market-order-item" key={order.id}>
            <li >{order.formattedTimestamp}</li>
            <li>{order.orderType}</li>
            <li >{order.tokenPrice}</li>
            <li >{order.orderSign}{order.tokenAmount}</li>
          </ul>
        )
      })}
    </>
  )
}

const showMyOpenOrders = (props) => {
  const { myOpenOrders, dispatch, exchange, account, token } = props
  let id = props.id;
  console.log("this is props===>",props)
  const { cancelOrder } = !interactions[id] ? interactions["mbappe"] : interactions[id];
  return (
    <>
      {myOpenOrders.map((order) => {
        return (
          <ul className="d-flex justify-content-between market-order-item" key={order.id}>
            <li className="amount-type"  >{order.formattedTimestamp}</li>
            <li>{order.orderType}</li>
            <li >{order.tokenPrice}</li>
            <li >{order.orderSign}{order.tokenAmount}</li>
            <button style={{border: 'none', outline: 'none'}}
              className="text-muted cancel-order"
              onClick={(e) => {
                cancelOrder(dispatch, exchange, order, account, token)
              }}
            >X</button>
          </ul>
        )
      })}
    </>
  )
}
class HistoryOrder extends Component {
  render() {
    return (
      <>
        <div className="market-history market-order mt15">
          <Tabs defaultActiveKey="open-orders">
            <Tab eventKey="open-orders" title="Open Orders">
              <ul className="d-flex justify-content-between market-order-item">
                <li  className="amount-type" >Time</li>
                <li>Buy/Sell</li>
                <li>Price</li>
                <li>Amount</li>
                <li>Cancel</li>
              </ul>
              {this.props.showMyOpenOrders ? showMyOpenOrders(this.props) : <Spinner type="table" />}
            </Tab>
            <Tab eventKey="order-history" title="Order history">
              <ul className="d-flex justify-content-between market-order-item">
                <li>Time</li>
                <li>Buy/Sell</li>
                <li>Price</li>
                <li>Amount</li>
              </ul> 
              {this.props.showMyFilledOrders ? showMyFilledOrders(this.props) : <Spinner type="table" />}
            </Tab>
          </Tabs>
        </div>
      </>
    )
  }
}
function mapStateToProps(state) {
  const myOpenOrdersLoaded = myOpenOrdersLoadedSelector(state)
  const orderCancelling = orderCancellingSelector(state)

  return {
    myFilledOrders: myFilledOrdersSelector(state),
    showMyFilledOrders: myFilledOrdersLoadedSelector(state),
    myOpenOrders: myOpenOrdersSelector(state),
    showMyOpenOrders: myOpenOrdersLoaded && !orderCancelling,
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(HistoryOrder);