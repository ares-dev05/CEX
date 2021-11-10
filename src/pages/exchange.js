import React, { Component } from 'react';
import HistoryOrder from '../components/HistoryOrder';
import MarketHistory from '../components/MarketHistory';
import AboutPlayer from '../components/AboutPlayer';
import MarketPairs from '../components/MarketPairs';
import MarketTrade from '../components/MarketTrade';
import OrderBook from '../components/OrderBook';
import TradingChart from '../components/TradingChart';
import PriceChart from '../components/PriceChart';
import TradingChartDark from '../components/TradingChartDark';
import { ThemeConsumer } from '../context/ThemeContext';
import interactions from "../store/interactions";
import { db } from "../components/firebase/firebase";
import { exchangeSelector, priceChartLoadedSelector, priceChartSelector } from '../store/selectors'
import { connect } from 'react-redux'


class exchange extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props)
  }
  async loadBlockchainData(props) {
    let id = props.id;
    const { loadAllOrders } = !interactions[id] ? interactions["mbappe"] : interactions[id];
    const { dispatch, exchange} = props
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
              <MarketPairs id={this.props.id} />
            </div>
            <div className="col-sm-12 col-md-6">
               <ThemeConsumer>
                {({ data }) => {
                  return data.theme === 'light' ? (
                    <PriceChart theme={data.theme}/>
                  ) : (
                    <PriceChart theme={data.theme}/>
                  );
                }}
              </ThemeConsumer>
              <MarketTrade id={this.props.id} />
              <HistoryOrder id={this.props.id} />
            </div>
            <div className="col-md-3">
              <AboutPlayer id={this.props.id}/>
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
  return {
    exchange: exchangeSelector(state),
    priceChartLoaded: priceChartLoadedSelector(state),
    priceChart: priceChartSelector(state),
  }
}

export default connect(mapStateToProps)(exchange)