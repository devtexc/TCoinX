const { expect } = require("chai");
const should = require("chai").should();

describe("Token contract deployment", function () {
  let tcxToken;
  let deployer;

  // This function will initiate everytime this test is run.
  before(async function () {
    const Token = await ethers.getContractFactory("TCOINX");

    // deploy tcx token contract
    tcxToken = await Token.deploy();
    await tcxToken.deployed();

    // get and assign the deployer and other addresses from the default addresses vault
    [deployer] = await ethers.getSigners();
  });

  it("Should token contract be deployed successfully", async function () {
    const contractAddress = await tcxToken.address;
    console.log("Token contract is deployed successfully.");
    console.log(`Contract address: ${contractAddress}`);
  });

  it("Should token contract contruction param passed as expected", async function () {
    const name = await tcxToken.name();
    const symbol = await tcxToken.symbol();
    const decimals = await tcxToken.decimals();

    console.log(`Token name: ${name}`);
    console.log(`Token symbol: ${symbol}`);
    console.log(`Token decimals: ${decimals}`);

    should.exist(name);
    should.exist(symbol);
    should.exist(decimals);
  });

  it("Token contract deployment should assign the total supply of tokens to the deployer/owner", async function () {
    const deployerBalance = await tcxToken.balanceOf(deployer.address);
    const totalSupply = await tcxToken.totalSupply();

    console.log(`Total supply: ${totalSupply}`);
    console.log(`Deployer balance: ${deployerBalance}`);

    expect(totalSupply).to.equal(deployerBalance);
  });
});
