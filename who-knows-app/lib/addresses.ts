import deployments from './contractAddress.json';

export const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
    11155111: deployments.sepolia as `0x${string}`, // Sepolia
    84532: deployments.baseSepolia as `0x${string}`,    // Base Sepolia
    6343: deployments.megaethTestnet as `0x${string}`,  // MegaETH Testnet V2
};

export const DEFAULT_CONTRACT_ADDRESS = CONTRACT_ADDRESSES[11155111];
