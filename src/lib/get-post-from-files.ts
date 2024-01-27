import { Meta, PageOpts } from 'nextra/types'

export function transformMeta(pages: PageOpts[]): Meta[] {
  return pages.map(({ frontMatter, route }) => {
    return {
      ...frontMatter,
      link: route,
    }
  })
}
