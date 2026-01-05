'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, MessageSquare, Search, ArrowLeft } from 'lucide-react'
import type { Conversation, Message, Profile } from '@/lib/types/database'

interface ConversationWithDetails extends Conversation {
  otherUser: Profile
  lastMessage?: Message
  unreadCount: number
}

export function MessagesContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetUserId = searchParams.get('user')
  const supabase = createClient()
  
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchConversations()
    }
  }, [user, authLoading])

  useEffect(() => {
    if (targetUserId && user) {
      startConversationWith(targetUserId)
    }
  }, [targetUserId, user, conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    if (!user) return

    const { data: convData } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (convData) {
      const conversationsWithDetails = await Promise.all(
        convData.map(async (conv) => {
          const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1
          
          const [profileRes, messagesRes, unreadRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', otherUserId).single(),
            supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1),
            supabase
              .from('messages')
              .select('id', { count: 'exact' })
              .eq('conversation_id', conv.id)
              .neq('sender_id', user.id)
              .eq('is_read', false),
          ])

          return {
            ...conv,
            otherUser: profileRes.data as Profile,
            lastMessage: messagesRes.data?.[0] as Message,
            unreadCount: unreadRes.count || 0,
          } as ConversationWithDetails
        })
      )
      
      setConversations(conversationsWithDetails)
    }
    
    setLoading(false)
  }

  const startConversationWith = async (targetId: string) => {
    const existing = conversations.find(
      c => c.otherUser?.id === targetId
    )
    
    if (existing) {
      selectConversation(existing)
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single()

    if (profileData) {
      const newConv: ConversationWithDetails = {
        id: 'new',
        participant_1: user!.id,
        participant_2: targetId,
        last_message_at: new Date().toISOString(),
        is_locked: false,
        locked_at: null,
        created_at: new Date().toISOString(),
        otherUser: profileData as Profile,
        unreadCount: 0,
      }
      setSelectedConversation(newConv)
      setMessages([])
    }
  }

  const selectConversation = async (conv: ConversationWithDetails) => {
    setSelectedConversation(conv)
    
    if (conv.id !== 'new') {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true })

      if (data) setMessages(data as Message[])

      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conv.id)
        .neq('sender_id', user!.id)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return
    
    setSending(true)
    
    let conversationId = selectedConversation.id
    
    if (conversationId === 'new') {
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: selectedConversation.otherUser.id,
        })
        .select()
        .single()

      if (error || !newConv) {
        setSending(false)
        return
      }
      
      conversationId = newConv.id
    }

    const { data: msgData } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage.trim(),
        message_type: 'text',
      })
      .select()
      .single()

    if (msgData) {
      setMessages(prev => [...prev, msgData as Message])
      setNewMessage('')
      
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId)
    }

    setSending(false)
    fetchConversations()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 px-4 pb-10">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-[600px]" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 px-4 pb-10">
        <div className="max-w-6xl mx-auto">
          <Card className="border-border bg-card h-[calc(100vh-140px)]">
            <div className="flex h-full">
              <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedConversation ? 'hidden md:flex' : ''}`}>
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold mb-3">Messages</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search conversations..." className="pl-9 bg-muted border-border" />
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No conversations yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => selectConversation(conv)}
                          className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                            selectedConversation?.id === conv.id ? 'bg-muted/50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={conv.otherUser?.avatar_url || ''} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {conv.otherUser?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">{conv.otherUser?.full_name}</p>
                                {conv.unreadCount > 0 && (
                                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                    {conv.unreadCount}
                                  </span>
                                )}
                              </div>
                              {conv.lastMessage && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {conv.lastMessage.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
                {selectedConversation ? (
                  <>
                    <div className="p-4 border-b border-border flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedConversation.otherUser?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedConversation.otherUser?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedConversation.otherUser?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedConversation.otherUser?.location_city}
                        </p>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                msg.sender_id === user?.id
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-muted rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-xs mt-1 ${
                                msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {new Date(msg.created_at).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-border">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                          className="bg-muted border-border"
                        />
                        <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <MessageSquare className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
