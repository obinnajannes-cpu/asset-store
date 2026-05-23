import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { network } from "hardhat";
import { getGasPricingOrDefault } from "./gas-utils.js";

const getEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env and set ${name} before deploying.`
    );
  }
  return value;
};

const privateKey = getEnvVar("SEPOLIA_PRIVATE_KEY");
const fallbackNetwork = process.env.FALLBACK_NETWORK ?? "hardhat";
const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;

const artifactPath = path.resolve("artifacts/contracts/oev.sol/OEV.json");
if (!fs.existsSync(artifactPath)) {
  throw new Error(
    `Missing OEV artifact at ${artifactPath}. Run "npx hardhat compile" before deploying.`
  );
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
if (!artifact.bytecode) {
  throw new Error("OEV artifact does not contain bytecode.");
}

async function connectToNetwork() {
  const networkCandidates = [] as string[];
  if (sepoliaRpcUrl) {
    networkCandidates.push("sepolia");
  }
  networkCandidates.push(fallbackNetwork);

  let lastError: unknown;
  for (const candidate of networkCandidates) {
    try {
      const connection = await network.create({
        network: candidate,
        override:
          candidate === "sepolia"
            ? { accounts: [privateKey] }
            : undefined,
      });
      const publicClient = await connection.viem.getPublicClient();
      await publicClient.getBlockNumber();
      return { connection, networkName: candidate };
    } catch (error) {
      lastError = error;
      console.warn(`Unable to connect to ${candidate}:`, error);
    }
  }

  throw new Error(
    `Unable to connect to any deployment network. Last error: ${String(lastError)}`
  );
}

const { connection, networkName } = await connectToNetwork();
const { viem } = connection;
const publicClient = await viem.getPublicClient();

const walletClients = await viem.getWalletClients();
if (!walletClients?.length) {
  throw new Error(
    "No wallet client available. Ensure your Hardhat network config includes the deploy private key or that the selected network supports local signing."
  );
}

const walletClient = walletClients[0];
const deployer = walletClient.account.address;
const gasPricing = await getGasPricingOrDefault(publicClient);
const estimatedGas = await publicClient.estimateGas({
  account: deployer,
  data: artifact.bytecode,
});
const gasLimit = estimatedGas + 150_000n;

const deployOptions = {
  walletClient,
  gas: gasLimit,
  ...(gasPricing.gasPrice
    ? { gasPrice: gasPricing.gasPrice }
    : {
        maxFeePerGas: gasPricing.maxFeePerGas,
        maxPriorityFeePerGas: gasPricing.maxPriorityFeePerGas,
      }),
};

console.log("Deploying OEV token...");
console.log("Network:", networkName);
console.log(
  "RPC URL:",
  networkName === "sepolia" ? sepoliaRpcUrl : fallbackNetwork,
);
console.log("Deployer address:", deployer);
console.log("Gas price / fee settings:", deployOptions);
console.log("Estimated gas limit:", gasLimit.toString());

const oev = await viem.deployContract("OEV", [], deployOptions);

const name = await oev.read.name();
const symbol = await oev.read.symbol();
const totalSupply = await oev.read.totalSupply();

const deploymentDetails = {
  network: networkName,
  rpcUrl: networkName === "sepolia" ? sepoliaRpcUrl : fallbackNetwork,
  deployer,
  contractAddress: oev.address,
  inputData: artifact.bytecode,
  token: {
    name,
    symbol,
    totalSupply: totalSupply.toString(),
  },
  gas: {
    gasLimit: gasLimit.toString(),
    ...gasPricing,
  },
};

console.log("OEV deployed successfully:");
console.log(JSON.stringify(deploymentDetails, null, 2));
