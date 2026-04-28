import MainLayout from "@/components/landing/MainLayout";

export const metadata = {
  title: "Terms of Service | Nexuspace",
  description: "Read the Nexuspace Terms of Service.",
  alternates: {
    canonical: "https://project-nexuspace.vercel.app/terms"
  },
  openGraph: {
    title: "Terms of Service | Nexuspace",
    description: "Read the Nexuspace Terms of Service.",
    url: "https://project-nexuspace.vercel.app/terms",
  }
};

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="pt-32 pb-24 px-6 sm:px-12 lg:px-24 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-12">Last Updated: April 2026</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Nexuspace platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you must discontinue use of the Service immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. Nexuspace cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-400">
              <li>You must be at least 13 years old to use this Service.</li>
              <li>You must provide accurate and complete registration information.</li>
              <li>You must not use the Service for any illegal or unauthorized purpose.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3. Content Ownership</h2>
            <p>
              We claim no intellectual property rights over the material you provide to the Service. Your profile and materials uploaded remain yours. However, by setting your pages to be viewed publicly, you agree to allow others to view your content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. API Usage and Rate Limiting</h2>
            <p>
              Customers may access their Nexuspace account data via an API. Any use of the API is bound by these Terms of Service plus the following specific rules:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-400">
              <li>Abuse or excessively frequent requests to Nexuspace via the API may result in the temporary or permanent suspension of your account's access to the API.</li>
              <li>Nexuspace, in its sole discretion, will determine abuse or excessive usage of the API.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Termination</h2>
            <p>
              Nexuspace, in its sole discretion, has the right to suspend or terminate your account and refuse any and all current or future use of the Service for any reason at any time. Such termination will result in the deactivation or deletion of your Account or your access to your Account.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

