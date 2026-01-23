import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "DBT Group Game",
  description: "A warm, reflective group experience for practicing DBT skills together.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white">
        {children}
      </body>
    </html>
  )
}
