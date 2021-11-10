import Web3 from 'web3'
import React, { Component } from 'react'
import address from './address.json'

class MarketHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            wallet: []
        }
    }
    readAccountDappValue = async (account1) => {
        let {wallet } = this.state;
        wallet = [];
        const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
        var etherval = 0;
        await web3.eth.getBalance(address.address1, function (err, result) {
          if (err) {
            console.log(err)
          } else {
            etherval = web3.utils.fromWei(result, "ether");
            wallet.push(etherval)
          }
        })
        await web3.eth.getBalance(address.address2, function (err, result) {
          if (err) {
            console.log(err)
          } else {
            etherval = web3.utils.fromWei(result, "ether");
            wallet.push(etherval)
          }
        })
        await web3.eth.getBalance(address.address3, function (err, result) {
          if (err) {
            console.log(err)
          } else {
            etherval = web3.utils.fromWei(result, "ether");
            wallet.push(etherval)
          }
        })
        this.setState({ wallet });
      }
      componentDidMount() {
        if (this.props.account) {
          this.readAccountDappValue(this.props.account);
        }
        else {
          this.readAccountDappValue(localStorage.getItem("account-address"));
        }
      }
    render() {
    let {  wallet } = this.state;
    return (
            <>
                    {
                        wallet.map((obj, key) => (
                            <div><up>Wallet{(key + 1)} balance : {obj}</up> </div>
                        ))
                    }
            </>
        )
    }
}
export default MarketHistory