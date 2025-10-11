import { computed, ref } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { useContractStore } from '@/stores/contract'

export const useContract = () => {
  const walletStore = useWalletStore()
  const contractStore = useContractStore()
  const isInitializing = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isOwner = computed(() => contractStore.isOwner)
  const votingActive = computed(() => contractStore.votingActive)
  const candidateCount = computed(() => contractStore.candidateCount)
  const contractAddress = computed(() => contractStore.contractInstance?.address)

  const initialize = async () => {
    if (!walletStore.isConnected) {
      error.value = 'Wallet not connected'
      return
    }
    isInitializing.value = true
    error.value = null
    try {
      await contractStore.initializeContract()
      console.log('Contract initialized:', contractStore.contractInstance?.address)
    } catch (err) {
      console.error('Contract initialization failed:', err)
      error.value = err instanceof Error ? err.message : 'Failed to initialize contract'
    } finally {
      isInitializing.value = false
    }
  }

  const updateStatus = async () => {
    try {
      await contractStore.updateStatus()
      console.log('Contract status updated')
    } catch (err) {
      console.error('Status update failed:', err)
      error.value = err instanceof Error ? err.message : 'Failed to update status'
    }
  }

  return {
    isOwner,
    votingActive,
    candidateCount,
    contractAddress,
    isInitializing,
    error,
    initialize,
    updateStatus
  }
}
