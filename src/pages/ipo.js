import IPOTrade from '../components/IPOTrade';
import IPOCountdown from '../components/IPOCountdown';
import React, { Component } from 'react';
import HistoryOrder from '../components/HistoryOrder';
import MarketHistory from '../components/MarketHistory';
import AboutPlayer from '../components/AboutPlayer';
import OrderBook from '../components/OrderBook';
import interactions from "../IPO/store/interactions";
import { db } from "../components/firebase/firebase";
import { exchangeSelector, priceChartLoadedSelector, priceChartSelector, timerSelector } from '../store/selectors'
import { connect } from 'react-redux'

class Ipo extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props)
  }
  async loadBlockchainData(props) {
    let id = props.id;
    const { loadAllOrders } = !interactions[id] ? interactions["mbappe"] : interactions[id];
    const { dispatch, exchange } = props
    await loadAllOrders(exchange, dispatch)
  }

  componentDidMount() {
    db.collection('stateRealtime').doc('changeState').onSnapshot((snap) => {
      this.loadBlockchainData(this.props)
    })
  }
  render() {
    return (
      <>
        <div className="container-fluid mtb15 no-fluid">

          <div className="row sm-gutters">
            <div className="col-sm-12 col-md-3">
              <IPOCountdown id={this.props.id} />
              <AboutPlayer id={this.props.id} />
            </div>
            <div className="col-sm-12 col-md-6">
              {!this.props.timerStatus ? <IPOTrade id={this.props.id} /> :
                <button className="btn btn-primary p-2 w-100">
                  S &nbsp;  &nbsp; &nbsp; &nbsp; O  &nbsp;  &nbsp; &nbsp; &nbsp;L  &nbsp;  &nbsp; &nbsp; &nbsp;D
                </button>}
              <HistoryOrder id={this.props.id} />
            </div>
            <div className="col-md-3">
              <OrderBook id={this.props.id} />
              <MarketHistory id={this.props.id} />
            </div>
          </div>
        </div>
      </>
    );
  }
}
function mapStateToProps(state) {
  const timerStatus = timerSelector(state);
  return {
    timerStatus: timerStatus,
    exchange: exchangeSelector(state),
    priceChartLoaded: priceChartLoadedSelector(state),
    priceChart: priceChartSelector(state),
  }
}

export default connect(mapStateToProps)(Ipo)