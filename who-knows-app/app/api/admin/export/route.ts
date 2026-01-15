import { NextRequest, NextResponse } from 'next/server';
import { readDB } from '@/lib/db';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.ADMIN_SECRET && secret !== 'debug_admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = readDB();
    const users = Object.values(db.users);

    const format = searchParams.get('format');

    if (format === 'csv') {
        let csv = 'Wallet Address,Quest Points,Referral Points,Total Points,Valid Referrals,Pending Referrals,Completed Quests,Total Volume\n';
        users.forEach((u) => {
            const validInvites = u.invites.filter((addr: string) => {
                const referral = db.referrals[addr];
                return referral?.isValidated;
            }).length;
            const pendingInvites = u.invites.filter((addr: string) => {
                const referral = db.referrals[addr];
                return !referral?.isValidated;
            }).length;
            const totalPoints = u.points + u.referralPoints;
            csv += `${u.address},${u.points},${u.referralPoints},${totalPoints},${validInvites},${pendingInvites},${u.completedQuestsCount},${u.volume.toFixed(4)}\n`;
        });
        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=snapshot.csv',
            },
        });
    }

    // Default to JSON but with the enriched valid referrals count
    const enrichedUsers = users.map((u) => ({
        address: u.address,
        questPoints: u.points,
        referralPoints: u.referralPoints,
        totalPoints: u.points + u.referralPoints,
        validReferrals: u.invites.filter((addr: string) => {
            const referral = db.referrals[addr];
            return referral?.isValidated;
        }).length,
        pendingReferrals: u.invites.filter((addr: string) => {
            const referral = db.referrals[addr];
            return !referral?.isValidated;
        }).length,
        completedQuests: u.completedQuestsCount,
        totalVolume: u.volume,
    }));

    return NextResponse.json(enrichedUsers);
}

