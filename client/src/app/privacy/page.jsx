import MainLayout from "@/components/landing/MainLayout";

export const metadata = {
  title: "Privacy Policy | Nexuspace",
};

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="pt-32 pb-24 px-6 sm:px-12 lg:px-24 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-12">Last Updated: April 2026</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
            <p>
              When you use Nexuspace, we collect the following types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-400">
              <li><strong>Account Information:</strong> Name, email address, password, and profile image.</li>
              <li><strong>Usage Data:</strong> We collect data regarding your interaction with our services, including log data, device information, and IP addresses for security purposes.</li>
              <li><strong>Communication Data:</strong> Messages, files, and content shared within workspaces and channels.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
            <p>
              We use the collected data for various purposes, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-400">
              <li>To provide and maintain the Nexuspace service.</li>
              <li>To notify you about changes to our service or security alerts.</li>
              <li>To provide customer support.</li>
              <li>To monitor the usage of our service and detect, prevent, and address technical issues.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3. Data Security</h2>
            <p>
              The security of your data is important to us. We implement state-of-the-art security measures including encryption in transit and at rest, secure HTTP cookies for session management, and CSRF protection. However, remember that no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. Third-Party Services</h2>
            <p>
              We may employ third-party companies to facilitate our service (e.g., Google OAuth, Cloudinary). These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Your Rights</h2>
            <p>
              You have the right to access, update, or delete the information we have on you. If you are unable to perform these actions yourself within your account settings, please contact us to assist you.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
