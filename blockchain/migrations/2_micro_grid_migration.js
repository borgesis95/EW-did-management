const MicroGridContract = artifacts.require("MicroGridContract");

module.exports = function (deployer) {
  deployer.deploy(MicroGridContract);
};
