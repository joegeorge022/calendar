import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CalendarProvider } from "@/lib/CalendarContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Calendar",
  description: "A simple Calendar app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CalendarProvider>
          {children}
        </CalendarProvider>
      </body>
    </html>
  )
}
