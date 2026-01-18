import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, baseSepolia } from 'wagmi/chains';

// Validate environment variables on load
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

if (projectId === 'YOUR_PROJECT_ID') {
  console.warn('[Who Knows?] WalletConnect projectId not set. Get one at https://cloud.walletconnect.com/');
}

export const config = getDefaultConfig({
  appName: 'Who Knows?',
  projectId,
  chains: [sepolia, baseSepolia],
  ssr: true,
});
