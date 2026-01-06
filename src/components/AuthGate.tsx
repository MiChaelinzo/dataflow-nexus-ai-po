import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { GithubLogo, Sparkle, ChartBar, Shield, Users, TrendUp, Warning } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

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

const CACHE_DURATION = 5 * 60 * 1000
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [cachedUser, setCachedUser] = useKV<UserInfo | null>('cached-user-info', null)
  const [cacheTimestamp, setCacheTimestamp] = useKV<number>('user-cache-timestamp', 0)

  useEffect(() => {
    const loadUser = async () => {
      const now = Date.now()
      
      if (cachedUser && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
        setUser(cachedUser)
        setLoading(false)
        return
      }

      let currentRetry = 0
      
      while (currentRetry <= MAX_RETRIES) {
        try {
          const userInfo = await window.spark.user()
          setUser(userInfo)
          setCachedUser(userInfo)
          setCacheTimestamp(Date.now())
          setError(null)
          setLoading(false)
          return
        } catch (err: any) {
          const errorMessage = err?.message || String(err)
          
          if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
            if (currentRetry < MAX_RETRIES) {
              const delay = INITIAL_RETRY_DELAY * Math.pow(2, currentRetry)
              setError(`Rate limit reached. Retrying in ${delay / 1000}s... (${currentRetry + 1}/${MAX_RETRIES})`)
              await new Promise(resolve => setTimeout(resolve, delay))
              currentRetry++
              setRetryCount(currentRetry)
              continue
            } else {
              if (cachedUser) {
                setUser(cachedUser)
                setError('Using cached user data due to rate limiting')
                setLoading(false)
                return
              }
              setError('GitHub rate limit reached. Please try again in a few minutes.')
            }
          } else {
            console.error('Failed to load user:', err)
            setError('Failed to authenticate. Please try again.')
          }
          break
        }
      }
      
      setLoading(false)
    }

    loadUser()
  }, [cachedUser, cacheTimestamp, setCachedUser, setCacheTimestamp])

  const handleRetry = () => {
    setError(null)
    setRetryCount(0)
    setLoading(true)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="grid-background fixed inset-0 opacity-30" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          <Card className="p-8 text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkle size={32} weight="duotone" className="text-accent animate-pulse" />
            </div>
            <p className="text-muted-foreground mb-2">Loading...</p>
            {error && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <div className="flex items-center gap-2 justify-center text-warning mb-2">
                  <Warning size={20} weight="fill" />
                  <p className="text-sm font-medium">Rate Limit Notice</p>
                </div>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!user && error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="grid-background fixed inset-0 opacity-30" />
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
                <Warning size={32} weight="duotone" className="text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Authentication Issue</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button 
                onClick={handleRetry}
                className="w-full gap-2"
              >
                <GithubLogo size={20} weight="fill" />
                Retry Authentication
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                If this persists, please wait a few minutes and try again
              </p>
            </Card>
          </motion.div>
        </div>
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
