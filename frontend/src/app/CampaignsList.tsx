'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FUND_CHAIN_CONTRACT_ADDRESS } from '@/lib/constants';
import FundChainJson from '@/contracts/FundChain.json';

interface Campaign {
  id: number;
  creator: string;
  goal: bigint;
  pledged: bigint;
  deadline: number;
  claimed: boolean;
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isExpired = new Date(campaign.deadline * 1000) < new Date();
  const goalReached = campaign.pledged >= campaign.goal;

  async function handlePledge() {
    if (!pledgeAmount || parseFloat(pledgeAmount) <= 0) {
      setMessage('Please enter a valid amount.');
      return;
    }
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    setIsLoading(true);
    setMessage('Processing pledge...');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        FUND_CHAIN_CONTRACT_ADDRESS,
        FundChainJson.abi,
        signer
      );

      const value = ethers.parseEther(pledgeAmount);
      const transaction = await contract.pledge(campaign.id, { value });
      
      await transaction.wait();
      
      setMessage('Pledge successful!');
      setPledgeAmount('');
    } catch (error) {
      console.error(error);
      setMessage('Pledge failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold text-white">Campaign #{campaign.id}</h3>
        <p className="text-sm text-gray-400 mt-1">Creator: {campaign.creator.substring(0, 6)}...{campaign.creator.substring(campaign.creator.length - 4)}</p>
        <div className="my-4">
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(Number((campaign.pledged * 100n) / campaign.goal), 100)}%` }}></div>
          </div>
          <p className="text-green-400 mt-2">{ethers.formatEther(campaign.pledged)} ETH pledged</p>
          <p className="text-gray-300">Goal: {ethers.formatEther(campaign.goal)} ETH</p>
        </div>
        <p className="text-gray-400">Deadline: {new Date(campaign.deadline * 1000).toLocaleString()}</p>
      </div>
      <div className="mt-6">
        {isExpired ? (
            <p className={`text-center font-bold ${goalReached ? 'text-green-500' : 'text-red-500'}`}>
                {goalReached ? 'Campaign Succeeded' : 'Campaign Failed'}
            </p>
        ) : (
          <div className="space-y-2">
            <input
              type="number"
              value={pledgeAmount}
              onChange={(e) => setPledgeAmount(e.target.value)}
              placeholder="0.1 ETH"
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
            <button
              onClick={handlePledge}
              disabled={isLoading}
              className="w-full py-2 px-4 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-500"
            >
              {isLoading ? 'Pledging...' : 'Pledge ETH'}
            </button>
          </div>
        )}
        {message && <p className="text-center text-sm text-gray-400 mt-2">{message}</p>}
      </div>
    </div>
  );
}

export default function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    async function fetchCampaigns() {
      if (typeof window.ethereum === 'undefined') return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        FUND_CHAIN_CONTRACT_ADDRESS,
        FundChainJson.abi,
        provider
      );

      try {
        const count = await contract.campaignIdCounter();
        const fetchedCampaigns: Campaign[] = [];
        for (let i = 0; i < Number(count); i++) {
          const c = await contract.campaigns(i);
          fetchedCampaigns.push({
            id: i,
            creator: c.creator,
            goal: c.goal,
            pledged: c.pledged,
            deadline: Number(c.deadline),
            claimed: c.claimed,
          });
        }
        setCampaigns(fetchedCampaigns.reverse());
      } catch (error) {
        console.error("Could not fetch campaigns:", error);
      }
    }

    fetchCampaigns();
  }, []);

  if (campaigns.length === 0) {
    return <p className="text-center text-gray-400">No campaigns yet. Be the first to create one!</p>;
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}