/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://mygale-art-and-services.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  sitemapSize: 5000,
  exclude: ['/api/*', '/admin/*'],
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }
  },
}
