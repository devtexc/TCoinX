async function main() {
  // We get the contract to deploy
  const TCOINX = await ethers.getContractFactory("TCOINX");
  console.log("Deploying TCOINX...");
  const tcoinx = await TCOINX.deploy();

  console.log("Deploy transaction:", tcoinx);

  await tcoinx.deployed();
  console.log("Tcoinx deployed to:", tcoinx.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
