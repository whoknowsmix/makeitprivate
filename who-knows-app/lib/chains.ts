import { defineChain } from 'viem';
import { sepolia, baseSepolia } from 'viem/chains';

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

export const chains = [sepolia, baseSepolia, megaethTestnet] as const;
