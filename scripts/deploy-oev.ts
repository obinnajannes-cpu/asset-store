import { network } from "hardhat";
import { getGasPricingOrDefault } from "./gas-utils.ts";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();

console.log("Deploying OEV token...");

const gasPricing = await getGasPricingOrDefault(publicClient);
console.log("Gas pricing used:", gasPricing);

const deployConfig = gasPricing.gasPrice
  ? { gasPrice: gasPricing.gasPrice }
  : {
      maxFeePerGas: gasPricing.maxFeePerGas,
      maxPriorityFeePerGas: gasPricing.maxPriorityFeePerGas,
    };

const oev = await viem.deployContract("OEV", [], deployConfig);

console.log(`OEV deployed at: ${oev.address}`);
console.log("Token name:", await oev.read.name());
console.log("Token symbol:", await oev.read.symbol());
console.log("Total supply:", await oev.read.totalSupply());
