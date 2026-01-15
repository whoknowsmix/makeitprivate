const hre = require("hardhat");

async function main() {
    const network = hre.network.name;
    console.log("");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  WHO KNOWS? - Privacy Mixer Deployment");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`  Network: ${network}`);
    console.log("");

    // Get deployer info
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`  Deployer: ${deployer.address}`);
    console.log(`  Balance: ${hre.ethers.formatEther(balance)} ETH`);
    console.log("");

    // Deploy contract
    console.log("  Deploying WhoKnows contract...");
    const WhoKnows = await hre.ethers.getContractFactory("WhoKnows");
    const contract = await WhoKnows.deploy();
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
    console.log(`  1. Update frontend .env.local:`);
    console.log(`     NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
    console.log("");
    console.log(`  2. Verify on Etherscan:`);
    console.log(`     npx hardhat verify --network ${network} ${contractAddress}`);
    console.log("");
    console.log("═══════════════════════════════════════════════════════════");
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});
