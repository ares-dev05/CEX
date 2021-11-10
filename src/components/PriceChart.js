import React, { Component } from 'react'
import { connect } from 'react-redux'
import Chart from 'react-apexcharts'
import Spinner from './Spinner'
import { chartOptions,chartOptionsDark } from './PriceChart.config'
import {
  priceChartLoadedSelector,
  priceChartSelector
} from '../store/selectors'

const showPriceChart = (props) => {
  return (
    <div className="main-chart mb15 price-chart">
      <div className="price">
      </div>
      {props.theme==='light'?<Chart options={chartOptions} series={props.priceChart.series} type='candlestick' width='100%' height='100%' />:
      <Chart options={chartOptionsDark} series={props.priceChart.series} type='candlestick' width='100%' height='100%' />
    }
    </div>
  )
}

class PriceChart extends Component {
  render() {
    return (
      <>
        {
          this.props.theme === 'light' ?
            <div className="card bg-light text-black">
              <div className="card-header">
                Price Chart
              </div>
              <div className="card-body">
                {this.props.priceChartLoaded ? showPriceChart(this.props) : <Spinner />}
              </div>
            </div> : <div className="card bg-dark text-white">
              <div className="card-header">
                Price Chart
              </div>
              <div className="card-body">
                {this.props.priceChartLoaded ? showPriceChart(this.props) : <Spinner />}
              </div>
            </div>
        }
      </>
    )
  }
}

function mapStateToProps(state) {

  return {
    priceChartLoaded: priceChartLoadedSelector(state),
    priceChart: priceChartSelector(state),
  }
}

export default connect(mapStateToProps)(PriceChart)
