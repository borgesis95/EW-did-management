// Help Truffle find `TruffleTutorial.sol` in the `/contracts` directory
const VendingMachine = artifacts.require("VendingMachine");

module.exports = function (deployer) {
  // Command Truffle to deploy the Smart Contract
  deployer.deploy(VendingMachine);
};
