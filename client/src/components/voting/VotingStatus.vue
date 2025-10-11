<template>
  <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
    <p>Voting Status: {{ votingActive ? 'Active' : 'Inactive' }}</p>
    <p>Candidate Count: {{ Number(candidateCount) }}</p>
    <ErrorMessage :message="error || 'Unknown error'" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useContract } from '@/composables/useContract'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

export default defineComponent({
  name: 'VotingStatus',
  components: { ErrorMessage },
  setup() {
    const { votingActive, candidateCount, error } = useContract()
    return { votingActive, candidateCount, error }
  },
})
</script>
