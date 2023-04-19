const MarketMicroGridContract = artifacts.require("MarketMicroGridContract");

module.exports = function (deployer) {
  deployer.deploy(MarketMicroGridContract);
};
