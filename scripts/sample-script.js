// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const fs = require("fs");
const hre = require("hardhat");
const {ethers} = require("hardhat");

async function main() {
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();

  const EthSwap = await ethers.getContractFactory("EthSwap");
  const ethSwap = await EthSwap.deploy(token.address);
  await ethSwap.deployed();

  const ethSwapData = {
    address: ethSwap.address,
    abi: JSON.parse(ethSwap.interface.format('json'))
  };
  fs.writeFileSync('./src/ethSwap.json', JSON.stringify(ethSwapData));

  const tokenData = {
    address: token.address,
    abi: JSON.parse(token.interface.format('json'))
  };
  fs.writeFileSync('./src/token.json',
    JSON.stringify(tokenData));

  console.log("ethSwap deployed to:", ethSwap.address);
  await token.transfer(ethSwap.address, '1000000000000000000000000')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
