import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BookmarksDashboard from '@/components/BookmarksDashboard'
import Header from '@/components/Header'
import type { Bookmark } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('id, title, url, created_at, user_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarks:', error.message)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        email={user.email ?? ''}
        avatarUrl={user.user_metadata?.avatar_url ?? null}
        name={user.user_metadata?.full_name ?? null}
      />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <BookmarksDashboard
          initialBookmarks={(bookmarks as Bookmark[]) ?? []}
          userId={user.id}
        />
      </main>
    </div>
  )
}
