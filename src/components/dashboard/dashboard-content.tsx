'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/context/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { 
  Calendar, MessageSquare, BookOpen, TrendingUp, 
  Clock, Star, Users, ArrowRight, Plus, Sparkles,
  Award, Heart, ShieldCheck, MapPin, Zap
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
  const [error, setError] = useState<string | null>(null)

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

    try {
      setError(null)
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

      if (sessionsRes.error) {
        console.error('Dashboard sessions fetch error:', sessionsRes.error)
        setError(`Sessions error: ${sessionsRes.error.message}`)
      } else if (sessionsRes.data) {
        setSessions(sessionsRes.data as Session[])
      }

      if (skillsRes.error) {
        console.error('Dashboard skills fetch error:', skillsRes.error)
        setError(`Skills error: ${skillsRes.error.message}`)
      } else if (skillsRes.data) {
        setSkills(skillsRes.data as UserSkill[])
      }

      if (notificationsRes.error) {
        console.error('Dashboard notifications fetch error:', notificationsRes.error)
        setError(`Notifications error: ${notificationsRes.error.message}`)
      } else if (notificationsRes.data) {
        setNotifications(notificationsRes.data as Notification[])
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Dashboard fetch error:', error)
      setError(`Error loading dashboard: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 pb-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-[2rem]" />
              ))}
            </div>
            <Skeleton className="h-[500px] rounded-[3rem]" />
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
      title: 'Active Sessions', 
      value: upcomingSessions.length.toString(), 
      icon: Calendar, 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      title: 'Teaching Matrix', 
      value: teachingSkills.length.toString(), 
      icon: Award, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      title: 'Growth Path', 
      value: learningSkills.length.toString(), 
      icon: TrendingUp, 
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10'
    },
    { 
      title: 'Trust Score', 
      value: profile?.trust_score?.toFixed(1) || '0.0', 
      icon: Star, 
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    },
  ]

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-24 px-4 pb-20">
        {error && (
          <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 font-semibold">
            {error}
          </div>
        )}
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
                <Sparkles className="w-3 h-3 mr-2" />
                Operational Dashboard
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                Welcome, <span className="text-primary">{profile?.full_name?.split(' ')[0]}</span>
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Monitoring your {profile?.location_city || 'global'} learning ecosystem.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/explore">
                <Button className="h-12 px-6 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 font-bold group">
                  Explore Matrix
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.title}</p>
                        <p className="text-4xl font-black mt-2 tracking-tighter">{stat.value}</p>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center border border-white/5`}>
                        <stat.icon className={`w-7 h-7 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Primary Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Sessions */}
              <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem] shadow-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight">Upcoming Sessions</CardTitle>
                    <CardDescription>Your scheduled knowledge transfers</CardDescription>
                  </div>
                  <Link href="/sessions">
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      View Timeline
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  {upcomingSessions.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border">
                      <Calendar className="w-16 h-16 mx-auto text-muted-foreground/20 mb-6" />
                      <p className="text-xl font-bold text-muted-foreground mb-6">No active sessions indexed</p>
                      <Link href="/explore">
                        <Button variant="outline" className="rounded-xl px-8 h-12 font-bold">
                          Begin Discovery
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => (
                        <div 
                          key={session.id} 
                          className="flex items-center gap-6 p-6 rounded-[2rem] bg-background/50 border border-border hover:border-primary/30 transition-all group"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="w-7 h-7 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-black truncate group-hover:text-primary transition-colors">{session.title}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="font-bold">
                                {new Date(session.scheduled_at).toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px] py-1 px-3">
                            {session.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills Area */}
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem] shadow-xl">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Award className="w-5 h-5 text-blue-500" />
                      </div>
                      Teaching
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {teachingSkills.map((us) => (
                        <Badge key={us.id} className="bg-blue-500/10 text-blue-500 border-blue-500/20 py-1 px-3 rounded-xl font-bold">
                          {us.skill?.name}
                        </Badge>
                      ))}
                      {teachingSkills.length === 0 && <p className="text-sm text-muted-foreground italic">None indexed</p>}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem] shadow-xl">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-violet-500" />
                      </div>
                      Learning
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {learningSkills.map((us) => (
                        <Badge key={us.id} className="bg-violet-500/10 text-violet-500 border-violet-500/20 py-1 px-3 rounded-xl font-bold">
                          {us.skill?.name}
                        </Badge>
                      ))}
                      {learningSkills.length === 0 && <p className="text-sm text-muted-foreground italic">None defined</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-8">
              <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem] shadow-xl p-2 overflow-hidden">
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-black">Fast Operations</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-3">
                  <Link href="/mentors" className="block">
                    <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-border bg-background hover:bg-primary hover:text-white hover:border-primary transition-all font-bold">
                      <Users className="w-5 h-5 mr-4" />
                      Find Mentors
                    </Button>
                  </Link>
                  <Link href="/sessions/new" className="block">
                    <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-border bg-background hover:bg-primary hover:text-white hover:border-primary transition-all font-bold">
                      <Zap className="w-5 h-5 mr-4" />
                      Instant Booking
                    </Button>
                  </Link>
                  <Link href="/messages" className="block">
                    <Button variant="outline" className="w-full h-14 justify-start rounded-2xl border-border bg-background hover:bg-primary hover:text-white hover:border-primary transition-all font-bold">
                      <MessageSquare className="w-5 h-5 mr-4" />
                      Terminal Sync
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem] shadow-xl p-2 overflow-hidden">
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-black">Signal Queue</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {notifications.length === 0 ? (
                    <div className="text-center py-10 opacity-40 italic text-sm">
                      Queue clear. No pending signals.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-border group hover:border-primary/20 transition-all">
                          <div className="w-2.5 h-2.5 mt-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black group-hover:text-primary transition-colors">{notif.title}</p>
                            <p className="text-xs text-muted-foreground truncate font-medium">{notif.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5 rounded-[2.5rem] shadow-xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldCheck className="w-20 h-20" />
                </div>
                <h3 className="text-xl font-black mb-2">Verified Growth</h3>
                <p className="text-sm text-muted-foreground mb-6">Your trust score is in the top 5% for the {profile?.location_city || 'local'} area. Keep it up!</p>
                <Button className="w-full bg-primary text-white rounded-xl font-bold h-12 shadow-lg shadow-primary/20">
                  Boost Reputation
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
