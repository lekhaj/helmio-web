import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Sidebar from '@/components/layout/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Helmio — Sprint Planner',
  description: 'Plan weekly sprints. Tie tasks to KPIs.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased text-neutral-900 bg-neutral-50 min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
        </div>
      </body>
    </html>
  )
}
