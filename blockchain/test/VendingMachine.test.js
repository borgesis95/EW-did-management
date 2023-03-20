const VendingMachine = artifacts.require("VendingMachine");

// Invece di describe
contract.skip("VendingMachine", (accounts) => {
  // prima di tutto va deployato il contratto
  before(async () => {
    instance = await VendingMachine.deployed();
  });

  it("ensure that starting balance of the vending machine is 100", async () => {
    let balance = await instance.getVendingMachineBalance();
    assert.equal(balance, 100, "The initial balance should be 100");
  });

  it("ensures the balance of vending maching can be updated", async () => {
    await instance.restock(100);
    let balance = await instance.getVendingMachineBalance();
    assert.equal(balance, 200, "The initial balance should be 200");
  });

  it("allows donuts to be purchased", async () => {
    await instance.purchase(1, {
      from: accounts[0],
      value: web3.utils.toWei("3", "ether"),
    });
    let balance = await instance.getVendingMachineBalance();
    assert.equal(balance, 199, "The initial balance should be 199");
  });
});
