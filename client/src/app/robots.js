export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/workspace', '/dashboard'],
    },
    sitemap: 'https://project-nexuspace.vercel.app/sitemap.xml',
  }
}

