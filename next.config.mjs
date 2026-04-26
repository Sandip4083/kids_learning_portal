/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
