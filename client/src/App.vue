<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-blue-600 text-white py-4 shadow">
      <div class="max-w-4xl mx-auto px-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">VoteChain</h1>
        <nav v-if="web3.isConnected">
          <router-link to="/" class="px-2 hover:underline">Home</router-link>
          <router-link to="/voter" class="px-2 hover:underline">Voter</router-link>
          <router-link v-if="contract.isOwner" to="/admin" class="px-2 hover:underline">Admin</router-link>
          <AppButton variant="secondary" @click="web3.disconnectWallet">Disconnect</AppButton>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-4">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <p>&copy; VoteChain by <a href="https://github.com/Disciple0fMarx" target="blank">Dhya El Bahri</a> - 2025</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useWeb3 } from '@/composables/useWeb3'
import { useContract } from '@/composables/useContract'
import AppButton from '@/components/common/Button.vue'

const web3 = useWeb3()
const contract = useContract()
</script>
