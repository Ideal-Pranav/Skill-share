'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, Code, Palette, Briefcase, Globe, GraduationCap, Heart, Wrench, Star, Users, MapPin, Sparkles, ArrowRight } from 'lucide-react'
import type { Skill, SkillCategory, UserSkill } from '@/lib/types/database'

const categoryIcons: Record<string, React.ElementType> = {
  'Technology': Code,
  'Business': Briefcase,
  'Creative Arts': Palette,
  'Languages': Globe,
  'Academic': GraduationCap,
  'Lifestyle': Heart,
  'Trades': Wrench,
}

export function ExploreContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category')
  
  const supabase = createClient()
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [mentorCounts, setMentorCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  
  // Location filters
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [categoriesRes, skillsRes, mentorsRes] = await Promise.all([
      supabase.from('skill_categories').select('*').order('name'),
      supabase.from('skills').select('*, category:skill_categories(*)').eq('is_approved', true).order('name'),
      supabase.from('user_skills').select('skill_id').eq('is_teaching', true),
    ])

    if (categoriesRes.data) setCategories(categoriesRes.data as SkillCategory[])
    if (skillsRes.data) setSkills(skillsRes.data as Skill[])
    
    if (mentorsRes.data) {
      const counts: Record<string, number> = {}
      mentorsRes.data.forEach((us: any) => {
        counts[us.skill_id] = (counts[us.skill_id] || 0) + 1
      })
      setMentorCounts(counts)
    }
    
    setLoading(false)
  }

  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || 
        skill.category?.name.toLowerCase() === selectedCategory.toLowerCase()
      
      const matchesDifficulty = difficultyFilter === 'all' || 
        skill.difficulty_level === parseInt(difficultyFilter)
      
      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [skills, searchQuery, selectedCategory, difficultyFilter])

  const groupedSkills = useMemo(() => {
    const grouped: Record<string, Skill[]> = {}
    filteredSkills.forEach(skill => {
      const categoryName = skill.category?.name || 'Other'
      if (!grouped[categoryName]) grouped[categoryName] = []
      grouped[categoryName].push(skill)
    })
    return grouped
  }, [filteredSkills])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4 mb-8">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-48 rounded-[2rem]" />
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
              Global Skill Matrix
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Explore the <span className="text-primary">Ecosystem</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Discover industry-standard skills and connect with mentors across 
              continents. Your growth path, localized.
            </p>
          </motion.div>

          {/* Search and Advanced Filters */}
          <Card className="mb-12 border-border bg-card/50 backdrop-blur-xl rounded-[2.5rem] p-2 overflow-hidden shadow-2xl shadow-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-6">
                {/* Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="What skill would you like to master today?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-12 pr-4 bg-background border-border rounded-2xl text-lg focus:ring-primary/20"
                  />
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name.toLowerCase()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                      <SelectValue placeholder="Skill Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="1">Beginner</SelectItem>
                      <SelectItem value="2">Elementary</SelectItem>
                      <SelectItem value="3">Intermediate</SelectItem>
                      <SelectItem value="4">Advanced</SelectItem>
                      <SelectItem value="5">Expert</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                      <Globe className="w-4 h-4 mr-2 opacity-50" />
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Global</SelectItem>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="usa">USA</SelectItem>
                      <SelectItem value="uk">UK</SelectItem>
                      <SelectItem value="germany">Germany</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                      <MapPin className="w-4 h-4 mr-2 opacity-50" />
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any State</SelectItem>
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="california">California</SelectItem>
                      <SelectItem value="berlin">Berlin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                      <MapPin className="w-4 h-4 mr-2 opacity-50" />
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any City</SelectItem>
                      <SelectItem value="nashik">Nashik</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="pune">Pune</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence mode="popLayout">
            {selectedCategory === 'all' && searchQuery === '' ? (
              <div className="space-y-16">
                {Object.entries(groupedSkills).map(([categoryName, categorySkills]) => {
                  const IconComponent = categoryIcons[categoryName] || Code
                  return (
                    <motion.div 
                      key={categoryName}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{categoryName}</h2>
                          <p className="text-sm text-muted-foreground">{categorySkills.length} Verified Skills</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categorySkills.map((skill, idx) => (
                          <SkillCard 
                            key={skill.id} 
                            skill={skill} 
                            mentorCount={mentorCounts[skill.id] || 0}
                            index={idx}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <p className="text-lg font-medium text-muted-foreground">
                    <span className="text-foreground font-bold">{filteredSkills.length}</span> results matching your criteria
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredSkills.map((skill, idx) => (
                    <SkillCard 
                      key={skill.id} 
                      skill={skill} 
                      mentorCount={mentorCounts[skill.id] || 0}
                      index={idx}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {filteredSkills.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32 bg-card/30 rounded-[3rem] border border-dashed border-border mt-12"
            >
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No matching skills found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Try broadening your search or switching locations. We&apos;re constantly 
                adding new programs globally.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setDifficultyFilter('all')
                  setCountryFilter('all')
                }}
                className="mt-8 rounded-xl"
              >
                Reset All Filters
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

function SkillCard({ skill, mentorCount, index }: { skill: Skill; mentorCount: number; index: number }) {
  const difficultyLabels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert']
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-red-500']
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, rotateX: 2, rotateY: 2 }}
      className="perspective-1000"
    >
      <Link href={`/skills/${skill.id}`}>
        <Card className="h-full border-border bg-card/60 backdrop-blur-sm hover:bg-card hover:border-primary/50 transition-all duration-500 rounded-[2rem] overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-primary/10">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex flex-col gap-1">
                <Badge className={`${colors[skill.difficulty_level - 1]} text-white border-0 py-0.5 px-3 rounded-lg text-[10px] uppercase tracking-wider font-bold`}>
                  {difficultyLabels[skill.difficulty_level - 1]}
                </Badge>
              </div>
              <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-background group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                <ArrowRight className="w-4 h-4 group-hover:text-primary-foreground transition-colors" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">
              {skill.name}
            </h3>
            
            {skill.description && (
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                {skill.description}
              </p>
            )}
            
            <div className="flex items-center justify-between pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Users className="w-4 h-4" />
                <span className="text-sm">{mentorCount} Mentors</span>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full ${i < skill.difficulty_level ? colors[skill.difficulty_level - 1] : 'bg-muted'}`} 
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
