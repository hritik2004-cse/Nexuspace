export const metadata = {
  title: "Terms of Service | Nexuspace",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-slate-300 text-sm leading-7">
          By using Nexuspace, you agree to use the platform responsibly and in
          compliance with applicable laws. You are responsible for maintaining
          the confidentiality of your account access.
        </p>
        <p className="text-slate-300 text-sm leading-7">
          Nexuspace may update features and service behavior over time.
          Continued use of the platform indicates acceptance of those updates.
        </p>
        <p className="text-slate-400 text-xs">
          If you do not agree with these terms, discontinue use of the service.
        </p>
      </div>
    </main>
  );
}
