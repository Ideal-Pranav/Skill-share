'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, MapPin, Star, CheckCircle2, MessageSquare, Calendar, Globe, ShieldCheck, Sparkles, Filter, ArrowRight, Users } from 'lucide-react'
import type { Profile, UserSkill, Skill } from '@/lib/types/database'
import { LOCATIONS, type CountryCode } from '@/lib/constants'

interface MentorWithSkills extends Profile {
  skills: (UserSkill & { skill: Skill })[]
}

export function MentorsContent() {
  const supabase = createClient()
  const [mentors, setMentors] = useState<MentorWithSkills[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Location filters
    const [countryFilter, setCountryFilter] = useState<string>('all')
    const [stateFilter, setStateFilter] = useState<string>('all')
    const [cityFilter, setCityFilter] = useState<string>('all')

    // Handle Country Change
    const handleCountryChange = (value: string) => {
      setCountryFilter(value)
      setStateFilter('all')
      setCityFilter('all')
    }

    // Handle State Change
    const handleStateChange = (value: string) => {
      setStateFilter(value)
      setCityFilter('all')
    }


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

  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => {
      const matchesSearch = 
        mentor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.skills.some(s => s.skill?.name.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCountry = countryFilter === 'all' || mentor.country?.toLowerCase() === countryFilter.toLowerCase()
      const matchesState = stateFilter === 'all' || mentor.state?.toLowerCase() === stateFilter.toLowerCase()
      const matchesCity = cityFilter === 'all' || mentor.city?.toLowerCase() === cityFilter.toLowerCase()
      
      return matchesSearch && matchesCountry && matchesState && matchesCity
    })
  }, [mentors, searchQuery, countryFilter, stateFilter, cityFilter])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 pb-10">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-4 w-96 mb-12" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80 rounded-[2.5rem]" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-24 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
              <Sparkles className="w-3 h-3 mr-2" />
              Elite Mentors
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Find Your <span className="text-primary">Perfect Guide</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Connect with verified experts from around the world. Filter by location 
              to find mentors who understand your local context.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <Card className="mb-12 border-border bg-card/50 backdrop-blur-xl rounded-[2.5rem] p-2 overflow-hidden shadow-2xl shadow-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search by name, skill, or industry expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-12 pr-4 bg-background border-border rounded-2xl text-lg focus:ring-primary/20"
                  />
                </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Select value={countryFilter} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                        <Globe className="w-4 h-4 mr-2 opacity-50 text-primary" />
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Global (All Countries)</SelectItem>
                        {Object.entries(LOCATIONS).map(([code, data]) => (
                          <SelectItem key={code} value={code}>{data.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <AnimatePresence mode="popLayout">
                      {countryFilter !== 'all' && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          <Select value={stateFilter} onValueChange={handleStateChange}>
                            <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                              <MapPin className="w-4 h-4 mr-2 opacity-50 text-primary" />
                              <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Any State</SelectItem>
                              {Object.entries(LOCATIONS[countryFilter as CountryCode].states).map(([code, data]) => (
                                <SelectItem key={code} value={code}>{data.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode="popLayout">
                      {stateFilter !== 'all' && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          <Select value={cityFilter} onValueChange={setCityFilter}>
                            <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                              <MapPin className="w-4 h-4 mr-2 opacity-50 text-primary" />
                              <SelectValue placeholder="City" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Any City</SelectItem>
                              {LOCATIONS[countryFilter as CountryCode].states[stateFilter as keyof typeof LOCATIONS[CountryCode]['states']].cities.map((city) => (
                                <SelectItem key={city} value={city.toLowerCase()}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

              </div>
            </CardContent>
          </Card>

          <AnimatePresence mode="popLayout">
            {filteredMentors.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-32 bg-card/30 rounded-[3rem] border border-dashed border-border"
              >
                <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No mentors found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Try broadening your location filters or search query. We&apos;re 
                  onboarding new experts daily.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('')
                    setCountryFilter('all')
                    setStateFilter('all')
                    setCityFilter('all')
                  }}
                  className="mt-8 rounded-xl"
                >
                  Reset All Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredMentors.map((mentor, idx) => (
                  <MentorCard key={mentor.id} mentor={mentor} index={idx} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

function MentorCard({ mentor, index }: { mentor: MentorWithSkills; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Card className="h-full border-border bg-card/60 backdrop-blur-sm hover:bg-card hover:border-primary/50 transition-all duration-500 rounded-[2.5rem] overflow-hidden group shadow-lg hover:shadow-2xl hover:shadow-primary/10 flex flex-col">
        <CardContent className="p-8 flex-1">
          <div className="flex items-start gap-6 mb-8">
            <div className="relative">
              <Avatar className="w-20 h-20 border-2 border-primary/30 p-1 bg-background">
                <AvatarImage src={mentor.avatar_url || ''} className="rounded-full object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {mentor.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {mentor.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-background rounded-full p-0.5 shadow-lg">
                  <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 pt-2">
              <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">{mentor.full_name}</h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span className="truncate">{mentor.city || mentor.location_city || 'Global'}, {mentor.country || 'WW'}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-lg text-xs font-bold">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {mentor.trust_score?.toFixed(1) || '0.0'}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  {mentor.total_sessions_as_mentor} Sessions
                </span>
              </div>
            </div>
          </div>

          {mentor.bio && (
            <p className="text-sm text-muted-foreground mb-8 line-clamp-3 leading-relaxed">
              {mentor.bio}
            </p>
          )}

          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60">Skills for Transfer</div>
            <div className="flex flex-wrap gap-2">
              {mentor.skills.slice(0, 3).map((us) => (
                <Badge key={us.id} variant="secondary" className="bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors py-1 px-3 rounded-xl text-xs font-medium">
                  {us.skill?.name}
                </Badge>
              ))}
              {mentor.skills.length > 3 && (
                <Badge variant="outline" className="border-border text-[10px] font-bold py-1 px-2 rounded-xl">
                  +{mentor.skills.length - 3} More
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        <div className="p-8 pt-0 flex gap-3">
          <Link href={`/mentors/${mentor.id}`} className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-2xl border-border hover:bg-accent group-hover:border-primary/50 transition-all font-bold">
              View Matrix
            </Button>
          </Link>
          <Link href={`/messages?user=${mentor.id}`}>
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted/30 hover:bg-primary hover:text-white transition-all">
              <MessageSquare className="w-5 h-5" />
            </Button>
          </Link>
          <Link href={`/sessions/new?mentor=${mentor.id}`}>
            <Button size="icon" className="h-12 w-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 transition-all">
              <Calendar className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}
