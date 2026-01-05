'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Sparkles, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import type { Skill, SkillCategory } from '@/lib/types/database'

export function OnboardingContent() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  
  const [bio, setBio] = useState(profile?.bio || '')
  const [mentoringPhilosophy, setMentoringPhilosophy] = useState(profile?.mentoring_philosophy || '')
  const [selectedTeachingSkills, setSelectedTeachingSkills] = useState<string[]>([])
  const [selectedLearningSkills, setSelectedLearningSkills] = useState<string[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchSkills()
  }, [user])

  const fetchSkills = async () => {
    const [categoriesRes, skillsRes] = await Promise.all([
      supabase.from('skill_categories').select('*').order('name'),
      supabase.from('skills').select('*, category:skill_categories(*)').eq('is_approved', true).order('name'),
    ])

    if (categoriesRes.data) setCategories(categoriesRes.data as SkillCategory[])
    if (skillsRes.data) setSkills(skillsRes.data as Skill[])
  }

  const handleSkillToggle = (skillId: string, isTeaching: boolean) => {
    if (isTeaching) {
      setSelectedTeachingSkills(prev => 
        prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
      )
    } else {
      setSelectedLearningSkills(prev => 
        prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
      )
    }
  }

  const handleNext = async () => {
    if (step === 1) {
      setLoading(true)
      const { error } = await supabase
        .from('profiles')
        .update({ bio, mentoring_philosophy: mentoringPhilosophy })
        .eq('id', user!.id)
      
      if (error) {
        toast.error('Failed to update profile')
        setLoading(false)
        return
      }
      setLoading(false)
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      setLoading(true)
      
      const skillsToInsert = [
        ...selectedTeachingSkills.map(skillId => ({
          user_id: user!.id,
          skill_id: skillId,
          is_teaching: true,
          is_learning: false,
          proficiency_level: 4,
          years_experience: 1,
        })),
        ...selectedLearningSkills.map(skillId => ({
          user_id: user!.id,
          skill_id: skillId,
          is_teaching: false,
          is_learning: true,
          proficiency_level: 1,
          years_experience: 0,
        })),
      ]

      if (skillsToInsert.length > 0) {
        const { error } = await supabase.from('user_skills').insert(skillsToInsert)
        if (error) {
          toast.error('Failed to save skills')
          setLoading(false)
          return
        }
      }

      await refreshProfile()
      toast.success('Profile setup complete!')
      router.push('/dashboard')
    }
  }

  const groupedSkills = skills.reduce((acc, skill) => {
    const categoryName = skill.category?.name || 'Other'
    if (!acc[categoryName]) acc[categoryName] = []
    acc[categoryName].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      
      <Card className="w-full max-w-2xl border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-slate-900" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {step === 1 && 'Tell us about yourself'}
            {step === 2 && 'What can you teach?'}
            {step === 3 && 'What do you want to learn?'}
          </CardTitle>
          <CardDescription className="text-slate-400">
            Step {step} of 3
          </CardDescription>
          
          <div className="flex gap-2 justify-center mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-colors ${
                  s <= step ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-300">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your background, and interests..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-24"
                />
              </div>
              
              {(profile?.role === 'mentor' || profile?.role === 'dual') && (
                <div className="space-y-2">
                  <Label htmlFor="philosophy" className="text-slate-300">Mentoring Philosophy</Label>
                  <Textarea
                    id="philosophy"
                    placeholder="What's your approach to teaching and mentoring?"
                    value={mentoringPhilosophy}
                    onChange={(e) => setMentoringPhilosophy(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-24"
                  />
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              {Object.entries(groupedSkills).map(([categoryName, categorySkills]) => (
                <div key={categoryName}>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">{categoryName}</h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant={selectedTeachingSkills.includes(skill.id) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${
                          selectedTeachingSkills.includes(skill.id)
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : 'hover:border-emerald-500/50'
                        }`}
                        onClick={() => handleSkillToggle(skill.id, true)}
                      >
                        {selectedTeachingSkills.includes(skill.id) && (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        )}
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              {Object.entries(groupedSkills).map(([categoryName, categorySkills]) => (
                <div key={categoryName}>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">{categoryName}</h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant={selectedLearningSkills.includes(skill.id) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${
                          selectedLearningSkills.includes(skill.id)
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                            : 'hover:border-cyan-500/50'
                        }`}
                        onClick={() => handleSkillToggle(skill.id, false)}
                      >
                        {selectedLearningSkills.includes(skill.id) && (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        )}
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {step === 3 ? 'Completing...' : 'Saving...'}
                </>
              ) : (
                <>
                  {step === 3 ? 'Complete Setup' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {step !== 1 && (
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="w-full text-slate-400"
            >
              Skip for now
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
