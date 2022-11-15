// import { ethers, network, run } from "hardhat";

async function main() {

  // The deployed contract address on network
  const tCoinXAddress = "0x126447E8D68ebBE56a2dc121120012c595a6afff";

  console.log(
    `Verifying smart contract address ${tCoinXAddress} on ${network.name}`
  );

  console.log(`Verifying contract on Etherscan...`);

  await run(`verify:verify`, {
    address: tCoinXAddress,
    contract: "contracts/TCOINX.sol:TCOINX", //Filename.sol:ClassName
    constructorArguments: [],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
