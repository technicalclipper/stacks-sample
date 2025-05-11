'use client';

import Image from "next/image";
import ConnectWallet from "./components/connectwallet";
import { connect, disconnect, isConnected } from '@stacks/connect';    //for disconnecting and checking if connected
import { getLocalStorage, request } from '@stacks/connect';
import GetAccountDetails from "./components/getAccountdetails";
import { generateWallet, generateSecretKey, generateNewAccount, getStxAddress } from '@stacks/wallet-sdk';


async function callcontract(){
  const response = await request('stx_callContract', {
    contract: 'STR23J01SSNR5E0QPWVPJV7WSY1E3YEXFYRPK845.read', // contract in format: address.contract-name
    functionName: 'gethi', // name of the function to call
    network: 'testnet', // optional, defaults to mainnet
  });
  console.log(response);
}

async function createWallet(){
  const password = 'password';
  const secretKey = generateSecretKey();

  

  let wallet = await generateWallet({
    secretKey,
    password,
  });

  const account = wallet.accounts[0];
  
  // Get the address from the private key
  const testnetAddress = getStxAddress(account, 'testnet');
  console.log('Wallet Address:', testnetAddress);
  console.log('Wallet Details:', wallet.accounts[0]);
}


export default function Home() {

 
  return (
   <>
            <h1>Connect Wallet</h1>
            <ConnectWallet />

            <h1>to check if connected</h1>
            <h1>Is Connected: {isConnected() ? 'Yes' : 'No'}</h1>

            <h1>to disconnect</h1>
            <button onClick={() => disconnect()}>Disconnect</button>

            <h1>to get account details</h1>
            <button onClick={GetAccountDetails}>Get Account Details</button>

            <h1>to call contract</h1>
            <button onClick={callcontract}>Call Contract</button>

            <h1>to create wallet</h1>
            <button onClick={createWallet}>Create Wallet</button>

   </>
  );
}
