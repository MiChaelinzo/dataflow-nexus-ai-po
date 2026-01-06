import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImag
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
  User, 
  Clock, 
  Eye,
  Crown,
  FileTe
} from '@pho

  avatar
  id: 
  login: stri

  type: 'i
  FileText,
  Sparkle
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface UserInfo {
  avatarUrl: string
  email: string
  id: number
  isOwner: boolean
  login: string
e

interface UserActivity {
  type: 'insight' | 'report' | 'view' | 'bookmark'
  title: string
  timestamp: number
  tab?: string
}


  totalViews: number
      try {
  reportsCreated: number
  bookmarksCount: number
  lastVisit: number
 

export function UserProfile() {
  const [user, setUser] = useState<UserInfo | null>(null)
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
        const userInfo = await window.spark.user()
        setUser(userInfo)
    cons
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
      defa
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    <

          <Tab
  }, [setStats])

  if (!user) {
    return null
  }

  const recentActivity = (activity || []).slice(0, 5)

  const formatTime = (timestamp: number) => {
                {user.login[0].toUpperC
    const minutes = Math.floor(diff / 60000)
            
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
                )}
  }

  const getActivityIcon = (type: string) => {
                var
      case 'insight':
        return <Sparkle size={16} weight="duotone" className="text-accent" />
      case 'report':
        return <FileText size={16} weight="duotone" className="text-success" />
      case 'view':
        return <Eye size={16} weight="duotone" className="text-primary" />
      case 'bookmark':
        return <Star size={16} weight="duotone" className="text-warning" />
      default:
        return <ChartBar size={16} weight="duotone" className="text-muted-foreground" />
    }
   

          
    <Card className="p-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User size={16} weight="duotone" />
            >
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Clock size={16} weight="duotone" />
                <p c
          </TabsTrigger>
                   

            </div>
            <Card className="p-8 text-center">
                <TrendUp size={32} weight="duotone" className="text-
              <h3 className="font-semibold mb-2">No Activity Yet</h
                Your recent actions will appear here
            </Card>
        </TabsContent>
    </Card>
}
export function useUserActivity() {

    setActivity((current) => {
        type,
        timestamp: Date.now(),
      }]
        {
          title,
          tab
        ...current.s
    })

}
export function useUs
    totalViews: 0,
    reportsCreated: 0,
    lastVisit: Date.now()

    setStats((c
        totalViews: key === 'totalViews' ? 1 : 0,
        reportsCreated: key === 're
        lastVisit: Date
      return {
        [key]: c


}


























































































                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <TrendUp size={32} weight="duotone" className="text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No Activity Yet</h3>
              <p className="text-sm text-muted-foreground">
                Your recent actions will appear here
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}

export function useUserActivity() {
  const [activity, setActivity] = useKV<UserActivity[]>('user-activity', [])

  const trackActivity = (type: UserActivity['type'], title: string, tab?: string) => {
    setActivity((current) => {
      if (!current) return [{
        type,
        title,
        timestamp: Date.now(),
        tab
      }]
      return [
        {
          type,
          title,
          timestamp: Date.now(),
          tab
        },
        ...current.slice(0, 49)
      ]
    })
  }

  return { trackActivity }
}

export function useUserStats() {
  const [stats, setStats] = useKV<UserStats>('user-stats', {
    totalViews: 0,
    insightsGenerated: 0,
    reportsCreated: 0,
    bookmarksCount: 0,
    lastVisit: Date.now()
  })

  const incrementStat = (key: keyof Omit<UserStats, 'lastVisit'>) => {
    setStats((current) => {
      if (!current) return {
        totalViews: key === 'totalViews' ? 1 : 0,
        insightsGenerated: key === 'insightsGenerated' ? 1 : 0,
        reportsCreated: key === 'reportsCreated' ? 1 : 0,
        bookmarksCount: key === 'bookmarksCount' ? 1 : 0,
        lastVisit: Date.now()
      }
      return {
        ...current,
        [key]: current[key] + 1
      }
    })
  }

  return { stats, incrementStat }
}
