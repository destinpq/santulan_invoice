/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC
  swcMinify: false,
  // Disable tracing to fix permission issues
  experimental: {
    trace: false,
  },
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/access',
        destination: '/developer',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig; 