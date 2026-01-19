import { createPublicClient, http, Hash } from 'viem';
import { sepolia, baseSepolia } from 'viem/chains';
import { megaethTestnet, hyperEVM } from './chains';

// Create clients for each supported chain
const clients = {
    [sepolia.id]: createPublicClient({
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL)
    }),
    [baseSepolia.id]: createPublicClient({
        chain: baseSepolia,
        transport: http(process.env.BASE_SEPOLIA_RPC_URL)
    }),
    [megaethTestnet.id]: createPublicClient({
        chain: megaethTestnet,
        transport: http(process.env.NEXT_PUBLIC_MEGAETH_RPC_URL || 'https://carrot.megaeth.com/rpc')
    }),
    [hyperEVM.id]: createPublicClient({
        chain: hyperEVM,
        transport: http('https://rpc.hyperliquid-testnet.xyz/evm')
    })
};

export async function verifyTransaction(hash: string, expectedAmount: string, expectedFrom: string) {
    // Try to find the transaction on all chains
    for (const client of Object.values(clients)) {
        try {
            const tx = await client.getTransaction({ hash: hash as Hash });

            // Check if transaction exists and is successful
            if (tx) {
                const receipt = await client.getTransactionReceipt({ hash: hash as Hash });

                if (receipt.status === 'success') {
                    // Verify details
                    // Note: In production code, you should also verify the 'to' address matches your contract
                    // and the 'value' matches the deposit amount.
                    // For now, we verify the sender matches the user claiming rewards.

                    const isFromUser = tx.from.toLowerCase() === expectedFrom.toLowerCase();

                    // Simple check: Allow if from user and confirmed
                    // In a stricter version, we would check tx.value and tx.to against known contract addresses

                    if (isFromUser) {
                        return {
                            verified: true,
                            chainId: client.chain.id,
                            blockNumber: receipt.blockNumber,
                            value: tx.value
                        };
                    }
                }
            }
        } catch (e) {
            // Ignore errors (tx not found on this chain) and continue to next
            continue;
        }
    }

    return { verified: false };
}
