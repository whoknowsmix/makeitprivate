#!/usr/bin/env node

/**
 * Who Knows? Airdrop Snapshot Generator
 * 
 * A secure, read-only script to extract final user data for airdrops.
 * 
 * Usage:
 *   node generate-airdrop.js [--min-quests=2] [--output-dir=./snapshots]
 * 
 * Requirements:
 *   - ADMIN_SECRET_KEY must be set in .env file
 *   - db.json must exist in who-knows-app directory
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY,
    DB_PATH: path.join(__dirname, 'who-knows-app', 'db.json'),
    OUTPUT_DIR: './snapshots',
    MIN_QUESTS_DEFAULT: 0, // Set to 2 for anti-sybil filtering
    REFERRAL_POINTS_PER_VALID: 500,
};

// ============================================================================
// SECURITY CHECK
// ============================================================================

function validateAccess() {
    console.log('\n🔐 Security Check...');

    if (!CONFIG.ADMIN_SECRET_KEY) {
        console.error('❌ ERROR: ADMIN_SECRET_KEY not found in .env file');
        console.error('   Please add ADMIN_SECRET_KEY=your_secret_key to your .env file');
        process.exit(1);
    }

    // Prompt for key verification
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('🔑 Enter ADMIN_SECRET_KEY to continue: ', (answer) => {
            rl.close();
            if (answer !== CONFIG.ADMIN_SECRET_KEY) {
                console.error('❌ ERROR: Invalid ADMIN_SECRET_KEY');
                process.exit(1);
            }
            console.log('✅ Access granted\n');
            resolve();
        });
    });
}

// ============================================================================
// ARGUMENT PARSING
// ============================================================================

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        minQuests: CONFIG.MIN_QUESTS_DEFAULT,
        outputDir: CONFIG.OUTPUT_DIR,
    };

    args.forEach(arg => {
        if (arg.startsWith('--min-quests=')) {
            options.minQuests = parseInt(arg.split('=')[1], 10);
        } else if (arg.startsWith('--output-dir=')) {
            options.outputDir = arg.split('=')[1];
        } else if (arg === '--help' || arg === '-h') {
            console.log(`
Who Knows? Airdrop Snapshot Generator

Usage:
  node generate-airdrop.js [options]

Options:
  --min-quests=N     Minimum completed quests to include user (default: 0, recommended: 2)
  --output-dir=PATH  Output directory for snapshot files (default: ./snapshots)
  --help, -h         Show this help message

Examples:
  node generate-airdrop.js
  node generate-airdrop.js --min-quests=2
  node generate-airdrop.js --min-quests=2 --output-dir=./airdrops
            `);
            process.exit(0);
        }
    });

    return options;
}

// ============================================================================
// DATABASE READ (READ-ONLY)
// ============================================================================

function readDatabase() {
    console.log('📂 Reading database...');

    if (!fs.existsSync(CONFIG.DB_PATH)) {
        console.error(`❌ ERROR: Database not found at ${CONFIG.DB_PATH}`);
        process.exit(1);
    }

    try {
        const data = fs.readFileSync(CONFIG.DB_PATH, 'utf-8');
        const db = JSON.parse(data);

        // Ensure required tables exist
        if (!db.users) db.users = {};
        if (!db.referrals) db.referrals = {};

        console.log(`   Found ${Object.keys(db.users).length} users in database`);
        return db;
    } catch (error) {
        console.error('❌ ERROR: Failed to parse database:', error.message);
        process.exit(1);
    }
}

// ============================================================================
// DATA EXTRACTION & CALCULATION
// ============================================================================

function extractAirdropData(db, minQuests) {
    console.log(`\n📊 Extracting airdrop data (min quests: ${minQuests})...`);

    const users = Object.values(db.users);
    const airdropData = [];

    let filteredCount = 0;

    users.forEach(user => {
        // Calculate valid referrals
        const validReferrals = user.invites ? user.invites.filter(addr => {
            const referral = db.referrals[addr];
            return referral && referral.isValidated;
        }).length : 0;

        // Calculate total points
        const questPoints = user.points || 0;
        const referralPoints = validReferrals * CONFIG.REFERRAL_POINTS_PER_VALID;
        const totalPoints = questPoints + referralPoints;

        // Get completed quests count
        const completedQuests = user.completedQuestsCount || 0;

        // Apply anti-sybil filter
        if (completedQuests < minQuests) {
            filteredCount++;
            return;
        }

        airdropData.push({
            walletAddress: user.address,
            questPoints: questPoints,
            validReferrals: validReferrals,
            referralPoints: referralPoints,
            totalPoints: totalPoints,
            completedQuests: completedQuests,
            totalVolume: user.volume || 0,
            transactions: user.transactions || 0,
        });
    });

    // Sort by total points (highest first)
    airdropData.sort((a, b) => b.totalPoints - a.totalPoints);

    // Add rank
    airdropData.forEach((user, index) => {
        user.rank = index + 1;
    });

    console.log(`   ✅ Extracted ${airdropData.length} eligible users`);
    console.log(`   ⚠️  Filtered out ${filteredCount} users (below ${minQuests} quests)`);

    return airdropData;
}

// ============================================================================
// OUTPUT GENERATION
// ============================================================================

function generateOutputs(data, outputDir) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const baseName = `airdrop_snapshot_${timestamp}`;

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate JSON
    const jsonPath = path.join(outputDir, `${baseName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log(`   📄 JSON: ${jsonPath}`);

    // Generate CSV (MultiSender/Disperse.app compatible)
    const csvPath = path.join(outputDir, `${baseName}.csv`);
    const headers = ['Rank', 'Wallet Address', 'Quest Points', 'Valid Referrals', 'Referral Points', 'Total Points', 'Completed Quests', 'Total Volume (ETH)', 'Transactions'];
    const csvRows = [headers.join(',')];

    data.forEach(user => {
        csvRows.push([
            user.rank,
            user.walletAddress,
            user.questPoints,
            user.validReferrals,
            user.referralPoints,
            user.totalPoints,
            user.completedQuests,
            user.totalVolume.toFixed(4),
            user.transactions,
        ].join(','));
    });

    fs.writeFileSync(csvPath, csvRows.join('\n'));
    console.log(`   📄 CSV: ${csvPath}`);

    // Generate Disperse.app format (address=amount)
    const dispersePath = path.join(outputDir, `${baseName}_disperse.txt`);
    const disperseLines = data.map(user => `${user.walletAddress}=${user.totalPoints}`);
    fs.writeFileSync(dispersePath, disperseLines.join('\n'));
    console.log(`   📄 Disperse Format: ${dispersePath}`);

    return { jsonPath, csvPath, dispersePath };
}

// ============================================================================
// SUMMARY LOGGING
// ============================================================================

function logSummary(data) {
    console.log('\n' + '='.repeat(60));
    console.log('📈 AIRDROP SNAPSHOT SUMMARY');
    console.log('='.repeat(60));

    const totalUsers = data.length;
    const totalPoints = data.reduce((sum, u) => sum + u.totalPoints, 0);
    const totalQuestPoints = data.reduce((sum, u) => sum + u.questPoints, 0);
    const totalReferralPoints = data.reduce((sum, u) => sum + u.referralPoints, 0);
    const totalValidReferrals = data.reduce((sum, u) => sum + u.validReferrals, 0);
    const totalVolume = data.reduce((sum, u) => sum + u.totalVolume, 0);

    console.log(`
┌─────────────────────────────────────────────────────────┐
│  Total Users Captured:        ${String(totalUsers).padStart(10)}              │
│  Total Quest Points:          ${String(totalQuestPoints).padStart(10)}              │
│  Total Valid Referrals:       ${String(totalValidReferrals).padStart(10)}              │
│  Total Referral Points:       ${String(totalReferralPoints).padStart(10)}              │
│  ─────────────────────────────────────────────────────  │
│  TOTAL POINTS DISTRIBUTED:    ${String(totalPoints).padStart(10)}              │
│  Total ETH Volume:            ${totalVolume.toFixed(4).padStart(10)} ETH          │
└─────────────────────────────────────────────────────────┘
`);

    // Top 10 leaderboard
    if (data.length > 0) {
        console.log('🏆 TOP 10 LEADERBOARD:');
        console.log('─'.repeat(60));
        data.slice(0, 10).forEach(user => {
            const addr = `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`;
            console.log(`   #${String(user.rank).padStart(2)}  ${addr}  ${String(user.totalPoints).padStart(8)} pts  (${user.validReferrals} refs)`);
        });
        console.log('');
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    console.log('\n' + '═'.repeat(60));
    console.log('     WHO KNOWS? AIRDROP SNAPSHOT GENERATOR');
    console.log('═'.repeat(60));
    console.log(`     Timestamp: ${new Date().toISOString()}`);
    console.log('     Mode: READ-ONLY (Safe Execution)');
    console.log('═'.repeat(60));

    // Parse command line arguments
    const options = parseArgs();

    // Security validation
    await validateAccess();

    // Read database (READ-ONLY)
    const db = readDatabase();

    // Extract and calculate airdrop data
    const airdropData = extractAirdropData(db, options.minQuests);

    // Generate output files
    console.log('\n💾 Generating output files...');
    const outputs = generateOutputs(airdropData, options.outputDir);

    // Log summary
    logSummary(airdropData);

    console.log('✅ Airdrop snapshot generated successfully!');
    console.log(`   Files saved to: ${path.resolve(options.outputDir)}\n`);
}

// Run the script
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
