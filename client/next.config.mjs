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
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            // 'same-origin-allow-popups' lets Google OAuth popups (opened by YOUR page)
            // communicate back via window.closed / postMessage, while still isolating
            // your page from unrelated cross-origin openers.
            // 'same-origin' (the Vercel default) breaks this entirely.
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
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
};

export default nextConfig;
