const hre = require("hardhat");

async function main() {
    try {
        const [deployer] = await hre.ethers.getSigners();
        const balance = await hre.ethers.provider.getBalance(deployer.address);
        console.log(`ADDRESS_CHECK: ${deployer.address}`);
        console.log(`BALANCE_CHECK: ${hre.ethers.formatEther(balance)}`);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
