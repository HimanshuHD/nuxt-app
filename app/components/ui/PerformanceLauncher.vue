<script setup lang="ts">
const isOpen = ref(false)

const PerformancePanel = defineAsyncComponent(
  () => import('./PerformancePanel.vue'),
)

onMounted(() => {
  performance.mark('app-mounted')
})
</script>

<template>
  <div>
    <button
      v-if="!isOpen"
      class="performance-trigger"
      type="button"
      aria-label="Open performance diagnostics"
      @click="isOpen = true"
    >
      Performance
    </button>

    <component
      :is="PerformancePanel"
      v-if="isOpen"
      @close="isOpen = false"
    />
  </div>
</template>

<style scoped>
.performance-trigger {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 2147483645;
  padding: 0.55rem 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.15);
  border-radius: 0.6rem;
  background: rgb(12 18 30 / 0.9);
  color: #f7f8fb;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.2);
  backdrop-filter: blur(12px);
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 640px) {
  .performance-trigger {
    right: 0.75rem;
    bottom: 0.75rem;
  }
}
</style>
