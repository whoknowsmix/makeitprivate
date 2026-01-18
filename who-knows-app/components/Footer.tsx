'use client';

import { useContractMetrics } from '@/hooks/useSmartContract';
import { useChainId } from 'wagmi';
import { useState, useEffect } from 'react';

export function Footer() {
    const { tvl, anonymitySet, dailyVolume } = useContractMetrics();
    const chainId = useChainId();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (!mounted) {
            setMounted(true);
        }
    }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!mounted) {
        return (
            <footer className="w-full border-t border-white/5 py-6 px-12 bg-background-dark/50 backdrop-blur-md mt-auto min-h-[80px]">
                <div className="max-w-6xl mx-auto flex justify-between items-center opacity-0 uppercase text-[10px] tracking-widest font-bold text-white/30">
                    Syncing Metrics...
                </div>
            </footer>
        );
    }

    const networkName = chainId === 11155111 ? 'Ethereum Sepolia' :
        chainId === 84532 ? 'Base Sepolia' :
            'Unknown Network';

    return (
        <footer className="w-full border-t border-white/5 py-6 px-12 bg-background-dark/50 backdrop-blur-md mt-auto min-h-[80px]">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex gap-12">
                    <div className="flex flex-col">
                        <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Total Value Locked</span>
                        <span className="text-white/80 text-sm font-medium">{tvl} ETH</span>
                    </div>
                    <div className="flex flex-col border-l border-white/5 pl-12">
                        <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Anonymity Set</span>
                        <span className="text-white/80 text-sm font-medium">{anonymitySet} Participants</span>
                    </div>
                    <div className="flex flex-col border-l border-white/5 pl-12">
                        <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold">24h Mix Volume</span>
                        <span className="text-white/80 text-sm font-medium">{dailyVolume} ETH</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">public</span>
                        <span className="text-white/40 text-xs">{networkName}</span>
                    </div>
                    <span className="text-white/20 text-[10px] uppercase tracking-tighter">Powered by ZK-SNARKs</span>
                </div>
            </div>
        </footer>
    );
}
