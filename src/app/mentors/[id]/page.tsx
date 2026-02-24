import { MentorDetailContent } from '@/components/mentors/mentor-detail-content'

export default async function MentorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MentorDetailContent mentorId={id} />
}
