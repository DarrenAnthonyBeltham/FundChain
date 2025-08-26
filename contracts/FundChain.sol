// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "hardhat/console.sol"; 

contract FundChain {

    struct Campaign {
        address payable creator; 
        uint goal;               
        uint pledged;            
        uint32 deadline;         
        bool claimed;            
    }

    mapping(uint => Campaign) public campaigns;
    uint public campaignIdCounter;

    event CampaignCreated(uint id, address creator, uint goal, uint32 deadline);
    event Contribution(uint id, address contributor, uint amount);
    event FundsClaimed(uint id, address creator, uint amount);
    
    function createCampaign(uint _goalInEther, uint32 _durationInDays) public {
        require(_goalInEther > 0, "Goal must be greater than 0");
        require(_durationInDays > 0, "Duration must be greater than 0");

        uint32 deadline = uint32(block.timestamp + (_durationInDays * 1 days));

        campaigns[campaignIdCounter] = Campaign({
            creator: payable(msg.sender),
            goal: _goalInEther * 1 ether,
            pledged: 0,
            deadline: deadline,
            claimed: false
        });

        emit CampaignCreated(campaignIdCounter, msg.sender, _goalInEther * 1 ether, deadline);
        campaignIdCounter++;
    }

    function pledge(uint _id) public payable {
        Campaign storage campaign = campaigns[_id];
        
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Pledge amount must be greater than 0");

        campaign.pledged += msg.value;
        
        emit Contribution(_id, msg.sender, msg.value);
    }

    function claimFunds(uint _id) public {
        Campaign storage campaign = campaigns[_id];

        require(msg.sender == campaign.creator, "Only the creator can claim funds");
        require(!campaign.claimed, "Funds have already been claimed");
        require(block.timestamp >= campaign.deadline, "Campaign has not ended yet");
        require(campaign.pledged >= campaign.goal, "Campaign goal was not reached");

        campaign.claimed = true;
        (bool success, ) = campaign.creator.call{value: campaign.pledged}("");
        require(success, "Failed to send funds");

        emit FundsClaimed(_id, msg.sender, campaign.pledged);
    }
}