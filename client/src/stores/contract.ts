import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ethers } from 'ethers'
import type { Signer } from 'ethers'
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
    // unwrap possible shallowRef for signer and provider
    const unwrap = <T>(maybeRef: unknown): T | null => {
      if (!maybeRef) return null
      if (typeof maybeRef === 'object' && maybeRef !== null && 'value' in maybeRef) {
        const container = maybeRef as { value?: unknown }
        return (container.value as T) ?? null
      }
      return maybeRef as T
    }

    const resolvedSigner = unwrap<Signer>(wallet.signer)
    const resolvedProvider = unwrap<ethers.BrowserProvider | null>(wallet.provider)

    if (!wallet.isConnected || !resolvedSigner || !wallet.address) {
      console.error('Wallet not connected', {
        isConnected: wallet.isConnected,
        hasSigner: !!resolvedSigner,
        hasAddress: !!wallet.address
      })
      throw new Error('Wallet not connected')
    }

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS
    if (!contractAddress) {
      throw new Error('Contract address not set in environment')
    }

    try {
      // If we have a provider, verify the contract code exists at the address to avoid BAD_DATA decode errors
      if (resolvedProvider) {
        try {
          const code = await resolvedProvider.getCode(contractAddress)
          if (!code || code === '0x') {
            throw new Error(`No contract code at ${contractAddress}`)
          }
        } catch (err) {
          console.error('Failed to fetch contract code:', err)
          throw new Error('Contract not found on network')
        }
      }

      const contract = new ethers.Contract(
        contractAddress,
        VotingABI.abi,
        resolvedSigner
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
