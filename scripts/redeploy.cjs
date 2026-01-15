const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Starting Redeployment...");

    // 1. Setup Network & Helper
    const networkName = hre.network.name; // 'sepolia' or 'baseSepolia'
    const [deployer] = await hre.ethers.getSigners();
    console.log(`📡 Network: ${networkName}`);
    console.log(`🔑 Deployer: ${deployer.address}`);

    // 2. Check Balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceEth = hre.ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceEth} ETH`);

    if (balance === 0n) {
        console.error("❌ Error: Deployer balance is 0. Please fund your wallet.");
        process.exit(1);
    }

    // 3. Deploy
    console.log("\n📄 Deploying WhoKnows contract...");
    const WhoKnows = await hre.ethers.getContractFactory("WhoKnows");
    const contract = await WhoKnows.deploy(deployer.address);

    console.log("⏳ Waiting for deployment...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(`✅ Deployed to: ${address}`);

    // 4. Update Frontend JSON
    const jsonPath = path.join(__dirname, '../who-knows-app/lib/contractAddress.json');
    let addresses = {};

    if (fs.existsSync(jsonPath)) {
        try {
            addresses = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        } catch (e) {
            console.warn("⚠️ Could not parse existing contractAddress.json, starting fresh.");
        }
    }

    addresses[networkName] = address;

    fs.writeFileSync(jsonPath, JSON.stringify(addresses, null, 4));
    console.log(`📝 Updated frontend config at: ${jsonPath}`);

    // 5. Verification Instructions
    console.log("\n🔍 Verification Command:");
    console.log(`npx hardhat verify --network ${networkName} ${address} ${deployer.address}`);

    console.log("\n🎉 Redeployment Complete! Frontend should automatically sync.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
