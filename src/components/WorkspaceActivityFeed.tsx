import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartBar,
  ShareNetwork,
  Users,
  Eye,
  ChatCircle,
  Plus,
  PencilSimple,
  Trash,
  Star,
  FolderOpen,
  Clock,
  Sparkle,
  TrendUp,
  FileText,
  Copy,
  Check,
  Link as LinkIcon,
  ArrowsLeftRight,
  VideoCamera,
  Crown,
  Buildings,
  Lock,
  UserPlus,
  UserMinus,
  Database,
  ArrowRight,
  Pulse
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { cn } from '@/lib/utils'

export interface WorkspaceActivity {
  id: string
  workspaceId: string
  workspaceName: string
  userId: string
  userName: string
  userAvatar?: string
  action: ActivityAction
  targetType: 'workspace' | 'dashboard' | 'member' | 'permission' | 'report' | 'insight' | 'session'
  targetId?: string
  targetName?: string
  details?: string
  metadata?: Record<string, any>
  timestamp: number
}

export type ActivityAction = 
  | 'created'
  | 'viewed'
  | 'edited'
  | 'deleted'
  | 'duplicated'
  | 'shared'
  | 'unshared'
  | 'favorited'
  | 'unfavorited'
  | 'commented'
  | 'joined'
  | 'left'
  | 'invited'
  | 'removed'
  | 'permission_changed'
  | 'exported'
  | 'generated'
  | 'recorded'

interface WorkspaceActivityFeedProps {
  workspaceId?: string
  limit?: number
  showFilters?: boolean
  className?: string
}

