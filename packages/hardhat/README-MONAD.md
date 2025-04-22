# Deploying to Monad Testnet

This guide will help you deploy your Legal Game contracts to the Monad Testnet.

## Monad Testnet Details

- **Network Name**: Monad Testnet
- **Chain ID**: 10143
- **RPC URL**: https://testnet-rpc.monad.xyz/
- **Block Explorer**: https://testnet.monadexplorer.com/
- **Currency Symbol**: MON

## Prerequisites

1. Make sure you have Node.js and Yarn installed
2. Install dependencies by running `yarn install` in the root directory
3. Get some MON testnet tokens from the Monad faucet (if available) or contact the Monad team

## Setup Environment

1. Create a `.env` file in the `packages/hardhat` directory if it doesn't exist
2. Add your private key to the `.env` file:

```
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

**Important**: Make sure your private key is for an account with MON testnet tokens.

## Deployment

### Method 1: Using our script

Run the deployment script:

```bash
cd packages/hardhat
node scripts/deployToMonad.js
```

### Method 2: Manual deployment

Deploy manually:

```bash
cd packages/hardhat
npx hardhat deploy --network monadTestnet
```

## Verify Deployment

After deployment, you can view your contracts on the Monad Explorer:

1. Go to https://testnet.monadexplorer.com/
2. Search for your contract address (printed in the deployment logs)

## Connect Frontend to Monad Testnet

The frontend is already configured to connect to Monad Testnet. When you start the app with `yarn start`, you should see Monad Testnet as an option in the network selection dropdown.

## Making Transactions on Monad Testnet

Once connected to Monad Testnet:

1. The game will use the deployed contracts automatically
2. All transactions will be processed on the Monad network
3. You can view transaction history in the Monad Explorer

## Troubleshooting

- If you encounter RPC errors, make sure the Monad Testnet is operational
- If transactions fail, ensure you have enough MON for gas fees
- For any other issues, consult the Monad documentation or community forums 