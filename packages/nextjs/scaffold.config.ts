import { monadTestnet } from "./utils/monad";
import * as chains from "viem/chains";
import * as wagmiChains from "wagmi/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly (chains.Chain | typeof monadTestnet)[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

export const DEFAULT_ALCHEMY_API_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

const scaffoldConfig = {
  // The networks on which your DApp is live
  // Using Sepolia for Vercel deployment
  targetNetworks: [chains.sepolia, monadTestnet],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  // If you want to use a different RPC for a specific network, you can add it here.
  // The key is the chain ID, and the value is the HTTP RPC URL
  rpcOverrides: {
    // Add Sepolia Testnet RPC
    11155111: "https://rpc.sepolia.org",
    // Add Monad Testnet RPC
    10143: "https://testnet-rpc.monad.xyz/",
  },

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;

/**
 * @example
 * const targetNetwork = {
 *   id: 11155111,
 *   name: "Sepolia",
 *   network: "sepolia",
 *   nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
 *   rpcUrls: {
 *     default: {
 *       http: ["https://rpc.sepolia.org"],
 *     },
 *   },
 *   blockExplorers: {
 *     default: {
 *       name: "Etherscan",
 *       url: "https://sepolia.etherscan.io",
 *     },
 *   },
 *   testnet: true,
 * };
 */
export const targetNetwork = {
  // ⚡️ Set your target network here (for deploying on Vercel)
  id: 10143,
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com/",
    },
  },
  testnet: true,
};
