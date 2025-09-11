import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AppProviders } from "./providers"
import { Suspense } from "react"
import { LoaderThree } from "@/components/ui/loader";
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
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<LoaderThree />}>
          <AppProviders>{children}</AppProviders>
        </Suspense>
      </body>
    </html>
  )
}
