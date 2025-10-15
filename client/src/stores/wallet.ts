import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { ethers } from 'ethers'
import type { Web3Provider, Signer } from '@/types/web3'


export const useWalletStore = defineStore('wallet', () => {
  const address = ref<string | null>(null)
  const isConnected = ref<boolean>(false)
  const provider = shallowRef<Web3Provider | null>(null)
  const signer = shallowRef<Signer | null>(null)

  const connect = async (): Promise<void> => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }
      address.value = accounts[0]

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }],   // Chain ID 31337 in hex
        });
      } catch (switchError: any) {
        // If network doesn't exist, add it (EIP-3085)
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7a69',
                chainName: import.meta.env.VITE_NETWORK_NAME || 'Hardhat Local',
                rpcUrls: [import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545'],
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: null,
              },
            ],
          });
        } else {
          console.error('Failed to switch network:', switchError)
          throw new Error('Network switch failed')
        }
      }

      provider.value = new ethers.BrowserProvider(window.ethereum)
      // const accounts = await provider.value.send('eth_requestAccounts', [])
      // address.value = accounts[0]

      const network = await provider.value.getNetwork()
      if (network.chainId !== BigInt(31337)) {
        throw new Error('Connected to wrong network. Please select Hardhat Local (chainId: 31337)')
      }

      signer.value = await provider.value.getSigner()
      isConnected.value = true

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          isConnected.value = false
          address.value = null
        } else {
          address.value = accounts[0] || null
        }
      })
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
