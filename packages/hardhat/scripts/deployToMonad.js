#!/usr/bin/env node

/**
 * Script to deploy the contract to Monad Testnet
 * 
 * Usage: 
 * 1. Make sure you have a private key set up in your .env file as DEPLOYER_PRIVATE_KEY
 * 2. Run: node scripts/deployToMonad.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ASCII Art for fun
console.log(`
    __  ___                      __   ______           __            __ 
   /  |/  /___  ____  ____ _____/ /  /_  __/__  _____/ /_____  ____/ /_
  / /|_/ / __ \\/ __ \\/ __ \`/ __  /    / / / _ \\/ ___/ __/ __ \\/ __  / /
 / /  / / /_/ / / / / /_/ / /_/ /    / / /  __(__  ) /_/ /_/ / /_/ /_/ 
/_/  /_/\\____/_/ /_/\\__,_/\\__,_/    /_/  \\___/____/\\__/\\____/\\__,_(_)  
                                                                        
`);

console.log('🚀 Starting deployment to Monad Testnet...');

try {
  // Check if .env file exists with private key
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found. Please create one with DEPLOYER_PRIVATE_KEY');
    process.exit(1);
  }

  // 1. Deploy the contracts to Monad Testnet
  console.log('📄 Deploying contracts...');
  execSync('npx hardhat deploy --network monadTestnet', { stdio: 'inherit' });
  
  // 2. Verify deployment was successful
  console.log('✅ Deployment completed successfully!');
  console.log('');
  console.log('🔍 You can view your contracts on the Monad Explorer:');
  console.log('   https://testnet.monadexplorer.com/');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Open your app and connect your wallet to Monad Testnet');
  console.log('2. Network Name: Monad Testnet');
  console.log('3. Chain ID: 10143');
  console.log('4. Currency Symbol: MON');
  console.log('');
  console.log('🎮 Enjoy your decentralized legal game on Monad Testnet!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} 