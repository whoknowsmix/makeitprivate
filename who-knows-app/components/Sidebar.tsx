'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { HistoryModal } from './HistoryModal';

export function Sidebar() {
    const pathname = usePathname();
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    return (
        <>
            <aside className="w-64 border-r border-white/5 bg-background-dark/80 backdrop-blur-xl flex flex-col justify-between py-8 px-6 h-screen sticky top-0 z-20">
                <div className="flex flex-col gap-10">
                    <div className="flex items-center gap-3 px-2">
                        <div className="size-10 rounded-full bg-gradient-to-br from-silver to-gray-600 flex items-center justify-center metallic-border">
                            <span className="material-symbols-outlined text-background-dark text-xl" style={{ fontVariationSettings: "'wght' 700" }}>visibility_off</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-lg font-bold tracking-tight leading-none">Who Knows?</h1>
                            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium">Privacy Mixer</p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-2">
                        <Link
                            href="/deposit"
                            className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-all duration-300 ${isActive('/deposit')
                                ? 'bg-white/5 text-white border-white/10 silver-glow'
                                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="material-symbols-outlined text-[22px] text-primary">south_west</span>
                            <span className="text-sm font-medium tracking-wide">Deposit</span>
                        </Link>
                        <Link
                            href="/withdraw"
                            className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-all duration-300 ${isActive('/withdraw')
                                ? 'bg-white/5 text-white border-white/10 silver-glow'
                                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="material-symbols-outlined text-[22px]">north_east</span>
                            <span className="text-sm font-medium tracking-wide">Withdraw</span>
                        </Link>
                        <button
                            onClick={() => setIsHistoryOpen(true)}
                            className="flex items-center gap-4 px-4 py-3 text-white/50 hover:text-white transition-colors duration-200 w-full text-left"
                        >
                            <span className="material-symbols-outlined text-[22px]">history</span>
                            <span className="text-sm font-medium tracking-wide">History</span>
                        </button>
                        <div className="h-px bg-white/5 my-4 mx-4"></div>
                        <Link
                            href="/rewards"
                            className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-all duration-300 ${isActive('/rewards')
                                ? 'bg-white/5 text-white border-white/10 silver-glow'
                                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="material-symbols-outlined text-[22px]">redeem</span>
                            <span className="text-sm font-medium tracking-wide">Rewards</span>
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-[10px] text-primary/80 uppercase font-bold tracking-widest">Network Live</span>
                        </div>
                        <span className="text-[10px] text-white/40">v2.0.4</span>
                    </div>
                    <Link href="#" className="flex items-center gap-4 px-4 py-3 text-white/40 hover:text-white transition-colors duration-200">
                        <span className="material-symbols-outlined text-[22px]">help</span>
                        <span className="text-sm font-medium">Support Center</span>
                    </Link>
                </div>
            </aside>

            <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
        </>
    );
}
