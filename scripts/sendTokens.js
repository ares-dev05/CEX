// node sendTokens.js --amount=999 --senderPrivatekey=778c1b6d6ef276b0c54f66e0d064f9aff31c700bdea27b722960b76fac0f9ba0 --senderAddress=3aaCC6fC5EBc6eB5E5EC261B94631b8fEf29A13a --receiverAddress=e73d5752F3c9045fdb24c3c6526C1a89ffD7Ccd9 --Token=../src/abis/Token.json

const Web3 = require('web3');
const args = require('minimist')(process.argv.slice(2))
//Parameter
var TokenAmount, senderPrivatekey, senderAddress, receiverAddress,Token;
TokenAmount = args.amount;
senderPrivatekey = args.senderPrivatekey;
senderAddress = args.senderAddress;
receiverAddress = args.receiverAddress;
Token=args.Token;
const gasPrice = 0; //or get with web3.eth.gasPrice
const gasLimit = 6721975;
//Running function
sendToken(Token, TokenAmount, senderPrivatekey, senderAddress, receiverAddress);
async function sendToken(Token, TokenAmount, senderPrivatekey, senderAddress, receiverAddress) {
    console.log("This is Token name====>",Token)
    Token=await require(Token);
    if (TokenAmount && senderPrivatekey && senderAddress && receiverAddress) {
        receiverAddress = "0x" + receiverAddress;
        senderAddress = "0x" + senderAddress;
        const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
        const networkId = await web3.eth.net.getId();
        const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
        const amountToSend = web3.utils.toWei(TokenAmount.toString(), 'ether')
        var extraData = token.methods.transfer(receiverAddress, amountToSend)
        var data = extraData.encodeABI()
        var nonce = await web3.eth.getTransactionCount(senderAddress);
        var transaction = {
            "from": senderAddress,
            "nonce": web3.utils.toHex(nonce),
            "gasPrice": web3.utils.toHex(gasPrice * 1e9),
            "gasLimit": web3.utils.toHex(gasLimit),
            "to": token._address,
            "data": data,
        };
        const tx = await web3.eth.accounts.signTransaction(transaction, senderPrivatekey)
        const hash = await web3.eth.sendSignedTransaction(tx.rawTransaction)
        console.log("success", hash);
    }
    else {
        //except
        console.log('Parameter is not correct');
        console.log('This is run example----');
        console.log('node SendTokens.js --amount=15 --senderPrivatekey=106e60ae4f9e4570c630fde8631fe410e3a4711264b4e62ea531cbfec449a828 --senderAddress=541bca21D23C32241aECd1A532e180501Fd53dB3 --receiverAddress=B397daDa3980e3EB3F2872e9FfA431f0806151Ce --Token=./Token.json');
    }
}

