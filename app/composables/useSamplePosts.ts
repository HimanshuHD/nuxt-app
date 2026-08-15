import type { SamplePost } from '~/types/sample'

export const useSamplePosts = async () => {
  return await useFetch<SamplePost[]>('https://jsonplaceholder.typicode.com/posts', {
    query: { _limit: 6 },
    key: 'sample-posts',
  })
}
