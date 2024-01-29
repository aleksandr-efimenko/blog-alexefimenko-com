const config = require('@theguild/tailwind-config')

module.exports = {
  ...config,
  content: [...config.content, './{pages,ui}/**/*.{tsx,mdx}'],
}
