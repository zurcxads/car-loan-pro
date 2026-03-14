import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { articles } from '@/data/articles';

export const metadata: Metadata = {
  title: 'Auto Loan Resources | Auto Loan Pro',
  description: 'Everything you need to know about getting the best auto loan. Guides on prequalification, credit scores, dealer financing, and more.',
  openGraph: {
    title: 'Auto Loan Resources | Auto Loan Pro',
    description: 'Everything you need to know about getting the best auto loan. Guides on prequalification, credit scores, dealer financing, and more.',
    type: 'website',
  },
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900 dark:text-zinc-100">Auto Loan Pro</Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500 dark:text-zinc-400">
            <Link href="/how-it-works" className="hover:text-gray-900 dark:hover:text-zinc-100 transition-colors duration-200">How It Works</Link>
            <Link href="/calculator" className="hover:text-gray-900 dark:hover:text-zinc-100 transition-colors duration-200">Calculator</Link>
            <Link href="/resources" className="text-gray-900 dark:text-zinc-100 font-medium">Resources</Link>
            <Link href="/login" className="hover:text-gray-900 dark:hover:text-zinc-100 transition-colors duration-200">Sign In</Link>
          </div>
          <Link href="/apply" className="hidden md:inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">
            Apply Now
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            Auto Loan Resources
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-zinc-400 font-light">
            Everything you need to know about getting the best auto loan
          </p>
        </div>
      </section>

      {/* Article Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/resources/${article.slug}`}
              className="group block p-6 rounded-2xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-600 text-xs font-medium">
                  {article.category}
                </span>
                <span className="text-xs text-gray-400 dark:text-zinc-500">{article.readTime}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {article.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-4">
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

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-zinc-800 py-12 px-6 bg-gray-50 dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto text-center text-xs text-gray-400 dark:text-zinc-500">
          Auto Loan Pro is not a lender. Offers are subject to credit approval. NMLS #000000
        </div>
      </footer>
    </div>
  );
}
