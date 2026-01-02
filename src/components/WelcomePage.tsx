import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ChartBar, 
  Sparkle, 
  Shield, 
  Function, 
  Users, 
  VideoCamera, 
  FileText,
  TrendUp,
  ArrowRight,
  CheckCircle,
  Lightning,
  Brain,
  Database,
  ChartLineUp,
  Play,
  X
} from '@phosphor-icons/react'

interface WelcomePageProps {
  onGetStarted: () => void
}

export function WelcomePage({ onGetStarted }: WelcomePageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [customVideoUrl, setCustomVideoUrl] = useState('')

  const features = [
    {
      id: 'pulse',
      icon: Sparkle,
      title: 'Tableau Pulse',
      description: 'AI-driven insights delivered proactively with smart prioritization',
      color: 'oklch(0.70 0.15 195)',
      bgColor: 'from-accent/10 via-card to-metric-purple/10',
      borderColor: 'border-accent/30'
    },
    {
      id: 'tableau',
      icon: ChartLineUp,
      title: 'Tableau Integration',
      description: 'Real embedded dashboards and comprehensive REST API showcase',
      color: 'oklch(0.60 0.18 290)',
      bgColor: 'from-metric-purple/10 via-card to-primary/10',
      borderColor: 'border-metric-purple/30'
    },
    {
      id: 'insights',
      icon: Brain,
      title: 'AI Insights Generator',
      description: 'GPT-4o powered analysis with confidence scoring and categorization',
      color: 'oklch(0.70 0.15 195)',
      bgColor: 'from-accent/10 via-card to-primary/10',
      borderColor: 'border-accent/30'
    },
    {
      id: 'seasonal',
      icon: TrendUp,
      title: 'Seasonal Intelligence',
      description: 'Automated pattern detection with quarterly forecasting and recommendations',
      color: 'oklch(0.70 0.15 70)',
      bgColor: 'from-warning/10 via-card to-accent/10',
      borderColor: 'border-warning/30'
    },
    {
      id: 'semantic',
      icon: Function,
      title: 'Semantic Layer',
      description: 'Business-friendly metric catalog with natural language search',
      color: 'oklch(0.60 0.18 290)',
      bgColor: 'from-metric-purple/10 via-card to-accent/10',
      borderColor: 'border-metric-purple/30'
    },
    {
      id: 'governance',
      icon: Shield,
      title: 'Data Governance',
      description: 'Enterprise-grade security, audit logging, and quality monitoring',
      color: 'oklch(0.65 0.15 145)',
      bgColor: 'from-success/10 via-card to-primary/10',
      borderColor: 'border-success/30'
    },
    {
      id: 'collaboration',
      icon: Users,
      title: 'Real-Time Collaboration',
      description: 'Live cursors, presence tracking, and threaded annotations',
      color: 'oklch(0.65 0.15 145)',
      bgColor: 'from-success/10 via-card to-accent/10',
      borderColor: 'border-success/30'
    },
    {
      id: 'replay',
      icon: VideoCamera,
      title: 'Session Replay & @Mentions',
      description: 'Record, playback, and collaborate with smart notifications',
      color: 'oklch(0.55 0.22 25)',
      bgColor: 'from-destructive/10 via-card to-accent/10',
      borderColor: 'border-destructive/30'
    },
    {
      id: 'reports',
      icon: FileText,
      title: 'Exportable Reports',
      description: 'Automated PDF, CSV, and JSON reports with scheduling',
      color: 'oklch(0.70 0.15 195)',
      bgColor: 'from-accent/10 via-card to-metric-purple/10',
      borderColor: 'border-accent/30'
    }
  ]

  const prizeCategories = [
    {
      title: 'Best Product Extensibility',
      description: 'Modular architecture with Tableau Developer Platform patterns',
      icon: Lightning
    },
    {
      title: 'Best Use of Semantic Modeling',
      description: 'Business-friendly metric catalog with natural language capabilities',
      icon: Database
    },
    {
      title: 'Best Data Layer Implementation',
      description: 'Comprehensive governance, security, and quality monitoring',
      icon: Shield
    },
    {
      title: 'Best Use of Actionable Analytics',
      description: 'Real-time collaboration, automated reports, and AI-driven insights',
      icon: Brain
    }
  ]

  const getEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`
    } else if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`
    }
    return url
  }

  const handlePlayDemo = (url?: string) => {
    const finalUrl = url || customVideoUrl
    if (finalUrl) {
      setVideoUrl(getEmbedUrl(finalUrl))
      setShowVideoModal(true)
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showVideoModal) {
        setShowVideoModal(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [showVideoModal])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="grid-background fixed inset-0 opacity-30" />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 px-4 py-2 bg-accent/20 text-accent border-accent/30 text-sm">
              Tableau Hackathon 2026 • Future of Analytics
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-gradient-accent">Analytics Intelligence</span>
              <br />
              <span className="text-foreground">Platform</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              An enterprise-grade analytics platform demonstrating the future of{' '}
              <span className="text-accent font-semibold">Tableau integration</span> with{' '}
              <span className="text-metric-purple font-semibold">AI-powered insights</span>,{' '}
              <span className="text-success font-semibold">real-time collaboration</span>, and{' '}
              <span className="text-warning font-semibold">semantic data modeling</span>
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 gap-3 glow-accent"
              >
                <ChartBar size={24} weight="duotone" />
                Enter Platform
                <ArrowRight size={20} weight="bold" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 gap-3 border-border/50 hover:border-accent/50"
                onClick={() => {
                  const featuresEl = document.getElementById('features')
                  featuresEl?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Explore Features
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-16"
          >
            <Card className="overflow-hidden bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/30">
              <div className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <Badge className="mb-4 px-4 py-2 bg-destructive/20 text-destructive border-destructive/30 text-sm">
                    <VideoCamera size={16} weight="duotone" className="mr-2" />
                    Platform Demo
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Watch the Platform in Action
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    See how our analytics intelligence platform combines AI-powered insights, 
                    real-time collaboration, and comprehensive Tableau integration
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="relative aspect-video bg-secondary rounded-xl overflow-hidden border-2 border-accent/20 shadow-2xl mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-metric-purple/20 flex items-center justify-center">
                      <div className="text-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-block mb-4"
                        >
                          <Button
                            size="lg"
                            onClick={() => handlePlayDemo()}
                            className="w-20 h-20 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl"
                          >
                            <Play size={32} weight="fill" />
                          </Button>
                        </motion.div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Click to watch demo video
                        </p>
                        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={14} weight="fill" className="text-success" />
                            <span>5 min overview</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={14} weight="fill" className="text-success" />
                            <span>Feature showcase</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={14} weight="fill" className="text-success" />
                            <span>Live demo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      Have your own demo video? Paste the URL below:
                    </p>
                    <div className="flex gap-3">
                      <Input
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                        value={customVideoUrl}
                        onChange={(e) => setCustomVideoUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handlePlayDemo()}
                        disabled={!customVideoUrl}
                        className="gap-2"
                      >
                        <Play size={16} weight="fill" />
                        Play
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Supports YouTube and Vimeo URLs
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            <Card className="p-6 text-center bg-gradient-to-br from-accent/5 to-card border-accent/20">
              <div className="text-4xl font-bold text-accent mb-2">$45K</div>
              <div className="text-sm text-muted-foreground">Prize Pool</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-metric-purple/5 to-card border-metric-purple/20">
              <div className="text-4xl font-bold text-metric-purple mb-2">9</div>
              <div className="text-sm text-muted-foreground">Core Features</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-success/5 to-card border-success/20">
              <div className="text-4xl font-bold text-success mb-2">4</div>
              <div className="text-sm text-muted-foreground">Prize Categories</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-warning/5 to-card border-warning/20">
              <div className="text-4xl font-bold text-warning mb-2">AI</div>
              <div className="text-sm text-muted-foreground">Powered</div>
            </Card>
          </motion.div>

          <div id="features" className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4">Platform Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A comprehensive suite of tools demonstrating Tableau Developer Platform integration
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                    onMouseEnter={() => setHoveredFeature(feature.id)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <Card 
                      className={`p-6 h-full transition-all duration-300 cursor-pointer bg-gradient-to-br ${feature.bgColor} ${feature.borderColor} ${
                        hoveredFeature === feature.id ? 'scale-105 shadow-lg' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ 
                            backgroundColor: `${feature.color.replace(')', ' / 0.2)')}` 
                          }}
                        >
                          <Icon 
                            size={24} 
                            weight="duotone" 
                            style={{ color: feature.color }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Prize Category Alignment</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Designed to compete across multiple prize categories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prizeCategories.map((category, index) => {
                const Icon = category.icon
                return (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
                  >
                    <Card className="p-6 bg-gradient-to-br from-primary/5 to-card border-primary/20">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                            <Icon size={20} weight="duotone" className="text-accent" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle size={18} weight="fill" className="text-success" />
                            {category.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="text-center"
          >
            <Card className="p-12 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/30">
              <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Experience the future of analytics with AI-powered insights, real-time collaboration,
                and comprehensive Tableau integration patterns
              </p>
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-6 gap-3 glow-accent"
              >
                <Sparkle size={24} weight="duotone" />
                Launch Platform
                <ArrowRight size={20} weight="bold" />
              </Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="mt-16 text-center text-sm text-muted-foreground"
          >
            <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} weight="fill" className="text-success" />
                <span>React + TypeScript</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} weight="fill" className="text-success" />
                <span>Tableau Developer Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} weight="fill" className="text-success" />
                <span>GPT-4o Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} weight="fill" className="text-success" />
                <span>D3.js + Recharts</span>
              </div>
            </div>
            <p>Built for Tableau Hackathon 2026 • The Future of Analytics</p>
          </motion.div>
        </div>
      </div>

      {showVideoModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="icon"
              variant="ghost"
              className="absolute -top-12 right-0 text-foreground hover:text-accent"
              onClick={() => setShowVideoModal(false)}
            >
              <X size={24} weight="bold" />
            </Button>
            
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-accent/30">
              <iframe
                src={videoUrl}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Platform Demo Video"
              />
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Press ESC or click outside to close
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
