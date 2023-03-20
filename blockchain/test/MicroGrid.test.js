const MicroGridContract = artifacts.require("MicgroGridContract");

contract("MicroGrid.sol", (accounts) => {
  before(async () => {
    instance = await MicroGridContract.deployed();
  });

  it("Create new offer and get back offers", async () => {
    const address = "0x73e37134d95b545f1a39c124618852706dcf6620";
    await instance.createEnergyOffer(address, 250, 1679320614, 1679320614);
  });
});
