import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ethers } from 'ethers'
import type { ContractInstance, VotingContractMethods } from '@/types/contract'
import { useWalletStore } from './wallet'
import VotingABI from '@/../../artifacts/contracts/Voting.sol/Voting.json'


export const useContractStore = defineStore('contract', () => {
  const contractInstance = ref<ContractInstance | null>(null)
  const isOwner = ref<boolean>(false)
  const votingActive = ref<boolean>(false)
  const candidateCount = ref<bigint>(BigInt(0))

  const initializeContract = async () => {
    const wallet = useWalletStore()
    if (!wallet.isConnected || !wallet.signer || !wallet.address) {
      console.error('Wallet not connected', {
        isConnected: wallet.isConnected,
        hasSigner: !!wallet.signer,
        hasAddress: !!wallet.address
      })
      throw new Error('Wallet not connected')
    }

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS
    if (!contractAddress) {
      throw new Error('Contract address not set in environment')
    }

    try {
      const contract = new ethers.Contract(
        contractAddress,
        VotingABI.abi,
        wallet.signer
      ) as ethers.Contract & VotingContractMethods

      contractInstance.value = {
        contract,
        address: contractAddress
      }

      const owner = await contract.owner()
      isOwner.value = owner.toLowerCase() === wallet.address?.toLowerCase()

      votingActive.value = await contract.votingActive()
      candidateCount.value = await contract.candidateCount()
    } catch (error) {
      console.error('Failed to initialize contract:', error)
      throw new Error('Contract initialization failed')
    }
  }

  const updateStatus = async () => {
    if (!contractInstance.value) return

    try {
      const contract = contractInstance.value.contract as ethers.Contract & VotingContractMethods
      votingActive.value = await contract.votingActive()
      candidateCount.value = await contract.candidateCount()
    } catch (error) {
      console.error('Failed to update contract status:', error)
    }
  }

  return {
    contractInstance,
    isOwner,
    votingActive,
    candidateCount,
    initializeContract,
    updateStatus
  }
})
