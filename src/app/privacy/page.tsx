'use client'

import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Breadcrumbs />
      <div className="max-w-3xl mx-auto px-6 py-16">

        <h1 className="font-display text-4xl md:text-5xl mb-2">PRIVACY &amp; DATA USE POLICY</h1>
        <p className="text-[var(--color-muted)] text-sm mb-12">
          Last updated: March 14, 2026 &middot; Effective: March 14, 2026
        </p>

        <div className="space-y-8 text-[var(--color-text)] leading-relaxed">
          <section>
            <h2 className="font-display text-2xl mb-3">1. WHO WE ARE</h2>
            <p>
              Message is operated by Dev/D (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;), accessible at votercontact.io/message.
              This policy explains how we collect, use, store, and protect your personal information when you
              visit our website or use our services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">2. INFORMATION WE COLLECT</h2>

            <h3 className="font-display text-lg mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Email address</strong> &mdash; when you sign up for updates, submit questions via the &ldquo;Ask Me&rdquo; form, or create an account.</li>
              <li><strong>Name</strong> &mdash; if you create an account.</li>
              <li><strong>Questions and messages</strong> &mdash; content you submit through our inquiry forms.</li>
            </ul>

            <h3 className="font-display text-lg mt-4 mb-2">2.2 Information Stored Automatically</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Theme preference</strong> &mdash; your light/dark mode selection, stored in your browser&rsquo;s local storage.</li>
              <li><strong>Cookie consent preference</strong> &mdash; your acceptance or rejection of this policy, stored in your browser&rsquo;s local storage.</li>
            </ul>

            <h3 className="font-display text-lg mt-4 mb-2">2.3 Information We Do Not Collect</h3>
            <p>
              We do not use tracking cookies, analytics cookies, or third-party advertising cookies.
              We do not use browser fingerprinting. We do not sell or share your data with third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">3. HOW WE USE YOUR INFORMATION</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To respond to your inquiries and questions.</li>
              <li>To send you product updates you&rsquo;ve opted into.</li>
              <li>To provide and maintain our services.</li>
              <li>To comply with legal obligations.</li>
            </ul>
            <p className="mt-3">
              <strong>Legal basis (GDPR):</strong> We process your data based on your explicit consent (Article 6(1)(a))
              and our legitimate interest in providing and improving our services (Article 6(1)(f)).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">4. DATA STORAGE &amp; SECURITY</h2>
            <p>
              During our current phase, all user-submitted data (email captures, questions) is stored
              exclusively in your browser&rsquo;s local storage on your device. This data does not leave your
              device and is not transmitted to our servers.
            </p>
            <p className="mt-3">
              When backend services are activated, data will be stored in encrypted databases with
              industry-standard security measures including encryption at rest and in transit.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">5. YOUR RIGHTS</h2>

            <h3 className="font-display text-lg mt-4 mb-2">5.1 Under GDPR (EU/EEA Residents)</h3>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Access</strong> &mdash; request a copy of your personal data.</li>
              <li><strong>Rectification</strong> &mdash; request correction of inaccurate data.</li>
              <li><strong>Erasure</strong> &mdash; request deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
              <li><strong>Restrict processing</strong> &mdash; request we limit how we use your data.</li>
              <li><strong>Data portability</strong> &mdash; receive your data in a machine-readable format.</li>
              <li><strong>Object</strong> &mdash; object to processing based on legitimate interests.</li>
              <li><strong>Withdraw consent</strong> &mdash; at any time, without affecting the lawfulness of prior processing.</li>
            </ul>

            <h3 className="font-display text-lg mt-4 mb-2">5.2 Under CCPA/CPRA (California Residents)</h3>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Know</strong> &mdash; what personal information we collect and how it is used.</li>
              <li><strong>Delete</strong> &mdash; request deletion of your personal information.</li>
              <li><strong>Opt-out</strong> &mdash; of the sale or sharing of personal information. <em>We do not sell your data.</em></li>
              <li><strong>Non-discrimination</strong> &mdash; we will not discriminate against you for exercising your rights.</li>
              <li><strong>Correct</strong> &mdash; inaccurate personal information.</li>
              <li><strong>Limit use of sensitive personal information.</strong></li>
            </ul>

            <h3 className="font-display text-lg mt-4 mb-2">5.3 Exercising Your Rights</h3>
            <p>
              Since data is currently stored in your browser&rsquo;s local storage, you can delete it at any time
              by clearing your browser data. For any other requests, contact us at the address below.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">6. COOKIES &amp; LOCAL STORAGE</h2>
            <p>
              We do not use cookies. We use browser local storage exclusively for:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Theme preference</strong> (<code>message-theme</code>) &mdash; remembers your dark/light mode choice.</li>
              <li><strong>Consent preference</strong> (<code>message-consent</code>) &mdash; remembers your privacy policy acceptance.</li>
              <li><strong>Email captures</strong> (<code>message-email-captures</code>) &mdash; stores email signups locally on your device.</li>
              <li><strong>Questions</strong> (<code>message-questions</code>) &mdash; stores submitted questions locally on your device.</li>
            </ul>
            <p className="mt-3">
              You can clear this data at any time through your browser settings. No data is transmitted
              to external servers during the current phase.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">7. THIRD-PARTY SERVICES</h2>
            <p>
              When fully operational, Message may integrate with:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase</strong> &mdash; authentication and database services.</li>
              <li><strong>Twilio</strong> &mdash; SMS messaging services.</li>
              <li><strong>Stripe</strong> &mdash; payment processing (hosted version only).</li>
              <li><strong>Anthropic</strong> &mdash; AI-powered features.</li>
            </ul>
            <p className="mt-3">
              Each third-party service has its own privacy policy. We will update this policy before
              activating any third-party integrations.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">8. DATA RETENTION</h2>
            <p>
              Locally stored data persists until you clear your browser storage. Once backend services
              are active, we will retain your data only as long as necessary to provide our services or
              as required by law. You may request deletion at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">9. CHILDREN&rsquo;S PRIVACY</h2>
            <p>
              Our services are not directed to individuals under 16. We do not knowingly collect personal
              information from children. If you believe we have collected data from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">10. CHANGES TO THIS POLICY</h2>
            <p>
              We may update this policy from time to time. Material changes will be communicated via a
              prominent notice on our website. Continued use after changes constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">11. CONTACT US</h2>
            <p>
              For privacy-related questions, data requests, or to exercise your rights:
            </p>
            <p className="mt-2">
              <strong>Dev/D</strong><br />
              Email: privacy@dkdev.io<br />
              Website: votercontact.io/message
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">12. SMS TESTING CONSENT</h2>
            <p>
              For information about our SMS testing consent procedures and Twilio compliance,
              please see our{' '}
              <Link href="/privacy/testing" className="text-[var(--color-accent)] underline hover:opacity-80 transition">
                SMS Testing Consent Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">13. DO NOT TRACK</h2>
            <p>
              We honor Do Not Track browser signals. Since we do not use tracking technologies,
              your experience is the same regardless of this setting.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--color-muted)]/20 text-center">
          <p className="text-[var(--color-muted)] text-xs">
            Website by Dev/D.
          </p>
        </div>
      </div>
    </div>
  )
}
