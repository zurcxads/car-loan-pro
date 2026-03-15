"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/resources?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickLinks = [
    { label: 'Home', href: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Apply Now', href: '/apply', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Contact', href: '/contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Resources', href: '/resources', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50   flex items-center justify-center px-6">
      <div className="text-center max-w-2xl w-full animate-fade-in-up">
        {/* 404 Illustration */}
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <div className="text-9xl font-bold text-gray-200  select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-24 h-24 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900  mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600  mb-8 max-w-md mx-auto">
            Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help or resources..."
                className="w-full px-4 py-3 pr-12 bg-white  border border-gray-300  rounded-xl text-sm text-gray-900  placeholder-gray-400  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Quick Links */}
          <div className="mb-8">
            <p className="text-sm text-gray-500  mb-4">Quick Links</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white   border border-gray-200  hover:shadow-sm transition-all active:scale-[0.98]"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                  <span className="text-xs font-medium text-gray-700 ">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-12 pt-8 border-t border-gray-200  max-w-md mx-auto">
            <p className="text-sm text-gray-500 ">
              Need help? Contact us at{' '}
              <a href="mailto:hello@autoloanpro.co" className="text-blue-600 hover:text-blue-700 font-medium">
                hello@autoloanpro.co
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
