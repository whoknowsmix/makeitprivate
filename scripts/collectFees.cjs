const hre = require("hardhat");

/**
 * Fee Collection Script
 * 
 * Usage:
 *   npx hardhat run scripts/collectFees.cjs --network sepolia
 *   npx hardhat run scripts/collectFees.cjs --network baseSepolia
 */

// Contract Addresses (Update these after redeployment!)
const CONTRACT_ADDRESSES = {
    sepolia: "0xD1FA53f474eca005D5957c64252c64cc1f24d16e", // Replace with NEW address
    baseSepolia: "0x8071D33647a5009D05912B1e65C565ab6e6dD631" // Replace with NEW address
};

async function main() {
    console.log("💰 Who Knows? Fee Collector");
    console.log("============================");

    const networkName = hre.network.name;
    console.log(`📡 Network: ${networkName}`);

    const contractAddress = CONTRACT_ADDRESSES[networkName];
    if (!contractAddress) {
        console.error(`❌ No contract address configured for network: ${networkName}`);
        process.exit(1);
    }
    console.log(`📝 Contract: ${contractAddress}`);

    const [signer] = await hre.ethers.getSigners();
    console.log(`🔑 Operator: ${signer.address}`);

    // Attach to contract
    const WhoKnows = await hre.ethers.getContractFactory("WhoKnows");
    const contract = WhoKnows.attach(contractAddress);

    // Check fee balance
    console.log("\n🔍 Checking fee balance...");
    let pendingFees;
    try {
        // Try new function first
        pendingFees = await contract.getPendingFees();
    } catch (e) {
        console.log("   (getPendingFees failed, verifying via accumulatedFees public var...)");
        try {
            pendingFees = await contract.accumulatedFees();
        } catch (e2) {
            console.error("❌ Failed to read pending fees. Contract might not be updated?");
            process.exit(1);
        }
    }

    const feesEth = hre.ethers.formatEther(pendingFees);
    console.log(`   Available Fees: ${feesEth} ETH`);

    if (pendingFees === 0n) {
        console.log("✅ No fees to collect.");
        return;
    }

    // Withdraw fees
    console.log("\n💸 Withdrawing fees...");
    try {
        const tx = await contract.withdrawFees();
        console.log(`   Tx Sent: ${tx.hash}`);

        process.stdout.write("   Waiting for confirmation... ");
        const receipt = await tx.wait();
        console.log("✅ Confirmed!");

        // Find event
        const event = receipt.logs.find(log => {
            // FeeWithdrawn signature or similar
            // For now just success is enough, but clean script tries to parse
            return true;
        });

        console.log(`\n🎉 Successfully collected ${feesEth} ETH!`);
        console.log(`   Transferred to: ${signer.address}`);

    } catch (error) {
        console.error("\n❌ Withdrawal Failed:");
        if (error.message.includes("is not color")) {
            // decoding error sometimes happens
            console.error(error.message);
        } else if (error.message.includes("revert")) {
            console.error("   Transaction reverted. Are you the owner?");
        } else {
            console.error(error);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
