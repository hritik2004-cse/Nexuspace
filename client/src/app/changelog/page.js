import ChangelogClient from "./ChangelogClient";

export const metadata = {
  title: "Changelog | Nexuspace",
  description: "A history of updates, improvements, and fixes to the Nexuspace engine.",
  openGraph: {
    title: "Changelog | Nexuspace",
    description: "A history of updates, improvements, and fixes to the Nexuspace engine.",
  }
};

export default function ChangelogPage() {
  return <ChangelogClient />;
}
