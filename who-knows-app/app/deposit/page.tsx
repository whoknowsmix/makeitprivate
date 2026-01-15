'use client';

import React, { useState, Suspense } from 'react';
import { useAccount } from 'wagmi';
import { generateSecret, hashSecret } from '@/lib/crypto';
import { useDeposit, PRESETS, MIN_DEPOSIT } from '@/hooks/useSmartContract';
import { Modal } from '@/components/Modal';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSearchParams } from 'next/navigation';

function DepositPageContent() {
    const { isConnected } = useAccount();
    const { deposit, isPending, isSuccess, reset } = useDeposit();
    const [amount, setAmount] = useState('1'); // Default 1 ETH
    const [secretNote, setSecretNote] = useState<string | null>(null);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [hasBackedUp, setHasBackedUp] = useState(false);

    const searchParams = useSearchParams();
    const referralCode = searchParams.get('ref');

    const handleStartDeposit = () => {
        if (!isConnected || parseFloat(amount) < parseFloat(MIN_DEPOSIT)) return;
        const note = generateSecret();
        setSecretNote(note);
        setShowNoteModal(true);
        setHasBackedUp(false);
    };

    const handleConfirmDeposit = async () => {
        if (!secretNote) return;
        const hash = hashSecret(secretNote);
        try {
            await deposit(amount, hash, referralCode || undefined);
            setShowNoteModal(false);
        } catch (e) {
            console.error(e);
        }
    };

    const feeAmount = (parseFloat(amount || '0') * 0.05).toFixed(4);
    const receiveAmount = (parseFloat(amount || '0') * 0.95).toFixed(4);

    if (isSuccess) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-xl text-center glass-card p-12 rounded-2xl border border-green-500/30">
                    <span className="material-symbols-outlined text-green-500 text-6xl mb-4">check_circle</span>
                    <h2 className="text-3xl font-bold mb-2">Deposit Successful</h2>
                    <p className="text-white/60 mb-2">Your {amount} ETH has been mixed.</p>
                    <p className="text-white/40 text-sm mb-8">Keep your secret note safe!</p>
                    <button onClick={reset} className="px-8 py-3 bg-primary rounded-lg font-bold">Make Another Deposit</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full pt-24 pb-12">
            <div className="text-center mb-10">
                <h1 className="text-white tracking-tight text-[40px] font-bold leading-tight pb-2">Deposit Funds</h1>
                <p className="text-white/40 text-base max-w-md mx-auto">Choose a preset or enter a custom amount. Minimum deposit is {MIN_DEPOSIT} ETH.</p>
            </div>

            <div className="w-full glass-card rounded-2xl p-8 metallic-border shadow-2xl max-w-xl relative overflow-hidden">
                {isPending && (
                    <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold tracking-widest uppercase text-sm">Processing Deposit...</p>
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="px-1 text-white/70 text-sm font-medium uppercase tracking-widest flex justify-between">
                            <span>Presets</span>
                            <span className="text-white/30 text-[10px]">Quick Select</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {PRESETS.map((preset) => (
                                <button
                                    key={preset.amount}
                                    onClick={() => setAmount(preset.amount)}
                                    className={`py-3 rounded-lg border transition-all text-sm font-medium ${amount === preset.amount
                                        ? 'border-primary/50 bg-primary/10 text-white silver-glow font-bold'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="px-1 text-white/70 text-sm font-medium uppercase tracking-widest flex justify-between">
                            <span>Custom Amount</span>
                            <span className="text-white/30 text-[10px]">ETH</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                min={MIN_DEPOSIT}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 h-16 px-4 text-xl font-bold focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-center placeholder:text-white/10"
                                placeholder="0.00"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-bold pointer-events-none">ETH</div>
                        </div>
                        {parseFloat(amount) < parseFloat(MIN_DEPOSIT) && amount !== '' && (
                            <p className="text-red-400 text-[10px] px-1">Minimum deposit is {MIN_DEPOSIT} ETH</p>
                        )}
                    </div>

                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Deposit Amount</span>
                            <span className="text-white font-medium">{amount || '0'} ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Protocol Fee (5%)</span>
                            <span className="text-red-400 font-medium">-{feeAmount} ETH</span>
                        </div>
                        <div className="h-px bg-white/10 my-1"></div>
                        <div className="flex justify-between text-base">
                            <span className="text-white/70 font-bold">You Receive</span>
                            <span className="text-green-400 font-bold">{receiveAmount} ETH</span>
                        </div>
                    </div>

                    <div className="pt-4 relative">
                        {!isConnected ? (
                            <div className="w-full flex justify-center">
                                <ConnectButton />
                            </div>
                        ) : (
                            <button
                                onClick={handleStartDeposit}
                                disabled={parseFloat(amount) < parseFloat(MIN_DEPOSIT) || amount === ''}
                                className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-16 bg-gradient-to-r from-white/15 to-white/5 hover:from-white/25 hover:to-white/15 border border-white/30 text-white text-base font-bold tracking-widest silver-glow transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <span className="truncate uppercase px-4">Mix {amount || '0'} ETH</span>
                            </button>
                        )}

                        <p className="text-center text-[10px] text-white/40 mt-4 uppercase tracking-tighter leading-relaxed">
                            A SECRET NOTE WILL BE GENERATED BEFORE CONFIRMING.<br />
                            <span className="italic text-white/20 text-[9px]">YOUR FUNDS CANNOT BE RECOVERED WITHOUT THIS NOTE.</span>
                        </p>
                    </div>
                </div>
            </div>

            <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Your Secret Note">
                <div className="flex flex-col gap-4">
                    <div className="p-4 bg-black/40 rounded-lg border border-red-500/20 text-center">
                        <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">CRITICAL: Save This Note Offline</p>
                        <p className="font-mono text-sm break-all text-white/80 select-all p-2 bg-white/5 rounded border border-white/10">
                            {secretNote}
                        </p>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-white/40 font-medium uppercase tracking-widest">Amount to Mix:</span>
                            <span className="text-white font-bold">{amount} ETH</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                            <span className="text-white/40 font-medium uppercase tracking-widest">Withdrawal Payout:</span>
                            <span className="text-green-400 font-bold">{receiveAmount} ETH</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-white/30 leading-relaxed">
                        This note is the ONLY way to withdraw your funds. It acts as both your proof of deposit and your spending key. We do not store this note.
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={hasBackedUp}
                                onChange={(e) => setHasBackedUp(e.target.checked)}
                                className="appearance-none w-5 h-5 rounded border border-white/20 bg-white/5 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                            />
                            {hasBackedUp && <span className="material-symbols-outlined absolute text-[16px] text-white pointer-events-none">check</span>}
                        </div>
                        <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">I have securely backed up my secret note</span>
                    </label>
                    <button
                        disabled={!hasBackedUp}
                        onClick={handleConfirmDeposit}
                        className="w-full py-4 rounded-xl bg-primary text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed silver-glow transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
                    >
                        Initiate Privacy Mix
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default function DepositPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <DepositPageContent />
        </Suspense>
    );
}

