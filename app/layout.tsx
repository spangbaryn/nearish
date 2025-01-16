import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Providers } from "@/components/providers"
import "./styles/globals.css"
import { RootLayoutClient } from "@/components/root-layout-client"
import { Toaster } from 'sonner'
import { AuthProvider } from "@/lib/auth-context"

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
      <body>
        <Providers>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}