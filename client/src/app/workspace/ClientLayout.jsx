"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { SocketProvider } from '@/context/SocketContext';
import { WorkspaceProvider } from '@/context/WorkspaceContext';

export default function ClientLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SocketProvider>
      <WorkspaceProvider>
        <div className="flex h-screen w-full bg-slate-900 text-slate-100 overflow-hidden font-sans relative">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className="flex flex-col flex-1 h-full min-w-0">
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
            <main id="main-content" className="flex-1 overflow-hidden relative">
              {children}
            </main>
          </div>
        </div>
      </WorkspaceProvider>
    </SocketProvider>
  );
}
