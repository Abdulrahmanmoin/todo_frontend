/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  // Enable standalone output for Docker builds
  // This creates a minimal server.js with only required dependencies
  output: 'standalone',
};

module.exports = nextConfig;
