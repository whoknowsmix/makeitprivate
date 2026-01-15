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

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        if (isOpen) {
            const stored = JSON.parse(localStorage.getItem('who-knows-history') || '[]');
            setHistory(stored);
        }
    }, [isOpen]);

    const clearHistory = () => {
        localStorage.removeItem('who-knows-history');
        setHistory([]);
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
                            <p className="text-[10px] font-mono text-white/60 break-all">
                                {item.hash}
                            </p>
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
