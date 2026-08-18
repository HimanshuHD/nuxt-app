import type { LocationSearchResult } from '~/components/weather/LocationSearch.vue'

export function useLocationSearch() {
  const searchQuery = ref('')
  const searchResults = ref<LocationSearchResult[]>([])
  const searchLoading = ref(false)
  const searchError = ref('')
  const requestId = ref(0)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function search() {
    if (timer) clearTimeout(timer)
    const query = searchQuery.value.trim()
    searchError.value = ''
    searchResults.value = []
    if (query.length < 2) { searchLoading.value = false; return }
    searchLoading.value = true
    const currentRequestId = ++requestId.value
    timer = setTimeout(async () => {
      try {
        const results = await $fetch<LocationSearchResult[]>('/api/geocode', { query: { q: query } })
        if (currentRequestId !== requestId.value || query !== searchQuery.value.trim()) return
        searchResults.value = results
        if (!results.length) searchError.value = 'No matching locations found. Try a city or country name.'
      } catch (error: unknown) {
        if (currentRequestId !== requestId.value) return
        searchError.value = getSearchErrorMessage(error)
      } finally { if (currentRequestId === requestId.value) searchLoading.value = false }
    }, 300)
  }
  function clearResults() { if (timer) clearTimeout(timer); requestId.value += 1; searchResults.value = []; searchError.value = ''; searchLoading.value = false }
  function clear() { clearResults(); searchQuery.value = '' }
  function setQuery(value: string) { searchQuery.value = value }
  function setQueryFromLocation(location: LocationSearchResult) { setQuery([location.name, location.state, location.country].filter(Boolean).join(', ')) }
  onUnmounted(() => { if (timer) clearTimeout(timer) })
  return { searchQuery, searchResults: readonly(searchResults), searchLoading: readonly(searchLoading), searchError: readonly(searchError), search, clear, clearResults, setQuery, setQueryFromLocation }
}

function getSearchErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'statusMessage' in error) { const statusMessage = error.statusMessage; if (typeof statusMessage === 'string') return statusMessage }
  return 'Unable to search for locations. Please try again.'
}
