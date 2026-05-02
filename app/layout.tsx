import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Helmio',
  description: 'Task tracker and feedback looper',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
          <Link href="/" className="font-bold text-lg text-brand-600 tracking-tight">
            Helmio
          </Link>
          <Link href="/tasks" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
            Tasks
          </Link>
          <Link href="/feedback" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
            Feedback
          </Link>
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
