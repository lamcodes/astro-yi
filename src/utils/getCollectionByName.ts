import { getCollection } from 'astro:content'

import { shouldIncludeEntry } from './content-entry'

export const getCollectionByName = async (name: 'blog' | 'feed') => {
  const posts = await getCollection(name)

  if (posts.length > 0) {
    return posts.filter(({ data }) => shouldIncludeEntry(data, import.meta.env.PROD))
  } else {
    return []
  }
}
