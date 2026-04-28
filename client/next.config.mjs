/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://nexuspace-backend.onrender.com/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'https://nexuspace-backend.onrender.com/socket.io/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          }
        ],
      },
    ];
  },
};

export default nextConfig;
