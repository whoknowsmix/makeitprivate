require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const privateKey = process.env.PRIVATE_KEY &&
    !process.env.PRIVATE_KEY.includes("your_private_key") &&
    /^[0-9a-fA-F]+$/.test(process.env.PRIVATE_KEY.replace('0x', '')) ?
    (process.env.PRIVATE_KEY.startsWith("0x") ? process.env.PRIVATE_KEY : `0x${process.env.PRIVATE_KEY}`) :
    undefined;

const accounts = privateKey ? [privateKey] : [];
if (!privateKey) {
    console.log("WARNING: Valid PRIVATE_KEY not found in .env. Deployment will fail if a network is used.");
}

module.exports = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: accounts,
        },
        baseSepolia: {
            url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
            accounts: accounts,
            gasPrice: 1000000000, // 1 gwei (ensure it doesn't get stuck)
        },
    },
    etherscan: {
        apiKey: {
            sepolia: process.env.ETHERSCAN_API_KEY || "",
            baseSepolia: process.env.BASESCAN_API_KEY || "PLACEHOLDER_KEY",
        },
        customChains: [
            {
                network: "baseSepolia",
                chainId: 84532,
                urls: {
                    apiURL: "https://api-sepolia.basescan.org/api",
                    browserURL: "https://sepolia.basescan.org",
                },
            },
        ],
    },
    sourcify: {
        enabled: true
    }
};
