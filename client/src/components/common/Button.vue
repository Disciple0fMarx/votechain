<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'AppButton',
  props: {
    variant: {
      type: String as () => 'primary' | 'secondary',
      default: 'primary',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  setup(props) {
    const buttonClasses = computed(() => [
      'px-4 py-2 rounded font-semibold text-white',
      props.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90',
      props.variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500',
    ])

    return { buttonClasses }
  },
})
</script>
