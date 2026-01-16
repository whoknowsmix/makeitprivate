
const { getOrCreateUser } = require('../lib/db');

// Mock FS if needed, or just rely on the real file since we are in the same project structure
// But lib/db.ts uses import/export which might need ts-node or transpilation.
// Let's rely on the fact that existing scripts (like `scripts/deploy.cjs`) use commonjs?
// Wait, the project has `tsconfig.json` so it's TS.
// `lib/db.ts` is TS.
// I should use `npx ts-node` to run the script.

async function main() {
    const address = "0x316502403e401d5d9bc653e6fdb365caff6f7d54";
    console.log("Checking user:", address);

    // Call the function which should trigger the migration
    const user = getOrCreateUser(address);

    console.log("User referral code:", user.referralCode);

    if (user.referralCode && user.referralCode.length > 0) {
        console.log("SUCCESS: Referral code generated.");
    } else {
        console.error("FAILURE: Referral code missing.");
        process.exit(1);
    }
}

main();
