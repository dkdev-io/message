import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cost Calculator — Message',
  description:
    'Compare SMS messaging costs across Message, Hustle, and Scale to Win. See how much your campaign can save with Message.',
}

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
