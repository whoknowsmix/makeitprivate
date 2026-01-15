# Local Setup Guide - Who Knows?

Follow these steps to set up and run the "Who Knows?" privacy mixer on your local machine.

## 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Git](https://git-scm.com/)
- A browser with [MetaMask](https://metamask.io/) installed.

## 2. Environment Configuration
In the root directory, you will find a `.env.template` file.
1. Create a copy named `.env`.
2. Open `.env` and fill in your details:
   - `PRIVATE_KEY`: Your wallet private key (without `0x`).
   - `SEPOLIA_RPC_URL`: Infura/Alchemy URL for Ethereum Sepolia.
   - `BASE_SEPOLIA_RPC_URL`: RPC URL for Base Sepolia (e.g., `https://sepolia.base.org`).
   - `ETHERSCAN_API_KEY`: For contract verification on Etherscan.
   - `BASESCAN_API_KEY`: For contract verification on Basescan.

## 3. Install Dependencies
You need to install dependencies for both the smart contracts and the frontend app.

**For Smart Contracts (Root):**
```bash
npm install
```

**For Frontend (who-knows-app):**
```bash
cd who-knows-app
npm install
cd ..
```

## 4. Compile & Deploy (Optional)
If you want to redeploy the contracts:

1. **Compile**:
   ```bash
   npx hardhat compile
   ```
2. **Deploy to Sepolia**:
   ```bash
   npx hardhat run scripts/deploy.cjs --network sepolia
   ```
3. **Deploy to Base Sepolia**:
   ```bash
   npx hardhat run scripts/deploy.cjs --network baseSepolia
   ```

The script will automatically update `who-knows-app/lib/addresses.ts` (or `deployedAddresses.json`) with the new addresses.

## 5. Run the Frontend
To start the web application:

```bash
cd who-knows-app
npm run dev
```

The app will start at [http://localhost:3000](http://localhost:3000) (or the next available port).

## 6. Testing the App
1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Connect your MetaMask wallet.
3. Switch your network to **Sepolia** or **Base Sepolia**.
4. Use the **Deposit** page to mix your ETH.
5. **Save the Secret Note!**
6. Go to the **Withdraw** page, enter your note and a recipient address to get your funds back (minus the 5% fee).

---
> [!IMPORTANT]
> **Privacy Tip**: For maximum anonymity, use the fixed presets (0.1, 1, or 10 ETH) and withdraw to a completely fresh wallet address.
