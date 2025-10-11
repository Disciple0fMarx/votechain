import { ethers } from 'ethers'

export interface Candidate {
  id: bigint
  totalRating: bigint
  voteCount: bigint
}

export interface ContractInstance {
  contract: ethers.Contract
  address: string
}
