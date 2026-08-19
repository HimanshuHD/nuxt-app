<script setup lang="ts">
import AppToast from '~/components/ui/AppToast.vue'

const { toasts, remove } = useToast()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <ClientOnly>
    <Teleport to="#teleports">
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
    </Teleport>
  </ClientOnly>
</template>

<style>
.toast-stack {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 2147483647;
  display: grid;
  gap: 0.75rem;
  width: min(420px, calc(100vw - 2rem));
  pointer-events: none;
}

.toast-stack > div {
  display: grid;
  gap: 0.75rem;
}

.toast-stack .toast {
  pointer-events: auto;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}

@media (max-width: 640px) {
  .toast-stack {
    right: 1rem;
    bottom: 1rem;
    width: calc(100vw - 2rem);
  }
}
</style>
