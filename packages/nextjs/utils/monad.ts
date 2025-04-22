import { defineChain } from 'viem';

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { 
      http: ['https://testnet-rpc.monad.xyz/'] 
    },
    public: { 
      http: ['https://testnet-rpc.monad.xyz/'] 
    },
  },
  blockExplorers: {
    default: { 
      name: 'Monad Explorer', 
      url: 'https://testnet.monadexplorer.com/' 
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11', // This may need to be updated with the actual address
      blockCreated: 1, // This may need to be updated with the actual block
    },
  },
}); 