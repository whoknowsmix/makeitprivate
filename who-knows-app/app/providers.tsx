'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    RainbowKitProvider,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import { config } from '../lib/config';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    // Suppress Lit Dev Mode Warning
    if (typeof window !== 'undefined') {
        (window as any).litIssuedWarnings = new Set(['Lit is in dev mode. Not recommended for production!']);
    }

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch - wait for client mount
    if (!mounted) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
                <RainbowKitProvider theme={darkTheme({
                    accentColor: '#2b8cee',
                    accentColorForeground: 'white',
                    borderRadius: 'medium',
                    fontStack: 'system',
                })}>
                    {children}
                </RainbowKitProvider>
            </WagmiProvider>
        </QueryClientProvider>
    );
}
