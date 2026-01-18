'use client';

import dynamic from 'next/dynamic';

const FloatingBackground = dynamic(() => import('./FloatingBackground').then(mod => mod.FloatingBackground), {
    ssr: false,
});

export function FloatingBackgroundWrapper() {
    return <FloatingBackground />;
}
