import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
  User,
  Sparkle,
  Star,
  Trend
  Crow
import { u
interface U
  email
  isOwne
}
interface U
  type:
  context?: string
  metadata?: Record<string, any>

  totalViews: number
  reportsCreate
  lastVisit: nu

  const [user, set
  const [sta
 

  })
  useEffect(
      try {
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

export function UserProfile() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [activity] = useKV<UserActivity[]>('user-activity', [])
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
        const userInfo = await window.spark.user()
        setUser(userInfo)
        
        setStats((current) => {
          if (!current) return {
            totalViews: 1,
            insightsGenerated: 0,
            reportsCreated: 0,
            bookmarksCount: 0,
            lastVisit: Date.now()
          }
          return {
            ...current,
            totalViews: current.totalViews + 1,
            lastVisit: Date.now()
          }
        })
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }
    
    loadUser()
  }, [setStats])

  const recentActivity = (activity || []).slice(0, 10)

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'view':
        return <Eye size={16} weight="duotone" className="text-accent" />
      case 'insight':
        return <Sparkle size={16} weight="fill" className="text-accent" />
      case 'report':
        return <FileText size={16} weight="duotone" className="text-accent" />
      case 'bookmark':
        return <Star size={16} weight="fill" className="text-warning" />
      default:
        return <ChartBar size={16} weight="duotone" className="text-accent" />
    }
  }

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">Loading user profile...</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 ring-2 ring-border">
              <AvatarImage src={user.avatarUrl} alt={user.login} />
              <AvatarFallback className="text-2xl bg-accent/20 text-accent">
                {user.login[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <p className="text-2xl font-bold font-mono">{s

              <div className="flex
                <span>Reports Created</span>
              <p className="text-2xl font-bold font-m

              <div classNa
                <s
              <p cla
          </div>
          <Separat
          <div>

          </div>

          <div>
            {recentActivity.length === 
                <Clock size={48} weight="thin" className="text-muted-foreground mx-au
              </div>
              <ScrollArea className="h-[
                  {r
                      key={item.id}
                  

                        <div className=
                            {getActivityIcon(item.type)}
                          <div classN
                            {item.context && (
                    
                              <Clock size={12} />
                  

                    </motion.div>
                </div>
            )}
        </TabsContent>
    </Card>
}
export function us

    type: UserActivity['type'],
    context?: string,
  ) => {
      id: `activity-${Date.now()}-${Ma
      description,
      timestamp: Date.now(),
    }
    setActivity(

}

    totalViews:
    reportsCreated: 0,
    lastVisit: Date.now()

    setStats((cu
        totalViews: ke

        lastVisit: Date.now()
      return {
        [key]: (current[key] as number) + 1,
      }
  }
  return { stats, incrementStat }





























































































