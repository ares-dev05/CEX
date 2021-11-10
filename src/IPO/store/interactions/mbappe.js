import Web3 from 'web3'
import {
    web3Loaded,
    web3AccountLoaded,
    tokenLoaded,
    exchangeLoaded,
    cancelledOrdersLoaded,
    filledOrdersLoaded,
    allOrdersLoaded,
    orderCancelling,
    orderCancelled,
    orderFilling,
    orderFilled,
    etherBalanceLoaded,
    tokenBalanceLoaded,
    exchangeEtherBalanceLoaded,
    exchangeTokenBalanceLoaded,
    balancesLoaded,
    balancesLoading,
    buyOrderMaking,
    sellOrderMaking,
    orderMade
} from '../../../store/actions'
import Token2 from '../tokens/Token3.json'
import Exchange2 from '../exchanges/Exchange3.json'
import { db } from "../../../components/firebase/firebase";
import { ETHER_ADDRESS } from '../../../helpers'
import Swal from 'sweetalert2'


let address = '';
let privateKey = '';
export const loadWeb3 = async (dispatch, adr, pri) => {
    address = adr;
    privateKey = pri;
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    dispatch(web3Loaded(web3))
    return web3
}
const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export const loadAccount = async (web3, dispatch) => {
    let account = address;
    dispatch(web3AccountLoaded(account))
    return account
}

export const loadToken = async (web3, networkId, dispatch) => {
    try {
        const token = new web3.eth.Contract(Token2.abi, Token2.networks[networkId].address)
        dispatch(tokenLoaded(token))
        return token
    } catch (error) {
        console.log('Contract not deployed to the current network. Please select another network with Metamask.')
        return null
    }
}

export const loadExchange = async (web3, networkId, dispatch) => {
    try {
        const exchange = new web3.eth.Contract(Exchange2.abi, Exchange2.networks[networkId].address)
        dispatch(exchangeLoaded(exchange))
        return exchange
    } catch (error) {
        console.log('Contract not deployed to the current network. Please select another network with Metamask.')
        return null
    }
}

export const loadAllOrders = async (exchange, dispatch) => {

    // Fetch cancelled orders with the "Cancel" event stream
    const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
    // Format cancelled orders
    const cancelledOrders = cancelStream.map((event) => event.returnValues)
    // Add cancelled orders to the redux store
    dispatch(cancelledOrdersLoaded(cancelledOrders))

    // Fetch filled orders with the "Trade" event stream
    const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
    // Format filled orders
    const filledOrders = tradeStream.map((event) => event.returnValues)
    // Add cancelled orders to the redux store
    dispatch(filledOrdersLoaded(filledOrders))

    // Load order stream
    const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest' })
    // Format order stream
    const allOrders = orderStream.map((event) => event.returnValues)
    // Add open orders to the redux store
    dispatch(allOrdersLoaded(allOrders))
}

