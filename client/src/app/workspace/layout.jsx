import ClientLayout from './ClientLayout';

export const metadata = {
  title: "Workspace | Nexuspace",
  description: "Manage your real-time tasks, instant messaging, and isolated scopes.",
  alternates: {
    canonical: "https://project-nexuspace.vercel.app/workspace"
  }
};

export default function WorkspaceLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>;
}

