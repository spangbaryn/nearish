import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import "./styles/globals.css"
import { RootLayoutClient } from "@/components/root-layout-client"
import { Toaster } from 'sonner'
import { Inter } from 'next/font/google'
import { cn } from "@/lib/utils"

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
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover"
        />
      </head>
      <body>
        <Providers>
          <RootLayoutClient className={cn(inter.className, "min-h-screen bg-background")}>
            {children}
          </RootLayoutClient>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}