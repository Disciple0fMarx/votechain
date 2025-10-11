<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Candidates</h2>
    <LoadingSpinner :is-loading="isLoading" />
    <ErrorMessage :message="error || 'Unknown error'" />
    <div v-if="candidates.length === 0 && !isLoading" class="text-gray-500">
      No candidates available.
    </div>
    <CandidateCard
      v-for="candidate in candidates"
      :key="Number(candidate.id)"
      :candidate="candidate"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useCandidates } from '@/composables/useCandidates'
import CandidateCard from './CandidateCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

export default defineComponent({
  name: 'CandidateList',
  components: { CandidateCard, LoadingSpinner, ErrorMessage },
  setup() {
    const candidates = useCandidates()
    const { candidates: candidateList, loading: isLoading, error, fetchCandidates } = candidates

    onMounted(fetchCandidates)

    return { candidates: candidateList, isLoading, error }
  },
})
</script>
