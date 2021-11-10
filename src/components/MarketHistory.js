import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import {
  filledOrdersLoadedSelector,
  filledOrdersSelector
} from '../store/selectors'
import { Tabs, Tab } from 'react-bootstrap';


const showFilledOrders = (filledOrders) => {
  return (
    <tbody>
      {filledOrders.map((order) => {
        return (
          <tr className={`order-${order.id}`} key={order.id}>
            <td className="text-muted Time">{order.formattedTimestamp}</td>
            <td className="Price" className={`text-${order.tokenPriceClass}`}>{order.tokenPrice}</td>
            <td className="Amount">{order.tokenAmount}</td>
          </tr>
        )
      })}
    </tbody>
  )
}
class MarketHistory extends Component {
  render() {
    return (
      <>
      <div className="market-history">
        <Tabs defaultActiveKey="recent-trades">
          <Tab eventKey="recent-trades" title="Recent Trades">
            <table className="table">
            <thead>
                <tr>
                  <th className="Time">Time</th>
                  <th className="Price">Price(BTC)</th>
                  <th className="Amount">Amount(ETH)</th>
                </tr>
              </thead>
              {this.props.filledOrdersLoaded ? showFilledOrders(this.props.filledOrders) : <Spinner type="table" />}
            </table>
            </Tab>
        </Tabs>
      </div>
    </>
    )
  }
}
function mapStateToProps(state) {
  return {
    filledOrdersLoaded: filledOrdersLoadedSelector(state),
    filledOrders: filledOrdersSelector(state),
  }
}

export default connect(mapStateToProps)(MarketHistory)