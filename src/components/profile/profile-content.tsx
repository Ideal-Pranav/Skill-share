'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { 
  User, MapPin, Globe, Calendar, Star, Edit2, Save, X,
  Plus, Trash2, CheckCircle2, Clock
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
  
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [locationCity, setLocationCity] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (profile) {
      setFullName(profile.full_name)
      setBio(profile.bio || '')
      setLocationCity(profile.location_city)
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
        location_city: locationCity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id)

    if (error) {
      toast.error('Failed to update profile')
    } else {
      await refreshProfile()
      toast.success('Profile updated!')
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
      toast.success('Skill removed')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 px-4 pb-10">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-48 mb-6" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    )
  }

  const teachingSkills = skills.filter(s => s.is_teaching)
  const learningSkills = skills.filter(s => s.is_learning)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 px-4 pb-10">
        <div className="max-w-4xl mx-auto">
          <Card className="border-border bg-card mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/30">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                    {profile?.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-muted border-border"
                        />
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="bg-muted border-border"
                        />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input
                          value={locationCity}
                          onChange={(e) => setLocationCity(e.target.value)}
                          className="bg-muted border-border"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={saving}>
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="outline" onClick={() => setEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
                          {profile?.is_verified && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profile?.location_city}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {profile?.languages?.join(', ')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {new Date(profile?.created_at || '').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      
                      {profile?.bio && (
                        <p className="text-muted-foreground">{profile.bio}</p>
                      )}
                      
                      <div className="flex gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {profile?.total_sessions_as_mentor || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Sessions Taught</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {profile?.total_sessions_as_learner || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Sessions Learned</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-amber-400">
                            <Star className="w-5 h-5 fill-amber-400" />
                            {profile?.trust_score?.toFixed(1) || '0.0'}
                          </div>
                          <div className="text-xs text-muted-foreground">Trust Score</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="skills" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="skills">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-emerald-400" />
                      </div>
                      Teaching
                    </CardTitle>
                    <Button variant="ghost" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {teachingSkills.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No skills added yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {teachingSkills.map((us) => (
                          <div key={us.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div>
                              <p className="font-medium">{us.skill?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {us.years_experience} years experience
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => removeSkill(us.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <Star className="w-4 h-4 text-cyan-400" />
                      </div>
                      Learning
                    </CardTitle>
                    <Button variant="ghost" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {learningSkills.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No skills added yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {learningSkills.map((us) => (
                          <div key={us.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <p className="font-medium">{us.skill?.name}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => removeSkill(us.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  {reviews.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No reviews yet
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {(review.reviewer as any)?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{(review.reviewer as any)?.full_name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                                    />
                                  ))}
                                </div>
                                <span>•</span>
                                <Clock className="w-3 h-3" />
                                {new Date(review.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {review.content && (
                            <p className="text-sm text-muted-foreground">{review.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
