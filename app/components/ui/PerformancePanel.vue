<script setup lang="ts">
import {
  getApiRequestMetrics,
  getDuplicateApiRequestCount,
  type ApiRequestMetric,
} from '~/utils/performance-monitor'

interface BundleReport {
  generatedAt: string
  javascript: {
    files: number
    bytes: number
    largestFile: { name: string; bytes: number } | null
  }
  css: {
    files: number
    bytes: number
  }
  assets: {
    files: number
    bytes: number
    largeFiles: number
  }
  source: {
    dynamicImports: number
    lazyComponents: number
  }
}

const emit = defineEmits<{
  close: []
}>()

const config = useRuntimeConfig()
const bundleReport = ref<BundleReport | null>(null)
const bundleLoading = ref(true)
const bundleError = ref(false)
const apiRequests = ref<ApiRequestMetric[]>([])
const duplicateRequests = ref(0)
const navigation = ref<PerformanceNavigationTiming | null>(null)
const appMountTime = ref<number | null>(null)
const loadedScripts = ref(0)
const loadedScriptBytes = ref(0)

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDuration(value: number | null) {
  return value === null ? '—' : `${value.toFixed(0)} ms`
}

function refreshRuntimeMetrics() {
  apiRequests.value = getApiRequestMetrics()
  duplicateRequests.value = getDuplicateApiRequestCount()

  const entries = performance.getEntriesByType('navigation')
  navigation.value = (entries[0] as PerformanceNavigationTiming | undefined) ?? null

  const mountMark = performance.getEntriesByName('app-mounted')[0]
  appMountTime.value = mountMark?.startTime ?? null

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const scripts = resources.filter((resource) => resource.name.includes('/_nuxt/') && resource.name.endsWith('.js'))
  loadedScripts.value = scripts.length
  loadedScriptBytes.value = scripts.reduce(
    (total, resource) => total + (resource.transferSize || resource.encodedBodySize || 0),
    0,
  )
}

async function loadBundleReport() {
  bundleLoading.value = true
  bundleError.value = false

  try {
    const baseURL = config.app.baseURL.endsWith('/')
      ? config.app.baseURL
      : `${config.app.baseURL}/`

    bundleReport.value = await $fetch<BundleReport>(`${baseURL}performance/bundle.json`, {
      cache: 'no-store',
    })
  } catch {
    bundleError.value = true
  } finally {
    bundleLoading.value = false
  }
}

onMounted(async () => {
  refreshRuntimeMetrics()
  await loadBundleReport()

  const interval = window.setInterval(refreshRuntimeMetrics, 1000)
  onBeforeUnmount(() => window.clearInterval(interval))
})
</script>

