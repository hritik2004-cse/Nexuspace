import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Optimization Settings */
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  reactCompiler: true,
  
  // Top-level key for Turbopack as per the warning
  turbopack: {
    root: path.join(__dirname, '..'),
  },

  experimental: {
    // Experimental key for package imports if not yet stable in this version
    optimizePackageImports: ['react-icons/si', 'react-icons/fa', 'lucide-react'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
  },
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
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          }
        ],
      },
    ];
  },
};

export default nextConfig;
