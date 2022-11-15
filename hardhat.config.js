require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: __dirname + "/.env" });
const { etherscanApiKey } = require("./etherscan.json");
require("@nomiclabs/hardhat-etherscan");

const { ALCHEMY_API_KEY, GOERLI_PRIVATE_KEY } = process.env;
const GOERLI_PRIVATE_KEY_ACCOUNT_5 =
  "c578c9c4a1478c66de8072249e122dc7acc5b9bf83f675cabcd57c89c37b29a7"; // TCX Deployer
const GOERLI_PRIVATE_KEY_ACCOUNT_1 =
  "9c9984886828c90874d0bbe7d324bae0cd4b1b11866860913afe830317847d63";
const GOERLI_PRIVATE_KEY_ACCOUNT_3 =
  "a92699d4e4ef00c80ee258b67fa2c7493f47e9bc844022b30c795921adb6da06";

module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/B1G80GPybgO9ERVTTHptZgY4xvd5whqP`,
      accounts: [GOERLI_PRIVATE_KEY_ACCOUNT_5],
      gasPrice: 30000000000, // 30 GWEI
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/B1G80GPybgO9ERVTTHptZgY4xvd5whqP`,
      accounts: [GOERLI_PRIVATE_KEY_ACCOUNT_5],
      gasPrice: 30000000000, // 30 GWEI
    },
  },
  mocha: {
    timeout: 5 * 60 * 1000, // 5 min
  },
  etherscan: {
    apiKey: etherscanApiKey,
  },
};
