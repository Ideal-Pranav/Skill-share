'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { LogoLoop } from '@/components/ui/logo-loop'
import { 
  Sparkles, ArrowRight, Users, BookOpen, Award, MapPin, 
  Code, Palette, Briefcase, Globe, GraduationCap, Heart,
  Star, CheckCircle2, Zap, Layout, ShieldCheck, ZapOff,
  CloudLightning, MousePointer2
} from 'lucide-react'
import { useRef, useEffect } from 'react'

const categories = [
  { name: 'Technology', icon: Code, color: 'from-indigo-500 to-blue-500', skills: 850 },
  { name: 'Creative Arts', icon: Palette, color: 'from-violet-500 to-purple-500', skills: 420 },
  { name: 'Business', icon: Briefcase, color: 'from-blue-500 to-indigo-500', skills: 310 },
  { name: 'Languages', icon: Globe, color: 'from-sky-500 to-indigo-500', skills: 240 },
  { name: 'Academic', icon: GraduationCap, color: 'from-indigo-600 to-violet-600', skills: 560 },
  { name: 'Lifestyle', icon: Heart, color: 'from-violet-400 to-indigo-400', skills: 180 },
]

const partnerLogos = [
  { src: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', alt: 'Google' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', alt: 'Amazon' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', alt: 'Microsoft' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg', alt: 'Meta' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', alt: 'Netflix' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', alt: 'Stripe' },
]

