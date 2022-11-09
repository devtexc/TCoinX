const { expect } = require("chai");

describe("Token contract snapshot test", function () {
  let tcxToken;
  let randToken;
  let deployer;
  let otherAccount1;
  let otherAccount2;
  let contractETHBalance;
  let deployerETHBalance;

  // This function will initiate before each testing async function runs.
  before(async function () {
    const Token = await ethers.getContractFactory("TCOINX");
    const randomToken = await ethers.getContractFactory("RANDOMTOKEN");
    [deployer, otherAccount1, otherAccount2] = await ethers.getSigners();

    // deploy tcx token contract
    tcxToken = await Token.deploy();
    await tcxToken.deployed();

    // deploy random token contract
    randToken = await randomToken.deploy();
    await randToken.deployed();

    // Do some transaction to the contract address
    console.log(`Deployer transfering 50 TCX to TCX contract address...`);
    console.log(`Deployer transfering 100 RAND to TCX contract address...`);
    console.log(`Deployer transfering 10 ETH to TCX contract address...`);

    await tcxToken.transfer(tcxToken.address, 50);
    await randToken.transfer(tcxToken.address, 100);
    await deployer.sendTransaction({
      to: tcxToken.address,
      value: ethers.utils.parseEther("10"), // Sends exactly 10 ether
    });

    // Check contract address after transactions
    console.log(
      `\nInitial token balance on contract (TCX): ${tcxToken.address}`
    );
    console.log(`-------------------------------------------`);
    console.log(`TCX : ${await tcxToken.balanceOf(tcxToken.address)}`);
    console.log(`RAND: ${await randToken.balanceOf(tcxToken.address)}`);
    console.log(`ETH : ${await getETHBalance(tcxToken.address)}`);
  });

  it("Should other accounts cannot trigger all the releasable contract functions", async function () {
    console.log(`\nTest case #1`);

    await expect(
      tcxToken
        .connect(otherAccount1)
        .releaseETH(otherAccount1.address, ethers.utils.parseEther("1"))
    ).to.be.reverted;

    await expect(
      tcxToken.connect(otherAccount1).releaseAllETH(otherAccount1.address)
    ).to.be.reverted;

    await expect(
      tcxToken
        .connect(otherAccount2)
        .releaseERC20(tcxToken.address, otherAccount1.address, 1)
    ).to.be.reverted;

    await expect(
      tcxToken
        .connect(otherAccount2)
        .releaseAllERC20(tcxToken.address, otherAccount1.address)
    ).to.be.reverted;
  });

  it("Should any token stuck in the contract are withdrawable", async function () {
    console.log(`\nTest case #2`);
    console.log(`Releasing all TCX token...`);

    // Deployer will bare network fees for this transaction
    await tcxToken.releaseAllERC20(tcxToken.address, deployer.address);
    let tcxBalance = await tcxToken.balanceOf(tcxToken.address);

    console.log(`\nBalance on contract:`);
    console.log(`-------------------------------------------`);
    console.log(`TCX : ${tcxBalance}`);

    expect(tcxBalance).to.equal(0);
  });

  it("Should any other ERC20 tokens stuck in the contract are withdrawable", async function () {
    console.log(`\nTest case #3`);
    console.log(`Releasing all RAND token...`);

    // Deployer will bare network fees for this transaction
    await tcxToken.releaseAllERC20(randToken.address, deployer.address);
    let randBalance = await randToken.balanceOf(tcxToken.address);

    console.log(`\nBalance on contract:`);
    console.log(`-------------------------------------------`);
    console.log(`RAND : ${randBalance}`);

    expect(randBalance).to.equal(0);
  });

  it("Should all the ETH within the contract withdrawable", async function () {
    console.log(`\nTest case #4`);
    console.log(`Releasing all ETH...`);

    // Deployer will bare network fees for this transaction
    const withdrawAmount = ethers.utils.parseEther("1");
    await tcxToken.releaseETH(deployer.address, withdrawAmount);
    await expect(await getETHBalance(tcxToken.address)).to.equal("9.0");

    await tcxToken.releaseAllETH(deployer.address);
    contractETHBalance = await getETHBalance(tcxToken.address);
    await expect(contractETHBalance).to.equal("0.0");

    console.log(`\nBalance on contract:`);
    console.log(`-------------------------------------------`);
    console.log(`ETH : ${contractETHBalance}`);
  });

  async function getETHBalance(address) {
    const balance = await hre.network.provider.send("eth_getBalance", [
      address,
    ]);

    return ethers.utils.formatEther(balance);
  }
});
