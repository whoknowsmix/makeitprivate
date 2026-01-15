# Redeploy Guide - Who Knows?

This guide explains how to migrate and redeploy the "Who Knows?" privacy mixer to Ethereum Sepolia and Base Sepolia using your new wallet.

## 1. Setup Environment
Ensure your `.env` file is updated with your **NEW wallet's private key** (without the `0x` prefix) and the required RPC URLs/API Keys.

> [!WARNING]
> I noticed your `.env` file currently contains placeholder values (e.g., `your_private_key_without_0x_here`). Please ensure you save your real keys to the file before running the deployment commands.

## 2. Clean Previous Artifacts
```bash
npx hardhat clean
```

## 3. Compile Contracts
```bash
npx hardhat compile
```

## 4. Deploy to Ethereum Sepolia
```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

## 5. Deploy to Base Sepolia
```bash
npx hardhat run scripts/deploy.cjs --network baseSepolia
```

## 6. Verify Contracts
Verify the deployed contracts on their respective explorers.

### Ethereum Sepolia:
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS DEPLOYER_ADDRESS
```

### Base Sepolia:
```bash
npx hardhat verify --network baseSepolia CONTRACT_ADDRESS DEPLOYER_ADDRESS
```

## 7. Frontend Integration
The `deployedAddresses.json` file is automatically updated with the new addresses.
```json
{
  "11155111": {
    "address": "0x...",
    "network": "sepolia",
    "timestamp": "..."
  },
  "84532": {
    "address": "0x...",
    "network": "baseSepolia",
    "timestamp": "..."
  }
}
```
