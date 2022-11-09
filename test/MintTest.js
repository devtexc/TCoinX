const { expect } = require("chai");

describe("Token contract minting test", function () {
  let tcxToken;
  let deployer;
  let otherAccount1;
  let otherAccount2;

  // This function will initiate before each testing async function runs.
  beforeEach(async function () {
    const Token = await ethers.getContractFactory("TCOINX");

    // deploy tcx token contract
    tcxToken = await Token.deploy();
    await tcxToken.deployed();

    // get and assign the deployer and other addresses from the default addresses vault
    [deployer, otherAccount1, otherAccount2] = await ethers.getSigners();
  });

  it("Should minted token be credited to deployer", async function () {    
    console.log(`\nTest case #1`);
    const balanceBeforeMint = await tcxToken.balanceOf(deployer.address);
    const mintAmount = ethers.BigNumber.from(1000);
    await tcxToken.mint(deployer.address, mintAmount);
    const balanceAfterMint = await tcxToken.balanceOf(deployer.address);

    console.log(`Deployer: ${deployer.address}`);
    console.log(`Minting amount: ${mintAmount}`);
    console.log(`Balance:`);
    console.log(`-----------------------------------------`);
    console.log(`Before: ${balanceBeforeMint}`);
    console.log(`After : ${balanceAfterMint}`);

    expect(balanceBeforeMint.add(mintAmount)).to.equal(balanceAfterMint);
  });

  it("Should only deployer can mint tokens", async function () {
    console.log(`\nTest case #2`);
    // Deployer minting
    console.log(`Minting token for deployer...`);
    const mintAmount = ethers.BigNumber.from(1000);
    await tcxToken.mint(deployer.address, mintAmount);
    const deployerBalance = await tcxToken.balanceOf(deployer.address);
    console.log(
      `Deployer 1: ${deployer.address} with token balance ${deployerBalance}`
    );

    // Account 1 minting
    console.log(`Minting token for account 1...`);
    await expect(
      tcxToken.connect(otherAccount1).mint(otherAccount1.address, mintAmount)
    ).to.be.reverted;
    const acc1Balance = await tcxToken.balanceOf(otherAccount1.address);
    console.log(
      `Account 1 : ${otherAccount1.address} with token balance ${acc1Balance}`
    );

    // Account 2 minting
    console.log(`Minting token for account 2...`);
    await expect(
      tcxToken.connect(otherAccount2).mint(otherAccount1.address, mintAmount)
    ).to.be.reverted;
    const acc2Balance = await tcxToken.balanceOf(otherAccount2.address);
    console.log(
      `Account 2 : ${otherAccount2.address} with token balance ${acc2Balance}`
    );
  });

  it("Should deployer able to mint token for other address", async function () {
    console.log(`\nTest case #3`);
    const balanceBeforeMint = await tcxToken.balanceOf(otherAccount1.address);
    const mintAmount = ethers.BigNumber.from(1000);
    await tcxToken.mint(otherAccount1.address, mintAmount);
    const balanceAfterMint = await tcxToken.balanceOf(otherAccount1.address);

    console.log(`Account 1: ${otherAccount1.address}`);
    console.log(`Minting amount: ${mintAmount}`);
    console.log(`Balance`);
    console.log(`-----------------------------------------`);
    console.log(`Before: ${balanceBeforeMint}`);
    console.log(`After : ${balanceAfterMint}`);

    expect(balanceBeforeMint.add(mintAmount)).to.equal(balanceAfterMint);
  });
});
