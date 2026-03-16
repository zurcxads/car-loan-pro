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
    <div className="premium-page min-h-screen bg-white">
      {/* Hero */}
      <section className="animate-fade-in-up px-6 pb-6 pt-24 md:pb-10 md:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#0A2540] sm:text-4xl">
            Auto Loan Resources
          </h1>
          <p className="mt-3 text-lg font-light text-[#425466]">
            Everything you need to know about getting the best auto loan
          </p>
        </div>
      </section>

      {/* Article Grid */}
      <section className="px-6 pb-20 pt-6 md:pb-24 md:pt-10">
        <div className="mx-auto grid max-w-6xl grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/resources/${article.slug}`}
              className="feature-card-hover group block rounded-2xl border border-[#E3E8EE] bg-[#F6F9FC] p-6 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                  {article.category}
                </span>
                <span className="text-xs text-[#6B7C93]">{article.readTime}</span>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-[#0A2540] transition-colors duration-200 group-hover:text-blue-600">
                {article.title}
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-[#425466]">
                {article.description}
              </p>
              <div className="flex items-center text-sm font-medium text-blue-600">
                Read article
                <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
