// Parameter type
// Run Example
// node SendTokens.js --contractAddr=0x324324324 --fromPrivateKey=
const args = require('minimist')(process.argv.slice(2))

//Parameter
// TokenAddress : contract address in binance smart chain
// TokenAmount : token amount to send
// PrivatekeyOfSender : privatekey of sender. this must be needed because of function parameter
// AddressOfSender : sender address
// AddressOfReceiver : receiver address
//Parameter Example

var TokenAddress, TokenAmount, TokenPrice, Type, AddressOfSender;
TokenAddress = args.TokenAddress;
TokenAmount = args.TokenAmount;
TokenPrice = args.TokenPrice;
Type = args.Type;
AddressOfSender = args.AddressOfSender;

function makeOrder(TokenAddress, TokenAmount, TokenPrice, Type, AddressOfSender){
    if(TokenAddress && TokenAmount && TokenPrice && Type && AddressOfSender)
    {
        //main part
        console.log('Good parameter');

        console.log('Successfully Running');
    }
    else{
        //except
        console.log("No enough parameter!  Let's check parameter again");
        console.log('This is run example----');
        console.log('node Order.js --TokenAddress=0xB8c77482e45F1F44dE1745F52C74426C631bDD52 --TokenAmount=0.1 --TokenPrice=1  --AddressOfSender=0xA63bcE801870de204B080A3B85Ba51b94bf87b84 --Type=buy --work=cancel');
    }
}



//Running function
makeOrder(TokenAddress, TokenAmount, TokenPrice, Type, AddressOfSender);