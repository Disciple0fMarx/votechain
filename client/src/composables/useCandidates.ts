import { ref } from 'vue'
import { useContractStore } from '@/stores/contract'
import type { Candidate } from '@/types/contract'

export const useCandidates = () => {
  const contractStore = useContractStore()
  const candidates = ref<Candidate[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchCandidates = async () => {
    if (!contractStore.contractInstance?.contract) {
      error.value = 'Contract not initialized'
      return
    }
    loading.value = true
    error.value = null

    try {
      const count = Number(contractStore.candidateCount)
      const fetchedCandidates: Candidate[] = []
      for (let id = 1; id <= count; id++) {
        const candidateData: [bigint, bigint, bigint] = await contractStore.contractInstance.contract.candidates(BigInt(id))
        if (candidateData[0] !== BigInt(0)) {  // Check if candidate exists
          fetchedCandidates.push({
            id: candidateData[0],
            totalRating: candidateData[1],
            voteCount: candidateData[2]
          })
        }
      }
      candidates.value = fetchedCandidates
      console.log('Candidates fetched:', candidates.value)
    } catch (err) {
      console.error('Failed to fetch candidates:', error)
      error.value = err instanceof Error ? err.message : 'Failed to fetch candidates'
    } finally {
      loading.value = false
    }
  }

  const addCandidate = async (id: number) => {
    if (!contractStore.contractInstance?.contract) {
      error.value = 'Contract not initialized'
      return
    }
    if (!contractStore.isOwner) {
      error.value = 'Only the contract owner can add candidates'
      return
    }
    loading.value = true
    error.value = null

    try {
      const tx = await contractStore.contractInstance.contract.addCandidate(BigInt(id))
      await tx.wait()
      await fetchCandidates()  // Refresh the candidate list
      await contractStore.updateStatus()
      console.log(`Candidate added: ${id}`)
    } catch (err) {
      console.error('Failed to add candidate:', err)
      error.value = err instanceof Error ? err.message : 'Failed to add candidate'
    } finally {
      loading.value = false
    }
  }

  return {
    candidates,
    loading,
    error,
    fetchCandidates,
    addCandidate
  }
}
