import type React from "react"
import type { Metadata } from "next"
import { Dancing_Script } from "next/font/google"
import "./globals.css"
import { AppProviders } from "./providers"
import { Suspense } from "react"
import { LoaderThree } from "@/components/ui/loader"

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing-script',
})

export const metadata: Metadata = {
  title: "FocusBolt",
  description: "Helps you stay focused and get things done.",
  generator: "keshavcodes",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${dancingScript.variable} font-sans`}>
        <Suspense fallback={<LoaderThree />}>
          <AppProviders>{children}</AppProviders>
        </Suspense>
      </body>
    </html>
  )
}
