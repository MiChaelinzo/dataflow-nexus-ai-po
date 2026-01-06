import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
  Eye,
  User, 
  Sparkle
  Eye,
  TrendU
  FileText,
  Sparkle,
  Star,
  ChartBar,
  TrendUp
}
interface UserStats {

  bookmarksCount: nu
}
export function
  const [act
    totalViews: 0,
    reportsCrea
}

    const loadUser = asy
        const userInfo = await window.spark.user()
        
          if (!curr
            in
 

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
        re
      } catch (error) {
        console.error('Failed to load user:', error)
      }
  ret
    
        <TabsL
  }, [setStats])

  if (!user) {
    return null
  }

  const recentActivity = (activity || []).slice(0, 5)

  const formatTime = (timestamp: number) => {
              <AvatarFallback className
    const minutes = Math.floor(diff / 60000)
            </Avatar>
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
                )}
  }

  const getActivityIcon = (type: string) => {
          <div clas
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
                  <
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Clock size={16} weight="duotone" />
                    
          </TabsTrigger>
                   

  })
  const incrementStat = (key: keyof Omit<UserStats,
      if (!current) return {
        insightsGenerated: key === 'insightsGenerated' ? 1 : 0,
        bookmarksCount: key === 'bookmarksCount' ? 
      }
        ...current,
      }
  }
  return { stats, incrementStat }










































































































































