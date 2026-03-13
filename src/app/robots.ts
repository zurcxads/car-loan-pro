import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autoloanpro.co';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/lender/',
          '/dashboard/',
          '/api/',
          '/dev/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
