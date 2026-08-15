import type { SamplePost } from '~/types/sample'

export const useSamplePosts = () => {
  const posts = useState<SamplePost[]>('sample-posts', () => [])
  const errorMessage = useState<string | null>('sample-posts-error', () => null)
  const loaded = useState<boolean>('sample-posts-loaded', () => false)
  const loading = useState<boolean>('sample-posts-loading', () => false)

  const fetchPosts = async () => {
    if (loading.value) return

    loading.value = true
    errorMessage.value = null

    try {
      posts.value = await $fetch<SamplePost[]>('https://jsonplaceholder.typicode.com/posts', {
        query: { _limit: 6 },
      })
      loaded.value = true
    } catch {
      errorMessage.value = "We couldn't load the sample data."
    } finally {
      loading.value = false
    }
  }

  return {
    posts,
    loading,
    loaded,
    errorMessage,
    fetchPosts,
  }
}
