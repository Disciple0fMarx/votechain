// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Voting is Ownable, ReentrancyGuard {
	struct Candidate {
		uint256 id;
		uint256 totalRating;
		uint256 voteCount;
	}

	mapping(uint256 => Candidate) public candidates;
	mapping(address => mapping(uint256 => bool)) public hasVoted;
	uint256 public candidateCount;
	bool public votingActive;

	constructor() Ownable(msg.sender) {
		votingActive = false;
	}

	function addCandidate(uint256 _id) external onlyOwner {
		require(candidates[_id].id == 0, "Candidate exists");
		candidates[_id] = Candidate(_id, 0, 0);
		candidateCount++;
	}

	function startVoting() external onlyOwner {
		votingActive = true;
	}

	function endVoting() external onlyOwner {
		votingActive = false;
	}

	function submitVote(uint256 _candidateId, uint256 _rating) external nonReentrant {
		require(votingActive, "Voting not active");
		require(_rating <= 100, "Rating must be 0-100");
		require(!hasVoted[msg.sender][_candidateId], "Already voted");
		require(candidates[_candidateId].id != 0, "Invalid candidate");
		
		candidates[_candidateId].totalRating += _rating;
		candidates[_candidateId].voteCount++;
		hasVoted[msg.sender][_candidateId] = true;
	}

	function getAverageRating(uint256 _candidateId) external view returns (uint256) {
		Candidate memory candidate = candidates[_candidateId];
		require(candidate.voteCount > 0, "No votes");
		return candidate.totalRating / candidate.voteCount;
	}
}

