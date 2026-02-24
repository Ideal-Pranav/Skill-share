'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, MapPin, Video, Users, Zap, ArrowLeft, BookOpen, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import type { Skill, Profile, Session } from '@/lib/types/database'

interface MentorWithSkills extends Profile {
  teaching_skills?: Skill[]
}

interface LearnerWithSkills extends Profile {
  learning_skills?: Skill[]
}

type SessionRole = 'as_learner' | 'as_teacher'

export function SessionCreateContent() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [mentors, setMentors] = useState<MentorWithSkills[]>([])
  const [learners, setLearners] = useState<LearnerWithSkills[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [sessionRole, setSessionRole] = useState<SessionRole>(
    profile?.role === 'mentor' ? 'as_teacher' : 'as_learner'
  )
  const [otherUserId, setOtherUserId] = useState<string>('')
  const [skillId, setSkillId] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [scheduledAt, setScheduledAt] = useState<string>('')
  const [durationMinutes, setDurationMinutes] = useState<string>('60')
  const [locationType, setLocationType] = useState<string>('online')
  const [meetingLink, setMeetingLink] = useState<string>('')
  const [locationDetails, setLocationDetails] = useState<string>('')
  const [price, setPrice] = useState<string>('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setError(null)

      // Fetch mentors
      const { data: mentorsData, error: mentorsError } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['mentor', 'dual'])
        .eq('is_active', true)
        .neq('id', user?.id)

      if (mentorsError) throw mentorsError

      // Fetch learners
      const { data: learnersData, error: learnersError } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['learner', 'dual'])
        .eq('is_active', true)
        .neq('id', user?.id)

      if (learnersError) throw learnersError

      // Fetch skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .eq('is_approved', true)
        .order('name', { ascending: true })

      if (skillsError) throw skillsError

      setMentors((mentorsData as MentorWithSkills[]) || [])
      setLearners((learnersData as LearnerWithSkills[]) || [])
      setSkills(skillsData as Skill[] || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      console.error('Error fetching data:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (!user || !profile) {
        throw new Error('User not authenticated')
      }

      if (!otherUserId || !skillId || !title || !scheduledAt) {
        throw new Error('Please fill in all required fields')
      }

      // Determine mentor and learner based on role
      let sessionData: Partial<Session>

      if (sessionRole === 'as_learner') {
        sessionData = {
          mentor_id: otherUserId,
          learner_id: user.id,
          skill_id: skillId,
          session_type: 'one_time',
          status: 'pending',
          title,
          description: description || null,
          scheduled_at: new Date(scheduledAt).toISOString(),
          duration_minutes: parseInt(durationMinutes),
          location_type: locationType,
          location_details: locationDetails || null,
          meeting_link: meetingLink || null,
          price: parseFloat(price) || 0,
          learner_notes: null,
          mentor_notes: null,
        }
      } else {
        // as_teacher
        sessionData = {
          mentor_id: user.id,
          learner_id: otherUserId,
          skill_id: skillId,
          session_type: 'one_time',
          status: 'pending',
          title,
          description: description || null,
          scheduled_at: new Date(scheduledAt).toISOString(),
          duration_minutes: parseInt(durationMinutes),
          location_type: locationType,
          location_details: locationDetails || null,
          meeting_link: meetingLink || null,
          price: parseFloat(price) || 0,
          learner_notes: null,
          mentor_notes: null,
        }
      }

      const { data, error: insertError } = await supabase
        .from('sessions')
        .insert([sessionData as Partial<Session>])
        .select()

      if (insertError) throw insertError

      if (data && data[0]) {
        router.push(`/sessions?created=${data[0].id}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session'
      console.error('Error creating session:', err)
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const canBeTeacher = profile?.role === 'mentor' || profile?.role === 'dual'
  const canBeLearner = profile?.role === 'learner' || profile?.role === 'dual'

  const otherUsers = sessionRole === 'as_learner' ? mentors : learners
  const otherUserLabel = sessionRole === 'as_learner' ? 'Mentor' : 'Learner'

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 px-4 pb-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-96" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 px-4 pb-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/sessions">
              <Button variant="ghost" className="mb-4 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sessions
              </Button>
            </Link>
            <h1 className="text-4xl font-black tracking-tight mb-2">Create a Session</h1>
            <p className="text-xl text-muted-foreground">
              Schedule a learning session
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 font-semibold">
              {error}
            </div>
          )}

          {/* Role Selection (if user can be both) */}
          {canBeTeacher && canBeLearner && (
            <div className="mb-8 grid grid-cols-2 gap-4">
              <Card
                className={`border-2 rounded-[2rem] cursor-pointer transition-all ${
                  sessionRole === 'as_learner'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card/40 hover:border-primary/50'
                }`}
                onClick={() => setSessionRole('as_learner')}
              >
                <CardContent className="p-6 text-center">
                  <GraduationCap className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-bold text-lg mb-1">Book as Learner</h3>
                  <p className="text-sm text-muted-foreground">Learn from a mentor</p>
                </CardContent>
              </Card>

              <Card
                className={`border-2 rounded-[2rem] cursor-pointer transition-all ${
                  sessionRole === 'as_teacher'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card/40 hover:border-primary/50'
                }`}
                onClick={() => setSessionRole('as_teacher')}
              >
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-bold text-lg mb-1">Create as Teacher</h3>
                  <p className="text-sm text-muted-foreground">Teach a learner</p>
                </CardContent>
              </Card>
            </div>
          )}

          {otherUsers.length === 0 ? (
            <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem]">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg font-semibold text-muted-foreground mb-4">
                  No {otherUserLabel.toLowerCase()}s available
                </p>
                <p className="text-muted-foreground mb-6">
                  Please try again later or browse available {otherUserLabel.toLowerCase()}s
                </p>
                <Link href={sessionRole === 'as_learner' ? '/mentors' : '/explore'}>
                  <Button className="rounded-xl">
                    Browse {otherUserLabel}s
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-card/40 backdrop-blur-xl rounded-[2.5rem]">
              <CardHeader className="p-8 pb-6">
                <CardTitle className="text-2xl font-black">Session Details</CardTitle>
                <CardDescription>
                  Fill in the details to create your session
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-0">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* User Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="other_user" className="text-base font-bold">
                      Select {otherUserLabel} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={otherUserId} onValueChange={setOtherUserId}>
                      <SelectTrigger id="other_user" className="h-12 rounded-xl border-border bg-background">
                        <SelectValue placeholder={`Choose a ${otherUserLabel.toLowerCase()}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {otherUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-3">
                              <span>{user.full_name}</span>
                              <Badge variant="outline" className="text-xs">
                                Trust: {user.trust_score.toFixed(1)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Skill Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="skill" className="text-base font-bold">
                      Skill <span className="text-red-500">*</span>
                    </Label>
                    <Select value={skillId} onValueChange={setSkillId}>
                      <SelectTrigger id="skill" className="h-12 rounded-xl border-border bg-background">
                        <SelectValue placeholder="Choose a skill..." />
                      </SelectTrigger>
                      <SelectContent>
                        {skills.map((skill) => (
                          <SelectItem key={skill.id} value={skill.id}>
                            {skill.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base font-bold">
                      Session Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Learn React Basics"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12 rounded-xl border-border bg-background"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-bold">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder={
                        sessionRole === 'as_learner'
                          ? 'Tell the mentor what you want to learn...'
                          : 'Describe what you will teach...'
                      }
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl border-border bg-background min-h-24"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-3">
                    <Label htmlFor="scheduled_at" className="text-base font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date & Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="h-12 rounded-xl border-border bg-background"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-3">
                    <Label htmlFor="duration" className="text-base font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Duration (minutes)
                    </Label>
                    <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                      <SelectTrigger id="duration" className="h-12 rounded-xl border-border bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="150">2.5 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Type */}
                  <div className="space-y-3">
                    <Label htmlFor="location_type" className="text-base font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location Type
                    </Label>
                    <Select value={locationType} onValueChange={setLocationType}>
                      <SelectTrigger id="location_type" className="h-12 rounded-xl border-border bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Online
                          </div>
                        </SelectItem>
                        <SelectItem value="in_person">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            In Person
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Meeting Link */}
                  {locationType === 'online' && (
                    <div className="space-y-3">
                      <Label htmlFor="meeting_link" className="text-base font-bold">
                        Meeting Link (Google Meet, Zoom, etc.)
                      </Label>
                      <Input
                        id="meeting_link"
                        placeholder="https://meet.google.com/..."
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        className="h-12 rounded-xl border-border bg-background"
                      />
                    </div>
                  )}

                  {/* Location Details */}
                  {locationType === 'in_person' && (
                    <div className="space-y-3">
                      <Label htmlFor="location_details" className="text-base font-bold">
                        Location Details
                      </Label>
                      <Textarea
                        id="location_details"
                        placeholder="Address, room number, landmarks, etc."
                        value={locationDetails}
                        onChange={(e) => setLocationDetails(e.target.value)}
                        className="rounded-xl border-border bg-background min-h-20"
                      />
                    </div>
                  )}

                  {/* Price */}
                  <div className="space-y-3">
                    <Label htmlFor="price" className="text-base font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Price (optional)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-12 rounded-xl border-border bg-background"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Link href="/sessions" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-xl font-bold"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={submitting || !otherUserId || !skillId || !title || !scheduledAt}
                      className="flex-1 h-12 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {submitting ? 'Creating...' : 'Create Session'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
