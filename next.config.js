/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC
  swcMinify: false,
  // Disable tracing to fix permission issues
  experimental: {
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
  // Environment variables that should be available to the browser
  // Note: We are NOT exposing the API key to the client
  env: {
    APP_ENV: process.env.NODE_ENV,
    // Always set SKIP_API_CALLS_DURING_BUILD to false regardless of environment
    SKIP_API_CALLS_DURING_BUILD: "false",
  },
  // Don't fail the build when external APIs can't be reached
  onDemandEntries: {
    // Keep in memory for longer
    maxInactiveAge: 60 * 60 * 1000,
    // Number of pages that should be kept simultaneously
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig; 