export function WorkspaceActivityFeed({ 
  workspaceId, 
  limit = 50, 
  showFilters = true,
  className 
}: WorkspaceActivityFeedProps) {
  const [activities, setActivities] = useKV<WorkspaceActivity[]>('workspace-activities', [])
  const [filter, setFilter] = useState<'all' | 'workspace' | 'dashboard' | 'member'>('all')
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)

  const filteredActivities = (activities || [])
    .filter(activity => !workspaceId || activity.workspaceId === workspaceId)
    .filter(activity => filter === 'all' || activity.targetType === filter)
    .filter(activity => {
      if (timeRange === 'all') return true
      const now = Date.now()
      const activityTime = activity.timestamp
      
      switch (timeRange) {
        case 'today':
          return now - activityTime < 24 * 60 * 60 * 1000
        case 'week':
          return now - activityTime < 7 * 24 * 60 * 60 * 1000
        case 'month':
          return now - activityTime < 30 * 24 * 60 * 60 * 1000
        default:
          return true
      }
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)

  const groupedByDate = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {} as Record<string, WorkspaceActivity[]>)

  const getActivityIcon = (activity: WorkspaceActivity) => {
    const iconClass = "flex-shrink-0"
    const size = 20

    switch (activity.action) {
      case 'created':
        return <Plus size={size} weight="bold" className={iconClass} />
      case 'viewed':
        return <Eye size={size} weight="duotone" className={iconClass} />
      case 'edited':
        return <PencilSimple size={size} weight="duotone" className={iconClass} />
      case 'deleted':
        return <Trash size={size} weight="duotone" className={iconClass} />
      case 'duplicated':
        return <Copy size={size} weight="duotone" className={iconClass} />
      case 'shared':
        return <ShareNetwork size={size} weight="fill" className={iconClass} />
      case 'unshared':
        return <ShareNetwork size={size} weight="duotone" className={iconClass} />
      case 'favorited':
        return <Star size={size} weight="fill" className={iconClass} />
      case 'unfavorited':
        return <Star size={size} weight="duotone" className={iconClass} />
      case 'commented':
        return <ChatCircle size={size} weight="fill" className={iconClass} />
      case 'joined':
        return <UserPlus size={size} weight="bold" className={iconClass} />
      case 'left':
        return <UserMinus size={size} weight="duotone" className={iconClass} />
      case 'invited':
        return <UserPlus size={size} weight="duotone" className={iconClass} />
      case 'removed':
        return <UserMinus size={size} weight="bold" className={iconClass} />
      case 'permission_changed':
        return <Lock size={size} weight="duotone" className={iconClass} />
      case 'exported':
        return <FileText size={size} weight="duotone" className={iconClass} />
      case 'generated':
        return <Sparkle size={size} weight="fill" className={iconClass} />
      case 'recorded':
        return <VideoCamera size={size} weight="fill" className={iconClass} />
      default:
        return <Pulse size={size} weight="duotone" className={iconClass} />
    }
  }

  const getActivityColor = (activity: WorkspaceActivity) => {
    switch (activity.action) {
      case 'created':
      case 'generated':
        return 'text-success'
      case 'deleted':
      case 'removed':
      case 'left':
        return 'text-destructive'
      case 'shared':
      case 'joined':
      case 'invited':
        return 'text-accent'
      case 'favorited':
        return 'text-warning'
      case 'commented':
        return 'text-metric-purple'
      case 'viewed':
        return 'text-muted-foreground'
      default:
        return 'text-foreground'
    }
  }

  const getActivityBadgeColor = (action: ActivityAction) => {
    switch (action) {
      case 'created':
      case 'generated':
        return 'bg-success/20 text-success border-success/30'
      case 'deleted':
      case 'removed':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      case 'shared':
      case 'joined':
        return 'bg-accent/20 text-accent border-accent/30'
      case 'viewed':
        return 'bg-muted text-muted-foreground border-border'
      default:
        return 'bg-secondary text-secondary-foreground border-border'
    }
  }

  const getTargetIcon = (targetType: string) => {
    const size = 16
    switch (targetType) {
      case 'workspace':
        return <FolderOpen size={size} weight="duotone" />
      case 'dashboard':
        return <ChartBar size={size} weight="duotone" />
      case 'member':
        return <Users size={size} weight="duotone" />
      case 'report':
        return <FileText size={size} weight="duotone" />
      case 'insight':
        return <Sparkle size={size} weight="duotone" />
      case 'session':
        return <VideoCamera size={size} weight="duotone" />
      default:
        return <Database size={16} weight="duotone" />
    }
  }

  const getActivityDescription = (activity: WorkspaceActivity) => {
    const action = activity.action.replace('_', ' ')
    const target = activity.targetName || activity.targetType
    
    return (
      <span>
        <strong>{action}</strong> {activity.targetType} {target && <em>"{target}"</em>}
        {activity.details && <span className="text-muted-foreground"> - {activity.details}</span>}
      </span>
    )
  }

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const activityStats = {
    total: filteredActivities.length,
    today: filteredActivities.filter(a => Date.now() - a.timestamp < 24 * 60 * 60 * 1000).length,
    activeUsers: new Set(filteredActivities.map(a => a.userId)).size,
    recentActions: filteredActivities.slice(0, 5).map(a => a.action)
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card className="p-6 bg-gradient-to-br from-success/10 via-card to-accent/10 border-success/30">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center">
              <Pulse size={28} weight="duotone" className="text-success" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Activity Feed</h2>
            <p className="text-muted-foreground">
              Real-time updates on workspace activities, member actions, and collaboration events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-success/20 text-success border-success/30 gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Activities</p>
          <p className="text-2xl font-bold font-mono">{activityStats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Today</p>
          <p className="text-2xl font-bold font-mono text-accent">{activityStats.today}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Active Users</p>
          <p className="text-2xl font-bold font-mono text-success">{activityStats.activeUsers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Most Common</p>
          <div className="flex gap-1 mt-1">
            {activityStats.recentActions.slice(0, 3).map((action, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {action}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Filter by Type</p>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                <TabsList>
                  <TabsTrigger value="all" className="gap-2">
                    <Pulse size={14} weight="duotone" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="workspace" className="gap-2">
                    <FolderOpen size={14} weight="duotone" />
                    Workspaces
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="gap-2">
                    <ChartBar size={14} weight="duotone" />
                    Dashboards
                  </TabsTrigger>
                  <TabsTrigger value="member" className="gap-2">
                    <Users size={14} weight="duotone" />
                    Members
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Time Range</p>
              <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="all">All Time</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <ScrollArea className="h-[600px] pr-4">
          {filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Pulse size={64} weight="thin" className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
              <p className="text-sm text-muted-foreground text-center">
                Workspace activities will appear here as members interact with dashboards and resources
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByDate).map(([date, dateActivities], dateIdx) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <Clock size={16} weight="duotone" className="text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {date === new Date().toLocaleDateString() ? 'Today' : date}
                    </h3>
                    <Separator className="flex-1" />
                    <Badge variant="secondary" className="text-xs">
                      {dateActivities.length} {dateActivities.length === 1 ? 'activity' : 'activities'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence>
                      {dateActivities.map((activity, activityIdx) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: activityIdx * 0.03 }}
                        >
                          <Card 
                            className={cn(
                              "p-4 transition-all hover:shadow-md cursor-pointer",
                              expandedActivity === activity.id && "ring-2 ring-accent/50"
                            )}
                            onClick={() => setExpandedActivity(
                              expandedActivity === activity.id ? null : activity.id
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10 ring-2 ring-background">
                                {activity.userAvatar ? (
                                  <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                                ) : (
                                  <AvatarFallback className="bg-accent/20 text-accent font-semibold">
                                    {getInitials(activity.userName)}
                                  </AvatarFallback>
                                )}
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm">{activity.userName}</span>
                                    <div className={cn("flex items-center gap-1", getActivityColor(activity))}>
                                      {getActivityIcon(activity)}
                                    </div>
                                    <Badge className={cn("text-xs", getActivityBadgeColor(activity.action))}>
                                      {activity.action.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground flex-shrink-0">
                                    {getTimeAgo(activity.timestamp)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    {getTargetIcon(activity.targetType)}
                                    <span className="capitalize">{activity.targetType}</span>
                                  </div>
                                  {activity.targetName && (
                                    <>
                                      <ArrowRight size={12} className="text-muted-foreground" />
                                      <span className="text-sm font-medium truncate">{activity.targetName}</span>
                                    </>
                                  )}
                                </div>

                                {activity.details && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {activity.details}
                                  </p>
                                )}

                                {expandedActivity === activity.id && activity.metadata && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 pt-3 border-t border-border"
                                  >
                                    <div className="space-y-2">
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Activity Details
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        {Object.entries(activity.metadata).map(([key, value]) => (
                                          <div key={key} className="flex items-start gap-2">
                                            <span className="text-muted-foreground capitalize">{key}:</span>
                                            <span className="font-mono">{String(value)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>

                            {activity.workspaceName && !workspaceId && (
                              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                                <FolderOpen size={14} weight="duotone" className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Workspace: <span className="font-medium">{activity.workspaceName}</span>
                                </span>
                              </div>
                            )}
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  )
}

export function useWorkspaceActivity() {
  const [activities, setActivities] = useKV<WorkspaceActivity[]>('workspace-activities', [])

  const addActivity = (activity: Omit<WorkspaceActivity, 'id' | 'timestamp'>) => {
    const newActivity: WorkspaceActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    }

    setActivities(current => [newActivity, ...(current || [])].slice(0, 1000))
    return newActivity
  }

  const clearActivities = () => {
    setActivities([])
  }

  const getActivitiesByWorkspace = (workspaceId: string) => {
    return (activities || []).filter(a => a.workspaceId === workspaceId)
  }

  const getActivitiesByUser = (userId: string) => {
    return (activities || []).filter(a => a.userId === userId)
  }

  return {
    activities: activities || [],
    addActivity,
    clearActivities,
    getActivitiesByWorkspace,
    getActivitiesByUser
  }
}