<template>
  <aside class="performance-panel" aria-label="Application performance metrics">
    <header class="performance-header">
      <div>
        <p class="performance-eyebrow">Developer diagnostics</p>
        <h2>Performance</h2>
      </div>

      <button
        class="performance-close"
        type="button"
        aria-label="Close performance panel"
        @click="emit('close')"
      >
        ×
      </button>
    </header>

    <div class="performance-body">
      <section class="metric-section">
        <div class="metric-heading">
          <h3>Bundle analysis</h3>
          <span class="metric-badge">build</span>
        </div>

        <div v-if="bundleLoading" class="metric-muted">Loading build report…</div>
        <div v-else-if="bundleError" class="metric-muted">
          Build report is unavailable. Run a production build to generate it.
        </div>
        <dl v-else-if="bundleReport" class="metric-grid">
          <div>
            <dt>JavaScript</dt>
            <dd>{{ formatBytes(bundleReport.javascript.bytes) }}</dd>
          </div>
          <div>
            <dt>JS files</dt>
            <dd>{{ bundleReport.javascript.files }}</dd>
          </div>
          <div>
            <dt>CSS</dt>
            <dd>{{ formatBytes(bundleReport.css.bytes) }}</dd>
          </div>
          <div>
            <dt>Assets</dt>
            <dd>{{ formatBytes(bundleReport.assets.bytes) }}</dd>
          </div>
        </dl>

        <p v-if="bundleReport?.javascript.largestFile" class="metric-detail">
          Largest JS: {{ bundleReport.javascript.largestFile.name }} ·
          {{ formatBytes(bundleReport.javascript.largestFile.bytes) }}
        </p>
      </section>

      <section class="metric-section">
        <div class="metric-heading">
          <h3>Lazy loading & imports</h3>
          <span class="metric-badge">static</span>
        </div>

        <dl v-if="bundleReport" class="metric-grid">
          <div>
            <dt>Lazy components</dt>
            <dd>{{ bundleReport.source.lazyComponents }}</dd>
          </div>
          <div>
            <dt>Dynamic imports</dt>
            <dd>{{ bundleReport.source.dynamicImports }}</dd>
          </div>
        </dl>
        <p class="metric-detail">
          Performance diagnostics are lazy-loaded and only downloaded when this panel is opened.
        </p>
      </section>

      <section class="metric-section">
        <div class="metric-heading">
          <h3>Asset optimization</h3>
          <span class="metric-badge">build</span>
        </div>

        <dl v-if="bundleReport" class="metric-grid">
          <div>
            <dt>Asset files</dt>
            <dd>{{ bundleReport.assets.files }}</dd>
          </div>
          <div>
            <dt>Large assets</dt>
            <dd>{{ bundleReport.assets.largeFiles }}</dd>
          </div>
        </dl>
        <p class="metric-detail">Large asset threshold: 250 KB.</p>
      </section>

      <section class="metric-section">
        <div class="metric-heading">
          <h3>Hydration & runtime</h3>
          <span class="metric-badge">live</span>
        </div>

        <dl class="metric-grid">
          <div>
            <dt>App mounted</dt>
            <dd>{{ formatDuration(appMountTime) }}</dd>
          </div>
          <div>
            <dt>DOM interactive</dt>
            <dd>{{ formatDuration(navigation?.domInteractive ?? null) }}</dd>
          </div>
          <div>
            <dt>Loaded JS</dt>
            <dd>{{ loadedScripts }} files</dd>
          </div>
          <div>
            <dt>JS transfer</dt>
            <dd>{{ formatBytes(loadedScriptBytes) }}</dd>
          </div>
        </dl>
      </section>

      <section class="metric-section">
        <div class="metric-heading">
          <h3>API request review</h3>
          <span class="metric-badge">live</span>
        </div>

        <div class="request-summary">
          <strong>{{ apiRequests.length }}</strong>
          <span>unique request signatures</span>
          <strong :class="{ 'metric-warning': duplicateRequests > 0 }">
            {{ duplicateRequests }}
          </strong>
          <span>duplicates within 2s</span>
        </div>

        <ul v-if="apiRequests.length" class="request-list">
          <li v-for="request in apiRequests" :key="request.key">
            <span>{{ request.url }}</span>
            <span>{{ request.count }}×</span>
          </li>
        </ul>
        <p v-else class="metric-muted">No tracked API requests yet.</p>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.performance-panel {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 2147483646;
  width: min(430px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: 1rem;
  background: rgb(12 18 30 / 0.96);
  color: #f7f8fb;
  box-shadow: 0 24px 70px rgb(0 0 0 / 0.4);
  backdrop-filter: blur(18px);
}

.performance-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
}

.performance-eyebrow {
  margin: 0 0 0.15rem;
  color: #8ea3c2;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.performance-header h2 {
  margin: 0;
  font-size: 1.05rem;
}

.performance-close {
  width: 2rem;
  height: 2rem;
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: 0.5rem;
  background: transparent;
  color: inherit;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.performance-body {
  max-height: calc(100vh - 5.5rem);
  overflow-y: auto;
  padding: 0.75rem;
}

.metric-section {
  padding: 0.9rem;
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 0.8rem;
  background: rgb(255 255 255 / 0.035);
}

.metric-section + .metric-section {
  margin-top: 0.65rem;
}

.metric-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.7rem;
}

.metric-heading h3 {
  margin: 0;
  font-size: 0.86rem;
}

.metric-badge {
  padding: 0.18rem 0.45rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.08);
  color: #aebbd0;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  margin: 0;
}

.metric-grid div {
  padding: 0.6rem;
  border-radius: 0.55rem;
  background: rgb(0 0 0 / 0.14);
}

.metric-grid dt {
  color: #8ea3c2;
  font-size: 0.68rem;
}

.metric-grid dd {
  margin: 0.18rem 0 0;
  font-size: 0.9rem;
  font-weight: 700;
}

.metric-detail,
.metric-muted {
  margin: 0.65rem 0 0;
  color: #9cabc0;
  font-size: 0.7rem;
  line-height: 1.5;
}

.request-summary {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: 0.5rem;
  row-gap: 0.15rem;
}

.request-summary strong {
  font-size: 1rem;
}

.request-summary span {
  color: #9cabc0;
  font-size: 0.7rem;
}

.metric-warning {
  color: #ffca7a;
}

.request-list {
  display: grid;
  gap: 0.35rem;
  margin: 0.7rem 0 0;
  padding: 0;
  list-style: none;
}

.request-list li {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.45rem 0.55rem;
  border-radius: 0.45rem;
  background: rgb(0 0 0 / 0.14);
  color: #aebbd0;
  font-size: 0.68rem;
}

.request-list li span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .performance-panel {
    top: 0.5rem;
    right: 0.5rem;
    width: calc(100vw - 1rem);
    max-height: calc(100vh - 1rem);
  }
}
</style>
