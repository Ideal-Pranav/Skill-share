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
import { 
  Users, BookOpen, Calendar, AlertTriangle, TrendingUp, 
  CheckCircle2, XCircle, Shield, BarChart3
} from 'lucide-react'
import type { Profile, Report, Session } from '@/lib/types/database'

export function AdminContent() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMentors: 0,
    totalSessions: 0,
    pendingReports: 0,
  })
  const [users, setUsers] = useState<Profile[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (profile && profile.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    if (user) {
      fetchAdminData()
    }
  }, [user, profile, authLoading])

  const fetchAdminData = async () => {
    const [usersRes, mentorsRes, sessionsRes, reportsRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact' }),
      supabase.from('profiles').select('*', { count: 'exact' }).in('role', ['mentor', 'dual']),
      supabase.from('sessions').select('*', { count: 'exact' }),
      supabase.from('reports').select('*').eq('status', 'pending'),
    ])

    setStats({
      totalUsers: usersRes.count || 0,
      totalMentors: mentorsRes.count || 0,
      totalSessions: sessionsRes.count || 0,
      pendingReports: reportsRes.data?.length || 0,
    })

    if (usersRes.data) setUsers(usersRes.data as Profile[])
    if (reportsRes.data) setReports(reportsRes.data as Report[])
    
    setLoading(false)
  }

  const handleVerifyUser = async (userId: string, verified: boolean) => {
    await supabase
      .from('profiles')
      .update({ is_verified: verified })
      .eq('id', userId)
    
    setUsers(users.map(u => u.id === userId ? { ...u, is_verified: verified } : u))
  }

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    await supabase
      .from('reports')
      .update({ 
        status, 
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', reportId)
    
    setReports(reports.filter(r => r.id !== reportId))
    setStats({ ...stats, pendingReports: stats.pendingReports - 1 })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 px-4 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 w-64 bg-muted rounded" />
              <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { title: 'Mentors', value: stats.totalMentors, icon: BookOpen, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    { title: 'Sessions', value: stats.totalSessions, icon: Calendar, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    { title: 'Pending Reports', value: stats.pendingReports, icon: AlertTriangle, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 px-4 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Platform management and moderation</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {statCards.map((stat) => (
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

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="reports">
                Reports {stats.pendingReports > 0 && (
                  <Badge variant="destructive" className="ml-2">{stats.pendingReports}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.slice(0, 20).map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {u.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{u.full_name}</p>
                              {u.is_verified && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{u.email}</span>
                              <span>•</span>
                              <Badge variant="outline">{u.role}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!u.is_verified ? (
                            <Button size="sm" variant="outline" onClick={() => handleVerifyUser(u.id, true)}>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Verify
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleVerifyUser(u.id, false)}>
                              <XCircle className="w-4 h-4 mr-1" />
                              Unverify
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Pending Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
                      <p className="text-muted-foreground">No pending reports</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div key={report.id} className="p-4 rounded-lg bg-muted/30 border border-amber-500/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge variant="outline" className="mb-2">{report.report_type}</Badge>
                              <p className="font-medium">{report.reason}</p>
                              {report.details && (
                                <p className="text-sm text-muted-foreground mt-2">{report.details}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Reported on {new Date(report.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleResolveReport(report.id, 'resolved')}
                              >
                                Resolve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleResolveReport(report.id, 'dismissed')}
                              >
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Platform Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-lg bg-muted/30">
                      <h3 className="font-medium mb-4">User Growth</h3>
                      <div className="flex items-end gap-1 h-32">
                        {[40, 55, 45, 60, 75, 65, 80].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-primary/50 rounded-t"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-lg bg-muted/30">
                      <h3 className="font-medium mb-4">Session Success Rate</h3>
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-muted"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray="85, 100"
                            className="text-emerald-400"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">85%</span>
                        </div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        Completion rate
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
