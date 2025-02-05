import { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
  title: 'Business Profile',
  description: 'View business profile and team intros'
}

export default function PublicBusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-background`}>
      {children}
    </div>
  )
} 