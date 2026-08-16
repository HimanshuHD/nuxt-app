<script setup lang="ts">
import type { Toast } from '~/composables/useToast'

defineProps<{ toast: Toast }>()

defineEmits<{ close: [] }>()
</script>

<template>
  <article class="toast" :class="`toast--${toast.type}`" role="status" aria-live="polite">
    <div class="toast__content">
      <strong>{{ toast.type === 'success' ? 'Success' : 'Error' }}</strong>
      <p>{{ toast.message }}</p>
    </div>
    <button type="button" class="toast__close" aria-label="Dismiss notification" @click="$emit('close')">
      ×
    </button>
  </article>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  width: min(420px, calc(100vw - 2rem));
  padding: 1rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 14px;
  background: rgba(15, 23, 42, .96);
  box-shadow: 0 18px 45px rgba(0, 0, 0, .35);
}
.toast--success { border-color: rgba(74, 222, 128, .35); }
.toast--error { border-color: rgba(248, 113, 113, .35); }
.toast__content { flex: 1; }
.toast__content strong { display: block; margin-bottom: .2rem; }
.toast__content p { margin: 0; color: #cbd5e1; line-height: 1.45; }
.toast__close { border: 0; background: transparent; color: #cbd5e1; font-size: 1.35rem; line-height: 1; cursor: pointer; }
</style>
