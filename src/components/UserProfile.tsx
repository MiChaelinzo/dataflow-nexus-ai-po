import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Sparkle,
  Star,
  TrendUp,
  Crown,
  Eye,
  FileText,
  ChartBar,
  Clock
} from '@phosphor-icons/react'

import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// ------------------------------------------------------------------
// Types & Interfaces
// ------------------------------------------------------------------

interface UserInfo {
  login: string
  email?: string
  avatarUrl?: string
  isOwner?: boolean
}

interface UserActivity {
  id: string
  type: 'view' | 'insight' | 'report' | 'bookmark'
  description: string
  context?: string
  timestamp: number
  metadata?: Record<string, any>
}

interface UserStats {
  totalViews: number
  insightsGenerated: number
  reportsCreated: number
  bookmarksCount: number
  lastVisit: number
}

// Global declaration for the window.spark object
declare global {
  interface Window {
    spark: {
      user: () => Promise<UserInfo>
    }
  }
}

// ------------------------------------------------------------------
// Mock Hooks (Replace with your actual imports if available)
// ------------------------------------------------------------------

// Assuming useKV is a custom hook for persistent state
function useKV<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Simple implementation using useState for demonstration
  const [value, setValue] = useState<T>(initialValue)
  return [value, setValue]
}

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------

export function UserProfile() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Using the custom hooks
  const [activity, setActivity] = useKV<UserActivity[]>('user-activity', [])
  const [stats, setStats] = useKV<UserStats>('user-stats', {
    totalViews: 0,
    insightsGenerated: 0,
    reportsCreated: 0,
    bookmarksCount: 0,
    lastVisit: Date.now()
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        const userInfo = await window.spark.user()
        setUser(userInfo)
        
        setStats((current) => {
          if (!current) {
             return {
              totalViews: 1,
              insightsGenerated: 0,
              reportsCreated: 0,
              bookmarksCount: 0,
              lastVisit: Date.now()
            }
          }
          return {
            ...current,
            totalViews: current.totalViews + 1,
            lastVisit: Date.now()
          }
        })
      } catch (error) {
        console.error('Failed to load user:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()
  }, [setStats])

  const recentActivity = (activity || []).slice(0, 10)

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'view':
        return <Eye size={16} weight="duotone" className="text-blue-500" />
      case 'insight':
        return <Sparkle size={16} weight="fill" className="text-purple-500" />
      case 'report':
        return <FileText size={16} weight="duotone" className="text-green-500" />
      case 'bookmark':
        return <Star size={16} weight="fill" className="text-yellow-500" />
      default:
        return <ChartBar size={16} weight="duotone" className="text-gray-500" />
    }
  }

  if (loading || !user) {
    return (
      <Card className="p-6 flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 ring-2 ring-border">
              <AvatarImage src={user.avatarUrl} alt={user.login} />
              <AvatarFallback className="text-2xl bg-accent/20 text-accent font-bold">
                {user.login?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold font-mono">{user.login}</p>
                {user.isOwner && (
                  <Badge variant="secondary" className="gap-1">
                    <Crown size={12} weight="fill" className="text-yellow-500" />
                    Owner
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileText size={16} />
                <span className="text-sm font-medium">Reports Created</span>
              </div>
              <p className="text-2xl font-bold font-mono">{stats.reportsCreated}</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Sparkle size={16} />
                <span className="text-sm font-medium">Insights Generated</span>
              </div>
              <p className="text-2xl font-bold font-mono">{stats.insightsGenerated}</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye size={16} />
                <span className="text-sm font-medium">Total Views</span>
              </div>
              <p className="text-2xl font-bold font-mono">{stats.totalViews}</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Star size={16} />
                <span className="text-sm font-medium">Bookmarks</span>
              </div>
              <p className="text-2xl font-bold font-mono">{stats.bookmarksCount}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Clock size={48} weight="thin" className="mb-4 opacity-50" />
              <p>No recent activity found</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="mt-1 p-2 rounded-full bg-background border shadow-sm">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        {item.context && (
                          <>
                            <span>•</span>
                            <span className="font-mono bg-muted px-1 rounded">{item.context}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}

// ------------------------------------------------------------------
// Custom Helper Hook (Recovered logic)
// ------------------------------------------------------------------

export function useUserStats() {
  const [activity, setActivity] = useKV<UserActivity[]>('user-activity', [])
  const [stats, setStats] = useKV<UserStats>('user-stats', {
    totalViews: 0,
    insightsGenerated: 0,
    reportsCreated: 0,
    bookmarksCount: 0,
    lastVisit: Date.now()
  })

  const addActivity = (
    description: string,
    type: UserActivity['type'],
    context?: string,
  ) => {
    const newActivity: UserActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
      context,
      timestamp: Date.now(),
    }
    
    setActivity((prev) => [newActivity, ...prev])
  }

  const incrementStat = (key: keyof UserStats) => {
    setStats((current) => {
      return {
        ...current,
        [key]: (current[key] as number) + 1,
      }
    })
  }

  return { stats, activity, addActivity, incrementStat }
}