const features = [
  {
    icon: Globe,
    title: 'Global Reach, Local Depth',
    description: 'Filter mentors by country, state, or city to find the perfect cultural and geographic match for your learning journey.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Expertise',
    description: 'Every mentor goes through a rigorous verification process to ensure high-quality, authentic educational experiences.',
  },
  {
    icon: CloudLightning,
    title: 'Real-time Sync',
    description: 'Experience seamless scheduling and real-time communication across all your devices, anytime, anywhere.',
  },
  {
    icon: Layout,
    title: 'Personalized Paths',
    description: 'Our intelligent matching system suggests learning paths based on your goals, location, and existing skill matrix.',
  },
]

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Mouse Glow Effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      mouseX.set(clientX)
      mouseY.set(clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500])

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30" ref={containerRef}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Main Glows */}
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[160px] animate-pulse delay-1000" />
          
          {/* Interactive Mouse Glow */}
          <motion.div
            style={{
              x: springX,
              y: springY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            className="fixed top-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-50 hidden md:block"
          />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-8 px-4 py-1 border-primary/20 bg-primary/5 text-primary backdrop-blur-sm animate-bounce-slow">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Revolutionizing Global Mentorship
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
              Master Any Skill with<br />
              <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
                World-Class Mentors
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              The premium skill-sharing ecosystem that connects ambitious learners with 
              industry experts across 150+ countries. Experience mentorship redefined.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="h-14 px-10 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-2xl shadow-primary/20 group transition-all duration-300 hover:scale-105">
                  Begin Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-border bg-background/50 backdrop-blur-md hover:bg-accent rounded-2xl transition-all duration-300">
                  Explore Programs
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Floating 3D-like Dashboard Preview */}
          <motion.div
            style={{ y: y1 }}
            className="mt-24 relative max-w-5xl mx-auto"
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.05)] bg-card/50 backdrop-blur-2xl">
              <div className="h-12 bg-muted/30 border-b border-border flex items-center px-6 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                </div>
                <div className="ml-4 h-6 w-64 bg-background/50 rounded-md border border-border flex items-center px-3 text-[10px] text-muted-foreground">
                  skillshare.global/dashboard
                </div>
              </div>
              <div className="p-8 aspect-video flex items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5">
                <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
                  <div className="h-40 rounded-2xl bg-background/80 border border-border p-4 shadow-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 mb-4" />
                    <div className="h-2 w-2/3 bg-muted rounded mb-2" />
                    <div className="h-2 w-1/2 bg-muted/50 rounded" />
                  </div>
                  <div className="h-40 rounded-2xl bg-background/80 border border-border p-4 shadow-xl translate-y-8">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 mb-4" />
                    <div className="h-2 w-2/3 bg-muted rounded mb-2" />
                    <div className="h-2 w-1/2 bg-muted/50 rounded" />
                  </div>
                  <div className="h-40 rounded-2xl bg-background/80 border border-border p-4 shadow-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 mb-4" />
                    <div className="h-2 w-2/3 bg-muted rounded mb-2" />
                    <div className="h-2 w-1/2 bg-muted/50 rounded" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-3xl blur-2xl" 
            />
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-12 -left-12 w-40 h-40 bg-violet-500/20 rounded-3xl blur-2xl" 
            />
          </motion.div>
        </div>
      </section>

      {/* Trust Bar / Logo Loop */}
      <section className="py-20 border-y border-border bg-card/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
            Empowering Teams At
          </p>
        </div>
        <div className="relative">
          <LogoLoop 
            logos={partnerLogos} 
            speed={40} 
            gap={80} 
            logoHeight={32}
            className="opacity-50 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0"
            fadeOut={true}
          />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">World-Class Skill Matrix</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Curated learning paths across every major industry. Verified mentors, 
              guaranteed growth.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="h-full"
              >
                <Link href={`/explore?category=${category.name.toLowerCase()}`} className="block h-full">
                  <Card className="group cursor-pointer border-border bg-card/40 backdrop-blur-sm hover:bg-card hover:border-primary/50 transition-all duration-500 rounded-[2.5rem] p-4 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 h-full">
                    <CardContent className="p-8 flex items-center gap-6 h-full">
                      <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:rotate-[15deg] transition-all duration-500 shadow-xl shadow-primary/10 shrink-0`}>
                        <category.icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                        <div className="flex items-center text-muted-foreground">
                          <span className="text-lg font-medium text-foreground">{category.skills}</span>
                          <span className="mx-2">•</span>
                          <span className="text-sm uppercase tracking-wider">Expert Mentors</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 shrink-0">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-32 bg-primary/[0.02] border-y border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -mr-96 -mt-96" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-6 uppercase tracking-[0.2em] text-[10px] py-1 px-4">
                  The Ecosystem
                </Badge>
                <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                  Engineered for<br />
                  <span className="text-primary">Global Excellence</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                  We&apos;ve built more than just a platform. SkillShare is a high-performance 
                  learning engine designed to remove barriers between curiosity and mastery.
                </p>

                  <div className="grid sm:grid-cols-2 gap-8">
                    {features.map((feature, idx) => (
                      <motion.div 
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="group h-full flex flex-col"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 group-hover:bg-primary group-hover:border-primary transition-all duration-300 shadow-lg group-hover:shadow-primary/20 shrink-0">
                          <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed flex-1">{feature.description}</p>
                      </motion.div>
                    ))}
                  </div>
              </motion.div>
            </div>

            <motion.div
              style={{ y: y2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-[3rem] overflow-hidden border border-border shadow-3xl aspect-[4/5] bg-card p-2">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-violet-500/10" />
                <div className="h-full w-full rounded-[2.5rem] bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-700" />
                
                {/* Overlay UI elements */}
                <div className="absolute top-10 left-10 p-6 bg-background/80 backdrop-blur-xl rounded-3xl border border-border shadow-2xl w-64">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification</div>
                      <div className="text-sm font-bold">Expert Approved</div>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-emerald-500" 
                    />
                  </div>
                </div>

                <div className="absolute bottom-10 right-10 p-6 bg-primary backdrop-blur-xl rounded-3xl shadow-2xl w-64 text-white">
                  <div className="text-3xl font-bold mb-2">15,000+</div>
                  <div className="text-xs uppercase tracking-[0.2em] opacity-80">Mentorship Sessions Completed</div>
                  <div className="mt-4 flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-muted" />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-primary bg-violet-400 flex items-center justify-center text-[10px] font-bold">+12k</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-[4rem] p-12 md:p-24 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />
            
            <h2 className="text-5xl md:text-7xl font-bold mb-8 relative z-10">
              Your Evolution<br />
              <span className="text-primary">Starts Here.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
              Join the elite circle of global learners and mentors. Scalable, secure, 
              and designed for the high-achievers of tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
              <Link href="/register">
                <Button size="lg" className="h-16 px-12 text-xl bg-primary text-primary-foreground hover:bg-primary/90 rounded-[2rem] shadow-xl shadow-primary/20">
                  Join the Community
                </Button>
              </Link>
              <Link href="/mentors">
                <Button size="lg" variant="outline" className="h-16 px-12 text-xl border-border bg-background/50 backdrop-blur-md rounded-[2rem]">
                  Meet the Mentors
                </Button>
              </Link>
            </div>
            
            <div className="mt-16 pt-16 border-t border-border/50 flex flex-wrap justify-center gap-12 grayscale opacity-40">
              <span className="text-2xl font-black">NASHIK.NY</span>
              <span className="text-2xl font-black">BERLIN.EDU</span>
              <span className="text-2xl font-black">LONDON.LAB</span>
              <span className="text-2xl font-black">TOKYO.TEC</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-border bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="text-2xl font-black tracking-tighter">SkillShare.</span>
              </Link>
              <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                Empowering the world through knowledge exchange. Premium mentorship for 
                the digital age, focused on community, trust, and global growth.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-primary">Platform</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link href="/explore" className="hover:text-primary transition-colors">Explore Matrix</Link></li>
                <li><Link href="/mentors" className="hover:text-primary transition-colors">Expert Mentors</Link></li>
                <li><Link href="/curriculum" className="hover:text-primary transition-colors">Curriculum</Link></li>
                <li><Link href="/enterprise" className="hover:text-primary transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-primary">Community</h4>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
                <li><Link href="/safety" className="hover:text-primary transition-colors">Safety & Trust</Link></li>
                <li><Link href="/cities" className="hover:text-primary transition-colors">Active Cities</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">Perspectives</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-border/50 text-sm text-muted-foreground">
            <p>© 2026 SkillShare Global. Built for the high-performance learners.</p>
            <div className="flex gap-8 font-medium">
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Excellence</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Charter</Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
