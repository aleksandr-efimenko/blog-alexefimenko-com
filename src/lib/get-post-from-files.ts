import { PageOpts } from 'nextra/types'
import { Meta } from './meta'

export function getArticles(pages: PageOpts[], tag?: string): Meta[] {
  return (
    pages
      .map(({ frontMatter, route }) => {
        return {
          title: frontMatter.title,
          tags: frontMatter.tags,
          date: frontMatter.date,
          description: frontMatter.description,
          image: frontMatter.image,
          published: frontMatter.published,
          link: route,
        }
      })
      .filter((meta) => {
        if (tag) {
          return meta.tags?.includes(tag)
        }
        return true
      })
      // filter out unpublished articles
      .filter((meta) => meta.published)
      .sort((left, right) => {
        const date1 = new Date(left.date)
        const date2 = new Date(right.date)
        if (date1 > date2) {
          return -1
        }
        if (date1 < date2) {
          return 1
        }
        return 0
      })
  )
}

export function getTags(pages: PageOpts[]): (string | [string, number])[] {
  const tags = pages
    .filter(({ frontMatter }) => frontMatter.published && frontMatter.tags)
    .reduce((acc, { frontMatter }) => {
      if (frontMatter.tags) {
        frontMatter.tags.forEach((tag: string | number) => {
          if (acc[tag]) {
            acc[tag]++
          } else {
            acc[tag] = 1
          }
        })
      }
      return acc
    }, {} as Record<string, number>)

  return Object.entries(tags).sort((left, right) => {
    return right[1] - left[1]
  })
}
