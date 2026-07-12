export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'NewsMediaOrganization',
          name: '026Newsblog',
          url: 'https://026newsblog.com',
          logo: 'https://026newsblog.com/logo.png',
          description: "East Africa's independent news platform.",
          foundingDate: '2025',
          address: { '@type': 'PostalAddress', addressCountry: 'KE' },
        }),
      }}
    />
  );
}
