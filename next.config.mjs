/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress NextAuth experimental warnings
  experimental: {},
  // Allow image domains if needed
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
