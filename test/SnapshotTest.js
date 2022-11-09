const { expect } = require("chai");

describe("Token contract snapshot test", function () {
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

  it("Should snapshot working as expected", async function () {
    console.log(`\nTest case #1`);

    // First snapshot
    console.log(`\nTaking Snapshot 1...`);
    const snapshot = await tcxToken.snapshot();
    const result = await snapshot.wait();
    const snapshotID = result.events[0].data;

    // Balance recording
    const balDeployer = await tcxToken.balanceOf(deployer.address);
    const balAcc1 = await tcxToken.balanceOf(otherAccount1.address);
    const balAcc2 = await tcxToken.balanceOf(otherAccount2.address);
    const balDeployerSnap1 = await tcxToken.balanceOfAt(
      deployer.address,
      snapshotID
    );
    const balAcc1Snap1 = await tcxToken.balanceOfAt(
      otherAccount1.address,
      snapshotID
    );
    const balAcc2Snap1 = await tcxToken.balanceOfAt(
      otherAccount2.address,
      snapshotID
    );

    // Do some transactions
    console.log(`Deployer transfering 100 to account 1...`);
    console.log(`Deployer transfering 150 to account 2...`);
    await tcxToken.transfer(otherAccount1.address, 100);
    await tcxToken.transfer(otherAccount2.address, 150);

    // Second snapshot
    console.log(`Taking Snapshot 2...`);
    const snapshot2 = await tcxToken.snapshot();
    const result2 = await snapshot2.wait();
    const snapshotID2 = result2.events[0].data;

    // balance recording
    const balDeployer_2 = await tcxToken.balanceOf(deployer.address);
    const balAcc1_2 = await tcxToken.balanceOf(otherAccount1.address);
    const balAcc2_2 = await tcxToken.balanceOf(otherAccount2.address);
    const balDeployerSnap2 = await tcxToken.balanceOfAt(
      deployer.address,
      snapshotID2
    );
    const balAcc1Snap2 = await tcxToken.balanceOfAt(
      otherAccount1.address,
      snapshotID2
    );
    const balAcc2Snap2 = await tcxToken.balanceOfAt(
      otherAccount2.address,
      snapshotID2
    );

    // Log results
    console.log(`\nSnapshot 1 Balance`);
    console.log("----------------------------------------------");
    console.log(`Deployer : ${balDeployerSnap1.toString()}`);
    console.log(`Account 1: ${balAcc1Snap1.toString()}`);
    console.log(`Account 2: ${balAcc2Snap1.toString()}`);

    console.log(`\nSnapshot 2 Balance`);
    console.log("----------------------------------------------");
    console.log(`Deployer : ${balDeployerSnap2.toString()}`);
    console.log(`Account 1: ${balAcc1Snap2.toString()}`);
    console.log(`Account 2: ${balAcc2Snap2.toString()}`);

    // Validate result
    expect(balDeployer).to.equal(balDeployerSnap1);
    expect(balAcc1).to.equal(balAcc1Snap1);
    expect(balAcc2).to.equal(balAcc2Snap1);

    expect(balDeployer_2).to.equal(balDeployerSnap2);
    expect(balAcc1_2).to.equal(balAcc1Snap2);
    expect(balAcc2_2).to.equal(balAcc2Snap2);
  });
});
