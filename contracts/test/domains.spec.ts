import { ethers, deployments } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Domains } from "../typechain-types";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("Domains", () => {
  let deployer: SignerWithAddress, alice: SignerWithAddress;
  let contract: Domains;
  beforeEach(async () => {
    [deployer, alice] = await ethers.getSigners();
    await deployments.fixture(["_Domains"]);
    contract = await ethers.getContract("Domains");
  });

  it("Should register a domain name", async () => {
    await expect(contract.connect(alice).register("doom")).to.be.revertedWith("Not enough Matic paid");
    const value = ethers.utils.parseEther("0.3");
    await contract.connect(alice).register("doom", {value: value});
    const contractBalance = await ethers.provider.getBalance(contract.address);
    expect(contractBalance).to.be.equal(value);
    const domainOwner = await contract.getAddress("doom");
    expect(domainOwner).to.be.equal(alice.address);
  });

  it("Should only allow owner to change a record", async () => {
    await expect(contract.connect(deployer).setRecord("doom", "gloom")).to.be.revertedWith("This is not your domain!");
  });
});
