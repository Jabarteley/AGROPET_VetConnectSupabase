import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatRoom from '@/components/ChatRoom'

export default async function ConversationPage({ params }: { params: { conversation_id: string } }) {
  const supabase = createClient()
  const conversationId = params.conversation_id

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect(`/login?redirectTo=/messages/${conversationId}`)
  }

  // Validate that the user is part of this conversation
  const { data: conversation, error: convoError } = await supabase
    .from('conversations')
    .select('id, participant1_id, participant2_id')
    .eq('id', conversationId)
    .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
    .single()

  if (convoError || !conversation) {
    return (
      <div className="p-4 text-center">
        <p>Conversation not found or you do not have access.</p>
      </div>
    )
  }
  
  const otherParticipantId = conversation.participant1_id === user.id ? conversation.participant2_id : conversation.participant1_id;
  
    // Fetch other participant's profile
  const { data: otherParticipantProfile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', otherParticipantId)
    .single();


  // Fetch initial messages
  const { data: initialMessages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (messagesError) {
    console.error('Error fetching messages:', messagesError)
    return <p className="p-4 text-center text-red-500">Could not load messages.</p>
  }

  return (
    <div className="flex flex-col items-center p-4 h-[calc(100vh-4rem)]">
      <div className="w-full max-w-2xl h-full flex flex-col">
         <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Chat with {otherParticipantProfile?.name || 'User'}</h1>
        </div>
        <ChatRoom
          conversationId={conversationId}
          initialMessages={initialMessages || []}
          currentUser={user}
        />
      </div>
    </div>
  )
}
