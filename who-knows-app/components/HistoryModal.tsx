'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';

interface HistoryItem {
    type: 'Deposit' | 'Withdraw';
    hash: string;
    timestamp: number;
    status: string;
}

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import { useAccount } from 'wagmi';

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const { chain } = useAccount();

    useEffect(() => {
        if (isOpen) {
            const stored = JSON.parse(localStorage.getItem('who-knows-history') || '[]');
            setHistory(stored);
        }
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    const clearHistory = () => {
        localStorage.removeItem('who-knows-history');
        setHistory([]);
    };

    const getExplorerUrl = (hash: string) => {
        const baseUrl = chain?.blockExplorers?.default.url || 'https://megaeth-testnet-v2.blockscout.com';
        return `${baseUrl}/tx/${hash}`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Transaction History">
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {history.length === 0 ? (
                    <p className="text-white/40 text-center py-8">No transactions found.</p>
                ) : (
                    history.map((item, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <span className={`text-xs font-bold uppercase tracking-wider ${item.type === 'Deposit' ? 'text-green-400' : 'text-red-400'}`}>
                                    {item.type}
                                </span>
                                <span className="text-[10px] text-white/30">
                                    {new Date(item.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] font-mono text-white/60 truncate max-w-[200px]">
                                    {item.hash}
                                </p>
                                <a
                                    href={getExplorerUrl(item.hash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 hover:underline"
                                >
                                    Explorer <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                                </a>
                            </div>
                            <span className="text-[10px] text-primary self-end">Confirmed</span>
                        </div>
                    ))
                )}

                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="mt-2 text-xs text-white/30 hover:text-white/50 underline self-center"
                    >
                        Clear History
                    </button>
                )}
            </div>
        </Modal>
    );
}
