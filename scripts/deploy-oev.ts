import { network } from "hardhat";

const { viem } = await network.create();

console.log("Deploying OEV token...");

const oev = await viem.deployContract("OEV");

console.log(`OEV deployed at: ${oev.address}`);
console.log("Token name:", await oev.read.name());
console.log("Token symbol:", await oev.read.symbol());
console.log("Total supply:", await oev.read.totalSupply());
