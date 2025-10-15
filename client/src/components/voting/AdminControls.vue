<template>
  <div class="border rounded p-4 bg-gray-50">
    <h2 class="text-2xl font-bold mb-4">Admin Controls</h2>
    <LoadingSpinner :is-loading="isLoading" />
    <ErrorMessage v-if="error" :message="error" />
    <div class="space-y-4">
      <div>
        <AppButton
          variant="primary"
          :disabled="isLoading || votingActive"
          @click="startVoting"
        >
          Start Voting
        </AppButton>
        <AppButton
          variant="primary"
          :disabled="isLoading || !votingActive"
          @click="endVoting"
        >
          End Voting
        </AppButton>
      </div>
      <div>
        <input
          v-model.number="newCandidateId"
          type="number"
          min="1"
          placeholder="Enter candidate ID"
          class="border rounded px-2 py-1 mr-2"
        />
        <AppButton
          variant="primary"
          :disabled="isLoading || !newCandidateId"
          @click="addCandidate"
        >
          Add Candidate
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useVoting } from '@/composables/useVoting'
import { useCandidates } from '@/composables/useCandidates'
import { useContract } from '@/composables/useContract'
import AppButton from '@/components/common/Button.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

export default defineComponent({
  name: 'AdminControls',
  components: { AppButton, LoadingSpinner, ErrorMessage },
  setup() {
    const voting = useVoting()
    const candidates = useCandidates()
    const contract = useContract()
    const newCandidateId = ref<number | null>(null)
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)

    async function startVoting() {
      isLoading.value = true
      await voting.startVoting()
      isLoading.value = voting.isLoading.value
      error.value = voting.error.value
    }

    async function endVoting() {
      isLoading.value = true
      await voting.endVoting()
      isLoading.value = voting.isLoading.value
      error.value = voting.error.value
    }

    async function addCandidate() {
      if (newCandidateId.value === null) return
      isLoading.value = true
      await candidates.addCandidate(newCandidateId.value)
      isLoading.value = candidates.loading.value
      error.value = candidates.error.value
      newCandidateId.value = null
    }

    return {
      votingActive: contract.votingActive,
      isLoading,
      error,
      newCandidateId,
      startVoting,
      endVoting,
      addCandidate,
    }
  },
})
</script>
