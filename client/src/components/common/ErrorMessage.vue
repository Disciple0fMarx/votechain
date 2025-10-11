<template>
  <div v-if="message" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    {{ message }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorMessage',
  props: {
    message: {
      type: String,
      default: null,
    },
  },
})
</script>
