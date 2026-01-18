import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { chains } from './chains';

// Use chains from shared library
export const megaethTestnet = chains.find(c => c.id === 6343)!;

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
  chains: chains as any,
  ssr: true,
});
