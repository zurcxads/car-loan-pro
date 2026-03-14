import type { Metadata } from 'next';

const SITE_NAME = 'Auto Loan Pro';
const SITE_URL = 'https://autoloanpro.co';
const DEFAULT_OG_IMAGE = '/og-image.svg';

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
};

function getAbsoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

function resolveMetadata(options: PageMetadataOptions) {
  const title = options.title.includes(SITE_NAME)
    ? options.title
    : `${options.title} | ${SITE_NAME}`;
  const url = getAbsoluteUrl(options.path);
  const image = getAbsoluteUrl(DEFAULT_OG_IMAGE);

  return {
    title,
    description: options.description,
    url,
    image,
    noIndex: options.noIndex ?? false,
    type: options.type ?? 'website',
  };
}

export function createPageMetadata(options: PageMetadataOptions): Metadata {
  const meta = resolveMetadata(options);

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.url,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.url,
      siteName: SITE_NAME,
      type: meta.type,
      images: [
        {
          url: meta.image,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [meta.image],
    },
    robots: meta.noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

export function createHeadTags(options: PageMetadataOptions) {
  const meta = resolveMetadata(options);

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={meta.url} />
      {meta.noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:type" content={meta.type} />
      <meta property="og:image" content={meta.image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
    </>
  );
}
