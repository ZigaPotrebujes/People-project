const People = artifacts.require("People");
const truffleAssert = require("truffle-assertions");

contract("People", async function(accounts){

  beforeEach(async function(){

  });

  it("should not create a person with age over 150 yrs", async function(){
    let instance = await People.deployed();
    await truffleAssert.fails(instance.createPerson("Ziga", 270, 190, {value: web3.utils.toWei("1", "ether")}), truffleAssert.ErrorType.REVERT);
  });
  it("should not create a person without payment", async function(){
    let instance = await People.deployed();
    await truffleAssert.fails(instance.createPerson("Ziga", 27, 190, {value: 1000000}), truffleAssert.ErrorType.REVERT);
  });
  it("should set senior status correctly", async function(){
    let instance = await People.deployed();
    await instance.createPerson("Ziga", 75, 190, {value: web3.utils.toWei("1", "ether")});
    let result = await instance.getPerson();
    assert(result.senior === true, "Senior level not set correctly");
  });
  it("should allow owner to delete an account", async function(){
    let instance = await People.deployed();
    await instance.createPerson("JohnyBravo", 29, 190, {value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(instance.deletePerson(accounts[1], {from: accounts[0]}));
  });
  it("should not allow non-owners to delete an account", async function(){
    let instance = await People.deployed();
    await instance.createPerson("BravoJohnny", 92, 190, {value: web3.utils.toWei("1", "ether")});
    await truffleAssert.fails(instance.deletePerson(accounts[2], {from: accounts[1]}));
  });
  it("should increase balance of the contract when a new user is added", async function(){
    let instance = await People.new();
    await instance.createPerson("JohhnyBravo", 29, 190, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    let contractBalance = await web3.eth.getBalance(instance.address);
    assert(contractBalance === web3.utils.toWei("1", "ether"));
  });
  it("should allow owner to withdraw balance", async function(){
    let instance = await People.new();
    await instance.createPerson("JohhnyBravo", 29, 190, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(instance.withdrawAll({from: accounts[0]}));
  });
  it("should not allow a non-owner to withdraw balance", async function(){
    let instance = await People.new();
    await instance.createPerson("JohnnyBravo", 29, 190, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.fails(instance.withdrawAll({from: accounts[1]}), truffleAssert.ErrorType.REVERT);
  });
  it("should increase owner's balance after withdrawal", async function(){
    let instance = await People.new();
    await instance.createPerson("JohnnyBravo", 29, 190, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    let ownerBalance = parseFloat(await web3.eth.getBalance(accounts[0]));
    await instance.withdrawAll();
    let newOwnerBalance = parseFloat(await web3.eth.getBalance(accounts[0]));
    assert(newOwnerBalance > ownerBalance);
  });
  it("should reset balance to 0 after withdrawal", async function(){
    let instance = await People.new();
    await instance.createPerson("JohnnyBravo", 29, 190, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await instance.withdrawAll();

    let balance = await instance.balance();
    let ourBalance = await parseFloat(balance);

    let realBalance = await web3.eth.getBalance(instance.address);
    assert(ourBalance == web3.utils.toWei("0", "ether") && ourBalance == realBalance, "Our balance should match the real one and they should be 0");
  });
});
