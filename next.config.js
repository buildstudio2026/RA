/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/RA',
  trailingSlash: true,
};

module.exports = nextConfig;
