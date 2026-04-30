"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import ProtectedRoute from '@/components/ProtectedRoute';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Providers({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </TooltipProvider>
          <ToastContainer 
            theme="dark" 
            position="bottom-right"
            autoClose={3000}
            limit={1}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            toastClassName={() => 
              "relative flex p-3 min-h-12 rounded-2xl justify-between overflow-hidden cursor-pointer bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl mb-4 md:mb-0 mx-4 md:mx-0 w-auto md:w-80 text-sm font-sans"
            }
            bodyClassName={() => "flex items-center p-0"}
          />
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
