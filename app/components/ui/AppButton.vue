<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary'
  type?: 'button' | 'submit'
}>(), {
  variant: 'primary',
  type: 'button',
})
</script>

<template>
  <button :class="['button', `button--${variant}`]" :type="type">
    <slot />
  </button>
</template>

<style scoped>
.button {
  display: inline-block;
  padding: 0.8rem 1.2rem;
  border: 0;
  border-radius: 999px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.button--primary {
  background: #fff;
  color: #0b1020;
}

.button--secondary {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: transparent;
  color: #f8fafc;
}
</style>
