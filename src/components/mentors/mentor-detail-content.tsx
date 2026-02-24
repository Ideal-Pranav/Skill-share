'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  MapPin, Star, CheckCircle2, MessageSquare, Calendar, Globe, ShieldCheck, 
  Sparkles, ArrowLeft, Award, TrendingUp, Users, Heart, Briefcase, Code,
  BookOpen, Zap
} from 'lucide-react'
import type { Profile, UserSkill, Skill } from '@/lib/types/database'

interface MentorWithSkills extends Profile {
  skills?: (UserSkill & { skill: Skill })[]
  reviews?: Array<{
    id: string
    rating: number
    content: string | null
    reviewer_id?: string
    reviewer?: Profile
    created_at: string
  }>
}

export function MentorDetailContent({ mentorId }: { mentorId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [mentor, setMentor] = useState<MentorWithSkills | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMentorDetail()
  }, [mentorId])

  const fetchMentorDetail = async () => {
    try {
      setError(null)

      // Fetch mentor profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', mentorId)
        .single()

      if (profileError) throw profileError

      // Fetch mentor skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select('*, skill:skills(*)')
        .eq('user_id', mentorId)
        .eq('is_teaching', true)

      if (skillsError) throw skillsError

      // Fetch reviews (without embedding profiles due to ambiguous relationships)
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, rating, content, reviewer_id, created_at')
        .eq('reviewee_id', mentorId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(5)

      if (reviewsError) throw reviewsError

      // Fetch reviewer profiles separately
      const reviewerIds = (reviewsData || []).map(r => r.reviewer_id).filter(Boolean)
      let reviewerProfiles: Record<string, Profile> = {}
      
      if (reviewerIds.length > 0) {
        const { data: reviewersData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', reviewerIds)
        
        if (reviewersData) {
          reviewerProfiles = Object.fromEntries(
            reviewersData.map(p => [p.id, p])
          )
        }
      }

      // Map reviews with their reviewer profiles
      const reviewsWithProfiles = (reviewsData || []).map(review => ({
        ...review,
        reviewer: review.reviewer_id ? reviewerProfiles[review.reviewer_id] : undefined
      }))

      setMentor({
        ...(profileData as Profile),
        skills: (skillsData || []) as (UserSkill & { skill: Skill })[],
        reviews: reviewsWithProfiles,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load mentor details'
      console.error('Error fetching mentor:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 px-4 pb-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-80" />
            <Skeleton className="h-96" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 px-4 pb-10">
          <div className="max-w-4xl mx-auto">
            <Link href="/mentors">
              <Button variant="ghost" className="mb-6 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Mentors
              </Button>
            </Link>
            <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem]">
              <CardContent className="p-12 text-center">
                <p className="text-lg font-semibold text-red-600 mb-4">
                  {error || 'Mentor not found'}
                </p>
                <Link href="/mentors">
                  <Button className="rounded-xl">View All Mentors</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const teachingSkills = mentor.skills?.filter(s => s.is_teaching) || []
  const averageRating = 
    mentor.reviews && mentor.reviews.length > 0
      ? (mentor.reviews.reduce((sum, r) => sum + r.rating, 0) / mentor.reviews.length).toFixed(1)
      : 'N/A'

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 px-4 pb-10">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/mentors">
            <Button variant="ghost" className="mb-6 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Mentors
            </Button>
          </Link>

          {/* Profile Card */}
          <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem] mb-8">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Avatar & Basic Info */}
                <div className="md:col-span-1 flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 border-4 border-primary/20 mb-6">
                    <AvatarImage src={mentor.avatar_url || ''} />
                    <AvatarFallback className="text-2xl bg-primary/20">
                      {mentor.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-black tracking-tight mb-2">{mentor.full_name}</h1>
                  
                  {mentor.is_verified && (
                    <div className="flex items-center gap-2 mb-4 justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">Verified Mentor</span>
                    </div>
                  )}

                  <div className="space-y-3 w-full">
                    <Link href={`/sessions/new?mentor=${mentor.id}`}>
                      <Button className="w-full bg-primary text-white rounded-xl font-bold h-12 shadow-lg shadow-primary/20">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Session
                      </Button>
                    </Link>
                    <Link href={`/messages?user=${mentor.id}`}>
                      <Button variant="outline" className="w-full rounded-xl font-bold h-12">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Stats & Info */}
                <div className="md:col-span-2">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-background/50 rounded-xl p-4 text-center border border-border">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Trust Score</p>
                      <p className="text-3xl font-black text-primary">{mentor.trust_score.toFixed(1)}</p>
                    </div>
                    <div className="bg-background/50 rounded-xl p-4 text-center border border-border">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Sessions</p>
                      <p className="text-3xl font-black">{mentor.total_sessions_as_mentor}</p>
                    </div>
                    <div className="bg-background/50 rounded-xl p-4 text-center border border-border">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Rating</p>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <p className="text-3xl font-black">{averageRating}</p>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-semibold">{mentor.location_city}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Languages</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {mentor.languages?.map((lang) => (
                            <Badge key={lang} variant="secondary" className="rounded-lg">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-semibold">{mentor.experience_years} years</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Response Rate</p>
                        <p className="font-semibold">{(mentor.response_rate * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {mentor.bio && (
            <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem] mb-8">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black">About</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {mentor.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Mentoring Philosophy */}
          {mentor.mentoring_philosophy && (
            <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem] mb-8">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Mentoring Philosophy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {mentor.mentoring_philosophy}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Teaching Skills */}
          {teachingSkills.length > 0 && (
            <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem] mb-8">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Skills ({teachingSkills.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="grid md:grid-cols-2 gap-4">
                  {teachingSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-4 rounded-2xl bg-background/50 border border-border hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg">{skill.skill?.name}</h3>
                        {skill.years_experience > 0 && (
                          <Badge variant="secondary" className="rounded-lg text-xs">
                            {skill.years_experience}y exp
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-muted-foreground">
                            Level: {skill.proficiency_level}/5
                          </span>
                        </div>
                        {skill.hourly_rate && (
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-muted-foreground">
                              ${skill.hourly_rate}/hour
                            </span>
                          </div>
                        )}
                        {skill.certifications && skill.certifications.length > 0 && (
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-muted-foreground">
                              {skill.certifications.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          {mentor.reviews && mentor.reviews.length > 0 && (
            <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem]">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  Reviews ({mentor.reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-4">
                  {mentor.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 rounded-2xl bg-background/50 border border-border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold">{review.reviewer?.full_name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.content && (
                        <p className="text-sm text-muted-foreground mt-2">{review.content}</p>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
