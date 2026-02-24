'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/context/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Sparkles, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Globe, MapPin, Search } from 'lucide-react'
import type { Skill, SkillCategory } from '@/lib/types/database'

export function OnboardingContent() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  
  // Profile Data
  const [bio, setBio] = useState(profile?.bio || '')
  const [country, setCountry] = useState(profile?.country || '')
  const [state, setState] = useState(profile?.state || '')
  const [city, setCity] = useState(profile?.location_city || '')
  
  // Skill Data
  const [selectedTeachingSkills, setSelectedTeachingSkills] = useState<string[]>([])
  const [selectedLearningSkills, setSelectedLearningSkills] = useState<string[]>([])

  useEffect(() => {
    if (!user && !loading) {
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
      if (!bio || !country || !city) {
        toast.error('Please fill in your basic info and location')
        return
      }
      setLoading(true)
      const { error } = await supabase
        .from('profiles')
        .update({ bio, country, state, city })
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
      toast.success('Your matrix is ready!')
      router.push('/dashboard')
    }
  }

  const groupedSkills = skills.reduce((acc, skill) => {
    const categoryName = skill.category?.name || 'Other'
    if (!acc[categoryName]) acc[categoryName] = []
    acc[categoryName].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  const stepTitles = [
    "Identity & Location",
    "Expertise Transfer",
    "Growth Objectives"
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="border-border bg-card/60 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden">
          <CardHeader className="pt-12 px-12 text-center">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20"
            >
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-3xl font-black tracking-tight mb-2 uppercase">
              {stepTitles[step-1]}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              Step {step} of 3 • Configuring your profile for global mentorship
            </CardDescription>
            
            <div className="flex gap-3 justify-center mt-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-20 rounded-full transition-all duration-500 ${
                    s <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="p-12 pt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-primary">Global Residency</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Select value={country} onValueChange={setCountry}>
                            <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                              <Globe className="w-4 h-4 mr-2 opacity-50" />
                              <SelectValue placeholder="Country" />
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
                          <Input
                            placeholder="State/Region"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="h-12 bg-background border-border rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="h-12 bg-background border-border rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-primary">Professional Narrative</Label>
                      <Textarea
                        placeholder="Define your expertise, background, and what drives you. This is your primary pitch to the community."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="bg-background border-border rounded-2xl min-h-[140px] text-lg p-4 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <p className="text-muted-foreground">Select the skills you are qualified to teach or mentor others in.</p>
                    </div>
                    <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                      {Object.entries(groupedSkills).map(([categoryName, categorySkills]) => (
                        <div key={categoryName} className="space-y-3">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{categoryName}</h3>
                          <div className="flex flex-wrap gap-2">
                            {categorySkills.map((skill) => (
                              <Badge
                                key={skill.id}
                                variant={selectedTeachingSkills.includes(skill.id) ? 'default' : 'outline'}
                                className={`cursor-pointer px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                                  selectedTeachingSkills.includes(skill.id)
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                                    : 'hover:border-primary/50 hover:bg-primary/5'
                                }`}
                                onClick={() => handleSkillToggle(skill.id, true)}
                              >
                                {selectedTeachingSkills.includes(skill.id) && (
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                )}
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <p className="text-muted-foreground">Select the skills you wish to acquire or master through mentorship.</p>
                    </div>
                    <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                      {Object.entries(groupedSkills).map(([categoryName, categorySkills]) => (
                        <div key={categoryName} className="space-y-3">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{categoryName}</h3>
                          <div className="flex flex-wrap gap-2">
                            {categorySkills.map((skill) => (
                              <Badge
                                key={skill.id}
                                variant={selectedLearningSkills.includes(skill.id) ? 'default' : 'outline'}
                                className={`cursor-pointer px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                                  selectedLearningSkills.includes(skill.id)
                                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20 scale-105 border-violet-500'
                                    : 'hover:border-violet-500/50 hover:bg-violet-500/5'
                                }`}
                                onClick={() => handleSkillToggle(skill.id, false)}
                              >
                                {selectedLearningSkills.includes(skill.id) && (
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                )}
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-4 pt-12">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 h-14 rounded-2xl border-border hover:bg-accent font-bold text-lg"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold text-lg group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    {step === 3 ? 'Finalize Matrix' : 'Proceed'}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>

            {step !== 1 && (
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="w-full mt-6 text-muted-foreground hover:text-primary rounded-xl"
              >
                Configure later in settings
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
