'use client'

import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function TestingConsent() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Breadcrumbs />
      <div className="max-w-3xl mx-auto px-6 py-16">

        <h1 className="font-display text-4xl md:text-5xl mb-2">SMS TESTING CONSENT POLICY</h1>
        <p className="text-[var(--color-muted)] text-sm mb-12">
          Last updated: March 14, 2026 &middot; Effective: March 14, 2026
        </p>

        <div className="space-y-8 text-[var(--color-text)] leading-relaxed">
          <section>
            <h2 className="font-display text-2xl mb-3">1. PURPOSE</h2>
            <p>
              This page documents the consent and opt-in procedures for all test messaging
              conducted during the development and quality assurance of the Message platform
              by Dev/D. This policy exists to ensure full compliance with Twilio&rsquo;s
              Acceptable Use Policy, Messaging Policy, and all applicable regulations including
              the Telephone Consumer Protection Act (TCPA), FCC rules, and CTIA guidelines.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">2. TEST MESSAGE OPT-IN CONFIRMATION</h2>
            <p>
              All individuals who receive test SMS messages from the Message platform have
              provided prior express written consent to receive such messages. Specifically:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                All test recipients are <strong>internal team members, developers, or designated
                testers</strong> employed by or contracted with Dev/D.
              </li>
              <li>
                Each test recipient has <strong>voluntarily provided their phone number</strong> for
                the explicit purpose of receiving test SMS messages during development and QA.
              </li>
              <li>
                Each test recipient has provided <strong>prior express written consent</strong> acknowledging
                they will receive test messages, the approximate frequency of messages, and their
                right to opt out at any time.
              </li>
              <li>
                <strong>No unsolicited messages</strong> are sent to any individual who has not
                explicitly opted in to testing.
              </li>
              <li>
                <strong>No purchased, rented, or third-party phone lists</strong> are used for testing.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">3. OPT-IN PROCESS</h2>
            <p>Test recipients opt in through the following process:</p>
            <ol className="list-decimal pl-6 space-y-2 mt-3">
              <li>
                The test recipient is identified as an internal team member or designated tester.
              </li>
              <li>
                The test recipient provides their mobile phone number directly to the development team.
              </li>
              <li>
                The test recipient is informed of: the purpose of test messages (platform development
                and QA), the expected message frequency, that standard message and data rates may apply,
                and how to opt out (reply STOP at any time).
              </li>
              <li>
                The test recipient provides written acknowledgment (via email, chat, or signed form)
                confirming their consent to receive test messages.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">4. OPT-OUT PROCEDURES</h2>
            <p>Test recipients may opt out at any time through any of the following methods:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>Reply STOP</strong> to any test message. The system will immediately cease
                all messages to that number and send a confirmation.
              </li>
              <li>
                <strong>Direct request</strong> to the development team via email, chat, or verbal communication.
              </li>
              <li>
                <strong>Email</strong> privacy@dkdev.io with a request to be removed from test messaging.
              </li>
            </ul>
            <p className="mt-3">
              Opt-out requests are honored immediately. Once opted out, no further test messages
              will be sent to that number unless the individual re-opts in.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">5. MESSAGE CONTENT &amp; FREQUENCY</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Test messages are clearly identified as test/development messages where applicable.
              </li>
              <li>
                Test messages contain content representative of the platform&rsquo;s intended use:
                voter outreach, campaign communications, and related political messaging.
              </li>
              <li>
                Message frequency varies based on development needs but does not exceed reasonable
                testing volumes.
              </li>
              <li>
                All test messages comply with TCPA quiet hours (no messages before 8:00 AM or
                after 9:00 PM in the recipient&rsquo;s local time zone).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">6. RECORD KEEPING</h2>
            <p>
              Dev/D maintains records of all test recipient opt-ins including:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>The phone number that opted in.</li>
              <li>The date and method of opt-in.</li>
              <li>The identity of the consenting individual.</li>
              <li>Any opt-out requests and the date they were processed.</li>
            </ul>
            <p className="mt-3">
              These records are retained for the duration of testing and for a minimum of five (5)
              years thereafter, in compliance with TCPA record-keeping requirements.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">7. TWILIO COMPLIANCE</h2>
            <p>
              All test messaging through the Message platform complies with:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Twilio Acceptable Use Policy</li>
              <li>Twilio Messaging Policy</li>
              <li>A2P 10DLC registration requirements (when applicable)</li>
              <li>CTIA Messaging Principles and Best Practices</li>
              <li>Telephone Consumer Protection Act (TCPA)</li>
              <li>FCC rules and regulations regarding SMS/MMS messaging</li>
              <li>CAN-SPAM Act (where applicable to messaging)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">8. CONTACT</h2>
            <p>
              For questions about test messaging consent or to exercise your opt-out rights:
            </p>
            <p className="mt-2">
              <strong>Dev/D</strong><br />
              Email: privacy@dkdev.io<br />
              Website: votercontact.io/message
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
