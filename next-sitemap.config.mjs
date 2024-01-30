const SITE_URL = process.env.SITE_URL || 'https://blog.alexefimenko.com'

const NEXT_SSG_FILES = ['/*.json$', '/*_buildManifest.js$', '/*_middlewareManifest.js$', '/*_ssgManifest.js$', '/*.js$']

const exclude = ['/tag/*']

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: NEXT_SSG_FILES,
      },
    ],
  },
}

export default config
