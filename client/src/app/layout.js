import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nexuspace",
  description: "A professional real-time collaboration platform for teams, featuring workspaces, tasks, and chat.",
};

import { Providers } from '@/components/Providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