export const subscribeToEvents = async (exchange, dispatch) => {
    exchange.events.Cancel({}, (error, event) => {
        if (event) {
            dispatch(orderCancelled(event.returnValues))
        }
    })

    exchange.events.Trade({}, (error, event) => {
        if (event)
            dispatch(orderFilled(event.returnValues))
    })


    exchange.events.Deposit({}, (error, event) => {
        dispatch(balancesLoaded())
    })

    exchange.events.Withdraw({}, (error, event) => {
        dispatch(balancesLoaded())
    })

    exchange.events.Order({}, (error, event) => {
        if (event)
            dispatch(orderMade(event.returnValues))
    })

}
export const cancelOrder = async (dispatch, exchange, order, account1, token) => {
    let useraddress = order.user;
    let userpirkey = '';
    var query = await db.collection('users').where('address', '==', useraddress).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                userpirkey = doc.data().privateKey;
            });
        })
    // web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'));
    var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    var gasPrice = 0; //or get with web3.eth.gasPrice
    var gasLimit = 6721975;
    var addr = account1;
    var extraData = exchange.methods.cancelOrder(order.id)
    var data = extraData.encodeABI()
    var nonce = await web3.eth.getTransactionCount(useraddress)
    console.log("🎉 11transaction nonce is: ", nonce, "");

    var transaction = {
        "from": useraddress,
        "nonce": web3.utils.toHex(nonce),
        "gasPrice": web3.utils.toHex(gasPrice * 1e9),
        "gasLimit": web3.utils.toHex(gasLimit),
        "to": exchange._address,
        "data": data,
    };
    var tx = await web3.eth.accounts.signTransaction(transaction, userpirkey);
    var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
    console.log("🎉 6The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");


    if (order.orderType == 'sell') {
        //withdrawal Token
        var tokenmount = web3.utils.toWei((order.tokenAmount).toString(), 'ether')
        var extraDatawt = exchange.methods.withdrawToken(token.options.address, tokenmount)
        var datawt = extraDatawt.encodeABI()
        var noncewt = await web3.eth.getTransactionCount(useraddress);
        console.log("🎉 22transaction nonce is: ", noncewt, "");

        var transactionwt = {
            "from": useraddress,
            "nonce": web3.utils.toHex(noncewt),
            "gasPrice": web3.utils.toHex(gasPrice * 1e9),
            "gasLimit": web3.utils.toHex(gasLimit),
            "to": exchange._address,
            "data": datawt,
        };
        var txwt = await web3.eth.accounts.signTransaction(transactionwt, userpirkey);
        var hashwt = await web3.eth.sendSignedTransaction(txwt.rawTransaction);
        console.log("🎉 7The hash of your transaction is: ", hashwt, "\n Check Alchemy's Mempool to view the status of your transaction!");

    }

    if (order.orderType == 'buy') {
        //withdrawal Eth
        var amounteth = eval((order.tokenAmount * order.tokenPrice).toFixed(4));
        var amountToSendwe = web3.utils.toWei(amounteth.toString(), 'ether')
        var extraDatawe = exchange.methods.withdrawEther(amountToSendwe)
        var datawe = extraDatawe.encodeABI()
        web3.eth.getTransactionCount(useraddress).then(function (e) {
            var noncewe = e
            var transactionwe = {
                "from": useraddress,
                "nonce": web3.utils.toHex(noncewe),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": exchange._address,
                "data": datawe,
            };
            web3.eth.accounts.signTransaction(transactionwe, userpirkey).then(function (tx) {
                web3.eth.sendSignedTransaction(tx.rawTransaction, function (error, hash) {
                    if (!error) {
                        console.log("🎉 8The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
                    } else {
                        console.log("❗Something went wrong while submitting your transaction:", error)
                    }

                });
            })
        });
    }
    await dispatch(orderCancelling())
    await dispatch(orderCancelled(order))
    await dispatch(balancesLoading())
    await dispatch(balancesLoaded())
    var flags = 1;
    await db.collection('stateRealtime').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                flags = doc.data().type;
            });
        })
    if (flags == 1) {
        flags = 0
        db.collection('stateRealtime').doc("changeState").set({
            type: flags
        })
    } else {
        flags = 1
        db.collection('stateRealtime').doc("changeState").set({
            type: flags
        })
    }
}
export const fillOrder = async (dispatch, exchange, order, account, token, tokenbal, etherbal) => {
    // console.log("this is frllordr........", order)
    // return
    let useraddress = order.user;
    db.collection('notification').doc(useraddress).set({
        type: 'changed',
        amount: order.tokenAmount
    })
    let userpirkey = '';
    await db.collection('users').where('address', '==', useraddress).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                userpirkey = doc.data().privateKey;
            });
        })
    // web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'));
    var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    var gasPrice = 0; //or get with web3.eth.gasPrice
    var gasLimit = 3000000;
    var addr = account;
    var extraData = exchange.methods.fillOrder(order.id)
    var data = extraData.encodeABI()
    var nonce = await web3.eth.getTransactionCount(addr)

    if (order.orderType == 'sell') {
        if (etherbal >= order.etherAmount) {

            var transaction = {
                "from": addr,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": exchange._address,
                "data": data,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, privateKey);
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

            dispatch(orderFilling())
            dispatch(orderFilled(order))

            //eth from buyer to user

            var amountToSend = web3.utils.toWei(order.etherAmount.toString(), 'ether')
            var fee = Math.round((9 / amountToSend) * 100)
            var amountToSend = Math.round((amountToSend - fee))
            var nonce = await web3.eth.getTransactionCount(addr);
            var transaction = {
                "from": addr,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": useraddress,
                // "data": data,
                "value": amountToSend,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, privateKey)
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉okiok The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

            //withdraw token
            var extraData = exchange.methods.withdrawToken(token.options.address, web3.utils.toWei((order.tokenAmount).toString(), 'ether'))
            var data = extraData.encodeABI()
            var nonce = await web3.eth.getTransactionCount(useraddress);
            var transaction = {
                "from": useraddress,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": exchange._address,
                "data": data,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, userpirkey);
            var tx = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

            var amountToSend = web3.utils.toWei(order.tokenAmount.toString(), 'ether')
            var extraData = token.methods.transfer(addr, amountToSend)
            var data = extraData.encodeABI()
            var nonce = await web3.eth.getTransactionCount(useraddress);
            var transaction = {
                "from": useraddress,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": token._address,
                "data": data,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, userpirkey)
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉okiok The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

            dispatch(balancesLoading())
            dispatch(balancesLoaded())
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Ether amount isn't correct.!",
            })
        }
    }

    if (order.orderType == 'buy') {
        if (tokenbal >= order.tokenAmount) {

            var transaction = {
                "from": addr,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": exchange._address,
                "data": data,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, privateKey);
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

            dispatch(orderFilling())
            dispatch(orderFilled(order))


            //token from seller to user
            var amountToSend = web3.utils.toWei(order.tokenAmount.toString(), 'ether')
            var extraData = token.methods.transfer(useraddress, amountToSend)
            var data = extraData.encodeABI()
            var nonce = await web3.eth.getTransactionCount(addr);
            var transaction = {
                "from": addr,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": token._address,
                "data": data,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, privateKey)
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉okiok The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
            //withdraw eth
            var amountToSend = web3.utils.toWei((order.etherAmount).toString(), 'ether'); //$1
            var extraData = exchange.methods.withdrawEther(amountToSend)
            var data = extraData.encodeABI()
            var nonce = await web3.eth.getTransactionCount(useraddress);
            var transaction = {
                "from": useraddress,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": exchange._address,
                "data": data,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, userpirkey);
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction);
            console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

            var amountToSend = web3.utils.toWei(order.etherAmount.toString(), 'ether')
            var nonce = await web3.eth.getTransactionCount(useraddress);
            var transaction = {
                "from": useraddress,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": addr,
                // "data": data,
                "value": amountToSend,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, userpirkey)
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉okiok The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
            dispatch(balancesLoading())
            dispatch(balancesLoaded())
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Token Balance isn't correct.!",
            })
        }
    }
    var flags = 1;
    await db.collection('stateRealtime').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                flags = doc.data().type;
            });
        })
    if (flags == 1) {
        flags = 0
        db.collection('stateRealtime').doc("changeState").set({
            type: flags
        })
    } else {
        flags = 1
        db.collection('stateRealtime').doc("changeState").set({
            type: flags
        })
    }


}
export const partOrder = async (dispatch, exchange, order, account, token, tokenbal, etherbal) => {
    let useraddress = order.user;
    let userpirkey = '';
    console.log("order is here====>", order)
    await db.collection('users').where('address', '==', useraddress).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                userpirkey = doc.data().privateKey;
            });
        })
    // web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'));
    var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    var gasPrice = 0; //or get with web3.eth.gasPrice
    var gasLimit = 3000000;
    var addr = account;
    var extraData = exchange.methods.fillOrder(order.id)
    var data = extraData.encodeABI()
    var nonce = await web3.eth.getTransactionCount(addr)

    if (order.orderType == 'sell') {
        if (etherbal >= order.etherAmount) {
            var transaction = {
                "from": addr,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": exchange._address,
                "data": data,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, privateKey);
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

            // dispatch(orderFilling())
            // dispatch(orderFilled(order))

            //eth from buyer to user

            var amountToSend = web3.utils.toWei(order.etherAmount.toString(), 'ether')
            var fee = Math.round((9 / amountToSend) * 100)
            var amountToSend = Math.round((amountToSend - fee))
            var nonce = await web3.eth.getTransactionCount(addr);
            var transaction = {
                "from": addr,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": useraddress,
                // "data": data,
                "value": amountToSend,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, privateKey)
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉okiok The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

            //withdraw token
            var extraData = exchange.methods.withdrawToken(token.options.address, web3.utils.toWei((order.tokenAmount).toString(), 'ether'))
            var data = extraData.encodeABI()
            var nonce = await web3.eth.getTransactionCount(useraddress);
            var transaction = {
                "from": useraddress,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": exchange._address,
                "data": data,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, userpirkey);
            var tx = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

            var amountToSend = web3.utils.toWei(order.tokenAmount.toString(), 'ether')
            var extraData = token.methods.transfer(addr, amountToSend)
            var data = extraData.encodeABI()
            var nonce = await web3.eth.getTransactionCount(useraddress);
            var transaction = {
                "from": useraddress,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": token._address,
                "data": data,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, userpirkey)
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉okiok The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

            // dispatch(balancesLoading())
            // dispatch(balancesLoaded())
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Sell Ether value isn't correct.!",
            })
        }
    }

    if (order.orderType == 'buy') {
        if (tokenbal >= order.tokenAmount) {

            var transaction = {
                "from": addr,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": exchange._address,
                "data": data,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, privateKey);
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

            // dispatch(orderFilling())
            // dispatch(orderFilled(order))


            //token from seller to user
            var amountToSend = web3.utils.toWei(order.tokenAmount.toString(), 'ether')
            var extraData = token.methods.transfer(useraddress, amountToSend)
            var data = extraData.encodeABI()
            var nonce = await web3.eth.getTransactionCount(addr);
            var transaction = {
                "from": addr,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": token._address,
                "data": data,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, privateKey)
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉okiok The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
            //withdraw eth
            var amountToSend = web3.utils.toWei((order.etherAmount).toString(), 'ether'); //$1
            var extraData = exchange.methods.withdrawEther(amountToSend)
            var data = extraData.encodeABI()
            var nonce = await web3.eth.getTransactionCount(useraddress);
            var transaction = {
                "from": useraddress,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": exchange._address,
                "data": data,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, userpirkey);
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction);
            console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

            var amountToSend = web3.utils.toWei(order.etherAmount.toString(), 'ether')
            var nonce = await web3.eth.getTransactionCount(useraddress);
            var transaction = {
                "from": useraddress,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": addr,
                // "data": data,
                "value": amountToSend,
            };
            var tx = await web3.eth.accounts.signTransaction(transaction, userpirkey)
            var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
            console.log("🎉okiok The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
            // dispatch(balancesLoading())
            // dispatch(balancesLoaded())
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Buy token balance isn't correct.!",
            })
        }
    }
    var flags = 1;
    await db.collection('stateRealtime').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                flags = doc.data().type;
            });
        })
    if (flags == 1) {
        flags = 0
        db.collection('stateRealtime').doc("changeState").set({
            type: flags
        })
    } else {
        flags = 1
        db.collection('stateRealtime').doc("changeState").set({
            type: flags
        })
    }
}
export const loadBalances = async (dispatch, web3, exchange, token, account) => {
    if (typeof address !== 'undefined') {
        // Ether balance in wallet
        const etherBalance = await web3.eth.getBalance(account)
        dispatch(etherBalanceLoaded(etherBalance))
        // Token balance in wallet
        const tokenBalance = await token.methods.balanceOf(account).call()
        dispatch(tokenBalanceLoaded(tokenBalance))

        // Ether balance in exchange
        const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
        dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance))

        // Token balance in exchange
        const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
        dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance))

        // Trigger all balances loaded
        dispatch(balancesLoaded())
    } else {
        
    }
}

