import Web3 from 'web3'
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { setTimerStatus } from '../store/actions';
import { connect } from "react-redux";
import configURL from '../config/config.json'
import tokens from "../IPO/store/tokens";
import exchanges from "../IPO/store/exchanges";

const countdownSetting = configURL.countdown;
class IPOCountdown extends Component {

  state = {
    remaining: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
    totalBal: 0,
    tokenbal: 0,
    isExpired: false
  };
  // used to set and clear interval
  timer;
  // used to calculate the distance between "current date and time" and the "target date and time"
  distance;

  constructor(props) {
    super(props);
    this.readAccountDappValue = this.readAccountDappValue.bind(this);
  }
  readAccountDappValue = async (account1) => {
    let { totalBal, tokenbal } = this.state;
    let exchangeName=0;
    totalBal = 0;
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    const networkId = await web3.eth.net.getId();
    var token = tokens[this.props.id].default;
        for (let nameid = 0; nameid < Object.entries(tokens).length; nameid++) {
      if (this.props.id === Object.entries(tokens)[nameid][0]){
        exchangeName=Object.entries(exchanges)[nameid][0];
      }
    }
    let adminaddress=exchanges[exchangeName].default.networks[networkId].address;
    var tokenInst = new web3.eth.Contract(token.abi, token.networks[networkId].address)
    let bal = await tokenInst.methods.totalSupply().call();
    totalBal = (bal / (10 ** 18));
    bal = await tokenInst.methods.balanceOf(adminaddress).call();
    tokenbal = (bal / (10 ** 18));
    this.setState({ totalBal, tokenbal });
  }
  componentDidMount() {
    if (this.props.account) {
      this.readAccountDappValue(this.props.account);
    }
    else {
      this.readAccountDappValue(localStorage.getItem("account-address"));
    }
    this.setDate(this.props.dispatch);
    this.counter(this.props.dispatch);
  }

  setDate = async (dispatch) => {
    var member = this.props.id;
    var configInfo = countdownSetting[member];
    var timeInfo = configInfo.split(',');
    var now = new Date(), countDownDate;
    countDownDate = new Date(timeInfo[0], timeInfo[1] - 1, timeInfo[2], timeInfo[3], timeInfo[4]);
    // Find the distance between now and the count down date
    this.distance = countDownDate.getTime() - now.getTime();
    // target date and time is less than current date and time
    if (this.distance < 0) {
      clearInterval(this.timer);
      this.setState({ isExpired: true });
      await dispatch(setTimerStatus(true));
    } else {
      this.setState({
        remaining: {
          days: Math.floor(this.distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (this.distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((this.distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((this.distance % (1000 * 60)) / 1000)
        },
        isExpired: false
      });
      await dispatch(setTimerStatus(false));
    }

  }

  counter(dispatch) {
    this.timer = setInterval(() => {
      this.setDate(dispatch);
      if (this.props.account) {
        this.readAccountDappValue(this.props.account);
      }
      else {
        this.readAccountDappValue(localStorage.getItem("account-address"));
      }
    }, 1000);
  }

  render() {
    const { remaining, isExpired, totalBal, tokenbal } = this.state;
    return (
      <>
        <div className="market-news mt15">
          <h2 className="heading">IPO Info</h2>
          <ul>
            <li>
              <Link to="/news-details">
                <h2>Price Drops in
                  {
                    (!isExpired) ? (
                      ' ' + (remaining.days * 24 + remaining.hours) + ' : ' + remaining.minutes + ' : ' + remaining.seconds
                    ) : (
                      <p className="alert-danger">Closed</p>
                    )
                  }
                </h2>
                Price drops 20% every 20 minutes until sold
              </Link>
            </li>
            <li>
              <Link to="/news-details">
                <strong>{eval((totalBal - tokenbal).toFixed(0))}/{totalBal} Sold</strong>
              </Link>
            </li>
          </ul>
        </div>
      </>
    );
  }

}



function mapStateToProps(state) {
  return {
  };
}

export default connect(mapStateToProps)(IPOCountdown);
