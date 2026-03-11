import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles, getArticleBySlug } from '@/data/articles';

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: `${article.title} | Auto Loan Pro`,
    description: article.description,
    openGraph: {
      title: `${article.title} | Auto Loan Pro`,
      description: article.description,
      type: 'article',
    },
  };
}

export default function ArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
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

      {/* Article */}
      <article className="pt-28 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
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
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
              {article.title}
            </h1>
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
                      <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-900">$1</strong>') }} />
                    </p>
                  </div>
                );
              }

              // Regular paragraph with bold support
              const html = trimmed
                .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-900">$1</strong>')
                .replace(/&ldquo;/g, '\u201C')
                .replace(/&rdquo;/g, '\u201D')
                .replace(/&mdash;/g, '\u2014');

              return (
                <p key={i} className="text-gray-600 leading-relaxed text-[15px] mb-4" dangerouslySetInnerHTML={{ __html: html }} />
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
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center text-xs text-gray-400">
          Auto Loan Pro is not a lender. Offers are subject to credit approval. NMLS #000000
        </div>
      </footer>
    </div>
  );
}
