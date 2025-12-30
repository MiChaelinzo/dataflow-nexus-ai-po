import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { GithubLogo, Sparkle, ChartBar, Shield, Users, TrendUp } from '@phosphor-icons/react'

interface UserInfo {
  avatarUrl: string
  email: string
  id: number
  isOwner: boolean
  login: string
}

interface AuthGateProps {
  children: React.ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userInfo = await window.spark.user()
        setUser(userInfo)
      } catch (error) {
        console.error('Failed to load user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="grid-background fixed inset-0 opacity-30" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkle size={32} weight="duotone" className="text-accent animate-pulse" />
            </div>
            <p className="text-muted-foreground">Loading...</p>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="grid-background fixed inset-0 opacity-30" />
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent via-primary to-metric-purple flex items-center justify-center glow-accent"
              >
                <ChartBar size={40} weight="duotone" className="text-white" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
              >
                Analytics Intelligence Platform
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground mb-2"
              >
                AI-Powered Data Governance & Real-Time Insights
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Badge className="text-sm px-4 py-2 bg-accent/20 text-accent border-accent/30">
                  Tableau Hackathon 2026
                </Badge>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-8 mb-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-3">Sign in to Continue</h2>
                  <p className="text-muted-foreground">
                    Access personalized dashboards, AI insights, and collaborative analytics
                  </p>
                </div>

                <Button 
                  size="lg"
                  className="w-full gap-3 text-lg h-14 bg-primary hover:bg-primary/90"
                  onClick={() => window.location.reload()}
                >
                  <GithubLogo size={24} weight="fill" />
                  Sign in with GitHub
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By signing in, you'll get access to all platform features
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Sparkle size={24} weight="duotone" className="text-accent" />
                </div>
                <h3 className="font-semibold mb-2">AI Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Automated pattern detection and recommendations
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-success/20 flex items-center justify-center">
                  <Users size={24} weight="duotone" className="text-success" />
                </div>
                <h3 className="font-semibold mb-2">Real-Time Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Live cursors and session replay
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-metric-purple/20 flex items-center justify-center">
                  <TrendUp size={24} weight="duotone" className="text-metric-purple" />
                </div>
                <h3 className="font-semibold mb-2">Predictive Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Forecasting with confidence intervals
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
