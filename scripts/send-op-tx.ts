import { network } from "hardhat";
import { getGasPricingOrDefault } from "./gas-utils.js";

const { viem } = await network.create({
  network: "hardhatOp",
  chainType: "op",
});

console.log("Sending transaction using the OP chain type");

const publicClient = await viem.getPublicClient();
const [senderClient] = await viem.getWalletClients();

console.log("Sending 1 wei from", senderClient.account.address, "to itself");

const l1Gas = await publicClient.estimateL1Gas({
  account: senderClient.account.address,
  to: senderClient.account.address,
  value: 1n,
});

console.log("Estimated L1 gas:", l1Gas);

const gasPricing = await getGasPricingOrDefault(publicClient);
console.log("Gas pricing used:", gasPricing);

console.log("Sending L2 transaction");
const tx = await senderClient.sendTransaction({
  to: senderClient.account.address,
  value: 1n,
  ...(gasPricing.gasPrice ? { gasPrice: gasPricing.gasPrice } : {
    maxFeePerGas: gasPricing.maxFeePerGas,
    maxPriorityFeePerGas: gasPricing.maxPriorityFeePerGas,
  }),
});

await publicClient.waitForTransactionReceipt({ hash: tx });

console.log("Transaction sent successfully");
