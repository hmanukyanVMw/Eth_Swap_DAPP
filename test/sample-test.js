const { expect } = require("chai");
const { ethers } = require("hardhat");
const { arrayify } = require("ethers/lib/utils");

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("AirDrop", function () {
  const TOKENS_IN_POOL = toWei(1000000000)
  const REWARD_AMOUNT = toWei(500)
  let addrs
  let contractBlocknumber
  const blockNumberCutoff = 11 // Any account that used ethSwap before or including this blocknumber are eligible for airdrop.
  before(async function () {
    // Create an array that shuffles the numbers 0 through 19.
    // The elements of the array will represent the develeopment account number
    // and the index will represent the order in which that account will use ethSwap to buyTokens
    // this.shuffle = []
    // while (this.shuffle.length < 2) {
    //   let r = Math.floor(Math.random() * 20)
    //   if (this.shuffle.indexOf(r) === -1) {
    //     this.shuffle.push(r)
    //   }
    // }

    // Get all signers
    addrs = await ethers.getSigners();
    // Deploy eth swap
    const tokenFactory = await ethers.getContractFactory('Token', addrs[0]);
    this.token = await tokenFactory.deploy();

    console.log(this.token, "tokenAddress");
    let tokenAddress = this.token.address;
    // Deploy eth swap
    const EthSwapFactory = await ethers.getContractFactory('EthSwap', addrs[0]);
    this.ethSwap = await EthSwapFactory.deploy(tokenAddress);

    const receipt = await this.ethSwap.deployTransaction.wait()
    contractBlocknumber = receipt.blockNumber

    // Check that all 1 million tokens are in the pool
    expect(
      await this.token.balanceOf(this.ethSwap.address)
    ).to.equal(TOKENS_IN_POOL);
  });

  it('contract has a name', async () => {
      const name = await this.ethSwap.name()
      assert.equal(name, 'EthSwap Instant Exchange')
  })
});
