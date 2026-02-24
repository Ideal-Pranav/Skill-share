'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/context/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  User, MapPin, Globe, Calendar, Star, Edit2, Save, X,
  Plus, Trash2, CheckCircle2, Clock, Sparkles, ShieldCheck,
  TrendingUp, BookOpen, Heart, Award, Briefcase, Code, Loader2
} from 'lucide-react'
import type { UserSkill, Skill, Review } from '@/lib/types/database'

export function ProfileContent() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [skills, setSkills] = useState<(UserSkill & { skill: Skill })[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Editable fields
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (profile) {
      setFullName(profile.full_name)
      setBio(profile.bio || '')
      setCountry(profile.country || '')
      setState(profile.state || '')
      setCity(profile.city || profile.location_city || '')
      fetchData()
    }
  }, [user, profile, authLoading])

  const fetchData = async () => {
    if (!user) return

    const [skillsRes, reviewsRes] = await Promise.all([
      supabase
        .from('user_skills')
        .select('*, skill:skills(*)')
        .eq('user_id', user.id),
      supabase
        .from('reviews')
        .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)')
        .eq('reviewee_id', user.id)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    if (skillsRes.data) setSkills(skillsRes.data as (UserSkill & { skill: Skill })[])
    if (reviewsRes.data) setReviews(reviewsRes.data as Review[])
    
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio,
        country,
        state,
        city,
        location_city: city, // Sync legacy field
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id)

    if (error) {
      toast.error('Failed to update profile')
    } else {
      await refreshProfile()
      toast.success('Matrix profile updated successfully')
      setEditing(false)
    }
    
    setSaving(false)
  }

  const removeSkill = async (skillId: string) => {
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('id', skillId)

    if (error) {
      toast.error('Failed to remove skill')
    } else {
      setSkills(skills.filter(s => s.id !== skillId))
      toast.success('Skill removed from matrix')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 pb-10">
          <div className="max-w-5xl mx-auto space-y-8">
            <Skeleton className="h-64 rounded-[3rem]" />
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="h-96 rounded-[3rem]" />
              <Skeleton className="h-96 rounded-[3rem]" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  const teachingSkills = skills.filter(s => s.is_teaching)
  const learningSkills = skills.filter(s => s.is_learning)

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-24 px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Hero Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="border-border bg-card/60 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden border-t-primary/20">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 blur-3xl opacity-50" />
              <CardContent className="p-8 md:p-12 relative z-10">
                <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl transition-transform duration-500 group-hover:scale-105">
                      <AvatarImage src={profile?.avatar_url || ''} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary text-5xl font-black">
                        {profile?.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {profile?.is_verified && (
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-background rounded-full p-1 shadow-lg">
                        <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4 min-w-0 w-full">
                    {editing ? (
                      <div className="grid gap-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Full Name</Label>
                            <Input
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="h-12 bg-background border-border rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Bio</Label>
                            <Input
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              className="h-12 bg-background border-border rounded-xl"
                            />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Country</Label>
                            <Select value={country} onValueChange={setCountry}>
                              <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="india">India</SelectItem>
                                <SelectItem value="usa">USA</SelectItem>
                                <SelectItem value="uk">UK</SelectItem>
                                <SelectItem value="germany">Germany</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary">State</Label>
                            <Input
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              className="h-12 bg-background border-border rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary">City</Label>
                            <Input
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="h-12 bg-background border-border rounded-xl"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button onClick={handleSave} disabled={saving} className="bg-primary text-white h-12 px-8 rounded-xl font-bold">
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Matrix
                          </Button>
                          <Button variant="outline" onClick={() => setEditing(false)} className="h-12 px-8 rounded-xl font-bold">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter truncate">{profile?.full_name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mt-2">
                              <div className="flex items-center gap-1.5 bg-primary/5 text-primary py-1 px-3 rounded-lg text-sm font-bold border border-primary/10">
                                <MapPin className="w-4 h-4" />
                                {city}, {country.toUpperCase()}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Globe className="w-4 h-4 text-primary" />
                                {profile?.languages?.join(', ') || 'English'}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-primary" />
                                Joined {new Date(profile?.created_at || '').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setEditing(true)} className="h-12 w-12 rounded-2xl bg-muted/30 hover:bg-primary hover:text-white transition-all">
                            <Edit2 className="w-5 h-5" />
                          </Button>
                        </div>
                        
                        {profile?.bio && (
                          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">{profile.bio}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-8 pt-6">
                          <div className="flex flex-col">
                            <span className="text-2xl font-black text-foreground">{profile?.total_sessions_as_mentor || 0}</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Mentored</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-2xl font-black text-foreground">{profile?.total_sessions_as_learner || 0}</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Learned</span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 text-2xl font-black text-amber-500">
                              <Star className="w-6 h-6 fill-amber-500" />
                              {profile?.trust_score?.toFixed(1) || '0.0'}
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Trust Rank</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Content */}
          <Tabs defaultValue="skills" className="space-y-12">
            <TabsList className="bg-card/50 backdrop-blur-xl border border-border p-1 rounded-2xl h-14 w-full sm:w-auto">
              <TabsTrigger value="skills" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full">Skills Matrix</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-bold h-full">Community Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="skills" className="mt-0">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Teaching Matrix */}
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-4 shadow-xl hover:border-primary/50 transition-all duration-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Award className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-black tracking-tight">Expertise</CardTitle>
                        <CardDescription>Knowledge you transfer to others</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-muted/30">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {teachingSkills.length === 0 ? (
                      <div className="text-center py-12 bg-muted/20 rounded-[2rem] border border-dashed border-border">
                        <p className="text-muted-foreground font-medium">No teaching skills indexed</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {teachingSkills.map((us, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={us.id} 
                            className="flex items-center justify-between p-5 rounded-3xl bg-background/50 border border-border hover:border-primary/30 group transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              <div>
                                <p className="font-bold text-lg leading-none mb-1 group-hover:text-primary transition-colors">{us.skill?.name}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                  {us.years_experience} Years Mastery
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeSkill(us.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Learning Matrix */}
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-4 shadow-xl hover:border-violet-500/50 transition-all duration-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                        <TrendingUp className="w-7 h-7 text-violet-500" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-black tracking-tight">Objectives</CardTitle>
                        <CardDescription>Skills you are currently acquiring</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-muted/30">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {learningSkills.length === 0 ? (
                      <div className="text-center py-12 bg-muted/20 rounded-[2rem] border border-dashed border-border">
                        <p className="text-muted-foreground font-medium">No learning goals defined</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {learningSkills.map((us, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={us.id} 
                            className="flex items-center justify-between p-5 rounded-3xl bg-background/50 border border-border hover:border-violet-500/30 group transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                              <div>
                                <p className="font-bold text-lg leading-none mb-1 group-hover:text-violet-500 transition-colors">{us.skill?.name}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Active Growth</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeSkill(us.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[3rem] p-8 shadow-xl">
                {reviews.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Star className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No feedback yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Complete your first mentorship session to start building your reputation.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-10">
                    {reviews.map((review, idx) => (
                      <motion.div 
                        key={review.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex flex-col sm:flex-row gap-6 pb-10 border-b border-border last:border-0 last:pb-0"
                      >
                        <Avatar className="w-16 h-16 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                            {(review.reviewer as any)?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="font-black text-lg">{(review.reviewer as any)?.full_name}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted/30'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(review.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          {review.content && (
                            <p className="text-muted-foreground leading-relaxed text-lg italic">
                              &quot;{review.content}&quot;
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
