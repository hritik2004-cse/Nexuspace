export const metadata = {
  title: "Privacy Policy | Nexuspace",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-slate-300 text-sm leading-7">
          Nexuspace collects only the data needed to provide collaboration features,
          such as account profile details, workspace content, and activity required to
          run the service.
        </p>
        <p className="text-slate-300 text-sm leading-7">
          We use authentication data to verify identity and keep your account secure.
          We do not sell your personal information. Data may be stored with trusted
          infrastructure providers used by the platform.
        </p>
        <p className="text-slate-400 text-xs">
          For requests regarding your data, contact the Nexuspace support team.
        </p>
      </div>
    </main>
  );
}