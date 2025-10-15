<template>
  <div class="border rounded p-4 mb-4 bg-white shadow">
    <h3 class="text-lg font-semibold">Candidate #{{ candidate.id }}</h3>
    <p>Total Rating: {{ Number(candidate.totalRating) }}</p>
    <p>Vote Count: {{ Number(candidate.voteCount) }}</p>
    <p v-if="averageRating !== null">Average Rating: {{ Number(averageRating) }}</p>
    <div v-if="votingActive" class="mt-2">
      <input
        v-model.number="rating"
        type="number"
        min="0"
        max="100"
        placeholder="Enter rating (0-100)"
        class="border rounded px-2 py-1 mr-2"
      />
      <AppButton variant="primary" :disabled="isLoading || rating < 0 || rating > 100" @click="submitVote">
        Submit Vote
      </AppButton>
    </div>
    <LoadingSpinner :is-loading="isLoading" />
    <ErrorMessage v-if="error" :message="error" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useVoting } from '@/composables/useVoting'
import { useContract } from '@/composables/useContract'
import AppButton from '@/components/common/Button.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import type { Candidate } from '@/types/contract'

export default defineComponent({
  name: 'CandidateCard',
  components: { AppButton, LoadingSpinner, ErrorMessage },
  props: {
    candidate: {
      type: Object as () => Candidate,
      required: true,
    },
  },
  setup(props) {
    const voting = useVoting()
    const contract = useContract()
    const rating = ref<number>(0)
    const averageRating = ref<bigint | null>(null)
    const { isLoading, error } = voting
    const { votingActive } = contract

    async function fetchVotingData() {
      const avg = await voting.getAverageRating(Number(props.candidate.id))
      averageRating.value = avg
    }

    async function submitVote() {
      await voting.submitVote(Number(props.candidate.id), rating.value)
      await fetchVotingData()
    }

    onMounted(fetchVotingData)

    return { rating, averageRating, isLoading, error, votingActive, submitVote }
  },
})
</script>
