import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Who Knows?',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, sepolia, baseSepolia],
  ssr: true,
});
