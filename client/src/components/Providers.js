"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export function Providers({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
