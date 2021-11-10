import Web3 from 'web3'
import React, { Component } from 'react'
import "bootstrap/dist/css/bootstrap.min.css";
import { connect } from 'react-redux'
import tokens from "../store/tokens";
import Exchanges from "../store/exchanges";
import { Tabs, Tab } from 'react-bootstrap';
import Spinner from './Spinner'
import {
  accountSelector, tokenBalanceSelector,etherBalanceSelector
} from "../store/selectors";

import configURL from '../config/config.json'
const IMGURL = configURL.imgURL;
var player2id = configURL.player2id;
class PortfolioList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenbal: [],
      exchangeses: [],
      token_cost: [],
      token_price: [],
      tokenName: [],
      loading: false,
      exchangeName: [],
      isOpen: false
    }

    this.readAccountDappValue = this.readAccountDappValue.bind(this);
  }

  readAccountDappValue = async (account1) => {
    let {loading, tokenName, exchangeName, tokenbal, exchangeses, token_cost, token_price } = this.state;
    tokenbal = [];
    exchangeses = [];
    token_cost = [];
    token_price = [];
    tokenName = [];
    exchangeName = [];
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
      let bal = await tokenInst.methods.balanceOf(account1).call();
      tokenbal.push(bal / (10 ** 18));
      exchangeses.push(new web3.eth.Contract(exchang.abi, exchang.networks[networkId].address))
    }
    for (var j = 0; j < exchangeName.length; j++) {
      var token = tokens[tokenName[j]].default;
      var tradeStream = await exchangeses[j].getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
      var filledOrders = await tradeStream.map((event) => event.returnValues)
      var tmp_cost = 0;
      var tmp_price = 0;
      if (filledOrders.length > 0) {
        for (var i = 0; i < filledOrders.length; i++) {
          if (filledOrders[i].userFill != filledOrders[i].user && filledOrders[i].userFill == account1 && filledOrders[i].tokenGive == token.networks[networkId].address) {
            tmp_cost += filledOrders[i].amountGet / (10 ** 18);
          }
          if (filledOrders[i].userFill != filledOrders[i].user && filledOrders[i].user == account1 && filledOrders[i].tokenGet == token.networks[networkId].address) {
            tmp_cost += filledOrders[i].amountGive / (10 ** 18);
          }
        }
        if (filledOrders[filledOrders.length - 1].tokenGive == token.networks[networkId].address) {
          tmp_price = filledOrders[filledOrders.length - 1].amountGet / filledOrders[filledOrders.length - 1].amountGive;
        }
        else {
          tmp_price = filledOrders[filledOrders.length - 1].amountGive / filledOrders[filledOrders.length - 1].amountGet;
        }
      }
      token_price.push(tmp_price);
      token_cost.push(tmp_cost);
    }
    loading=true;
    this.setState({loading, tokenName, exchangeName, tokenbal, exchangeses, token_cost, token_price });
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
    else{
        this.readAccountDappValue(localStorage.getItem("account-address"));
    }
  }

  render() {
    let {loading, tokenName, exchangeName, tokenbal, exchangeses, token_cost, token_price } = this.state;

    return (
      <>
        <div className="markets pb70">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="markets-pair-list">
                  <Tabs defaultActiveKey="favorites">
                    <Tab eventKey="favorites" title="★ Favorites">
                      <div className="table-responsive">
                        <table className="table star-active">
                          <thead>
                            <tr>
                              <th>Token</th>
                              <th>Photo</th>
                              <th>Amount</th>
                              <th>Cost Paid </th>
                              <th>Current Value</th>
                              <th>Total Value</th>
                              <th>Percentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              tokenName.map((obj, key) => (
                                tokenbal[key] > 0 ? <tr data-href="exchange-light.html">
                                  <td> <i className="icon ion-md-star"></i><a href={`/players/${obj}`}>{obj}</a></td>
                                  <td><img src={`${IMGURL+player2id[obj]}.png`} alt="eth" style={{ width : "60%"}}/></td>
                                  <td><img src={'img/icon/1.png'} alt="eth" />{eval((tokenbal[key]).toFixed(1))}</td>
                                  {token_cost[key] ? <td>{eval((token_cost[key]).toFixed(2))}</td> : <td>0</td>}
                                  {token_price[key] ? <td>{eval((token_price[key]).toFixed(2))}</td> : <td>0</td>}
                                  {tokenbal[key] && token_price[key] ? <td>{eval((tokenbal[key] * token_price[key]).toFixed(0))}</td> : <td>0</td>}
                                  {token_cost[key] !== 0 && token_cost[key] ? <td className="green">{eval(((tokenbal[key] * token_price[key] - token_cost[key]) * 100 / token_cost[key]).toFixed(0))}</td> : <td>0</td>}
                                </tr> : <></>
                              )
                              )
                            }
                            {!loading && <Spinner type='table' />}
                          </tbody>
                        </table>
                      </div>
                    </Tab>
                  </Tabs>
                  <div className="text-center">
                    {
                      loading&& <a href="#!" className="load-more btn">
                      Load More <i className="icon ion-md-arrow-down"></i>
                    </a>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
function mapStateToProps(state) {
  return {
    account: accountSelector(state),
    etherBalance: etherBalanceSelector(state),
  }
}

export default connect(mapStateToProps)(PortfolioList)