'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useWithdraw } from '@/hooks/useSmartContract';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WithdrawPage() {
    // Ethereum hooks
    const { isConnected } = useAccount();
    const { withdraw: ethWithdraw, isPending, isSuccess, error, reset, hash } = useWithdraw();

    const [secret, setSecret] = useState('');
    const [recipient, setRecipient] = useState('');

    const handleWithdraw = async () => {
        if (!secret || !recipient) return;
        try {
            await ethWithdraw(secret, recipient);
        } catch (e) {
            console.error(e);
        }
    };

    // Get appropriate explorer URL
    const getExplorerUrl = () => {
        if (!hash) return '';
        return `https://sepolia.etherscan.io/tx/${hash}`;
    };

    if (isSuccess) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-xl text-center glass-card p-12 rounded-2xl border border-green-500/30">
                    <span className="material-symbols-outlined text-green-500 text-6xl mb-4">check_circle</span>
                    <h2 className="text-3xl font-bold mb-2">Withdrawal Initiated</h2>
                    <p className="text-white/60 mb-2">Funds are being sent to recipient address.</p>
                    {hash && (
                        <a
                            href={getExplorerUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 break-all mb-6 block"
                        >
                            View on Etherscan: {hash.slice(0, 20)}...
                        </a>
                    )}
                    <button onClick={reset} className="px-8 py-3 bg-primary rounded-lg font-bold">Withdraw Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full pt-24 pb-12">
            <div className="text-center mb-10">
                <h1 className="text-white tracking-tight text-[40px] font-bold leading-tight pb-2">
                    Withdraw Funds
                    <span className="ml-2 text-lg text-primary">⟠</span>
                </h1>
                <p className="text-white/40 text-base max-w-md mx-auto">
                    Provide your secret note to claim your mixed tokens. 0.5% protocol fee is deducted automatically.
                </p>
            </div>

            <div className="w-full glass-card rounded-2xl p-8 metallic-border shadow-2xl max-w-xl relative overflow-hidden">
                {isPending && (
                    <div className="absolute inset-0 bg-charcoal/90 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold tracking-widest uppercase text-sm silver-glow">Verifying & Sending...</p>
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            Invalid secret note or recipient address.
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="px-1 text-white/70 text-sm font-medium uppercase tracking-widest">
                            Secret Note
                        </label>
                        <textarea
                            className="form-input flex w-full rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-primary/50 border border-white/10 bg-white/5 p-4 text-sm font-mono placeholder:text-white/10 transition-all resize-none h-28"
                            placeholder="wk-..."
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                        />
                        <p className="px-1 text-[10px] text-white/20 italic">Paste the exact note you saved during deposit.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="px-1 text-white/70 text-sm font-medium uppercase tracking-widest">
                            Recipient Address
                        </label>
                        <input
                            className="form-input flex w-full rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-primary/50 border border-white/10 bg-white/5 h-14 px-4 text-sm font-mono placeholder:text-white/20 transition-all"
                            placeholder="0x..."
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-[20px] text-white/40">info</span>
                            <p className="text-[11px] text-white/40 leading-relaxed">
                                The contract will automatically calculate the original deposit amount and deduct the 0.5% protocol fee before transferring the remainder to the recipient.
                            </p>
                        </div>
                    </div>

                    <div className="pt-2">
                        {!isConnected ? (
                            <div className="w-full flex justify-center">
                                <ConnectButton />
                            </div>
                        ) : (
                            <button
                                disabled={!secret || !recipient}
                                onClick={() => {
                                    handleWithdraw();
                                    if (navigator.vibrate) navigator.vibrate(10);
                                }}
                                className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-gradient-to-r from-primary to-primary/80 border border-white/20 text-white text-base font-bold tracking-widest silver-glow transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                            >
                                <span className="truncate uppercase px-4">Claim Mixed ETH</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-center text-[10px] text-white/20 mt-8 uppercase tracking-widest">
                Privacy Tip: Withdraw to a clean wallet for maximum anonymity.
            </p>
        </div>
    );
}
