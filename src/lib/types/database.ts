export type UserRole = 'learner' | 'mentor' | 'dual' | 'admin'
export type SessionStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
export type SessionType = 'one_time' | 'recurring' | 'group'
export type NotificationType = 'session_request' | 'session_confirmed' | 'session_cancelled' | 'new_message' | 'review_reminder' | 'system'
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed'
export type ReportType = 'user' | 'session' | 'message' | 'review'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  mentoring_philosophy: string | null
  role: UserRole
  is_verified: boolean
  is_active: boolean
  location_city: string
  location_radius_km: number
  languages: string[]
  experience_years: number
  timezone: string
  trust_score: number
  total_sessions_as_mentor: number
  total_sessions_as_learner: number
  response_rate: number
  last_active_at: string
  created_at: string
  updated_at: string
}

export interface SkillCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  parent_id: string | null
  created_at: string
}

export interface Skill {
  id: string
  name: string
  category_id: string | null
  description: string | null
  difficulty_level: number
  is_approved: boolean
  created_at: string
  category?: SkillCategory
}

export interface UserSkill {
  id: string
  user_id: string
  skill_id: string
  proficiency_level: number
  is_teaching: boolean
  is_learning: boolean
  years_experience: number
  hourly_rate: number | null
  certifications: string[] | null
  created_at: string
  skill?: Skill
  user?: Profile
}

export interface Availability {
  id: string
  user_id: string
  day_of_week: number | null
  start_time: string
  end_time: string
  is_recurring: boolean
  specific_date: string | null
  created_at: string
}

export interface Session {
  id: string
  mentor_id: string | null
  learner_id: string | null
  skill_id: string | null
  session_type: SessionType
  status: SessionStatus
  title: string
  description: string | null
  scheduled_at: string
  duration_minutes: number
  location_type: string
  location_details: string | null
  meeting_link: string | null
  price: number
  mentor_notes: string | null
  learner_notes: string | null
  cancelled_by: string | null
  cancellation_reason: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  mentor?: Profile
  learner?: Profile
  skill?: Skill
}

export interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message_at: string
  is_locked: boolean
  locked_at: string | null
  created_at: string
  participant_1_profile?: Profile
  participant_2_profile?: Profile
  last_message?: Message
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string | null
  content: string
  message_type: string
  file_url: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  sender?: Profile
}

export interface Review {
  id: string
  session_id: string
  reviewer_id: string | null
  reviewee_id: string | null
  rating: number
  content: string | null
  is_visible: boolean
  visible_after: string | null
  helpful_count: number
  created_at: string
  reviewer?: Profile
  reviewee?: Profile
  session?: Session
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string | null
  reported_user_id: string | null
  reported_session_id: string | null
  reported_message_id: string | null
  report_type: ReportType
  reason: string
  details: string | null
  status: ReportStatus
  reviewed_by: string | null
  reviewed_at: string | null
  resolution_notes: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'last_active_at'>
        Update: Partial<Profile>
      }
      skill_categories: {
        Row: SkillCategory
        Insert: Omit<SkillCategory, 'id' | 'created_at'>
        Update: Partial<SkillCategory>
      }
      skills: {
        Row: Skill
        Insert: Omit<Skill, 'id' | 'created_at'>
        Update: Partial<Skill>
      }
      user_skills: {
        Row: UserSkill
        Insert: Omit<UserSkill, 'id' | 'created_at'>
        Update: Partial<UserSkill>
      }
      availability: {
        Row: Availability
        Insert: Omit<Availability, 'id' | 'created_at'>
        Update: Partial<Availability>
      }
      sessions: {
        Row: Session
        Insert: Omit<Session, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Session>
      }
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, 'id' | 'created_at'>
        Update: Partial<Conversation>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: Partial<Message>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at'>
        Update: Partial<Review>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Notification>
      }
      reports: {
        Row: Report
        Insert: Omit<Report, 'id' | 'created_at'>
        Update: Partial<Report>
      }
    }
  }
}
