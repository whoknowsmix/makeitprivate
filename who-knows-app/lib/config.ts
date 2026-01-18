import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, baseSepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define MegaETH Testnet V2 custom chain
export const megaethTestnet = defineChain({
  id: 6343,
  name: 'MegaETH Testnet V2',
  network: 'megaeth-v2',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://carrot.megaeth.com/rpc']
    },
    public: {
      http: ['https://carrot.megaeth.com/rpc']
    },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://megaeth-testnet-v2.blockscout.com' },
  },
  testnet: true,
  iconUrl: 'https://logo.svgcdn.com/token-branded/mega-eth.png',
  iconBackground: '#fff',
});

if (!process.env.NEXT_PUBLIC_MEGAETH_RPC_URL) {
  // Silent fallback to avoid console noise
}

// Validate environment variables on load
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

if (projectId === 'YOUR_PROJECT_ID') {
  // Silent fallback for development
}

export const config = getDefaultConfig({
  appName: 'Who Knows?',
  projectId,
  chains: [sepolia, baseSepolia, megaethTestnet],
  ssr: true,
});
