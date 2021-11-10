// Parameter type
// Run Example
// node SendTokens.js --contractAddr=0x324324324 --fromPrivateKey=
const args = require('minimist')(process.argv.slice(2))

function checkAllUsers(){
    console.log('All users balance');
}


function checkAllTokens(){
    console.log('All Tokens balance');
}
//Running function
checkAllUsers();
checkAllTokens();