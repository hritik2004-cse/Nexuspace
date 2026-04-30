"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);

  // Sync with URL params optionally
  const workspaceParam = searchParams.get('workspace');

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!user) return;
      try {
        const res = await api.get('/workspaces');
        setWorkspaces(res.data);

        if (workspaceParam) {
          const urlMatch = res.data.find(w => w._id === workspaceParam);
          if (urlMatch) {
            setActiveWorkspace(urlMatch);
            localStorage.setItem('lastActiveWorkspaceId', urlMatch._id);
          } else {
            // Attempt to join the workspace if they clicked an invite link
            try {
              const joinRes = await api.post(`/workspaces/${workspaceParam}/join`);
              setWorkspaces([...res.data, joinRes.data]);
              setActiveWorkspace(joinRes.data);
              localStorage.setItem('lastActiveWorkspaceId', joinRes.data._id);
            } catch (err) {
              const fallback = res.data[0] || null;
              setActiveWorkspace(fallback);
              if (fallback) localStorage.setItem('lastActiveWorkspaceId', fallback._id);
            }
          }
        } else if (res.data.length > 0) {
          const lastId = localStorage.getItem('lastActiveWorkspaceId');
          const lastMatch = res.data.find(w => w._id === lastId);
          const selected = lastMatch || res.data[0];
          setActiveWorkspace(selected);
          localStorage.setItem('lastActiveWorkspaceId', selected._id);
        } else {
          setActiveWorkspace(null);
        }
      } catch (error) {
        setActiveWorkspace(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user, workspaceParam]);

  const createWorkspace = async (name) => {
    try {
      const res = await api.post('/workspaces', { name });
      setWorkspaces([...workspaces, res.data]);
      switchWorkspace(res.data._id);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create workspace');
    }
  };

  const switchWorkspace = (id) => {
    const match = workspaces.find(w => w._id === id);
    if (match) {
      setActiveWorkspace(match);
      localStorage.setItem('lastActiveWorkspaceId', match._id);
      router.push(`/workspace?workspace=${id}`);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loading,
        onlineCount,
        setOnlineCount,
        isMemberListOpen,
        setIsMemberListOpen,
        createWorkspace,
        switchWorkspace
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
