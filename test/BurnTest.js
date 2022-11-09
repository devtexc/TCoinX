const { expect } = require("chai");

describe("Token contract burning test", function () {
  let tcxToken;
  let deployer;
  let otherAccount1;

  // This function will initiate before each testing async function runs.
  beforeEach(async function () {
    const Token = await ethers.getContractFactory("TCOINX");

    // deploy tcx token contract
    tcxToken = await Token.deploy();
    await tcxToken.deployed();

    // get and assign the deployer and other addresses from the default addresses vault
    [deployer, otherAccount1] = await ethers.getSigners();
  });

  it("Should deployer burn owned token", async function () {
    console.log(`\nTest case #1`);
    const balanceBeforeBurn = await tcxToken.balanceOf(deployer.address);
    const totalSupplyBeforeBurn = await tcxToken.totalSupply();
    const burnAmount = ethers.BigNumber.from(1000);
    await tcxToken.burn(burnAmount);
    const balanceAfterBurn = await tcxToken.balanceOf(deployer.address);
    const totalSupplyAfterBurn = await tcxToken.totalSupply();

    console.log(`Deployer: ${deployer.address}`);
    console.log(`Burning amount: ${burnAmount}`);
    console.log(`Balance`);
    console.log(`-----------------------------------------`);
    console.log(`Before: ${balanceBeforeBurn}`);
    console.log(`After : ${balanceAfterBurn}`);
    console.log(`\nTotal Supply`);
    console.log(`-----------------------------------------`);
    console.log(`Before: ${totalSupplyBeforeBurn}`);
    console.log(`After : ${totalSupplyAfterBurn}`);

    expect(balanceBeforeBurn.sub(burnAmount)).to.equal(balanceAfterBurn);
  });

  it("Should not deployer burn more than owned token", async function () {
    console.log(`\nTest case #2`);
    const balance = await tcxToken.balanceOf(deployer.address);
    const burnAmount = balance.add(ethers.BigNumber.from(1000));

    console.log(`Token balance  : ${balance}`);
    console.log(`Burn amount    : ${burnAmount}`);

    await expect(tcxToken.burn(burnAmount)).to.be.reverted;
  });
});
