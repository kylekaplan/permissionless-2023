import * as zksync from "zksync-web3";
import * as ethers from "ethers";
import dotenv from "dotenv";



// Currently, only one environment is supported.
import { Wallet, Provider } from "zksync-web3";

dotenv.config();


function initWallet() {

    const privateKey = process.env.PRIVATE_KEY?.toString();

    const ethProvider = ethers.getDefaultProvider("goerli");
    
    const provider = new Provider("https://testnet.era.zksync.dev");
    // Private key of the account to connect
    const wallet = new Wallet(`${privateKey}`).connect(provider);
    
    return wallet;
  
}

export default initWallet;
