import { NextRequest, NextResponse } from 'next/server';
import {
    readDB,
    writeDB,
    getOrCreateUser,
    UserData,
    createReferral,
    getReferralByInvited,
    checkAntiSybil,
    recordAntiSybilData,
    DBSchema
} from '@/lib/db';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    const db = readDB();
    const user = getOrCreateUser(address);

    // Sort and get top 50
    const leaderboard = Object.values(db.users)
        .sort((a, b) => (b.points + b.referralPoints) - (a.points + a.referralPoints))
        .slice(0, 50)
        .map((u) => ({
            address: u.address,
            points: u.points + u.referralPoints,
        }));

    // Get referral details with quest progress for pending
    const pendingReferrals = user.invites
        .filter(addr => {
            const referral = db.referrals[addr];
            return !referral?.isValidated;
        })
        .map(addr => {
            const referred = db.users[addr];
            return {
                address: addr,
                questsCompleted: referred?.completedQuestsCount ?? 0,
                questsRequired: 2,
            };
        });

    const successfulReferrals = user.invites
        .filter(addr => {
            const referral = db.referrals[addr];
            return referral?.isValidated;
        })
        .map(addr => {
            const referral = db.referrals[addr];
            return {
                address: addr,
                validatedAt: referral?.validatedAt ?? null,
            };
        });

    return NextResponse.json({
        user,
        leaderboard,
        referralStats: {
            pending: pendingReferrals,
            successful: successfulReferrals
        }
    });
}

import { verifyTransaction } from '@/lib/verifyTransaction';

export async function POST(req: NextRequest) {
    const { address, amount, hash, referralCode, fingerprint } = await req.json();

    if (!address || !amount || !hash) {
        return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Server-side Verification
    const verification = await verifyTransaction(hash, amount, address);
    if (!verification.verified) {
        return NextResponse.json({ error: 'Transaction verification failed' }, { status: 400 });
    }

    const db = readDB();
    const user = getOrCreateUser(address);
    const normalizedAddress = address.toLowerCase();

    // Get IP from request headers
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] ||
        req.headers.get('x-real-ip') ||
        'unknown';

    // Anti-Sybil check for referrals
    if (referralCode && user.transactions === 0) {
        const sybilCheck = checkAntiSybil(db, normalizedAddress, fingerprint, ipAddress);
        if (!sybilCheck.allowed) {
            return NextResponse.json({
                error: 'Anti-Sybil protection triggered',
                reason: sybilCheck.reason
            }, { status: 403 });
        }
    }

    // Record anti-Sybil data
    recordAntiSybilData(db, normalizedAddress, fingerprint, ipAddress);

    // Prevent duplicate processing
    if (user.processedHashes.includes(hash)) {
        return NextResponse.json({ user });
    }

    const value = parseFloat(amount);
    user.transactions += 1;
    user.volume += value;
    user.dailyVolume += value;
    user.weeklyVolume += value;
    user.lastTxTimestamp = Date.now();
    user.processedHashes.push(hash);

    // Initial Referral Link logic with formal referrals table
    if (referralCode && user.transactions === 1 && !user.referredBy) {
        const inviter = Object.values(db.users).find((u) => u.referralCode === referralCode);
        if (inviter && inviter.address !== normalizedAddress) {
            // Check if inviter's fingerprint matches (anti-Sybil)
            const inviterSybilData = db.antiSybil[inviter.address];
            const userSybilData = db.antiSybil[normalizedAddress];

            const isSameDevice = inviterSybilData?.fingerprint &&
                userSybilData?.fingerprint &&
                inviterSybilData.fingerprint === userSybilData.fingerprint;

            if (!isSameDevice) {
                user.referredBy = inviter.address;
                if (!inviter.invites.includes(normalizedAddress)) {
                    inviter.invites.push(normalizedAddress);
                    db.users[inviter.address] = inviter;
                }

                // Create formal referral record
                if (!db.referrals[normalizedAddress]) {
                    db.referrals[normalizedAddress] = createReferral(inviter.address, normalizedAddress);
                }
            }
        }
    }

    // Points logic
    let earnedPoints = 0;

    // Daily Tasks
    if (user.transactions >= 10 && !user.quests.dailyTx) {
        user.quests.dailyTx = true;
        earnedPoints += 100;
        user.completedQuestsCount++;
    }

    const checkVolQuest = (vol: number, threshold: number, questKey: keyof UserData['quests'], points: number) => {
        if (vol >= threshold && !user.quests[questKey]) {
            (user.quests as Record<string, boolean>)[questKey] = true;
            earnedPoints += points;
            user.completedQuestsCount++;
        }
    };

    checkVolQuest(user.dailyVolume, 1, 'dailyVol1', 1000);
    checkVolQuest(user.dailyVolume, 5, 'dailyVol5', 5000);
    checkVolQuest(user.dailyVolume, 10, 'dailyVol10', 10000);
    checkVolQuest(user.dailyVolume, 50, 'dailyVol50', 50000);
    checkVolQuest(user.dailyVolume, 100, 'dailyVol100', 100000);
    checkVolQuest(user.weeklyVolume, 1, 'weeklyVol1', 10000);

    user.points += earnedPoints;

    // Activity-Based Referral Validation with formal referrals table
    if (user.referredBy && user.completedQuestsCount >= 2) {
        const referral = db.referrals[normalizedAddress];
        if (referral && !referral.isValidated) {
            const inviter = db.users[user.referredBy];
            if (inviter) {
                inviter.referralPoints += 500;
                db.users[inviter.address] = inviter;

                // Update referral record
                referral.isValidated = true;
                referral.validatedAt = Date.now();
                db.referrals[normalizedAddress] = referral;
            }
        }
    }

    db.users[normalizedAddress] = user;
    writeDB(db);

    return NextResponse.json({ user, earnedPoints });
}

