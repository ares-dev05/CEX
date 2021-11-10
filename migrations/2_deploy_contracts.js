const Token = artifacts.require("Token");
const Token2 = artifacts.require("Token2");
const Token3 = artifacts.require("Token3");
const Exchange = artifacts.require("Exchange");
const Exchange2 = artifacts.require("Exchange2");
const Exchange3 = artifacts.require("Exchange3");


module.exports = async function(deployer) {
  const accounts = await web3.eth.getAccounts()

  await deployer.deploy(Token);
  await deployer.deploy(Token2);
  await deployer.deploy(Token3);

  const feeAccount = accounts[5]
  const feePercent = 4
  const feeAccount1 = accounts[6]
  const feePercent1 = 3
  const feeAccount2 = accounts[7]
  const feePercent2 = 3
  
  await deployer.deploy(Exchange,  feeAccount, feePercent, feeAccount1, feePercent1, feeAccount2, feePercent2);

  await deployer.deploy(Exchange2,  feeAccount, feePercent, feeAccount1, feePercent1, feeAccount2, feePercent2)
  await deployer.deploy(Exchange3,  feeAccount, feePercent, feeAccount1, feePercent1, feeAccount2, feePercent2)
};

