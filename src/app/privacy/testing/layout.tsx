import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SMS Testing Consent — Message',
  description:
    'SMS testing consent policy for Message platform development. All test recipients have provided prior express written consent per TCPA and Twilio requirements.',
}

export default function TestingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