export const depositEther = async (dispatch, exchange, web3, amount, account) => {
    // web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'));
    web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    // var account1 = web3.eth.accounts.create();
    // console.log('account', account1);
    var gasPrice = 0; //or get with web3.eth.gasPrice
    var gasLimit = 6721975;
    var addr = account;
    var amountToSend = web3.utils.toWei(amount, 'ether'); //$1
    var extraData = exchange.methods.depositEther()
    var data = extraData.encodeABI()
    web3.eth.getTransactionCount(addr).then(function (e) {
        var nonce = e
        var transaction = {
            "from": addr,
            "nonce": web3.utils.toHex(nonce),
            "gasPrice": web3.utils.toHex(gasPrice * 1e9),
            "gasLimit": web3.utils.toHex(gasLimit),
            "to": exchange._address,
            "data": data,
            "value": amountToSend,
        };
        web3.eth.accounts.signTransaction(transaction, privateKey).then(function (tx) {
            web3.eth.sendSignedTransaction(tx.rawTransaction, function (error, hash) {
                if (!error) {
                    console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
                } else {
                    console.log("❗Something went wrong while submitting your transaction:", error)
                }
            });
        })
    });
    dispatch(balancesLoading())
    dispatch(balancesLoaded())
}

export const withdrawEther = async (dispatch, exchange, web3, amount, account) => {
    // web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'));
    web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    var gasPrice = 0; //or get with web3.eth.gasPrice
    var gasLimit = 6721975;
    var addr = account;
    var amountToSend = web3.utils.toWei(amount, 'ether'); //$1
    var extraData = exchange.methods.withdrawEther(amountToSend)
    var data = extraData.encodeABI()
    web3.eth.getTransactionCount(addr).then(function (e) {
        var nonce = e
        var transaction = {
            "from": addr,
            "nonce": web3.utils.toHex(nonce),
            "gasPrice": web3.utils.toHex(gasPrice * 1e9),
            "gasLimit": web3.utils.toHex(gasLimit),
            "to": exchange._address,
            "data": data,
        };
        web3.eth.accounts.signTransaction(transaction, privateKey).then(function (tx) {
            web3.eth.sendSignedTransaction(tx.rawTransaction, function (error, hash) {
                if (!error) {
                    console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
                } else {
                    console.log("❗Something went wrong while submitting your transaction:", error)
                }
            });
        })
    });
    dispatch(balancesLoading())
    dispatch(balancesLoaded())
}

