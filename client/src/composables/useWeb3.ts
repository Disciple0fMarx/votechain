import { ref, computed } from 'vue'
import { useWalletStore } from '@/stores/wallet'

export const useWeb3 = () => {
  const walletStore = useWalletStore()
  const isConnecting = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isConnected = computed(() => walletStore.isConnected)
  const address = computed(() => walletStore.address)

  const connectWallet = async () => {
    isConnecting.value = true
    error.value = null
    try {
      await walletStore.connect()
      console.log('Wallet connected:', walletStore.address)
    } catch (err) {
      console.error('Wallet connection failed:', err)
      error.value = err instanceof Error ? err.message : 'Failed to connect wallet'
    } finally {
      isConnecting.value = false
    }
  }

  const disconnectWallet = async () => {
    walletStore.disconnect()
    error.value = null
    console.log('Wallet disconnected')
  }

  return {
    isConnected,
    address,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet
  }
}
