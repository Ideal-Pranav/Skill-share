'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { 
  Calendar, MessageSquare, BookOpen, TrendingUp, 
  Clock, Star, Users, ArrowRight, Plus
} from 'lucide-react'
import type { Session, UserSkill, Notification } from '@/lib/types/database'

export function DashboardContent() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [sessions, setSessions] = useState<Session[]>([])
  const [skills, setSkills] = useState<UserSkill[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, authLoading])

  const fetchDashboardData = async () => {
    if (!user) return

    const [sessionsRes, skillsRes, notificationsRes] = await Promise.all([
      supabase
        .from('sessions')
        .select('*, mentor:profiles!sessions_mentor_id_fkey(*), learner:profiles!sessions_learner_id_fkey(*), skill:skills(*)')
        .or(`mentor_id.eq.${user.id},learner_id.eq.${user.id}`)
        .order('scheduled_at', { ascending: true })
        .limit(5),
      supabase
        .from('user_skills')
        .select('*, skill:skills(*)')
        .eq('user_id', user.id),
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    if (sessionsRes.data) setSessions(sessionsRes.data as Session[])
    if (skillsRes.data) setSkills(skillsRes.data as UserSkill[])
    if (notificationsRes.data) setNotifications(notificationsRes.data as Notification[])
    
    setLoading(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 px-4 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    )
  }

  const upcomingSessions = sessions.filter(s => new Date(s.scheduled_at) > new Date())
  const teachingSkills = skills.filter(s => s.is_teaching)
  const learningSkills = skills.filter(s => s.is_learning)

  const stats = [
    { 
      title: 'Upcoming Sessions', 
      value: upcomingSessions.length.toString(), 
      icon: Calendar, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    { 
      title: 'Teaching Skills', 
      value: teachingSkills.length.toString(), 
      icon: BookOpen, 
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      title: 'Learning Skills', 
      value: learningSkills.length.toString(), 
      icon: TrendingUp, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    { 
      title: 'Trust Score', 
      value: profile?.trust_score?.toFixed(1) || '0.0', 
      icon: Star, 
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 px-4 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.full_name?.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your learning journey
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                  <Link href="/sessions">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {upcomingSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground mb-4">No upcoming sessions</p>
                      <Link href="/explore">
                        <Button variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Book a Session
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => (
                        <div 
                          key={session.id} 
                          className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{session.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {new Date(session.scheduled_at).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Your Skills</CardTitle>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm">
                      Manage
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {skills.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground mb-4">No skills added yet</p>
                      <Link href="/profile">
                        <Button variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Skills
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teachingSkills.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Teaching</p>
                          <div className="flex flex-wrap gap-2">
                            {teachingSkills.map((us) => (
                              <Badge key={us.id} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                                {us.skill?.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {learningSkills.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Learning</p>
                          <div className="flex flex-wrap gap-2">
                            {learningSkills.map((us) => (
                              <Badge key={us.id} variant="secondary">
                                {us.skill?.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/explore" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Find Mentors
                    </Button>
                  </Link>
                  <Link href="/sessions/new" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Session
                    </Button>
                  </Link>
                  <Link href="/messages" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No new notifications
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30">
                          <div className="w-2 h-2 mt-2 rounded-full bg-emerald-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notif.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
