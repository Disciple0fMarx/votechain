import { ethers } from 'ethers'

export interface Candidate {
  id: bigint
  totalRating: bigint
  voteCount: bigint
}

export interface VotingContractMethods {
  owner: () => Promise<string>
  votingActive: () => Promise<boolean>
  candidateCount: () => Promise<bigint>
  addCandidate: (_id: bigint) => Promise<void>
  startVoting: () => Promise<void>
  endVoting: () => Promise<void>
  submitVote: (_candidateId: bigint, _rating: bigint) => Promise<void>
  getAverageRating: (_candidateId: bigint) => Promise<bigint>
  candidates: (_id: bigint) => Promise<[bigint, bigint, bigint]> // For the candidates mapping
}

export interface ContractInstance {
  contract: ethers.Contract & VotingContractMethods
  address: string
}
