require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
    solidity: "0.8.24",
    networks: {
        megaethTestnet: {
            url: "https://carrot.megaeth.com/rpc",
            chainId: 6342,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        }
    }
};
