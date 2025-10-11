import { ref } from 'vue'
import { useContractStore } from '../stores/contract'
import { useWalletStore } from '../stores/wallet'

export const useVoting = () =>{
  const contractStore = useContractStore()
  const walletStore = useWalletStore()
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const startVoting = async () => {
    if (!contractStore.contractInstance?.contract) {
      error.value = 'Contract not initialized'
      return
    }
    if (!contractStore.isOwner) {
      error.value = 'Only the owner can start voting'
      return
    }

    isLoading.value = true
    error.value = null
    try {
      const tx = await contractStore.contractInstance.contract.startVoting()
      await tx.wait()
      await contractStore.updateStatus()
      console.log('Voting started')
    } catch (err) {
      console.error('Failed to start voting:', err)
      error.value = err instanceof Error ? err.message : 'Failed to start voting'
    } finally {
      isLoading.value = false
    }
  }

  const endVoting = async () => {
    if (!contractStore.contractInstance?.contract) {
      error.value = 'Contract not initialized'
      return
    }
    if (!contractStore.isOwner) {
      error.value = 'Only the owner can start voting'
      return
    }

    isLoading.value = true
    error.value = null
    try {
      const tx = await contractStore.contractInstance.contract.endVoting()
      await tx.wait()
      await contractStore.updateStatus()
      console.log('Voting ended')
    } catch (err) {
      console.error('Failed to end voting:', err)
      error.value = err instanceof Error ? err.message : 'Failed to end voting'
    } finally {
      isLoading.value = false
    }
  }

  const submitVote = async (candidateId: number, rating: number) => {
    if (!contractStore.contractInstance?.contract || !walletStore.address) {
      error.value = 'Contract or wallet not initialized'
      return
    }
    if (rating < 0 || rating > 100) {
      error.value = 'Rating must be between 0 and 100'
      return
    }
    isLoading.value = true
    error.value = null
    try {
      const tx = await contractStore.contractInstance.contract.submitVote(BigInt(candidateId), BigInt(rating))
      await tx.wait()
      console.log('Vote submitted:', { candidateId, rating })
    } catch (err) {
      console.error('Failed to submit vote:', err)
      error.value = err instanceof Error ? err.message : 'Failed to submit vote'
    } finally {
      isLoading.value = false
    }
  }

  const getAverageRating = async (candidateId: number): Promise<bigint | null> => {
    if (!contractStore.contractInstance?.contract) {
      error.value = 'Contract not initialized'
      return null
    }
    try {
      const average = await contractStore.contractInstance.contract.getAverageRating(BigInt(candidateId))
      console.log('Average rating fetched:', { candidateId, average: Number(average) })
      return average as bigint
    } catch (err) {
      console.error('Failed to fetch average rating:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch average rating'
      return null
    }
  }

  return {
    isLoading,
    error,
    startVoting,
    endVoting,
    submitVote,
    getAverageRating
  }
}
