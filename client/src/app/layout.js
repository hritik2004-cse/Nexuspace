import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

export const metadata = {
  metadataBase: new URL('https://project-nexuspace.vercel.app'),
  title: "Nexuspace | Real-time Collaboration & Workspace Management",
  description: "A professional real-time collaboration platform for teams, featuring workspaces, tasks, Kanban boards, and edge-synchronized chat.",
  alternates: {
    canonical: 'https://project-nexuspace.vercel.app',
    languages: {
      'en': 'https://project-nexuspace.vercel.app',
    },
  },
  openGraph: {
    title: "Nexuspace | Edge-Synchronized Workspaces",
    description: "The world's most agonizingly fast command center. Real-time tasks, instant messaging, and isolated scopes.",
    url: "https://project-nexuspace.vercel.app",
    siteName: "Nexuspace",
    images: [
      {
        url: "https://project-nexuspace.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nexuspace Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexuspace | Edge-Synchronized Workspaces",
    description: "The world's most agonizingly fast command center.",
    images: ["https://project-nexuspace.vercel.app/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: "#030014",
  width: "device-width",
  initialScale: 1,
};

import { Providers } from '@/components/Providers';

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://project-nexuspace.vercel.app/#organization",
        "name": "Nexuspace",
        "url": "https://project-nexuspace.vercel.app",
        "logo": "https://project-nexuspace.vercel.app/icon.png",
        "sameAs": [
          "https://twitter.com/nexuspace",
          "https://github.com/nexuspace"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://project-nexuspace.vercel.app/#website",
        "url": "https://project-nexuspace.vercel.app",
        "name": "Nexuspace",
        "publisher": {
          "@id": "https://project-nexuspace.vercel.app/#organization"
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": "Nexuspace",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "description": "Real-time collaboration platform with chat and task management"
      }
    ]
  };

  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${poppins.variable} font-sans antialiased bg-[#030014] text-white`} id="main-content">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-indigo-600 focus:text-white">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

