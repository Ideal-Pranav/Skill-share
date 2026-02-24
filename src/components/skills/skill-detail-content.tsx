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
  MapPin, Star, CheckCircle2, MessageSquare, ArrowLeft, Award, TrendingUp,
  BookOpen, Zap, Users, Clock, Briefcase, Shield
} from 'lucide-react'
import type { Skill, SkillCategory, UserSkill, Profile } from '@/lib/types/database'

interface SkillWithTeachers extends Skill {
  category?: SkillCategory
  teachers?: Array<{
    id: string
    user_id: string
    proficiency_level: number
    hourly_rate: number | null
    certifications: string[] | null
    years_experience: number
    user?: Profile
  }>
}

const difficultyLabels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
const difficultyColors = ['bg-green-600', 'bg-blue-600', 'bg-orange-600', 'bg-red-600']

export function SkillDetailContent({ skillId }: { skillId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [skill, setSkill] = useState<SkillWithTeachers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSkillDetail()
  }, [skillId])

  const fetchSkillDetail = async () => {
    try {
      setError(null)

      // Fetch skill
      const { data: skillData, error: skillError } = await supabase
        .from('skills')
        .select('*')
        .eq('id', skillId)
        .single()

      if (skillError) throw skillError

      const skill = skillData as Skill

      // Fetch category if available
      let categoryData = null
      if (skill.category_id) {
        const { data: catData } = await supabase
          .from('skill_categories')
          .select('*')
          .eq('id', skill.category_id)
          .single()
        categoryData = catData as SkillCategory | null
      }

      // Fetch teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from('user_skills')
        .select('id, user_id, proficiency_level, hourly_rate, certifications, years_experience')
        .eq('skill_id', skillId)
        .eq('is_teaching', true)

      if (teachersError) throw teachersError

      const teachers = (teachersData || []) as Array<{
        id: string
        user_id: string
        proficiency_level: number
        hourly_rate: number | null
        certifications: string[] | null
        years_experience: number
      }>

      // Fetch teacher profiles
      const teacherIds = teachers.map(t => t.user_id).filter(Boolean)
      let teacherProfiles: Record<string, Profile> = {}

      if (teacherIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', teacherIds)

        if (profilesData) {
          teacherProfiles = Object.fromEntries(
            (profilesData as Profile[]).map(p => [p.id, p])
          )
        }
      }

      const teachersWithProfiles = teachers.map(teacher => ({
        ...teacher,
        user: teacher.user_id ? teacherProfiles[teacher.user_id] : undefined
      }))

      setSkill({
        ...skill,
        category: categoryData || undefined,
        teachers: teachersWithProfiles
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load skill details'
      console.error('Error fetching skill:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <Skeleton className="h-48 w-full rounded-lg mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Skill not found</h1>
            <p className="text-muted-foreground mb-8">The skill you're looking for doesn't exist or has been removed.</p>
            <Link href="/explore">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Explore
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-start gap-4 mb-6">
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="gaps-1">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={`${difficultyColors[skill.difficulty_level - 1]} text-white border-0`}>
                {difficultyLabels[skill.difficulty_level - 1]}
              </Badge>
              {skill.category && (
                <Badge variant="outline" className="bg-background">
                  {skill.category.name}
                </Badge>
              )}
            </div>

            <h1 className="text-5xl font-bold mb-4 tracking-tight">{skill.name}</h1>

            {skill.description && (
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {skill.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  {skill.teachers?.length || 0} {(skill.teachers?.length || 0) === 1 ? 'Teacher' : 'Teachers'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teachers Section */}
      <div className="container mx-auto px-4 py-16">
        {skill.teachers && skill.teachers.length > 0 ? (
          <>
            <h2 className="text-3xl font-bold mb-8">Learn from Expert Teachers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skill.teachers.map(teacher => (
                <Card key={teacher.id} className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    {teacher.user && (
                      <>
                        <div className="flex items-start gap-4 mb-6">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={teacher.user.avatar_url || undefined} />
                            <AvatarFallback>{teacher.user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{teacher.user.full_name}</h3>
                              {teacher.user.is_verified && (
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            {teacher.user.location_city && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {teacher.user.location_city}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-muted/50 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm font-bold text-primary">
                              {teacher.years_experience} {teacher.years_experience === 1 ? 'yr' : 'yrs'}
                            </div>
                            <div className="text-xs text-muted-foreground">Experience</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold">
                              {['Beginner', 'Intermediate', 'Advanced', 'Expert'][teacher.proficiency_level - 1]}
                            </div>
                            <div className="text-xs text-muted-foreground">Level</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold">
                              {teacher.hourly_rate ? `$${teacher.hourly_rate}` : 'Free'}
                            </div>
                            <div className="text-xs text-muted-foreground">/hour</div>
                          </div>
                        </div>

                        {/* Certifications */}
                        {teacher.certifications && teacher.certifications.length > 0 && (
                          <div className="mb-6">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">CERTIFICATIONS</p>
                            <div className="flex flex-wrap gap-2">
                              {teacher.certifications.map((cert, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bio */}
                        {teacher.user.bio && (
                          <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                            {teacher.user.bio}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Link href={`/sessions/new?mentor=${teacher.user_id}`} className="flex-1">
                            <Button className="w-full" size="sm">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Book Session
                            </Button>
                          </Link>
                          <Link href={`/messages?user=${teacher.user_id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Teachers Yet</h3>
              <p className="text-muted-foreground mb-6">No one is currently teaching this skill. Check back soon!</p>
              <Link href="/explore">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Explore Other Skills
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
