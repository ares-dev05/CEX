import Web3 from 'web3'
import React, { Component } from 'react'
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { connect } from 'react-redux'
import tokens from "../store/tokens";
import Exchanges from "../store/exchanges";
import { Tabs, Tab } from 'react-bootstrap';
import {
  accountSelector, tokenBalanceSelector,etherBalanceSelector
} from "../store/selectors";
import Slider from 'react-slick';

class PortfolioStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenbal: [],
      exchangeses: [],
      token_cost: [],
      token_price: [],
      tokenName: [],
      exchangeName: [],
      totalval: [],
      etherval: [],
      isOpen: false
    }

    this.readAccountDappValue = this.readAccountDappValue.bind(this);
  }

  readAccountDappValue = async (account1) => {

    let { tokenName, exchangeName, tokenbal, exchangeses, token_cost, token_price,totalval,etherval } = this.state;
    tokenbal = [];
    exchangeses = [];
    token_cost = [];
    token_price = [];
    tokenName = [];
    exchangeName = [];
    totalval=0;
    etherval=0
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
    for(var total_count=0;total_count<tokenbal.length;total_count++){
      totalval+=tokenbal[total_count] * token_price[total_count];
    }
     await   web3.eth.getBalance(account1, function(err, result) {
              if (err) {
                console.log(err)
              } else {
                console.log(web3.utils.fromWei(result, "ether")  + " ETH ")
                etherval=web3.utils.fromWei(result, "ether");
              }
        })
                this.setState({ tokenName, exchangeName, tokenbal, exchangeses, token_cost, token_price,totalval ,etherval});
    
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
    let { tokenName, exchangeName, tokenbal, exchangeses, token_cost, token_price,totalval,etherval } = this.state;

    return (
      <div className="market-carousel">
        <div className="market-carousel-item">

          <strong>Portfolio Value</strong>
          <h2>{totalval}</h2>
          <strong>{etherval}</strong>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    etherBalance: etherBalanceSelector(state),
    account: accountSelector(state),
  }
}

export default connect(mapStateToProps)(PortfolioStats)