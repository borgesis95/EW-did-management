const MicroGridContract = artifacts.require("MarketMicroGridContract");

contract("MarketMicroGrid.sol", (accounts) => {
  before(async () => {
    instance = await MicroGridContract.deployed();
  });

  it("Create new offer and get back offers array", async () => {
    console.log("accounts", accounts);
    const date = new Date().getTime();
    price = 35;
    await instance.createOffer(accounts[1], price, date);
    const res = await instance.getOffers();
    assert.lengthOf(res, 1, "One offer has been created");
  });

  it("Create bid and get back bids array", async () => {
    const date = new Date().getTime();
    price = 50;
    await instance.createBid(accounts[2], price, date);
    const res = await instance.getBids();
    console.log("res bids", res);
    assert.lengthOf(res, 1, "One bid has been created");
  });
});
