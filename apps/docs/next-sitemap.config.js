/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://dokugen.samueltuoyo.com', 
  generateRobotsTxt: true, 
  generateIndexSitemap: false,
  exclude: ['/api/*'], 
  changefreq: 'daily', 
  priority: 0.8, 
  sitemapSize: 5000, 
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/*'] }
    ]
  }
};

export default config;