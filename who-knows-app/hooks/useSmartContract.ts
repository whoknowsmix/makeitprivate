'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId, useWatchContractEvent } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACT_ADDRESSES, DEFAULT_CONTRACT_ADDRESS } from '../lib/addresses';

// Presets for the UI
export const PRESETS = [
    { amount: '0.1', label: '0.1 ETH' },
    { amount: '1', label: '1 ETH' },
    { amount: '10', label: '10 ETH' },
] as const;

export const FEE_PERCENT = 0.005; // 0.5%
export const MIN_DEPOSIT = '0.01';

// Contract ABI
const ABI = [
    {
        inputs: [{ name: 'commitment', type: 'bytes32' }],
        name: 'deposit',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'secret', type: 'string' },
            { name: 'recipient', type: 'address' },
        ],
        name: 'withdraw',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'commitment', type: 'bytes32' }],
        name: 'getDepositStatus',
        outputs: [
            { name: 'exists', type: 'bool' },
            { name: 'isWithdrawn', type: 'bool' }
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalValueLocked',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'anonymitySet',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'dailyVolume',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'commitment', type: 'bytes32' },
            { indexed: false, name: 'amount', type: 'uint256' },
            { indexed: false, name: 'timestamp', type: 'uint256' }
        ],
        name: 'Deposit',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'recipient', type: 'address' },
            { indexed: false, name: 'amount', type: 'uint256' },
            { indexed: false, name: 'fee', type: 'uint256' },
            { indexed: false, name: 'timestamp', type: 'uint256' }
        ],
        name: 'Withdrawal',
        type: 'event',
    },
] as const;

export const useSmartContractAddress = () => {
    const chainId = useChainId();
    return CONTRACT_ADDRESSES[chainId] || DEFAULT_CONTRACT_ADDRESS;
};

export const useContractMetrics = () => {
    const address = useSmartContractAddress();

    // Total Value Locked
    const { data: tvl, refetch: refetchTVL } = useReadContract({
        address,
        abi: ABI,
        functionName: 'totalValueLocked',
    });

    // Anonymity Set
    const { data: anonSet, refetch: refetchAnon } = useReadContract({
        address,
        abi: ABI,
        functionName: 'anonymitySet',
    });

    // Daily Volume
    const { data: volume, refetch: refetchVolume } = useReadContract({
        address,
        abi: ABI,
        functionName: 'dailyVolume',
    });

    const refresh = () => {
        refetchTVL();
        refetchAnon();
        refetchVolume();
    };

    // Watch for events to refresh data in real-time
    useWatchContractEvent({
        address,
        abi: ABI,
        eventName: 'Deposit',
        onLogs() { refresh(); },
    });

    useWatchContractEvent({
        address,
        abi: ABI,
        eventName: 'Withdrawal',
        onLogs() { refresh(); },
    });

    return {
        tvl: tvl ? parseFloat(formatEther(tvl)).toFixed(2) : '0.00',
        anonymitySet: anonSet ? anonSet.toString() : '0',
        dailyVolume: volume ? parseFloat(formatEther(volume)).toFixed(2) : '0.00',
        refresh
    };
};

export const useDeposit = () => {
    const { address, isConnected } = useAccount();
    const contractAddress = useSmartContractAddress();
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const [isSuccess, setIsSuccess] = useState(false);
    const [lastProcessedHash, setLastProcessedHash] = useState<string | null>(null);
    const [pendingAmount, setPendingAmount] = useState<string | null>(null);
    const [activeReferralCode, setActiveReferralCode] = useState<string | null>(null);

    useEffect(() => {
        if (isConfirmed && hash && hash !== lastProcessedHash && address && pendingAmount && !isSuccess) {
            setIsSuccess(true);
            setLastProcessedHash(hash);

            const historyItem = {
                type: 'Deposit',
                hash: hash,
                timestamp: Date.now(),
                status: 'Success'
            };
            const existing = JSON.parse(localStorage.getItem('who-knows-history') || '[]');
            localStorage.setItem('who-knows-history', JSON.stringify([historyItem, ...existing]));

            // Generate simple browser fingerprint for anti-Sybil
            const generateFingerprint = (): string => {
                const components = [
                    navigator.userAgent,
                    navigator.language,
                    screen.width + 'x' + screen.height,
                    screen.colorDepth,
                    new Date().getTimezoneOffset(),
                    navigator.hardwareConcurrency || 0,
                    (navigator as unknown as { deviceMemory?: number }).deviceMemory || 0,
                ];
                const str = components.join('|');
                // Simple hash function
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    const char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                return Math.abs(hash).toString(36);
            };

            // Update Rewards Points with fingerprint
            fetch('/api/rewards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: address,
                    amount: pendingAmount,
                    hash: hash,
                    referralCode: activeReferralCode,
                    fingerprint: generateFingerprint()
                })
            }).catch(console.error);
        }
    }, [isConfirmed, hash, address, pendingAmount, lastProcessedHash, activeReferralCode, isSuccess]);

    const deposit = async (amount: string, commitment: string, referralCode?: string) => {
        if (!isConnected) throw new Error('Wallet not connected');
        setPendingAmount(amount);
        if (referralCode) setActiveReferralCode(referralCode);

        writeContract({
            address: contractAddress,
            abi: ABI,
            functionName: 'deposit',
            args: [commitment as `0x${string}`],
            value: parseEther(amount),
        });
    };

    return {
        deposit,
        isPending: isWritePending || isConfirming,
        isSuccess,
        error: writeError?.message || null,
        reset: () => setIsSuccess(false),
        hash
    };
};

export const useWithdraw = () => {
    const { isConnected } = useAccount();
    const contractAddress = useSmartContractAddress();
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isConfirmed && !isSuccess) {
            setIsSuccess(true);
            const historyItem = {
                type: 'Withdraw',
                hash: hash,
                timestamp: Date.now(),
                status: 'Success'
            };
            const existing = JSON.parse(localStorage.getItem('who-knows-history') || '[]');
            localStorage.setItem('who-knows-history', JSON.stringify([historyItem, ...existing]));
        }
    }, [isConfirmed, hash, isSuccess]);

    useEffect(() => {
        if (writeError && writeError.message !== error) {
            setError(writeError.message);
        }
    }, [writeError, error]);

    const withdraw = async (secret: string, recipient: string) => {
        if (!isConnected) throw new Error('Wallet not connected');
        setError(null);
        setIsSuccess(false);

        writeContract({
            address: contractAddress,
            abi: ABI,
            functionName: 'withdraw',
            args: [secret, recipient as `0x${string}`],
        });
    };

    return {
        withdraw,
        isPending: isWritePending || isConfirming,
        isSuccess,
        error,
        reset: () => { setIsSuccess(false); setError(null); },
        hash
    };
};
