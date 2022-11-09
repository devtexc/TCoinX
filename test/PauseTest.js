const { expect } = require("chai");

describe("Token contract pause/unpause test", function () {
  let tcxToken;
  let deployer;
  let otherAccount1;
  let otherAccount2;

  // This function will initiate before each testing async function runs.
  before(async function () {
    const Token = await ethers.getContractFactory("TCOINX");

    // deploy tcx token contract
    tcxToken = await Token.deploy();
    await tcxToken.deployed();

    // get and assign the deployer and other addresses from the default addresses vault
    [deployer, otherAccount1, otherAccount2] = await ethers.getSigners();
  });

  it("Should token cannot be transferred when deployer paused transfer", async function () {
    console.log(`\nTest case #1`);

    // token minting for account 1
    const mintAmount = ethers.BigNumber.from(1000);
    await tcxToken.mint(otherAccount1.address, mintAmount);

    // transfer from deployer to account 2
    await tcxToken.transfer(otherAccount2.address, 50);
    expect(await tcxToken.balanceOf(otherAccount2.address)).to.equal(50);

    // pause transfer
    await tcxToken.pause();

    // deployer transfer to account 1
    await expect(tcxToken.transfer(otherAccount1.address, 50)).to.be.reverted;

    // account 1 transfer to account 2
    await expect(
      tcxToken.connect(otherAccount1).transfer(otherAccount2.address, 50)
    ).to.be.reverted;

    // unpause transfer
    await tcxToken.unpause();

    // account transfer to account 2
    await tcxToken.connect(otherAccount1).transfer(otherAccount2.address, 50);
    expect(await tcxToken.balanceOf(otherAccount2.address)).to.equal(100);
  });
});
