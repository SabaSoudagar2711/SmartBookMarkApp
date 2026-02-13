'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Bookmark } from '@/lib/types'
import AddBookmarkForm from './AddBookmarkForm'
import BookmarkList from './BookmarkList'

interface BookmarksDashboardProps {
  initialBookmarks: Bookmark[]
  userId: string
}

export default function BookmarksDashboard({
  initialBookmarks,
  userId,
}: BookmarksDashboardProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const supabase = createClient()

  const handleAdd = useCallback((bookmark: Bookmark) => {
    setBookmarks((prev) => [bookmark, ...prev])
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (!error) {
      setBookmarks((prev) => prev.filter((b) => b.id !== id))
    }
  }, [supabase, userId])

  useEffect(() => {
    const channel = supabase
      .channel(`bookmarks:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newBookmark = payload.new as Bookmark
          setBookmarks((prev) => {
            // Avoid duplicates from optimistic updates
            if (prev.some((b) => b.id === newBookmark.id)) return prev
            return [newBookmark, ...prev]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deletedId = payload.old.id as string
          setBookmarks((prev) => prev.filter((b) => b.id !== deletedId))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
          Your Bookmarks
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {bookmarks.length === 0
            ? 'No bookmarks yet. Add one below.'
            : `${bookmarks.length} bookmark${bookmarks.length === 1 ? '' : 's'}`}
        </p>
      </div>

      <AddBookmarkForm userId={userId} onAdd={handleAdd} />

      <div className="mt-8">
        <BookmarkList bookmarks={bookmarks} onDelete={handleDelete} />
      </div>
    </div>
  )
}
