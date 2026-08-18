<script setup lang="ts">
const props = defineProps<{ condition: string; icon: string }>()

const type = computed(() => {
  const code = props.icon.slice(0, 2)
  if (code === '11') return 'storm'
  if (['09', '10'].includes(code)) return 'rain'
  if (code === '13') return 'snow'
  if (code === '50') return 'mist'
  if (code === '01') return 'clear'
  return 'clouds'
})
</script>

<template>
  <div class="weather-visual" :class="`weather-visual--${type}`" role="img" :aria-label="`Animated ${condition} weather illustration`">
    <svg viewBox="0 0 220 150" aria-hidden="true">
      <g v-if="type === 'clear'" class="visual-sun">
        <circle cx="110" cy="65" r="30" />
        <g class="visual-rays"><path d="M110 15v-12M110 127v12M60 65H48M172 65h-12M75 30 66 21M145 100l9 9M145 30l9-9M75 100l-9 9" /></g>
      </g>
      <g v-else-if="type === 'snow'" class="visual-snow">
        <path class="visual-cloud" d="M55 92c-18 0-30-11-30-27s12-28 29-28c7-20 25-31 46-31 25 0 43 15 48 36 22-2 39 10 39 28s-15 22-33 22Z" />
        <g class="snowflakes"><circle cx="70" cy="116" r="3"/><circle cx="110" cy="126" r="3"/><circle cx="150" cy="114" r="3"/></g>
      </g>
      <g v-else-if="type === 'storm'" class="visual-storm">
        <path class="visual-cloud" d="M55 88c-18 0-30-11-30-27s12-28 29-28c7-20 25-31 46-31 25 0 43 15 48 36 22-2 39 10 39 28s-15 22-33 22Z" />
        <path class="visual-bolt" d="M112 86 91 122h19l-8 24 28-39h-19Z" />
      </g>
      <g v-else-if="type === 'rain'" class="visual-rain">
        <path class="visual-cloud" d="M55 88c-18 0-30-11-30-27s12-28 29-28c7-20 25-31 46-31 25 0 43 15 48 36 22-2 39 10 39 28s-15 22-33 22Z" />
        <g class="rain-drops"><path d="M72 106l-7 16"/><path d="M108 106l-7 16"/><path d="M144 106l-7 16"/></g>
      </g>
      <g v-else class="visual-clouds">
        <circle class="visual-sun-small" cx="82" cy="53" r="25" />
        <path class="visual-cloud" d="M58 105c-17 0-29-10-29-25s12-26 28-26c6-18 22-27 40-27 22 0 38 13 43 32 19-2 34 9 34 25s-13 21-29 21Z" />
      </g>
      <g v-if="type === 'mist'" class="visual-mist"><path d="M35 66h150M25 88h170M45 110h130"/></g>
    </svg>
  </div>
</template>

<style scoped>
.weather-visual {
  width: min(250px, 42vw);
  min-width: 180px;
  filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.22));
}

.weather-visual svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.visual-cloud {
  fill: rgba(232, 245, 255, 0.92);
}

.visual-sun circle,
.visual-sun-small {
  fill: #ffd86b;
}

.visual-rays path {
  fill: none;
  stroke: #ffd86b;
  stroke-width: 5;
  stroke-linecap: round;
  animation: pulse 2.4s ease-in-out infinite;
}

.visual-sun {
  transform-origin: 110px 65px;
  animation: float 4s ease-in-out infinite;
}

.visual-clouds .visual-cloud,
.visual-rain .visual-cloud,
.visual-snow .visual-cloud,
.visual-storm .visual-cloud {
  animation: float 4s ease-in-out infinite;
}

.rain-drops path {
  fill: none;
  stroke: #7dd3fc;
  stroke-width: 6;
  stroke-linecap: round;
  animation: rain 1s linear infinite;
}

.rain-drops path:nth-child(2) {
  animation-delay: 0.18s;
}

.rain-drops path:nth-child(3) {
  animation-delay: 0.36s;
}

.snowflakes circle {
  fill: #e0f2fe;
  animation: snow 2s ease-in-out infinite;
}

.snowflakes circle:nth-child(2) {
  animation-delay: 0.35s;
}

.snowflakes circle:nth-child(3) {
  animation-delay: 0.7s;
}

.visual-bolt {
  fill: #facc15;
  animation: flash 2.8s infinite;
}

.visual-mist path {
  fill: none;
  stroke: #cbd5e1;
  stroke-width: 6;
  stroke-linecap: round;
  opacity: 0.65;
  animation: drift 3s ease-in-out infinite;
}

.visual-mist path:nth-child(2) {
  animation-delay: 0.3s;
}

.visual-mist path:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes float {
  50% {
    transform: translateY(-7px);
  }
}

@keyframes pulse {
  50% {
    opacity: 0.45;
  }
}

@keyframes rain {
  from {
    transform: translateY(-7px);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  to {
    transform: translateY(12px);
    opacity: 0;
  }
}

@keyframes snow {
  50% {
    transform: translateY(8px);
    opacity: 0.55;
  }
}

@keyframes flash {
  0%,
  48%,
  52%,
  100% {
    opacity: 0.85;
  }
  50% {
    opacity: 0.1;
  }
}

@keyframes drift {
  50% {
    transform: translateX(10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather-visual * {
    animation: none !important;
  }
}
</style>