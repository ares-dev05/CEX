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
// node SendTokens.js --TokenAddress=0xB8c77482e45F1F44dE1745F52C74426C631bDD52
// --TokenAmount=0.1 --PrivatekeyOfSender=106e60ae4f9e4570c630fde8631fe410e3a4711264b4e62ea531cbfec449a828
//  --AddressOfSender=0xA63bcE801870de204B080A3B85Ba51b94bf87b84 --AddressOfReceiver=0x541bca21D23C32241aECd1A532e180501Fd53dB3

var TokenAddress, TokenAmount, PrivatekeyOfSender, AddressOfSender, AddressOfReceiver;
TokenAddress = args.TokenAddress;
TokenAmount = args.TokenAmount;
PrivatekeyOfSender = args.PrivatekeyOfSender;
AddressOfReceiver = args.AddressOfReceiver;
AddressOfSender = args.AddressOfSender;

function sendToken(TokenAddress, TokenAmount, PrivatekeyOfSender, AddressOfSender, AddressOfReceiver){
    if(TokenAddress && TokenAmount && PrivatekeyOfSender && AddressOfSender && AddressOfReceiver)
    {
        //main part
        console.log('Good parameter');

        console.log('Successfully Running');
    }
    else{
        //except
        console.log("No enough parameter!  Let's check parameter again");
        console.log('This is run example----');
        console.log('node SendToken.js --TokenAddress=0xB8c77482e45F1F44dE1745F52C74426C631bDD52 --TokenAmount=0.1 --PrivatekeyOfSender=106e60ae4f9e4570c630fde8631fe410e3a4711264b4e62ea531cbfec449a828  --AddressOfSender=0xA63bcE801870de204B080A3B85Ba51b94bf87b84 --AddressOfReceiver=0x541bca21D23C32241aECd1A532e180501Fd53dB3');

    }
}

//Running function
sendToken(TokenAddress, TokenAmount, PrivatekeyOfSender, AddressOfSender, AddressOfReceiver);