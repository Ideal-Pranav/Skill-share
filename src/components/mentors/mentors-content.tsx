'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, MapPin, Star, CheckCircle2, MessageSquare, Calendar } from 'lucide-react'
import type { Profile, UserSkill, Skill } from '@/lib/types/database'

interface MentorWithSkills extends Profile {
  skills: (UserSkill & { skill: Skill })[]
}

export function MentorsContent() {
  const supabase = createClient()
  const [mentors, setMentors] = useState<MentorWithSkills[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchMentors()
  }, [])

  const fetchMentors = async () => {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['mentor', 'dual'])
      .eq('is_active', true)
      .order('trust_score', { ascending: false })

    if (profilesData) {
      const mentorsWithSkills = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: skillsData } = await supabase
            .from('user_skills')
            .select('*, skill:skills(*)')
            .eq('user_id', profile.id)
            .eq('is_teaching', true)
          
          return {
            ...profile,
            skills: skillsData || []
          } as MentorWithSkills
        })
      )
      setMentors(mentorsWithSkills)
    }
    
    setLoading(false)
  }

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = 
      mentor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.skills.some(s => s.skill?.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 px-4 pb-10">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 px-4 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Find Mentors</h1>
            <p className="text-muted-foreground">
              Connect with experienced mentors in Nashik who can guide your learning journey
            </p>
          </div>

          <div className="relative max-w-xl mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, skill, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          {filteredMentors.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No mentors found</h3>
              <p className="text-muted-foreground">Try adjusting your search or check back later</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function MentorCard({ mentor }: { mentor: MentorWithSkills }) {
  return (
    <Card className="border-border bg-card hover:border-primary/50 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-primary/30">
            <AvatarImage src={mentor.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {mentor.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{mentor.full_name}</h3>
              {mentor.is_verified && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {mentor.location_city}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium">{mentor.trust_score?.toFixed(1) || '0.0'}</span>
              <span className="text-xs text-muted-foreground">
                ({mentor.total_sessions_as_mentor} sessions)
              </span>
            </div>
          </div>
        </div>

        {mentor.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {mentor.bio}
          </p>
        )}

        {mentor.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {mentor.skills.slice(0, 4).map((us) => (
              <Badge key={us.id} variant="secondary" className="text-xs">
                {us.skill?.name}
              </Badge>
            ))}
            {mentor.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.skills.length - 4} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-border">
          <Link href={`/mentors/${mentor.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
          <Link href={`/messages?user=${mentor.id}`}>
            <Button variant="ghost" size="icon">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/sessions/new?mentor=${mentor.id}`}>
            <Button size="icon" className="bg-primary hover:bg-primary/90">
              <Calendar className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
