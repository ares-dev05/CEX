// node Order.js --amount=10 --senderPrivatekey=0xA63bcE8... --senderAddress=3f4eda...  --receiverAddress=A63bcE8...


const Web3 = require('web3');
//Parameter
const args = require('minimist')(process.argv.slice(2))
var TokenAmount, senderPrivatekey, senderAddress, receiverAddress;
TokenAmount = args.amount;
senderPrivatekey = args.senderPrivatekey;
senderAddress = args.senderAddress;
receiverAddress = args.receiverAddress;
const gasPrice = 0; //or get with web3.eth.gasPrice
const gasLimit = 6721975;
//Running function
async function  sendToken (TokenAmount, senderPrivatekey, senderAddress, receiverAddress) {
        if (TokenAmount && senderPrivatekey && senderAddress && receiverAddress) {
            receiverAddress="0x"+receiverAddress;
            senderAddress="0x"+senderAddress;
        const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
        const amountToSend = web3.utils.toWei(TokenAmount.toString(), 'ether')
        const nonce = await web3.eth.getTransactionCount(senderAddress);
        const transaction = {
            "from": senderAddress,
            "nonce": web3.utils.toHex(nonce),
            "gasPrice": web3.utils.toHex(gasPrice * 1e9),
            "gasLimit": web3.utils.toHex(gasLimit),
            "to": receiverAddress,
            "value": amountToSend,
        };
        const tx = await web3.eth.accounts.signTransaction(transaction, senderPrivatekey)
        const hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
        console.log("success",hash);
    }
    else {
        //except
        console.log('Parameter is not correct');
        console.log('This is run example----');
        console.log('node Order.js --amount=10 --senderPrivatekey=0xA63bcE8... --senderAddress=3f4eda...  --receiverAddress=0xA63bcE8...');
    }
}
sendToken(TokenAmount, senderPrivatekey, senderAddress, receiverAddress);

