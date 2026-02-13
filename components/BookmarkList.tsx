'use client'

import { useState } from 'react'
import type { Bookmark } from '@/lib/types'

interface BookmarkListProps {
  bookmarks: Bookmark[]
  onDelete: (id: string) => Promise<void>
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function getFaviconUrl(url: string): string {
  try {
    const { protocol, hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${protocol}//${hostname}&sz=32`
  } catch {
    return ''
  }
}

interface BookmarkItemProps {
  bookmark: Bookmark
  onDelete: (id: string) => Promise<void>
}

function BookmarkItem({ bookmark, onDelete }: BookmarkItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(bookmark.id)
  }

  const faviconUrl = getFaviconUrl(bookmark.url)

  return (
    <div className="group flex items-start gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 transition-colors duration-150">
      <div className="flex-shrink-0 mt-0.5">
        {faviconUrl && !imgError ? (
          <img
            src={faviconUrl}
            alt=""
            className="w-5 h-5 rounded-sm"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-5 h-5 rounded-sm bg-gray-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors truncate"
        >
          {bookmark.title}
        </a>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 truncate">
            {getDomain(bookmark.url)}
          </span>
          <span className="text-gray-200 text-xs">|</span>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatDate(bookmark.created_at)}
          </span>
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label={`Delete bookmark: ${bookmark.title}`}
        className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        {isDeleting ? (
          <svg
            className="animate-spin w-4 h-4"
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
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
      </button>
    </div>
  )
}

export default function BookmarkList({ bookmarks, onDelete }: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
        <div className="w-10 h-10 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-500">No bookmarks yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Add your first bookmark using the form above.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bookmark) => (
        <BookmarkItem key={bookmark.id} bookmark={bookmark} onDelete={onDelete} />
      ))}
    </div>
  )
}
