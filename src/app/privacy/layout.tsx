import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy & Data Use Policy — Message',
  description:
    'How Message handles your data. GDPR and CCPA/CPRA compliant privacy policy covering data collection, storage, and your rights.',
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
