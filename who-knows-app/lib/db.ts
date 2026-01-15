import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');

export type ReferralRecord = {
    inviterAddress: string;
    invitedAddress: string;
    isValidated: boolean;
    createdAt: number;
    validatedAt: number | null;
};

export type AntiSybilData = {
    fingerprint: string | null;
    ipAddress: string | null;
    firstSeenAt: number;
};

export type DBSchema = {
    users: Record<string, UserData>;
    referrals: Record<string, ReferralRecord>;
    antiSybil: Record<string, AntiSybilData>;
};

export function readDB(): DBSchema {
    if (!fs.existsSync(DB_PATH)) {
        return { users: {}, referrals: {}, antiSybil: {} };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure all tables exist
    if (!parsed.referrals) parsed.referrals = {};
    if (!parsed.antiSybil) parsed.antiSybil = {};
    return parsed;
}

export function writeDB(data: DBSchema) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export type QuestData = {
    dailyTx: boolean;
    dailyVol1: boolean;
    dailyVol5: boolean;
    dailyVol10: boolean;
    dailyVol50: boolean;
    dailyVol100: boolean;
    weeklyVol1: boolean;
};

export type UserData = {
    address: string;
    points: number;
    referralPoints: number;
    referralCode: string;
    referredBy: string | null;
    completedQuestsCount: number;
    invites: string[];
    transactions: number;
    volume: number;
    dailyVolume: number;
    weeklyVolume: number;
    lastTxTimestamp: number;
    processedHashes: string[];
    quests: QuestData;
};

// Helper: Create a referral record
export function createReferral(inviterAddress: string, invitedAddress: string): ReferralRecord {
    return {
        inviterAddress: inviterAddress.toLowerCase(),
        invitedAddress: invitedAddress.toLowerCase(),
        isValidated: false,
        createdAt: Date.now(),
        validatedAt: null,
    };
}

// Helper: Get referral by invited address
export function getReferralByInvited(db: DBSchema, invitedAddress: string): ReferralRecord | null {
    return db.referrals[invitedAddress.toLowerCase()] || null;
}

// Helper: Check for anti-Sybil violations
export function checkAntiSybil(db: DBSchema, address: string, fingerprint?: string, ipAddress?: string): { allowed: boolean; reason?: string } {
    const normalizedAddress = address.toLowerCase();

    // Check if fingerprint is already associated with another address
    if (fingerprint) {
        for (const [addr, data] of Object.entries(db.antiSybil)) {
            if (addr !== normalizedAddress && data.fingerprint === fingerprint) {
                return { allowed: false, reason: 'Device fingerprint already registered with another wallet' };
            }
        }
    }

    return { allowed: true };
}

// Helper: Record anti-Sybil data
export function recordAntiSybilData(db: DBSchema, address: string, fingerprint?: string, ipAddress?: string) {
    const normalizedAddress = address.toLowerCase();
    if (!db.antiSybil[normalizedAddress]) {
        db.antiSybil[normalizedAddress] = {
            fingerprint: fingerprint || null,
            ipAddress: ipAddress || null,
            firstSeenAt: Date.now(),
        };
    } else {
        // Update if new data provided
        if (fingerprint && !db.antiSybil[normalizedAddress].fingerprint) {
            db.antiSybil[normalizedAddress].fingerprint = fingerprint;
        }
        if (ipAddress && !db.antiSybil[normalizedAddress].ipAddress) {
            db.antiSybil[normalizedAddress].ipAddress = ipAddress;
        }
    }
}

export function getOrCreateUser(address: string): UserData {
    const db = readDB();
    const normalizedAddress = address.toLowerCase();

    if (!db.users[normalizedAddress]) {
        db.users[normalizedAddress] = {
            address: normalizedAddress,
            points: 0,
            referralPoints: 0,
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            referredBy: null,
            completedQuestsCount: 0,
            invites: [],
            transactions: 0,
            volume: 0,
            dailyVolume: 0,
            weeklyVolume: 0,
            lastTxTimestamp: 0,
            processedHashes: [],
            quests: {
                dailyTx: false,
                dailyVol1: false,
                dailyVol5: false,
                dailyVol10: false,
                dailyVol50: false,
                dailyVol100: false,
                weeklyVol1: false,
            },
        };
        writeDB(db);
    } else {
        // Migration: Ensure new fields exist
        const user = db.users[normalizedAddress];
        if (user.referralPoints === undefined) user.referralPoints = 0;
        if (user.referredBy === undefined) user.referredBy = null;
        if (user.completedQuestsCount === undefined) {
            // Recalculate quest count
            user.completedQuestsCount = Object.values(user.quests).filter(Boolean).length;
        }
        if (user.processedHashes === undefined) user.processedHashes = [];
        if (user.invites === undefined) user.invites = [];
        db.users[normalizedAddress] = user;
        writeDB(db);
    }

    return db.users[normalizedAddress];
}
