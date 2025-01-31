import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: 'noindex, nofollow'
}

export default function PublicBusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
} 