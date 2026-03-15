import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Footer from '@/components/shared/Footer';
import { articles } from '@/data/articles';
import { createPageMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Auto Loan Resources',
  description: 'Explore guides on prequalification, credit scores, dealer financing, and other topics that help borrowers make smarter auto loan decisions.',
  path: '/resources',
});

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-6 py-20 pt-28">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Auto Loan Resources
          </h1>
          <p className="mt-4 text-lg text-gray-600 font-light">
            Everything you need to know about getting the best auto loan
          </p>
        </div>
      </section>

      {/* Article Grid */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article, index) => (
            <Link
              key={article.slug}
              href={`/resources/${article.slug}`}
              className={`group block rounded-2xl border border-gray-200 bg-gray-50 p-6 transition-all duration-200 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                articles.length % 2 === 1 && index === articles.length - 1 ? 'md:col-span-2' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-medium">
                  {article.category}
                </span>
                <span className="text-xs text-gray-500">{article.readTime}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {article.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {article.description}
              </p>
              <div className="flex items-center text-sm text-blue-600 font-medium">
                Read article
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
