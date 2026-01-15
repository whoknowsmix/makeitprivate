'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
    return (
        <header className="w-full flex justify-end p-8 absolute top-0 left-0 z-20 pointer-events-none">
            <div className="pointer-events-auto">
                <ConnectButton.Custom>
                    {({
                        account,
                        chain,
                        openAccountModal,
                        openChainModal,
                        openConnectModal,
                        mounted,
                    }) => {
                        const ready = mounted;
                        const connected = ready && account && chain;

                        return (
                            <div
                                {...(!ready && {
                                    'aria-hidden': true,
                                    'style': {
                                        opacity: 0,
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                    },
                                })}
                            >
                                {(() => {
                                    if (!connected) {
                                        return (
                                            <button onClick={openConnectModal} className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-silver/30 bg-white/5 hover:bg-white/10 text-white transition-all duration-300 silver-glow backdrop-blur-sm group cursor-pointer">
                                                <span className="material-symbols-outlined text-lg text-silver group-hover:text-white transition-colors">account_balance_wallet</span>
                                                <span className="text-sm font-medium tracking-wider uppercase">Connect Wallet</span>
                                            </button>
                                        );
                                    }

                                    if (chain.unsupported) {
                                        return (
                                            <button onClick={openChainModal} className="px-6 py-2.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 font-medium">
                                                Wrong network
                                            </button>
                                        );
                                    }

                                    return (
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <button
                                                onClick={openChainModal}
                                                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white"
                                                type="button"
                                            >
                                                {chain.hasIcon && (
                                                    <div
                                                        style={{
                                                            background: chain.iconBackground,
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: 999,
                                                            overflow: 'hidden',
                                                            marginRight: 4,
                                                        }}
                                                    >
                                                        {chain.iconUrl && (
                                                            <img
                                                                alt={chain.name ?? 'Chain icon'}
                                                                src={chain.iconUrl}
                                                                style={{ width: 12, height: 12 }}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                {chain.name}
                                            </button>

                                            <button onClick={openAccountModal} type="button" className="px-6 py-2.5 rounded-full border border-silver/30 bg-white/5 hover:bg-white/10 text-white transition-all silver-glow backdrop-blur-sm">
                                                {account.displayName}
                                                {account.displayBalance
                                                    ? ` (${account.displayBalance})`
                                                    : ''}
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    }}
                </ConnectButton.Custom>
            </div>
        </header>
    );
}
