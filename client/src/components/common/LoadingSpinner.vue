<template>
  <div v-if="isLoading" class="flex justify-center items-center">
    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoadingSpinner',
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
})
</script>