export const depositToken = async (dispatch, exchange, web3, token, amount, account) => {
    // web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'));
    web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    var gasPrice = 0; //or get with web3.eth.gasPrice
    var gasLimit = 6721975;
    var addr = account;
    var amountToSend = web3.utils.toWei(amount, 'ether'); //$1
    var extraData = token.methods.approve(exchange.options.address, amountToSend)
    var data = extraData.encodeABI()
    var e = await web3.eth.getTransactionCount(addr)
    var nonce = e
    var transaction = {
        "from": addr,
        "nonce": web3.utils.toHex(nonce),
        "gasPrice": web3.utils.toHex(gasPrice * 1e9),
        "gasLimit": web3.utils.toHex(gasLimit),
        "to": token._address,
        "data": data,
    }
    var tx = await web3.eth.accounts.signTransaction(transaction, privateKey)
    var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
    console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");

    var extraData = exchange.methods.depositToken(token.options.address, amountToSend)
    var data = extraData.encodeABI()
    web3.eth.getTransactionCount(addr).then(function (e) {
        var nonce = e
        var transaction = {
            "from": addr,
            "nonce": web3.utils.toHex(nonce),
            "gasPrice": web3.utils.toHex(gasPrice * 1e9),
            "gasLimit": web3.utils.toHex(gasLimit),
            "to": exchange._address,
            "data": data,
        };
        web3.eth.accounts.signTransaction(transaction, privateKey).then(function (tx) {
            web3.eth.sendSignedTransaction(tx.rawTransaction, function (error, hash) {
                if (!error) {
                    console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
                } else {
                    console.log("❗Something went wrong while submitting your transaction:", error)
                }
            });
        })
    });
    dispatch(balancesLoading())
    dispatch(balancesLoaded())
}

