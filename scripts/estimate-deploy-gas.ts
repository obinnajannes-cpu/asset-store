import { network } from 'hardhat';
import fs from 'node:fs';
import path from 'node:path';

const main = async () => {
  const artifactPath = path.resolve('artifacts/contracts/oev.sol/OEV.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const { bytecode } = artifact;
  if (!bytecode) {
    throw new Error('Artifact has no bytecode');
  }

  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();

  const [senderClient] = await viem.getWalletClients();
  if (!senderClient) {
    throw new Error('No wallet client available for gas estimation.');
  }

  const from = senderClient.account.address;

  const gas = await publicClient.estimateGas({
    account: from,
    data: bytecode,
  });

  console.log('from account:', from);
  console.log('estimated deployment gas:', gas.toString());
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
