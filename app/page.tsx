import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900">Helmio</h1>
      <p className="text-gray-500 max-w-md">
        Track tasks, close the loop with feedback, and keep your team moving.
      </p>
      <div className="flex gap-4">
        <Link
          href="/tasks"
          className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          View Tasks
        </Link>
        <Link
          href="/feedback"
          className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:border-brand-600 hover:text-brand-600 transition-colors"
        >
          View Feedback
        </Link>
      </div>
    </div>
  )
}
