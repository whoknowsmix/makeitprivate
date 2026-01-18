const hre = require("hardhat");

async function main() {
    const network = hre.network.name;
    console.log("");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  WHO KNOWS? - MegaETH Deployment");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`  Network: ${network} (Chain ID: 6343)`);
    console.log("");

    // Get deployer info
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`  Deployer: ${deployer.address}`);
    console.log(`  Balance: ${hre.ethers.formatEther(balance)} ETH`);

    if (balance === 0n) {
        console.error("  ❌ ERROR: Deployer has 0 ETH on MegaETH Testnet.");
        console.error("     Please bridge funds or use a faucet.");
        process.exit(1);
    }
    console.log("");

    // Deploy contract
    console.log("  Deploying WhoKnows contract...");
    const WhoKnows = await hre.ethers.getContractFactory("WhoKnows");

    // Pass deployer address as initialOwner
    const contract = await WhoKnows.deploy(deployer.address);
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  ✅ DEPLOYMENT SUCCESSFUL");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`  Contract Address: ${contractAddress}`);
    console.log("");
    console.log("  NEXT STEPS:");
    console.log("  ─────────────────────────────────────────────────────────");
    console.log(`  1. Update frontend config:`);
    console.log(`     Add "${contractAddress}" to lib/contractAddress.json under 'megaethTestnet'`);
    console.log("");
    console.log(`  2. Verify transaction on MegaExplorer:`);
    console.log(`     https://megaexplorer.xyz/address/${contractAddress}`);
    console.log("");
    console.log("═══════════════════════════════════════════════════════════");
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});
