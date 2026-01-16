'use client';

import React, { useEffect, useRef } from 'react';

export function FloatingBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const assets = container.querySelectorAll<HTMLElement>('.floating-asset');
            assets.forEach((asset, index) => {
                const speed = (index + 1) * 0.05;
                const x = (window.innerWidth - clientX * speed) / 100;
                const y = (window.innerHeight - clientY * speed) / 100;

                // Add rotation based on position
                const rotateX = (clientY / window.innerHeight - 0.5) * 20;
                const rotateY = (clientX / window.innerWidth - 0.5) * 20;

                asset.style.transform = `translate(${x}px, ${y}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
        };
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="floating-asset top-[15%] left-[10%] scale-150 absolute transition-transform duration-100 ease-out preserve-3d">
                <span className="material-symbols-outlined text-[120px] text-silver/10" style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}>lock</span>
            </div>
            <div className="floating-asset bottom-[20%] right-[12%] scale-125 rotate-12 absolute transition-transform duration-100 ease-out preserve-3d">
                <span className="material-symbols-outlined text-[100px] text-silver/10" style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}>shield</span>
            </div>
            <div className="floating-asset top-[40%] right-[5%] scale-75 -rotate-12 absolute transition-transform duration-100 ease-out preserve-3d">
                <span className="material-symbols-outlined text-[80px] text-silver/10" style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}>fingerprint</span>
            </div>
        </div>
    );
}
