import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ethers } from 'ethers'
import type { Web3Provider, Signer } from '@/types/web3'


export const useWalletStore = defineStore('wallet', () => {
  const address = ref<string | null>(null)
  const isConnected = ref<boolean>(false)
  const provider = ref<Web3Provider>(null)
  const signer = ref<Signer>(null)

  const connect = async (): Promise<void> => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    try {
      provider.value = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.value.send('eth_requestAccounts', [])
      address.value = accounts[0]
      signer.value = await provider.value.getSigner()
      isConnected.value = true
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw new Error('Wallet connection failed')
    }
  }

  const disconnect = (): void => {
    address.value = null
    isConnected.value = false
    provider.value = null
    signer.value = null
  }

  return {
    address,
    isConnected,
    provider,
    signer,
    connect,
    disconnect
  }
})
