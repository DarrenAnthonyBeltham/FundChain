'use client'; 

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function ConnectWallet() {
  const [account, setAccount] = useState<string | null>(null);

  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const connectedAccount = await signer.getAddress();
        setAccount(connectedAccount);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  }

  return (
    <div>
      {account ? (
        <p className="text-white bg-green-600 px-4 py-2 rounded-lg">
          Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
        </p>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}