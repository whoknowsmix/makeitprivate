'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

type UserRewardsData = {
    address: string;
    points: number;
    referralPoints: number;
    referralCode: string;
    invites: string[];
    transactions: number;
    volume: number;
    completedQuestsCount: number;
    quests: {
        dailyTx: boolean;
        dailyVol1: boolean;
        dailyVol5: boolean;
        dailyVol10: boolean;
        dailyVol50: boolean;
        dailyVol100: boolean;
        weeklyVol1: boolean;
    };
};

type LeaderboardItem = {
    address: string;
    points: number;
};

type ReferralStats = {
    pending: Array<{
        address: string;
        questsCompleted: number;
        questsRequired: number;
    }>;
    successful: Array<{
        address: string;
        validatedAt: number | null;
    }>;
};

export default function RewardsPage() {
    const { address, isConnected } = useAccount();
    const [data, setData] = useState<{ user: UserRewardsData; leaderboard: LeaderboardItem[]; referralStats: ReferralStats } | null>(null);
    const [loading, setLoading] = useState(true);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

    const fetchRewards = async () => {
        if (!address) return;
        try {
            const res = await fetch(`/api/rewards?address=${address}`);
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isConnected && address) {
            fetchRewards();
        } else {
            setLoading(false);
        }
    }, [isConnected, address]);

    const handleCopyReferral = () => {
        if (!data?.user.referralCode) return;
        const link = `${window.location.origin}/deposit?ref=${data.user.referralCode}`;
        navigator.clipboard.writeText(link);
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="glass-card p-12 rounded-2xl text-center max-w-lg w-full">
                    <span className="material-symbols-outlined text-6xl text-white/20 mb-4">emoji_events</span>
                    <h2 className="text-3xl font-bold mb-4">Join the Rewards Program</h2>
                    <p className="text-white/40 mb-8">Connect your wallet to track your transaction volume, earn points, and climb the leaderboard.</p>
                    <div className="flex justify-center">
                        <ConnectButton />
                    </div>
                </div>
            </div>
        );
    }

    const QUESTS = [
        { id: 'dailyTx', title: 'Daily Mix Master', desc: 'Complete 10 transactions in a day', points: 100, completed: data?.user.quests.dailyTx },
        { id: 'dailyVol1', title: 'Volume Starter', desc: 'Mix 1 ETH volume in a day', points: 1000, completed: data?.user.quests.dailyVol1 },
        { id: 'dailyVol5', title: 'Volume Enthusiast', desc: 'Mix 5 ETH volume in a day', points: 5000, completed: data?.user.quests.dailyVol5 },
        { id: 'dailyVol10', title: 'Volume Pro', desc: 'Mix 10 ETH volume in a day', points: 10000, completed: data?.user.quests.dailyVol10 },
        { id: 'dailyVol50', title: 'High Roller', desc: 'Mix 50 ETH volume in a day', points: 50000, completed: data?.user.quests.dailyVol50 },
        { id: 'dailyVol100', title: 'Privacy Whale', desc: 'Mix 100 ETH volume in a day', points: 100000, completed: data?.user.quests.dailyVol100 },
        { id: 'weeklyVol1', title: 'Weekly Grind', desc: 'Mix 1 ETH minimum volume in a week', points: 10000, completed: data?.user.quests.weeklyVol1 },
    ];

    const totalPoints = (data?.user.points ?? 0) + (data?.user.referralPoints ?? 0);
    const userRank = data?.leaderboard.findIndex(item => item.address === address?.toLowerCase()) ?? -1;
    const rankText = userRank !== -1 ? `#${userRank + 1}` : 'Unranked';

    return (
        <div className="flex-1 p-12 max-w-7xl mx-auto w-full pt-24 pb-20 overflow-y-auto">
            <div className="mb-12">
                <h1 className="text-4xl font-bold mb-2">Rewards Program</h1>
                <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Gamified Privacy Mixing</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Referrals */}
                <div className="lg:col-span-2 space-y-8">
                    {/* User Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-card p-6 rounded-2xl metallic-border flex flex-col">
                            <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Total Points</span>
                            <span className="text-3xl font-bold text-primary">{totalPoints.toLocaleString()}</span>
                            <div className="flex gap-2 mt-2">
                                <span className="text-[10px] text-white/40">Quests: {data?.user.points.toLocaleString()}</span>
                                <span className="text-[10px] text-green-400/60">Ref: {data?.user.referralPoints.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl metallic-border flex flex-col">
                            <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Global Rank</span>
                            <span className="text-3xl font-bold text-white">{rankText}</span>
                            <span className="text-[10px] text-white/20 mt-2 uppercase tracking-tighter">Top 50 Leaderboard</span>
                        </div>
                        <div className="glass-card p-6 rounded-2xl metallic-border flex flex-col">
                            <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Valid Referrals</span>
                            <span className="text-3xl font-bold text-green-400">{data?.referralStats.successful.length ?? 0}</span>
                            <span className="text-[10px] text-white/20 mt-2 uppercase tracking-tighter">Unlimited invites</span>
                        </div>
                    </div>

                    {/* Quest Dashboard */}
                    <div className="glass-card rounded-2xl metallic-border overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">assignment</span>
                                Quest Dashboard
                            </h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {QUESTS.map((quest) => (
                                <div key={quest.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white/90">{quest.title}</span>
                                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">+{quest.points} PTS</span>
                                        </div>
                                        <p className="text-sm text-white/40">{quest.desc}</p>
                                    </div>
                                    <div>
                                        {quest.completed ? (
                                            <span className="flex items-center gap-1 text-green-400 text-sm font-bold bg-green-400/10 px-3 py-1 rounded-full">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                Claimed
                                            </span>
                                        ) : (
                                            <span className="text-white/20 text-sm font-medium border border-white/10 px-3 py-1 rounded-full italic">
                                                In Progress
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Referral Section (Updated with Unlimited & Validation Logic) */}
                    <div className="glass-card rounded-2xl metallic-border overflow-hidden bg-gradient-to-br from-primary/[0.03] to-transparent">
                        <div className="p-8 pb-4">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="max-w-md">
                                    <h3 className="text-xl font-bold mb-2">Unlimited Referrals</h3>
                                    <p className="text-white/40 text-sm">Invite friends and earn 500 points for every "Valid" referral. A referral is valid after the user completes 2+ quests.</p>
                                </div>
                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    <button
                                        onClick={handleCopyReferral}
                                        className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${copyStatus === 'copied' ? 'bg-green-500 text-white' : 'bg-primary text-white silver-glow'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {copyStatus === 'copied' ? 'check' : 'link'}
                                        </span>
                                        {copyStatus === 'copied' ? 'Link Copied!' : 'Copy Referral Link'}
                                    </button>
                                    <p className="text-center text-[10px] text-white/20 uppercase tracking-widest">Your Code: {data?.user.referralCode}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5 border-t border-white/5 bg-black/20">
                            <div className="p-6">
                                <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                                    Pending Validation ({data?.referralStats.pending.length ?? 0})
                                </h4>
                                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                    {data?.referralStats.pending.map((ref) => (
                                        <div key={ref.address} className="flex items-center justify-between text-xs p-2 rounded bg-white/[0.02]">
                                            <span className="font-mono text-white/40">{ref.address.substring(0, 10)}...{ref.address.substring(34)}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-0.5">
                                                    {[0, 1].map((i) => (
                                                        <div
                                                            key={i}
                                                            className={`w-2 h-2 rounded-full ${i < ref.questsCompleted ? 'bg-yellow-400' : 'bg-white/10'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[9px] text-yellow-400/50 uppercase font-bold tracking-tighter">
                                                    {ref.questsCompleted}/{ref.questsRequired} Quests
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {data?.referralStats.pending.length === 0 && (
                                        <p className="text-[10px] italic text-white/10 text-center py-4">No pending referrals</p>
                                    )}
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                    Verified & Rewarded ({data?.referralStats.successful.length ?? 0})
                                </h4>
                                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                    {data?.referralStats.successful.map((ref) => (
                                        <div key={ref.address} className="flex items-center justify-between text-xs p-2 rounded bg-green-400/5 border border-green-500/10">
                                            <span className="font-mono text-white/60">{ref.address.substring(0, 10)}...{ref.address.substring(34)}</span>
                                            <span className="text-[9px] text-green-400 font-bold uppercase tracking-tighter">+500 PTS</span>
                                        </div>
                                    ))}
                                    {data?.referralStats.successful.length === 0 && (
                                        <p className="text-[10px] italic text-white/10 text-center py-4">No successful referrals yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Leaderboard */}
                <div className="glass-card rounded-2xl metallic-border flex flex-col h-[fit-content] max-h-[850px]">
                    <div className="p-6 border-b border-white/5 bg-white/5 sticky top-0 z-10">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">leaderboard</span>
                            Leaderboard
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                        {data?.leaderboard.map((item, index) => (
                            <div key={item.address} className={`p-5 flex items-center justify-between ${item.address === address?.toLowerCase() ? 'bg-primary/5' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <span className={`w-6 text-sm font-bold ${index < 3 ? 'text-primary' : 'text-white/20'}`}>
                                        {index + 1}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-mono text-white/80">
                                            {item.address.substring(0, 6)}...{item.address.substring(38)}
                                        </span>
                                        {item.address === address?.toLowerCase() && (
                                            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">You</span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-white/60">
                                    {item.points.toLocaleString()} <span className="text-[10px] text-white/20">PTS</span>
                                </span>
                            </div>
                        ))}
                        {data?.leaderboard.length === 0 && (
                            <div className="p-12 text-center">
                                <p className="text-white/20 text-sm italic">No participants yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
