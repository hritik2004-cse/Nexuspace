"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user && mounted) {
      // If the user isn't logged in and they are trying to access a protected route (like /workspace)
      if (pathname.startsWith('/workspace')) {
        router.push('/login');
      }
    }
  }, [user, loading, router, pathname, mounted]);

  // Optionally show a loading spinner while checking auth status
  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If the user isn't authenticated, don't render the protected content
  if (!user && pathname.startsWith('/workspace')) {
    return null;
  }

  return children;
}
