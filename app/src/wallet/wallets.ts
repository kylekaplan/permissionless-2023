import * as zksync from "zksync-web3";
import * as ethers from "ethers";
import dotenv from "dotenv";



// Currently, only one environment is supported.
import { Wallet, Provider } from "zksync-web3";


function initWallet() {

    const privateKey = '0x4a25dc61e86751e9e421787e5defb61fc7368973f6a3e296f2890f4608f9a5ca'?.toString();

    const ethProvider = ethers.getDefaultProvider("goerli");
    
    const provider = new Provider("https://testnet.era.zksync.dev");
    // Private key of the account to connect
    const wallet = new Wallet(`${privateKey}`).connect(provider);
    
    return wallet;
  
}

export { initWallet };

export default initWallet;
