'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Calendar, Clock, MapPin, Video, User, CheckCircle2, 
  XCircle, MessageSquare, Star
} from 'lucide-react'
import type { Session } from '@/lib/types/database'
import Link from 'next/link'

export function SessionsContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchSessions()
    }
  }, [user, authLoading])

  const fetchSessions = async () => {
    if (!user) return

    try {
      setError(null)
      const { data, error } = await supabase
        .from('sessions')
        .select('*, mentor:profiles!sessions_mentor_id_fkey(*), learner:profiles!sessions_learner_id_fkey(*), skill:skills(*)')
        .or(`mentor_id.eq.${user.id},learner_id.eq.${user.id}`)
        .order('scheduled_at', { ascending: false })

      if (error) {
        console.error('Sessions fetch error:', error)
        setError(`Sessions error: ${error.message}`)
      } else if (data) {
        setSessions(data as Session[])
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Sessions fetch error:', error)
      setError(`Error loading sessions: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 px-4 pb-10">
          <div className="max-w-5xl mx-auto">
            <Skeleton className="h-10 w-64 mb-8" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    )
  }

  const now = new Date()
  const upcomingSessions = sessions.filter(s => new Date(s.scheduled_at) > now && s.status !== 'cancelled')
  const pastSessions = sessions.filter(s => new Date(s.scheduled_at) <= now || s.status === 'completed')
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/50'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 px-4 pb-10">
        {error && (
          <div className="max-w-5xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 font-semibold">
            {error}
          </div>
        )}
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Sessions</h1>
              <p className="text-muted-foreground">
                Manage your learning and teaching sessions
              </p>
            </div>
            <Link href="/sessions/new">
              <Button className="bg-primary">
                <Calendar className="w-4 h-4 mr-2" />
                Book New Session
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastSessions.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({cancelledSessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingSessions.length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No upcoming sessions</h3>
                    <p className="text-muted-foreground mb-4">Book a session with a mentor to get started</p>
                    <Link href="/explore">
                      <Button>Browse Skills</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <SessionCard key={session.id} session={session} userId={user!.id} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastSessions.length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Clock className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No past sessions</h3>
                    <p className="text-muted-foreground">Your completed sessions will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastSessions.map((session) => (
                    <SessionCard key={session.id} session={session} userId={user!.id} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled">
              {cancelledSessions.length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <XCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No cancelled sessions</h3>
                    <p className="text-muted-foreground">Cancelled sessions will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {cancelledSessions.map((session) => (
                    <SessionCard key={session.id} session={session} userId={user!.id} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function SessionCard({ session, userId }: { session: Session; userId: string }) {
  const isMentor = session.mentor_id === userId
  const otherPerson = isMentor ? session.learner : session.mentor
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/50'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50'
      default: return ''
    }
  }

  return (
    <Card className="border-border bg-card hover:border-primary/30 transition-colors">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{session.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {session.skill?.name}
                </p>
              </div>
              <Badge className={getStatusColor(session.status)}>
                {session.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(session.scheduled_at).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(session.scheduled_at).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                <span>({session.duration_minutes} min)</span>
              </div>
              <div className="flex items-center gap-1">
                {session.location_type === 'online' ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {session.location_type === 'online' ? 'Online' : session.location_details || 'In Person'}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                {(otherPerson as any)?.full_name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-sm font-medium">{(otherPerson as any)?.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {isMentor ? 'Learner' : 'Mentor'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex md:flex-col gap-2 md:justify-center">
            {session.status === 'confirmed' && session.meeting_link && (
              <Button className="bg-emerald-500 hover:bg-emerald-600" asChild>
                <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                  <Video className="w-4 h-4 mr-2" />
                  Join
                </a>
              </Button>
            )}
            <Link href={`/messages?user=${isMentor ? session.learner_id : session.mentor_id}`}>
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </Link>
            {session.status === 'completed' && (
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
