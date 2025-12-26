'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function initiateConversation(vetId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const userId = user.id

  // Check if a conversation already exists between these two users
  let { data: conversation, error: selectError } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(participant1_id.eq.${userId},participant2_id.eq.${vetId}),and(participant1_id.eq.${vetId},participant2_id.eq.${userId})`)
    .single()

  if (selectError && selectError.code !== 'PGRST116') { // PGRST116: single row not found
    console.error('Error checking for existing conversation:', selectError)
    // For now, redirect to a generic error or home page. In a real app, handle gracefully.
    return redirect('/')
  }

  // If no conversation exists, create a new one
  if (!conversation) {
    let { data: newConversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        participant1_id: userId,
        participant2_id: vetId,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error creating new conversation:', insertError)
      return redirect('/')
    }
    conversation = newConversation
  }

  // Redirect to the conversation page
  revalidatePath(`/messages/${conversation.id}`)
  redirect(`/messages/${conversation.id}`)
}
