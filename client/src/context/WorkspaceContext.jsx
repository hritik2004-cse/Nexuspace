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

  // Sync with URL params optionally
  const workspaceParam = searchParams.get('workspace');

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!user) return;
      try {
        const res = await api.get('/workspaces');
        setWorkspaces(res.data);

        if (res.data.length > 0) {
          // If a workspace ID is in the URL and valid, select it.
          const urlMatch = res.data.find(w => w._id === workspaceParam);
          if (urlMatch) {
            setActiveWorkspace(urlMatch);
          } else {
            // Default to the first joined workspace
            setActiveWorkspace(res.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
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
      router.push(`/workspace?workspace=${id}`);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loading,
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
