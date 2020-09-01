// Abstract the contract (Load the compiled contract (json format - starNotaryv2/build/contracts/starNotary.json))
const StarNotary = artifacts.require("starNotary");

var accounts;
var owner;

// Truffle gets a clean copy every time you deploy your tests or you run your test.
// It takes two parameter 1. description and 2. Function that automatically gets the accounts. 
contract('StarNotary', (accs) => {
    // When we deploy, we gets list of accounts and I am storing it in accounts variable. 
    accounts = accs;    
    owner = accounts[0];
});

// Test CreateStar functionality
it('Can create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]});
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!');
});

it('lets user1 putup their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei("0.01", "ether");
    await instance.createStar('Awesome Star 2!', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('let user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei("1", "ether");
    let balance = web3.utils.toWei("2", "ether");
    
    await instance.createStar('Awesome Star 3!', starId, {from: user1, gasPrice:0});
    await instance.putStarUpForSale(starId, starPrice, {from: user1, gasPrice:0});
    
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.approve(user2, starId, {from:user1, gasPrice:0});
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});

    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    
    assert.equal(value1, value2);
    
});

it('let user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei("0.01", "ether");
    let balance = web3.utils.toWei("0.05", "ether");

    await instance.createStar('Awesome Star 4!', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    
    let balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.approve(user2, starId, {from:user1, gasPrice:0});
    await instance.buyStar(starId, {from: user2, value: balance});

    assert.equal(await instance.ownerOf.call(starId), user2);

});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei("0.01", "ether");
    let balance = web3.utils.toWei("0.02", "ether");

    await instance.createStar('Awesome Star 5!', starId, {from: user1, gasPrice:0});
    await instance.putStarUpForSale(starId, starPrice, {from: user1, gasPrice:0});

    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);

    await instance.approve(user2, starId, {from:user1, gasPrice:0});
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice: 0});
    const balanceOfUser2AfterTransaction = await web3.eth.getBalance(user2);

    console.log(user1, await web3.eth.getBalance(user1));
    console.log(user2, await web3.eth.getBalance(user2));

    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceOfUser2AfterTransaction);

    assert.equal(starPrice, value);

});