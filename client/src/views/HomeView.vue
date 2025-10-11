<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
      <h1 class="text-3xl font-bold mb-6 text-center">VoteChain</h1>
      <p class="mb-4 text-gray-600 text-center">Connect your wallet to participate in percentage-based voting.</p>
      <AppButton
        v-if="!web3.isConnected.value"
        variant="primary"
        :disabled="web3.isConnecting.value"
        @click="web3.connectWallet"
        class="w-full"
      >
        Connect Wallet
      </AppButton>
      <div v-else class="text-center">
        <p class="text-green-600 mb-4">Connected: {{ web3.address }}</p>
        <router-link to="/voter" class="block mb-2">
          <AppButton variant="secondary" class="w-full">Voter Dashboard</AppButton>
        </router-link>
        <router-link v-if="contract.isOwner" to="/admin" class="block">
          <AppButton variant="secondary" class="w-full">Admin Dashboard</AppButton>
        </router-link>
      </div>
      <LoadingSpinner :is-loading="web3.isConnecting.value" />
      <ErrorMessage :message="web3.error.value || 'Unknown error'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useWeb3 } from '@/composables/useWeb3'
import { useContract } from '@/composables/useContract'
import AppButton from '@/components/common/Button.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const web3 = useWeb3()
const contract = useContract()

onMounted(async () => {
  if (web3.isConnected) {
    await contract.initialize()
  }
})
</script>
