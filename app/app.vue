<script setup lang="ts">
const { toasts, remove } = useToast()
</script>

<template>
  <NuxtPage />

  <div class="toast-stack" aria-label="Notifications">
    <TransitionGroup name="toast" tag="div">
      <AppToast
        v-for="toast in toasts"
        :key="toast.id"
        :toast="toast"
        @close="remove(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  z-index: 1000;
  right: 1rem;
  bottom: 1rem;
  display: grid;
  gap: .75rem;
  pointer-events: none;
}
.toast-stack :deep(.toast) { pointer-events: auto; }
.toast-enter-active, .toast-leave-active { transition: opacity .2s ease, transform .2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(.5rem); }
</style>
