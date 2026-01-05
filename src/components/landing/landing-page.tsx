'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { 
  Sparkles, ArrowRight, Users, BookOpen, Award, MapPin, 
  Code, Palette, Briefcase, Globe, GraduationCap, Heart,
  Star, CheckCircle2, Zap
} from 'lucide-react'

const categories = [
  { name: 'Technology', icon: Code, color: 'from-blue-500 to-cyan-500', skills: 8 },
  { name: 'Creative Arts', icon: Palette, color: 'from-pink-500 to-rose-500', skills: 5 },
  { name: 'Business', icon: Briefcase, color: 'from-amber-500 to-orange-500', skills: 5 },
  { name: 'Languages', icon: Globe, color: 'from-emerald-500 to-teal-500', skills: 5 },
  { name: 'Academic', icon: GraduationCap, color: 'from-violet-500 to-purple-500', skills: 5 },
  { name: 'Lifestyle', icon: Heart, color: 'from-red-500 to-pink-500', skills: 4 },
]

const features = [
  {
    icon: Users,
    title: 'Local Community',
    description: 'Connect with mentors and learners in Nashik. Build meaningful relationships that go beyond the screen.',
  },
  {
    icon: BookOpen,
    title: 'Skill Exchange',
    description: 'Teach what you know, learn what you don\'t. Every skill has value in our community.',
  },
  {
    icon: Award,
    title: 'Trust & Reputation',
    description: 'Build your reputation through verified sessions and honest reviews from real learners.',
  },
  {
    icon: MapPin,
    title: 'Meet In Person',
    description: 'Schedule sessions online or meet in person at local cafes, libraries, or co-working spaces.',
  },
]

const stats = [
  { value: '36+', label: 'Skills Available' },
  { value: '7', label: 'Categories' },
  { value: 'Nashik', label: 'Starting City' },
  { value: 'Free', label: 'To Join' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-background to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="mb-6 border-emerald-500/50 text-emerald-400">
              <Sparkles className="w-3 h-3 mr-1" />
              Now live in Nashik
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Learn from{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Local Experts
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with skilled mentors in your community. Whether you want to learn coding, 
              master a new language, or pick up a creative skill — find the perfect guide nearby.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 h-12 text-lg">
                  Start Learning
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 text-lg">
                  Explore Skills
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Skill Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse through diverse categories and find the perfect skill to learn or teach
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/explore?category=${category.name.toLowerCase()}`}>
                  <Card className="group cursor-pointer border-border hover:border-emerald-500/50 transition-all duration-300 bg-card hover:bg-card/80">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm">{category.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{category.skills} skills</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why SkillShare Nashik?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;re building a community where knowledge flows freely between neighbors
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-border bg-card/50 hover:bg-card transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-card/50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                How It Works
              </h2>
              
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Create Your Profile', desc: 'Sign up and tell us about your skills and what you want to learn' },
                  { step: '02', title: 'Find Your Match', desc: 'Browse mentors or learners based on skills, location, and availability' },
                  { step: '03', title: 'Book a Session', desc: 'Schedule a time that works for both of you — online or in person' },
                  { step: '04', title: 'Learn & Grow', desc: 'Complete sessions, leave reviews, and build your reputation' },
                ].map((item, index) => (
                  <motion.div 
                    key={item.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
              <Card className="relative border-border bg-card">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-2xl font-bold text-slate-900">
                      P
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Priya Sharma</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        Nashik, Maharashtra
                      </div>
                    </div>
                    <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="secondary">React.js</Badge>
                    <Badge variant="secondary">JavaScript</Badge>
                    <Badge variant="secondary">Web Dev</Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    &quot;Teaching web development to beginners for 3 years. I believe in learning by building real projects together.&quot;
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="font-semibold">4.9</span>
                      <span className="text-muted-foreground">(24 reviews)</span>
                    </div>
                    <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500">
                      <Zap className="w-4 h-4 mr-2" />
                      Book Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of learners and mentors in Nashik. Whether you want to pick up a new skill 
              or share your expertise, there&apos;s a place for you here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 h-12 text-lg">
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/mentors">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 text-lg">
                  Browse Mentors
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-slate-900" />
              </div>
              <span className="font-semibold">SkillShare Nashik</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Building a community of learners and teachers in Nashik.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
