import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import "./styles/globals.css"
import { RootLayoutClient } from "@/components/root-layout-client"
import { Toaster } from 'sonner'
import { Inter } from 'next/font/google'
import { ZoomResetProvider } from '@/app/components/zoom-reset-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Nearish",
  description: "A social network for small businesses and their customers",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0"
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ZoomResetProvider>
          <Providers>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
            <Toaster />
          </Providers>
        </ZoomResetProvider>
      </body>
    </html>
  )
}