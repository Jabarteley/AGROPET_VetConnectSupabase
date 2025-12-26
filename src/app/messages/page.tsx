import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MessagesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login?redirectTo=/messages')
  }

  // Fetch all conversations for the current user
  const { data: conversations, error: conversationsError } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  if (conversationsError) {
    console.error('Error fetching conversations:', conversationsError)
    return <p className="p-4 text-center text-red-500">Could not fetch conversations.</p>
  }

  // Get the IDs of the other participants
  const otherParticipantIds = conversations.map((c) =>
    c.participant1_id === user.id ? c.participant2_id : c.participant1_id
  )

  // Fetch the profiles of the other participants
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', otherParticipantIds)

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    return <p className="p-4 text-center text-red-500">Could not fetch user profiles.</p>
  }

  // Create a map of profile IDs to names for easy lookup
  const profileMap = new Map(profiles.map((p) => [p.id, p.name || p.email]))

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Conversations</h1>
        <div className="space-y-4">
          {conversations.length > 0 ? (
            conversations.map((convo) => {
              const otherId = convo.participant1_id === user.id ? convo.participant2_id : convo.participant1_id
              const otherName = profileMap.get(otherId) || 'Unknown User'
              return (
                <Link
                  key={convo.id}
                  href={`/messages/${convo.id}`}
                  className="block p-4 bg-white rounded-lg shadow-md border hover:bg-gray-50"
                >
                  <h2 className="font-bold text-lg text-gray-800">Chat with {otherName}</h2>
                  <p className="text-sm text-gray-500">
                    Last message: {new Date(convo.last_message_at).toLocaleString()}
                  </p>
                </Link>
              )
            })
          ) : (
            <p className="text-center text-gray-500">You have no conversations.</p>
          )}
        </div>
      </div>
    </div>
  )
}
