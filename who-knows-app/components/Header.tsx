'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
    return (
        <header className="w-full flex justify-between md:justify-end items-center p-6 md:p-8 absolute top-0 left-0 z-20 pointer-events-none">
            {/* Mobile Hamburger */}
            <button
                onClick={onOpenMenu}
                className="md:hidden pointer-events-auto p-2 bg-white/5 rounded-lg border border-white/10 text-white"
            >
                <span className="material-symbols-outlined">menu</span>
            </button>

            <div className="pointer-events-auto flex items-center gap-3">
                <EthereumConnectButton />
            </div>
        </header>
    );
}

/**
 * Ethereum Connect Button using RainbowKit
 */
function EthereumConnectButton() {
    return (
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
                                        <span className="text-sm font-medium tracking-wider uppercase hidden sm:inline">Connect ETH</span>
                                        <span className="text-sm font-medium tracking-wider uppercase sm:hidden">⟠</span>
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
                                                        className="rounded-full"
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {chain.name}
                                    </button>

                                    <button onClick={openAccountModal} type="button" className="px-4 sm:px-6 py-2.5 rounded-full border border-silver/30 bg-white/5 hover:bg-white/10 text-white transition-all silver-glow backdrop-blur-sm text-sm">
                                        {account.displayName}
                                        <span className="hidden sm:inline">
                                            {account.displayBalance
                                                ? ` (${account.displayBalance})`
                                                : ''}
                                        </span>
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}
