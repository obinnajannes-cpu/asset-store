# Sample Hardhat 3 Beta Project (`node:test` and `viem`)

This project showcases a Hardhat 3 Beta project using the native Node.js test runner (`node:test`) and the `viem` library for Ethereum interactions.

To learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using [`node:test`](nodejs.org/api/test.html), the new Node.js native test runner, and [`viem`](https://viem.sh/).
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
npx hardhat test solidity
npx hardhat test nodejs
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```

## Deploy the OEV token

A new ERC-20 token contract has been added at `contracts/oev.sol` with:

- name: `OG Elite Ventures`
- symbol: `OEV`
- initial supply: `1,000,000 OEV`

To deploy the token locally or to Sepolia, use the new Ignition module:

```shell
npx hardhat ignition deploy ignition/modules/OEV.ts
```

Or for Sepolia:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/OEV.ts
```

## Deploy using Remix + MetaMask (recommended for quick Sepolia deploy)

1. Open [asset-store/remix/OEV_for_remix.sol](remix/OEV_for_remix.sol) or the flattened file [asset-store/flattened/OEV_flattened.sol](flattened/OEV_flattened.sol) in Remix.
2. In Remix Settings → Compiler, select `0.8.28` and match optimization settings (the contract uses default optimization off).
3. In the Deploy & Run panel, choose `Injected Provider - MetaMask` and switch MetaMask to the Sepolia network.
4. Deploy the contract; MetaMask will prompt to confirm the transaction. After mining, copy the deployed contract address from Remix.

## Verify on Etherscan (Sepolia)

1. Go to https://sepolia.etherscan.io and open the contract address page.
2. Click `Contract` → `Verify and Publish`.
3. Choose `Single file (flattened)` and paste the contents of `flattened/OEV_flattened.sol`.
4. Select compiler version `0.8.28` and license `MIT`, then submit. Etherscan will compile and verify.

Notes:
- The flattened file already inlines OpenZeppelin dependencies to simplify verification: [flattened/OEV_flattened.sol](flattened/OEV_flattened.sol).
- You can also deploy via Hardhat Ignition using `npm run deploy:oev:sepolia` after setting `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY` in `asset-store/.env`.


### Add OEV to MetaMask

1. Copy the deployed contract address from the deploy command output.
2. Open MetaMask and choose the network you deployed to.
3. Select `Import tokens` → `Custom token`.
4. Paste the contract address.
5. MetaMask should automatically detect the token symbol `OEV` and decimals `18`.
6. Add the token to view your OEV balance.

If MetaMask does not auto-detect the token, enter:

- Token Symbol: `OEV`
- Token Decimal: `18`

### Deploy locally and register in MetaMask

To deploy on a local Hardhat network:

1. Start a local node:

```bash
npx hardhat node
```

2. In another terminal, deploy the token to localhost:

```bash
npm run deploy:oev:local
```

3. Copy the deployed address from the command output.

4. In MetaMask, add a custom RPC network:
   - Network Name: `Local Hardhat`
   - New RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`

5. Add the custom token using the deployed contract address.

### Deploy to Sepolia

If you want to deploy to Sepolia, set the environment variables first.

> Make sure your Infura endpoint is a complete URL, including `https://` and your project ID.

```bash
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
export SEPOLIA_PRIVATE_KEY="0xyourprivatekey"
```

Then run:

```bash
npm run deploy:oev:sepolia
```

After deployment, copy the address and add the token in MetaMask on the Sepolia network.

Instead of exporting variables each session, you can create a `.env` file in the project root. Copy the example file and fill in your values locally:

```bash
cp .env.example .env
# edit .env and fill in your values
```

> Do not paste your private key into chat or commit it to source control.

