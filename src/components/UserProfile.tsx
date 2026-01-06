import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTri
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
  Eye,
import {
  Star,
  Clock,
} from
  Sparkle,
  login: st
  Star,
  isOwner: 
  TrendUp
} from '@phosphor-icons/react'

interface UserInfo {
  login: string
  email: string
  avatarUrl: string
  isOwner: boolean
  id: string
 

interface UserActivity {
  id: string
  type: 'view' | 'insight' | 'report' | 'bookmark'
  description: string
  timestamp: number
  metadata?: Record<string, any>
 


  totalViews: number
  insightsGenerated: number
  reportsCreated: number
  bookmarksCount: number
  lastVisit: number
 

export function UserProfile() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [activity] = useKV<UserActivity[]>('user-activity', [])
  const [stats, setStats] = useKV<UserStats>('user-stats', {
            lastVi
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
        </TabsList>
        <TabsContent value="pr
            <Avatar className=
              <AvatarFallback cla
           
            
              <div clas
                {user.isOwner && (
                    Owner
           
          
          </div>
          <Separator />
       
     
    
              
                


               
   



                  <p className="text-xs text-
                <p className="text-2xl 

                <div className="flex items
                  <p className="text-xs

            </div>

            <p className="text-xs text-muted-
            </p>
   

            <h3 className="text-sm font-semib
            </h3>
            {recentAc
                <Clock size={48} weight="thin" className="text-muted-foregrou
              </div>
              <ScrollArea className="h-[400px] pr-4">
                  
                      key={item.id}
                      
                    >
              
                            {getActivityIcon(item.type)}
     
   

          
                </div>
            )}
        </TabsContent>
    </Card>
}
export function use

    type: UserActivity['type'],
    metadataOrId?: string | Record<string, any>
    const metadata =
      id: `activity-${Da
      description,


  }
  return { activity: activity || [], trackActivity }

  const [stats, setStats] = useKV<UserStats>('user-stats', {
    insightsGenerated: 0,
    bookmarksCount: 0,
  })
  const incr
      if (!current) return {
        insightsGenerated: key === 'insightsGenerated' ? 1 :
        bookmarksCount: key === 'bookmarksCount' ? 1 : 0,
      }
        ...current,
        lastVisit: Date.n
    })

}


















































































































































