/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
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

export default nextConfig; 