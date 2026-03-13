"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Resources', href: '/resources' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-md py-3'
            : 'bg-white/95 backdrop-blur-xl py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              Auto Loan Pro
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative ${
                    isActive(link.href)
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/apply"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all duration-200 active:scale-[0.98]"
              >
                Get Pre-Approved
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Link
                    href="/"
                    className="text-xl font-bold text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Auto Loan Pro
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                          isActive(link.href)
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </nav>

                {/* Footer with CTA */}
                <div className="p-6 border-t border-gray-200">
                  <Link
                    href="/apply"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-center text-base font-semibold rounded-lg transition-colors"
                  >
                    Get Pre-Approved
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
