<template>
  <div class="min-h-screen bg-gray-100 py-6">
    <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 class="text-3xl font-bold mb-6 text-center">Voter Dashboard</h1>
      <VotingStatus />
      <CandidateList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useContract } from '@/composables/useContract'
import { useCandidates } from '@/composables/useCandidates'
import VotingStatus from '@/components/voting/VotingStatus.vue'
import CandidateList from '@/components/voting/CandidateList.vue'

const contract = useContract()
const candidates = useCandidates()

onMounted(async () => {
  await contract.initialize()
  await candidates.fetchCandidates()
})
</script>
