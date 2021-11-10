import Web3 from 'web3'
import React, { Component, useEffect, useState } from 'react'
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { connect } from 'react-redux'
import tokens from "../store/tokens";
import Exchanges from "../store/exchanges";
import Spinner from './Spinner'
import {
  accountSelector, tokenBalanceSelector,
} from "../store/selectors";
import { Tabs, Tab } from 'react-bootstrap';

import configURL from '../config/config.json'
const IMGURL = configURL.imgURL;
var player2id = configURL.player2id;

const ShowForm = (state) => {
  let { loading, tokenName, exchangeName, tokenbal, exchangeses, token_percent, token_price, sell_price, buy_price, matchflag } = state;
  const [filtername, setFiltername] = useState("");
  const [flagArray, setFlagArray] = useState(matchflag);
  const onChange = (e) => {
    setFiltername(e.target.value);
    var flags = [];
    for (var i = 0; i < tokenName.length; i++) {
      if (tokenName[i].toLowerCase().includes(filtername.toLowerCase())) {
        flags[i] = true;
      }
      else {
        flags[i] = false;
      }
    }
    if (e.target.value === '') {
      for (var i = 0; i < tokenName.length; i++) {
          flags[i] = true;
      }
    }
    setFlagArray(flags);
  }
  // useEffect(async () => {
  //   var flag=[]
  //   for (var i = 0; i < tokenName.length; i++) {
  //     flag[i] = true;
  // }
  //   await setFlagArray(flag);
  // }, []);
  return (
    <div className="market-pairs">
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text" id="inputGroup-sizing-sm">
            <i className="icon ion-md-search"></i>
          </span>
        </div>
        <input
          type="text"
          className="form-control"
          placeholder="Search"
          aria-describedby="inputGroup-sizing-sm"
          onChange={(e) => onChange(e)}
          value={filtername}
          required
        />
      </div>
      <Tabs defaultActiveKey="btc">
        <Tab eventKey="btc" title="ETH">
          <table className="table">
            {/* <thead>
              <tr>
                <th>Name</th>
                <th>Photo</th>
                <th>Last Price</th>
                <th>Change</th>
              </tr>
            </thead> */}
            <tbody>
              <tr className="text-center">
                <td className="text-center">Name</td>
                <td><div style={{width: '100%'}}>Photo</div></td>
                <td>Last Price</td>
                <td>Percentage</td>
              </tr>
              {
                tokenName.map((obj, key) => (
                  flagArray[key] && tokenbal[key] ? <tr>
                    <td><i className="icon ion-md-star" ></i> <a href={`/players/${obj}`}>{obj}</a></td>
                    <td><div style={{width: '100%'}}><img style={{width: '60%'}} src={`${IMGURL+player2id[obj]}.png`} /></div></td>
                    {token_price[key] ? <td>{eval((token_price[key]).toFixed(2))}</td> : <td>0</td>}
                    {token_percent[key] !== 0 && token_percent[key] ? <td className="green">{eval((100 * token_price[key] / token_percent[key]).toFixed(0))}</td> : <td>0</td>}
                  </tr> : <></>
                )
                )
              }
            </tbody>
          </table>
        </Tab>
      </Tabs>
    </div>
  )
}
class MarketPairs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenbal: [],
      exchangeses: [],
      token_percent: [],
      token_price: [],
      sell_price: [],
      buy_price: [],
      tokenName: [],
      loading: false,
      exchangeName: [],
      isOpen: false,
      matchflag: []
    }

    this.readAccountDappValue = this.readAccountDappValue.bind(this);
  }

  readAccountDappValue = async (account1) => {
    let { loading, tokenName, exchangeName, tokenbal, exchangeses, token_percent, token_price, sell_price, buy_price, matchflag } = this.state;
    tokenbal = [];
    exchangeses = [];
    token_percent = [];
    token_price = [];
    sell_price = [];
    buy_price = [];
    tokenName = [];
    exchangeName = [];
    matchflag = [];
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    const networkId = await web3.eth.net.getId();
    for (var i = 0; i < Object.entries(tokens).length; i++) {
      tokenName.push(Object.entries(tokens)[i][0])
      exchangeName.push(Object.entries(Exchanges)[i][0])
    }
    for (var i = 0; i < tokenName.length; i++) {
      var token = tokens[tokenName[i]].default;
      var exchang = Exchanges[exchangeName[i]].default;
      var tokenInst = new web3.eth.Contract(token.abi, token.networks[networkId].address)
      let bal = await tokenInst.methods.totalSupply().call();
      tokenbal.push(bal / (10 ** 18));
      exchangeses.push(new web3.eth.Contract(exchang.abi, exchang.networks[networkId].address))
    }
    for (var j = 0; j < exchangeName.length; j++) {
      var token = tokens[tokenName[j]].default;
      var tradeStream = await exchangeses[j].getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
      var filledOrders = await tradeStream.map((event) => event.returnValues)
      const cancelStream = await exchangeses[j].getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
      // Format cancelled orders
      const cancelledOrders = cancelStream.map((event) => event.returnValues)
      const orderStream = await exchangeses[j].getPastEvents('Order', { fromBlock: 0, toBlock: 'latest' })
      // Format order stream
      const allOrders = orderStream.map((event) => event.returnValues)
      var tmp_percent = 0;
      var tmp_price = 0;
      var max_price = 0;
      var min_price = 0;
      if (filledOrders.length > 0) {
        var cnt = 0;
        for (var i = 0; i < filledOrders.length; i++) {
          let unix_timestamp = filledOrders[i].timestamp
          var date = new Date(unix_timestamp * 1000);
          var pricedate = date.getDate();
          var currentdate = new Date();
          var datetime = currentdate.getDate();
          if (datetime - pricedate == 1) {
            if (filledOrders[i].tokenGive == token.networks[networkId].address) {
              cnt++
              tmp_percent = (tmp_percent * (cnt - 1) + filledOrders[i].amountGet / filledOrders[i].amountGive) / cnt;
            }
            else {
              cnt++
              tmp_percent = (tmp_percent * (cnt - 1) + filledOrders[i].amountGive / filledOrders[i].amountGet) / cnt;
            }
          }
        }
        if (filledOrders[filledOrders.length - 1].tokenGive == token.networks[networkId].address) {
          tmp_price = filledOrders[filledOrders.length - 1].amountGet / filledOrders[filledOrders.length - 1].amountGive;
        }
        else {
          tmp_price = filledOrders[filledOrders.length - 1].amountGive / filledOrders[filledOrders.length - 1].amountGet;
        }
      }
      if (allOrders.length > 0) {
        var cnt = 0;
        var flag = false;
        for (var i = 0; i < allOrders.length; i++) {
          var cancel_flag = false;
          for (var k = 0; k < cancelledOrders.length; k++) {
            if (allOrders[i].id == cancelledOrders[k].id) {
              cancel_flag = true;
              break;
            }
          }
          if (cancel_flag) continue;
          for (var l = 0; l < filledOrders.length; l++) {
            if (allOrders[i].id == filledOrders[l].id) {
              cancel_flag = true;
            }
          }
          if (cancel_flag) continue;
          if (!flag) {
            if (allOrders[i].tokenGive == token.networks[networkId].address) {
              // max_price = allOrders[i].amountGet / allOrders[i].amountGive;
              min_price = allOrders[i].amountGet / allOrders[i].amountGive;
              flag = true;
            }
            else {
              max_price = allOrders[i].amountGive / allOrders[i].amountGet;
              // min_price = allOrders[i].amountGive / allOrders[i].amountGet;
              flag = true;
            }

          }
          else {
            if (allOrders[i].tokenGive == token.networks[networkId].address) {
              if (flag && min_price == 0) { min_price = 99999 }
              // if (max_price < allOrders[i].amountGet / allOrders[i].amountGive) { max_price = allOrders[i].amountGet / allOrders[i].amountGive; }
              if (min_price > allOrders[i].amountGet / allOrders[i].amountGive) { min_price = allOrders[i].amountGet / allOrders[i].amountGive; }
            }
            else {
              if (max_price < allOrders[i].amountGive / allOrders[i].amountGet) { max_price = allOrders[i].amountGive / allOrders[i].amountGet; }
              // if (min_price > allOrders[i].amountGive / allOrders[i].amountGet) { min_price = allOrders[i].amountGive / allOrders[i].amountGet; }
            }

          }
        }
      }
      sell_price.push(max_price);
      buy_price.push(min_price);
      token_price.push(tmp_price);
      token_percent.push(tmp_percent);
    }
    console.log("token_price", token_price)
    loading = true;
    for (var i = 0; i < tokenName.length; i++) {
      matchflag[i] = true;
    }
    this.setState({ loading, tokenName, exchangeName, tokenbal, exchangeses, token_percent, token_price, sell_price, buy_price, matchflag });
  }

  openModal = () => {
    this.setState({ isOpen: true }, () => {
      this.readAccountDappValue(this.props.account);
    });
  }
  closeModal = () => this.setState({ isOpen: false });

  componentDidMount() {
    if (this.props.account) {
      this.readAccountDappValue(this.props.account);
    }
  }

  render() {
    let { loading, tokenName, exchangeName, tokenbal, exchangeses, token_percent, token_price, sell_price, buy_price, matchflag } = this.state;

    return (
      <>
        {loading ? <ShowForm {...this.state}></ShowForm>: <Spinner type='table' />}
      </>
    )

  }
}

function mapStateToProps(state) {
  return {
    account: accountSelector(state),
  }
}

export default connect(mapStateToProps)(MarketPairs)