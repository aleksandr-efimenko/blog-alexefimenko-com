// @ts-nocheck
import { getPagesUnderRoute } from 'nextra/context'
import { BlogCardList } from '@/components/ui/blog-card-list'
import { TagList } from '@/components/ui/tag-list'
import { getArticles, getTags } from '@/lib/get-post-from-files'
import { Bleed } from 'nextra-theme-docs'

export function TagPage({ tag, title }: { tag?: string; title?: string }) {
  return (
    <Bleed>
      <h1 className='text-4xl font-bold mb-10'>{title}</h1>
      <TagList tags={getTags(getPagesUnderRoute('/posts'))} withCount asLink className='mb-20 mt-10' />
      <BlogCardList articles={getArticles(getPagesUnderRoute('/posts'), tag)} />
    </Bleed>
  )
}
