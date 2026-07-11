const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://026newsblog.vercel.app';

export function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: '026Newsblog',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Breaking news, trending stories, and insights from top authors worldwide.',
    foundingDate: '2025',
    address: { '@type': 'PostalAddress', addressCountry: 'KE' },
    sameAs: ['https://twitter.com/026newsblog', 'https://facebook.com/026newsblog'],
    publisher: {
      '@type': 'Organization',
      name: '026Newsblog',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
