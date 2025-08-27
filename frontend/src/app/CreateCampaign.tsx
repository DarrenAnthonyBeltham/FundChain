'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { FUND_CHAIN_CONTRACT_ADDRESS } from '@/lib/constants';
import FundChainJson from '@/contracts/FundChain.json';

export default function CreateCampaign() {
  const [goal, setGoal] = useState('');
  const [days, setDays] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleCreateCampaign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    setIsLoading(true);
    setMessage('Processing transaction...');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        FUND_CHAIN_CONTRACT_ADDRESS,
        FundChainJson.abi,
        signer
      );

      const goalInEther = ethers.parseEther(goal);
      const transaction = await contract.createCampaign(goal, days);
      
      await transaction.wait();
      
      setMessage('Campaign created successfully!');
      setGoal('');
      setDays('');
    } catch (error) {
      console.error(error);
      setMessage('Error creating campaign.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-white">Create a New Campaign</h2>
      <form onSubmit={handleCreateCampaign} className="space-y-4">
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-300">
            Funding Goal (ETH)
          </label>
          <input
            id="goal"
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0.001"
            step="0.001"
          />
        </div>
        <div>
          <label htmlFor="days" className="block text-sm font-medium text-gray-300">
            Duration (Days)
          </label>
          <input
            id="days"
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="1"
            step="1"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>
      {message && <p className="text-center text-gray-400 mt-4">{message}</p>}
    </div>
  );
}