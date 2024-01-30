import nextra from 'nextra'

/**
 * @type {import('next').NextConfig}
 */

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  siteUrl: process.env.SITE_URL || 'https://blog.alexefimenko.com',
  generateRobotsTxt: true, // (optional)
})

export default withNextra()