export const withdrawToken = (dispatch, exchange, web3, token, amount, account) => {
    // web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'));
    web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    var gasPrice = 0; //or get with web3.eth.gasPrice
    var gasLimit = 6721975;
    var addr = account;
    var amountToSend = web3.utils.toWei(amount, 'ether'); //$1
    var extraData = exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether'))
    var data = extraData.encodeABI()
    web3.eth.getTransactionCount(addr).then(function (e) {
        var nonce = e
        var transaction = {
            "from": addr,
            "nonce": web3.utils.toHex(nonce),
            "gasPrice": web3.utils.toHex(gasPrice * 1e9),
            "gasLimit": web3.utils.toHex(gasLimit),
            "to": exchange._address,
            "data": data,
        };
        console.log(exchange._address, token.options.address);
        web3.eth.accounts.signTransaction(transaction, privateKey).then(function (tx) {
            web3.eth.sendSignedTransaction(tx.rawTransaction, function (error, hash) {
                if (!error) {
                    console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
                } else {
                    console.log("❗Something went wrong while submitting your transaction:", error)
                }
            });
        })
    });
    dispatch(balancesLoading())
    dispatch(balancesLoaded())
}

export const makeBuyOrder = async (dispatch, exchange, token, web3, order, account, tokenbal, etherbal, antiorder,id) => {
    var lastorder = order;
    // web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'));
    web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    let tokenGet = token.options.address;
    let amountGet = web3.utils.toWei(order.amount.toString(), 'ether')
    let tokenGive = ETHER_ADDRESS
    var amounteth = eval((order.amount * order.price).toFixed(4));
    let amountGive = web3.utils.toWei(amounteth.toString(), 'ether')
    var gasPrice = 0; //or get with web3.eth.gasPrice
    var gasLimit = 6721975;
    var addr = account;
    var bestorder = []
    var new_id = 0;
    if (etherbal >= order.amount * order.price && (order.amount * order.price > 0)) {
        await antiorder.sort(function (x, y) {
            return x.tokenPrice - y.tokenPrice;
        });
        var orderFlag = false;
        for (var i = antiorder.length - 1; i >= 0; i--) {
            if (antiorder[i].tokenPrice < order.price) {
                bestorder.push(antiorder[i])
            }
        }
        await antiorder.sort(function (x, y) {
            return x.id - y.id;
        });
        if (antiorder.length > 0) {
            new_id = parseInt(antiorder[antiorder.length - 1].id) + 1
        }
        // console.log("antiorder is here====>", antiorder)
        for (var i = 0; i < antiorder.length; i++) {
            if (antiorder[i].tokenPrice == order.price) {
                bestorder.push(antiorder[i])
            }
        }
        var orderFlag = false;
        for (var i = 0; i < bestorder.length; i++) {
            if (bestorder[i].tokenPrice <= order.price && bestorder[i].tokenAmount == order.amount) {
                await dispatch(balancesLoading())
                await dispatch(buyOrderMaking(lastorder))
                await fillOrder(dispatch, exchange, bestorder[i], account, token, tokenbal, etherbal,id);
                await dispatch(orderMade(lastorder));
                await loadAllOrders(exchange, dispatch)
                await dispatch(balancesLoaded())
                orderFlag = true;
                break;
            }
        }
        if (orderFlag) {
            var flags = 1;
            await db.collection('stateRealtime').get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        flags = doc.data().type;
                    });
                })
            if (flags == 1) {
                flags = 0
                db.collection('stateRealtime').doc("changeState").set({
                    type: flags
                })
            } else {
                flags = 1
                db.collection('stateRealtime').doc("changeState").set({
                    type: flags
                })
            }
            Swal.fire({
                icon: 'success',
                title: 'Order Success',
                text: 'Order Success',
            });
            return;
        }
        var orderamounts = 0;
        var currentAmount = 0;
        for (var i = 0; i < bestorder.length; i++) {
            if (bestorder[i].tokenPrice <= order.price) {
                orderamounts += bestorder[i].tokenAmount
                if (orderamounts == order.amount) {
                    await dispatch(balancesLoading())
                    await dispatch(buyOrderMaking(lastorder))
                    await fillOrder(dispatch, exchange, bestorder[i], account, token, tokenbal, etherbal,id);
                    await dispatch(orderMade(lastorder));
                    await loadAllOrders(exchange, dispatch)
                    await dispatch(balancesLoaded())
                    break;
                } else if (orderamounts < order.amount) {
                    await fillOrder(dispatch, exchange, bestorder[i], account, token, tokenbal, etherbal,id);
                } else if (orderamounts > order.amount) {
                    await cancelOrder(dispatch, exchange, bestorder[i], bestorder[i].user, token)
                    currentAmount = eval((orderamounts - order.amount).toFixed(4));
                    var matchAmount = eval((bestorder[i].tokenAmount - currentAmount).toFixed(4));
                    var matchether = eval((matchAmount * bestorder[i].tokenPrice).toFixed(4));
                    let useraddress = bestorder[i].user;
                    let userpirkey = '';
                    db.collection('notification').doc(useraddress).set({
                        type: 'changed',
                        amount: matchAmount,
                        id:id
                    })
                    await db.collection('users').where('address', '==', useraddress).get()
                        .then(snapshot => {
                            snapshot.forEach(doc => {
                                userpirkey = doc.data().privateKey;
                            });
                        })

                    // make rest sellorder1
                    var neworder = [{ amount: matchAmount.toString(), price: bestorder[i].tokenPrice.toString() }];
                    await dispatch(balancesLoading())
                    await dispatch(buyOrderMaking(neworder))
                    var ramounteth = eval((matchAmount * bestorder[i].tokenPrice).toFixed(4));
                    let rtokenGet = ETHER_ADDRESS
                    let ramountGet = web3.utils.toWei(ramounteth.toString(), 'ether')
                    let rtokenGive = token.options.address
                    let ramountGive = web3.utils.toWei(matchAmount.toString(), 'ether')
                    var gasPrice = 0; //or get with web3.eth.gasPrice
                    var gasLimit = 6721975;

                    //Deposit Token
                    var ramountToSenddt = web3.utils.toWei(matchAmount.toString(), 'ether');
                    var extraDatadt = token.methods.approve(exchange.options.address, ramountToSenddt)
                    var datadt = extraDatadt.encodeABI()
                    var noncedt = await web3.eth.getTransactionCount(useraddress)
                    // console.log("🎉 3.1transaction nonce is: ", noncedt, "");

                    var transactiondt = {
                        "from": useraddress,
                        "nonce": web3.utils.toHex(noncedt),
                        "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                        "gasLimit": web3.utils.toHex(gasLimit),
                        "to": token._address,
                        "data": datadt,
                    }
                    var txdt = await web3.eth.accounts.signTransaction(transactiondt, userpirkey)
                    var hashdt = await web3.eth.sendSignedTransaction(txdt.rawTransaction)
                    // console.log("🎉 3.1The hash of your transaction is: ", hashdt, "\n Check Alchemy's Mempool to view the status of your transaction!");

                    var extraDatabdt = exchange.methods.depositToken(token.options.address, ramountToSenddt)
                    var databdt = extraDatabdt.encodeABI()
                    var noncebdt = await web3.eth.getTransactionCount(useraddress);
                    // console.log("🎉 4.1transaction nonce is: ", noncebdt, "");

                    var transactionbdt = {
                        "from": useraddress,
                        "nonce": web3.utils.toHex(noncebdt),
                        "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                        "gasLimit": web3.utils.toHex(gasLimit),
                        "to": exchange._address,
                        "data": databdt,
                    };
                    var txbdt = await web3.eth.accounts.signTransaction(transactionbdt, userpirkey);
                    var hashbdt = await web3.eth.sendSignedTransaction(txbdt.rawTransaction)
                    console.log("🎉 4.1The hash of your transaction is: ", hashbdt, "\n Check Alchemy's Mempool to view the status of your transaction!");
                    //makeSellorder
                    var extraData = exchange.methods.makeOrder(rtokenGet, ramountGet, rtokenGive, ramountGive)
                    var data = extraData.encodeABI()
                    var nonce = await web3.eth.getTransactionCount(useraddress)
                    console.log("🎉 5.1The nonce  is: ", nonce);
                    var transaction = {
                        "from": useraddress,
                        "nonce": web3.utils.toHex(nonce),
                        "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                        "gasLimit": web3.utils.toHex(gasLimit),
                        "to": exchange._address,
                        "data": data,
                    };
                    var tx = await web3.eth.accounts.signTransaction(transaction, userpirkey)
                    var hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
                    console.log("🎉 5.1The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
                    await dispatch(orderMade(neworder));
                    await loadAllOrders(exchange, dispatch)
                    await dispatch(balancesLoaded());
                    var newmakeorder = { price: bestorder[i].tokenPrice.toString(), orderType: "sell", user: bestorder[i].user, etherAmount: matchether, tokenAmount: matchAmount, id: new_id };

                    // make rest sellorder2
                    var neworder = [{ amount: currentAmount.toString(), price: bestorder[i].tokenPrice.toString() }];
                    await dispatch(balancesLoading())
                    await dispatch(buyOrderMaking(neworder))
                    var ramounteth = eval((currentAmount * bestorder[i].tokenPrice).toFixed(4));
                    rtokenGet = ETHER_ADDRESS
                    ramountGet = web3.utils.toWei(ramounteth.toString(), 'ether')
                    rtokenGive = token.options.address
                    ramountGive = web3.utils.toWei(currentAmount.toString(), 'ether')
                    var gasPrice = 0; //or get with web3.eth.gasPrice
                    var gasLimit = 6721975;

                    //Deposit Token
                    var ramountToSenddt = web3.utils.toWei(currentAmount.toString(), 'ether');
                    var extraDatadt = token.methods.approve(exchange.options.address, ramountToSenddt)
                    var datadt = extraDatadt.encodeABI()
                    var noncedt = await web3.eth.getTransactionCount(useraddress)
                    // console.log("🎉 3transaction nonce is: ", noncedt, "");

                    var transactiondt = {
                        "from": useraddress,
                        "nonce": web3.utils.toHex(noncedt),
                        "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                        "gasLimit": web3.utils.toHex(gasLimit),
                        "to": token._address,
                        "data": datadt,
                    }
                    var txdt = await web3.eth.accounts.signTransaction(transactiondt, userpirkey)
                    var hashdt = await web3.eth.sendSignedTransaction(txdt.rawTransaction)
                    console.log("🎉 3The hash of your transaction is: ", hashdt, "\n Check Alchemy's Mempool to view the status of your transaction!");

                    var extraDatabdt = exchange.methods.depositToken(token.options.address, ramountToSenddt)
                    var databdt = extraDatabdt.encodeABI()
                    var noncebdt = await web3.eth.getTransactionCount(useraddress);
                    console.log("🎉 4transaction nonce is: ", noncebdt, "");

                    var transactionbdt = {
                        "from": useraddress,
                        "nonce": web3.utils.toHex(noncebdt),
                        "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                        "gasLimit": web3.utils.toHex(gasLimit),
                        "to": exchange._address,
                        "data": databdt,
                    };
                    var txbdt = await web3.eth.accounts.signTransaction(transactionbdt, userpirkey);
                    var hashbdt = await web3.eth.sendSignedTransaction(txbdt.rawTransaction)
                    console.log("🎉 4The hash of your transaction is: ", hashbdt, "\n Check Alchemy's Mempool to view the status of your transaction!");
                    //makeSellorder
                    var extraData = exchange.methods.makeOrder(rtokenGet, ramountGet, rtokenGive, ramountGive)
                    var data = extraData.encodeABI()
                    var nonce = await web3.eth.getTransactionCount(useraddress)
                    var transaction = {
                        "from": useraddress,
                        "nonce": web3.utils.toHex(nonce),
                        "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                        "gasLimit": web3.utils.toHex(gasLimit),
                        "to": exchange._address,
                        "data": data,
                    };
                    // console.log(exchange._address, token.options.address);
                    tx = await web3.eth.accounts.signTransaction(transaction, userpirkey)
                    hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
                    console.log("🎉 5.2The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
                    await dispatch(orderMade(neworder));
                    await loadAllOrders(exchange, dispatch)
                    await dispatch(balancesLoaded());
                    await partOrder(dispatch, exchange, newmakeorder, account, token, tokenbal, etherbal)
                    break;
                }
            }
        }
        if (orderamounts >= order.amount) {
            var flags = 1;
            await db.collection('stateRealtime').get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        flags = doc.data().type;
                    });
                })
            if (flags == 1) {
                flags = 0
                db.collection('stateRealtime').doc("changeState").set({
                    type: flags
                })
            } else {
                flags = 1
                db.collection('stateRealtime').doc("changeState").set({
                    type: flags
                })
            }
            Swal.fire(
                'Good!',
                'Sucessfully Completed',
                'success',
            );
            return;
        }
        else {
            var rimget = eval((order.amount - orderamounts).toFixed(4));
            amountGet = web3.utils.toWei(rimget.toString(), 'ether')
            amounteth = eval(((order.amount - orderamounts) * order.price).toFixed(4));
            amountGive = web3.utils.toWei(amounteth.toString(), 'ether')
            lastorder.amount = rimget.toString()
        }
        await dispatch(balancesLoading())

        await dispatch(buyOrderMaking(lastorder))
        //Deposit Eth
        var amountToSend1 = amountGive; //$1
        var extraData1 = exchange.methods.depositEther()
        var data1 = extraData1.encodeABI()
        var nonce1 = await web3.eth.getTransactionCount(addr)
        var transaction1 = {
            "from": addr,
            "nonce": web3.utils.toHex(nonce1),
            "gasPrice": web3.utils.toHex(gasPrice * 1e9),
            "gasLimit": web3.utils.toHex(gasLimit),
            "to": exchange._address,
            "data": data1,
            "value": amountToSend1,
        };
        var tx1 = await web3.eth.accounts.signTransaction(transaction1, privateKey)
        var hash1 = await web3.eth.sendSignedTransaction(tx1.rawTransaction)
        // console.log("🎉 The hash of your transaction is: ", hash1, "\n Check Alchemy's Mempool to view the status of your transaction!");
        //makeOrer
        // var amountToSend = web3.utils.toWei(amount, 'ether'); //$1
        var extraData = exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive)
        var data = extraData.encodeABI()
        web3.eth.getTransactionCount(addr).then(function (e) {
            var nonce = e
            var transaction = {
                "from": addr,
                "nonce": web3.utils.toHex(nonce),
                "gasPrice": web3.utils.toHex(gasPrice * 1e9),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": exchange._address,
                "data": data,
            };
            web3.eth.accounts.signTransaction(transaction, privateKey).then(function (tx) {
                web3.eth.sendSignedTransaction(tx.rawTransaction, function (error, hash) {
                    if (!error) {
                        // console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
                        //window.location.reload()
                    } else {
                        // console.log("❗Something went wrong while submitting your transaction:", error)
                    }
                });
            })
        });

        await dispatch(orderMade(lastorder));
        await loadAllOrders(exchange, dispatch)
        await dispatch(balancesLoaded())
        Swal.fire(
            'Good!',
            'Order Success Made!',
            'success'
        )
        //cancel synchronize flag
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error...',
            text: "Buy order amount isn't correct.!",
        })
        return;
    }
    var flags = 1;
    await db.collection('stateRealtime').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                flags = doc.data().type;
            });
        })
    if (flags == 1) {
        flags = 0
        db.collection('stateRealtime').doc("changeState").set({
            type: flags
        })
    } else {
        flags = 1
        db.collection('stateRealtime').doc("changeState").set({
            type: flags
        })
    }
}