'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Bookmark } from '@/lib/types'

interface AddBookmarkFormProps {
  userId: string
  onAdd: (bookmark: Bookmark) => void
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function AddBookmarkForm({ userId, onAdd }: AddBookmarkFormProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedTitle = title.trim()
    const trimmedUrl = url.trim()

    if (!trimmedTitle) {
      setError('Title is required.')
      return
    }

    if (!trimmedUrl) {
      setError('URL is required.')
      return
    }

    if (!isValidUrl(trimmedUrl)) {
      setError('Please enter a valid URL starting with http:// or https://')
      return
    }

    setIsSubmitting(true)

    const { data, error: insertError } = await supabase
      .from('bookmarks')
      .insert({
        title: trimmedTitle,
        url: trimmedUrl,
        user_id: userId,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setIsSubmitting(false)
      return
    }

    if (data) {
      onAdd(data as Bookmark)
    }

    setTitle('')
    setUrl('')
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Add New Bookmark
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="title"
            className="block text-xs font-medium text-gray-500 mb-1.5"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Next.js Documentation"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-150"
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        <div>
          <label
            htmlFor="url"
            className="block text-xs font-medium text-gray-500 mb-1.5"
          >
            URL
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-150"
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Saving...
            </>
          ) : (
            'Save Bookmark'
          )}
        </button>
      </form>
    </div>
  )
}
