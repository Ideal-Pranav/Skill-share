'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MapPin, Globe, Search, ArrowRight, Building2, 
  Sparkles, Users, Navigation2, Compass, LayoutGrid, List
} from 'lucide-react'
import { LOCATIONS, type CountryCode } from '@/lib/constants'

export default function CitiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<string | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const allCities = useMemo(() => {
    const list: { city: string; state: string; country: string; countryCode: string; stateCode: string }[] = []
    Object.entries(LOCATIONS).forEach(([countryCode, countryData]) => {
      Object.entries(countryData.states).forEach(([stateCode, stateData]) => {
        stateData.cities.forEach(city => {
          list.push({
            city,
            state: stateData.name,
            country: countryData.name,
            countryCode,
            stateCode
          })
        })
      })
    })
    return list
  }, [])

  const filteredCities = useMemo(() => {
    return allCities.filter(item => {
      const matchesSearch = 
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.country.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCountry = selectedCountry === 'all' || item.countryCode === selectedCountry
      
      return matchesSearch && matchesCountry
    })
  }, [allCities, searchQuery, selectedCountry])

  const groupedCities = useMemo(() => {
    const grouped: Record<string, typeof filteredCities> = {}
    filteredCities.forEach(item => {
      if (!grouped[item.country]) grouped[item.country] = []
      grouped[item.country].push(item)
    })
    return grouped
  }, [filteredCities])

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-24 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary py-1 px-4">
              <Compass className="w-3.5 h-3.5 mr-2 animate-spin-slow" />
              Global Network
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Active <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Learning Hubs</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Explore our growing ecosystem of skill-sharing communities across the globe. 
              Find mentors in your local time zone or discover expertise from cultural centers worldwide.
            </p>
          </motion.div>

          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center justify-between">
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search city, state, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 bg-card/50 backdrop-blur-sm border-border rounded-2xl text-lg shadow-xl shadow-primary/5 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={selectedCountry === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCountry('all')}
                className="rounded-xl h-10 px-4"
              >
                All Regions
              </Button>
              {Object.entries(LOCATIONS).map(([code, data]) => (
                <Button
                  key={code}
                  variant={selectedCountry === code ? 'default' : 'outline'}
                  onClick={() => setSelectedCountry(code)}
                  className="rounded-xl h-10 px-4"
                >
                  {data.name}
                </Button>
              ))}
              
              <div className="h-8 w-px bg-border mx-2 hidden sm:block" />
              
              <div className="flex bg-muted/50 p-1 rounded-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={`h-8 w-8 rounded-lg ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={`h-8 w-8 rounded-lg ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Cities Display */}
          <AnimatePresence mode="wait">
            {filteredCities.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-32 bg-card/20 rounded-[3rem] border border-dashed border-border"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-primary/40" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No hubs found</h3>
                <p className="text-muted-foreground">We haven&apos;t expanded to this location yet. Check back soon!</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-20"
              >
                {Object.entries(groupedCities).map(([countryName, cities], idx) => (
                  <section key={countryName}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-px flex-1 bg-border" />
                      <div className="flex items-center gap-2 px-6 py-2 bg-primary/5 rounded-full border border-primary/10">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold uppercase tracking-[0.2em]">{countryName}</span>
                      </div>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className={
                      viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        : "space-y-3"
                    }>
                      {cities.map((item, cityIdx) => (
                        <CityCard 
                          key={`${item.countryCode}-${item.city}`} 
                          item={item} 
                          index={cityIdx}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Interactive Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>
    </div>
  )
}

function CityCard({ item, index, viewMode }: { item: any, index: number, viewMode: 'grid' | 'list' }) {
  const mentorCount = Math.floor(Math.random() * 450) + 50 // Mocked detail

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
      >
        <Link href={`/mentors?country=${item.countryCode}&state=${item.stateCode}&city=${item.city.toLowerCase()}`}>
          <Card className="group hover:border-primary/50 transition-all duration-300 bg-card/30 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{item.city}</h4>
                  <p className="text-xs text-muted-foreground">{item.state}, {item.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-primary">{mentorCount}+ Mentors</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Experts</div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -10 }}
    >
      <Link href={`/mentors?country=${item.countryCode}&state=${item.stateCode}&city=${item.city.toLowerCase()}`}>
        <Card className="group h-full border-border bg-card/40 backdrop-blur-xl hover:bg-card hover:border-primary/50 transition-all duration-500 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center group-hover:rotate-[15deg] transition-all duration-500 shadow-sm">
                <Navigation2 className="w-7 h-7 text-primary" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[10px] font-bold">
                Active Hub
              </Badge>
            </div>
            
            <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">{item.city}</h3>
            <p className="text-sm text-muted-foreground mb-6">{item.state}, {item.country}</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  Mentors
                </span>
                <span className="font-bold text-primary">{mentorCount}+</span>
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(mentorCount / 500) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-primary" 
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">View Experts</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
