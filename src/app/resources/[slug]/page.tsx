import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles, getArticleBySlug, getRelatedArticles } from '@/data/articles';
import DOMPurify from 'isomorphic-dompurify';
import { createPageMetadata } from '@/lib/metadata';

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    ...createPageMetadata({
      title: article.title,
      description: article.description,
      path: `/resources/${article.slug}`,
      type: 'article',
    }),
    keywords: `auto loan, car loan, ${article.category.toLowerCase()}, financing, interest rates`,
    authors: [{ name: article.author || 'Auto Loan Pro' }],
    openGraph: {
      ...createPageMetadata({
        title: article.title,
        description: article.description,
        path: `/resources/${article.slug}`,
        type: 'article',
      }).openGraph,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author || 'Auto Loan Pro'],
    },
  };
}

export default function ArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(params.slug, 3);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Organization',
      name: article.author || 'Auto Loan Pro',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Auto Loan Pro',
      logo: {
        '@type': 'ImageObject',
        url: 'https://autoloanpro.com/logo.png',
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://autoloanpro.com/resources/${article.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="min-h-screen">
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
            <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
              <Link href="/how-it-works" className="hover:text-gray-900 transition-colors duration-200">How It Works</Link>
              <Link href="/calculator" className="hover:text-gray-900 transition-colors duration-200">Calculator</Link>
              <Link href="/resources" className="text-gray-900 font-medium">Resources</Link>
              <Link href="/login" className="hover:text-gray-900 transition-colors duration-200">Sign In</Link>
            </div>
            <Link href="/apply" className="hidden md:inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Apply Now
            </Link>
          </div>
        </nav>

        {/* Article + Sidebar */}
        <div className="pt-28 pb-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Main Article */}
              <article className="flex-1 max-w-3xl">
                <Link href="/resources" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 mb-8">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Resources
                </Link>

                {/* Header */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-medium">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400">{article.readTime}</span>
                    {article.updatedAt && (
                      <span className="text-xs text-gray-400">Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-3">
                    {article.title}
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {article.description}
                  </p>
                </div>

                {/* Content */}
                <div className="prose-article">
                  {article.content.split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;

                    if (trimmed.startsWith('### ')) {
                      return (
                        <h3 key={i} className="text-lg font-semibold text-gray-900 mt-8 mb-3">
                          {trimmed.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (trimmed.startsWith('## ')) {
                      return (
                        <h2 key={i} className="text-xl font-bold text-gray-900 mt-10 mb-4">
                          {trimmed.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (trimmed.startsWith('- **')) {
                      const parts = trimmed.replace('- **', '').split('**');
                      return (
                        <div key={i} className="flex gap-2 ml-1 mb-2">
                          <span className="text-blue-600 mt-0.5">&bull;</span>
                          <p className="text-gray-600 leading-relaxed text-[15px]">
                            <strong className="text-gray-900">{parts[0]}</strong>
                            {parts.slice(1).join('')}
                          </p>
                        </div>
                      );
                    }
                    if (trimmed.startsWith('- ')) {
                      return (
                        <div key={i} className="flex gap-2 ml-1 mb-2">
                          <span className="text-blue-600 mt-0.5">&bull;</span>
                          <p className="text-gray-600 leading-relaxed text-[15px]">{trimmed.replace('- ', '')}</p>
                        </div>
                      );
                    }
                    if (/^\d+\.\s/.test(trimmed)) {
                      const num = trimmed.match(/^(\d+)\.\s/)?.[1];
                      const text = trimmed.replace(/^\d+\.\s/, '');
                      return (
                        <div key={i} className="flex gap-3 ml-1 mb-2">
                          <span className="text-blue-600 font-semibold text-sm mt-0.5">{num}.</span>
                          <p className="text-gray-600 leading-relaxed text-[15px]">
                            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-900">$1</strong>')) }} />
                          </p>
                        </div>
                      );
                    }

                    const html = trimmed
                      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-900">$1</strong>')
                      .replace(/&ldquo;/g, '\u201C')
                      .replace(/&rdquo;/g, '\u201D')
                      .replace(/&mdash;/g, '\u2014');

                    return (
                      <p key={i} className="text-gray-600 leading-relaxed text-[15px] mb-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
                    );
                  })}
                </div>

                {/* CTA */}
                <div className="mt-16 p-8 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to see your rate?</h2>
                  <p className="text-sm text-gray-500 mb-6">Check your personalized offers in under 5 minutes with no impact to your credit score.</p>
                  <Link
                    href="/apply"
                    className="inline-flex px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors duration-200"
                  >
                    Apply Now
                  </Link>
                </div>
              </article>

              {/* Related Articles Sidebar */}
              {relatedArticles.length > 0 && (
                <aside className="lg:w-80 shrink-0">
                  <div className="sticky top-24">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Related Articles</h3>
                    <div className="space-y-4">
                      {relatedArticles.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/resources/${related.slug}`}
                          className="block p-4 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-sm transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-medium">
                              {related.category}
                            </span>
                            <span className="text-[10px] text-gray-400">{related.readTime}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {related.title}
                          </h4>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                            {related.description}
                          </p>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-6 p-6 rounded-xl bg-blue-50 border border-blue-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Get Your Free Rate Quote</h4>
                      <p className="text-xs text-gray-600 mb-4">
                        See personalized offers from multiple lenders in minutes. No credit impact.
                      </p>
                      <Link
                        href="/apply"
                        className="block w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium text-center rounded-lg transition-colors duration-200"
                      >
                        Check My Rate
                      </Link>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-12 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto text-center text-xs text-gray-400">
            Auto Loan Pro is not a lender. Offers are subject to credit approval. NMLS #000000
          </div>
        </footer>
      </div>
    </>
  );
}
