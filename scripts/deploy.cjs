const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("==========================================");
    console.log("Who Knows? - Deployment Script");
    console.log("==========================================");
    console.log("Deploying with account:", deployer.address);

    // 1. Balance Check
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        throw new Error("Insufficient funds for deployment. Please fund your wallet.");
    }

    const network = await ethers.provider.getNetwork();
    console.log("Network Name:", network.name);
    console.log("Chain ID:", network.chainId.toString());

    // 2. Deploy WhoKnows
    console.log("\nDeploying WhoKnows contract...");
    const WhoKnows = await ethers.getContractFactory("WhoKnows");
    const whoKnows = await WhoKnows.deploy(deployer.address);

    await whoKnows.waitForDeployment();
    const address = await whoKnows.getAddress();

    console.log("SUCCESS: WhoKnows deployed to:", address);

    // 3. Save address to deployedAddresses.json
    const addressFilePath = path.join(__dirname, "../deployedAddresses.json");
    let addresses = {};

    if (fs.existsSync(addressFilePath)) {
        try {
            addresses = JSON.parse(fs.readFileSync(addressFilePath, "utf8"));
        } catch (e) {
            console.log("Note: Creating new deployedAddresses.json");
        }
    }

    const chainKey = network.chainId.toString();
    addresses[chainKey] = {
        address: address,
        network: network.name,
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(addressFilePath, JSON.stringify(addresses, null, 2));
    console.log(`\nLocal registry updated: deployedAddresses.json`);
    console.log("==========================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\nDEPLOYMENT FAILED:");
        console.error(error.message);
        process.exit(1);
    });
