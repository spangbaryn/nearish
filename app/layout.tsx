import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Providers } from "../components/providers"
import "./styles/globals.css"
import { RootLayoutClient } from "@/components/root-layout-client"
import { headers } from 'next/headers'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: "Nearish",
  description: "A social network for small businesses and their customers",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="antialiased">
        <Providers>
          <RootLayoutClient>{children}</RootLayoutClient>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}