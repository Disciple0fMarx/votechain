import { ethers, type TransactionResponse } from 'ethers'

export interface Candidate {
  id: bigint
  totalRating: bigint
  voteCount: bigint
}

export interface VotingContractMethods {
  owner: () => Promise<string>
  votingActive: () => Promise<boolean>
  candidateCount: () => Promise<bigint>
  addCandidate: (_id: bigint) => Promise<TransactionResponse>
  startVoting: () => Promise<TransactionResponse>
  endVoting: () => Promise<TransactionResponse>
  submitVote: (_candidateId: bigint, _rating: bigint) => Promise<TransactionResponse>
  getAverageRating: (_candidateId: bigint) => Promise<bigint>
  candidates: (_id: bigint) => Promise<[bigint, bigint, bigint]> // For the candidates mapping
}

export interface ContractInstance {
  contract: ethers.Contract & VotingContractMethods
  address: string
}
