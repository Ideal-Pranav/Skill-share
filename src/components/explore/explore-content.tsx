'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, Code, Palette, Briefcase, Globe, GraduationCap, Heart, Wrench, Star, Users } from 'lucide-react'
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
      mentorsRes.data.forEach((us: UserSkill) => {
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
        <main className="pt-20 px-4 pb-10">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-40" />
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
            <h1 className="text-3xl font-bold mb-2">Explore Skills</h1>
            <p className="text-muted-foreground">
              Discover skills to learn or find learners for skills you can teach
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-card border-border">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name.toLowerCase()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-48 bg-card border-border">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Beginner</SelectItem>
                <SelectItem value="2">Elementary</SelectItem>
                <SelectItem value="3">Intermediate</SelectItem>
                <SelectItem value="4">Advanced</SelectItem>
                <SelectItem value="5">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedCategory === 'all' && searchQuery === '' ? (
            <div className="space-y-10">
              {Object.entries(groupedSkills).map(([categoryName, categorySkills]) => {
                const IconComponent = categoryIcons[categoryName] || Code
                return (
                  <div key={categoryName}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">{categoryName}</h2>
                      <Badge variant="secondary">{categorySkills.length} skills</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {categorySkills.map((skill) => (
                        <SkillCard 
                          key={skill.id} 
                          skill={skill} 
                          mentorCount={mentorCounts[skill.id] || 0}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-4">
                {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredSkills.map((skill) => (
                  <SkillCard 
                    key={skill.id} 
                    skill={skill} 
                    mentorCount={mentorCounts[skill.id] || 0}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredSkills.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No skills found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SkillCard({ skill, mentorCount }: { skill: Skill; mentorCount: number }) {
  const difficultyLabels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert']
  
  return (
    <Link href={`/skills/${skill.id}`}>
      <Card className="h-full border-border bg-card hover:border-primary/50 transition-all duration-300 group cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              {skill.name}
            </h3>
            <Badge variant="outline" className="text-xs">
              {difficultyLabels[skill.difficulty_level - 1]}
            </Badge>
          </div>
          
          {skill.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {skill.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{mentorCount} mentor{mentorCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < skill.difficulty_level ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} 
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
