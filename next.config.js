/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.mapbox.com', 'tile.openstreetmap.org'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
  output: 'standalone',
  experimental: {
    optimizeCss: true,
  },
  poweredByHeader: false
}

module.exports = nextConfig 