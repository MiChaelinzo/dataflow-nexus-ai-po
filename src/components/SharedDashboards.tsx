import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { 
  ChartBar, 
  Plus, 
  ShareNetwork,
  Eye,
  PencilSimple,
  Trash,
  Copy,
  Lock,
  LockOpen,
  Users,
  Link as LinkIcon,
  Clock,
  Star,
  Funnel,
  TrendUp,
  ChatCircle,
  ArrowRight,
  Check,
  X,
  Globe,
  UserCircle
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { useWorkspaceActivity } from '@/components/WorkspaceActivityFeed'
import { generateSampleDashboards } from '@/lib/data'

export interface SharedDashboard {
  id: string
  name: string
  description: string
  workspaceId: string
  workspaceName: string
  ownerId: string
  ownerName: string
  visibility: 'private' | 'workspace' | 'organization' | 'public'
  shareLink?: string
  permissions: DashboardPermission[]
  views: number
  comments: number
  lastModified: number
  createdAt: number
  isFavorite?: boolean
  tags: string[]
  thumbnail?: string
}

export interface DashboardPermission {
  userId: string
  userName: string
  userEmail: string
  role: 'viewer' | 'commenter' | 'editor' | 'admin'
  grantedAt: number
  grantedBy: string
}

export interface ShareRequest {
  id: string
  dashboardId: string
  dashboardName: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  message?: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: number
}

export function SharedDashboards() {
  const [dashboards, setDashboards] = useKV<SharedDashboard[]>('shared-dashboards', [])
  const [dashboardsInitialized, setDashboardsInitialized] = useKV<boolean>('dashboards-initialized', false)
  const [shareRequests, setShareRequests] = useKV<ShareRequest[]>('share-requests', [])
  const [selectedDashboard, setSelectedDashboard] = useState<SharedDashboard | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [shareRole, setShareRole] = useState<'viewer' | 'commenter' | 'editor' | 'admin'>('viewer')
  const [currentUser] = useKV<{ id: string; name: string; email: string }>('current-user-info', {
    id: 'user-1',
    name: 'You',
    email: 'you@company.com'
  })
  const { addActivity } = useWorkspaceActivity()
  const [user, setUser] = useState<{ login: string; avatarUrl: string } | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userInfo = await window.spark.user()
        setUser({ login: userInfo.login, avatarUrl: userInfo.avatarUrl || '' })
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }
    
    loadUser()
  }, [])

  useEffect(() => {
    if (!dashboardsInitialized) {
      const userName = user?.login || 'You'
      const sampleDashboards = generateSampleDashboards('user-1', userName)
      setDashboards(() => sampleDashboards)
      setDashboardsInitialized(true)
    }
  }, [dashboardsInitialized, setDashboards, setDashboardsInitialized, user])

  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    workspaceId: 'default',
    workspaceName: 'Personal',
    visibility: 'private' as 'private' | 'workspace' | 'organization' | 'public',
    tags: [] as string[],
    newTag: ''
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return <Lock size={16} weight="fill" />
      case 'workspace':
        return <Users size={16} weight="fill" />
      case 'organization':
        return <Globe size={16} weight="fill" />
      case 'public':
        return <LockOpen size={16} weight="fill" />
      default:
        return <Lock size={16} weight="fill" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-accent/20 text-accent border-accent/30'
      case 'editor':
        return 'bg-success/20 text-success border-success/30'
      case 'commenter':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'viewer':
        return 'bg-muted text-muted-foreground border-border'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const handleCreateDashboard = () => {
    if (!newDashboard.name.trim()) {
      toast.error('Please enter a dashboard name')
      return
    }

    const dashboard: SharedDashboard = {
      id: `dash-${Date.now()}`,
      name: newDashboard.name,
      description: newDashboard.description,
      workspaceId: newDashboard.workspaceId,
      workspaceName: newDashboard.workspaceName,
      ownerId: currentUser?.id || 'user-1',
      ownerName: currentUser?.name || 'You',
      visibility: newDashboard.visibility,
      shareLink: `https://analytics.example.com/d/${Date.now()}`,
      permissions: [{
        userId: currentUser?.id || 'user-1',
        userName: currentUser?.name || 'You',
        userEmail: currentUser?.email || 'you@company.com',
        role: 'admin',
        grantedAt: Date.now(),
        grantedBy: 'system'
      }],
      views: 0,
      comments: 0,
      lastModified: Date.now(),
      createdAt: Date.now(),
      isFavorite: false,
      tags: newDashboard.tags
    }

    setDashboards(current => [...(current || []), dashboard])
    
    addActivity({
      workspaceId: dashboard.workspaceId,
      workspaceName: dashboard.workspaceName,
      userId: currentUser?.id || 'user-1',
      userName: currentUser?.name || 'You',
      action: 'created',
      targetType: 'dashboard',
      targetId: dashboard.id,
      targetName: dashboard.name,
      details: `Created new dashboard with ${dashboard.visibility} visibility`,
      metadata: {
        visibility: dashboard.visibility,
        tags: dashboard.tags.join(', ')
      }
    })
    
    toast.success('Dashboard created!', {
      description: `${dashboard.name} is ready to use`
    })

    setNewDashboard({
      name: '',
      description: '',
      workspaceId: 'default',
      workspaceName: 'Personal',
      visibility: 'private',
      tags: [],
      newTag: ''
    })
    setIsCreating(false)
    setSelectedDashboard(dashboard)
  }

  const handleShareDashboard = () => {
    if (!selectedDashboard || !shareEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shareEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    const permission: DashboardPermission = {
      userId: `user-${Date.now()}`,
      userName: shareEmail.split('@')[0],
      userEmail: shareEmail,
      role: shareRole,
      grantedAt: Date.now(),
      grantedBy: currentUser?.id || 'user-1'
    }

    setDashboards(current =>
      (current || []).map(dash =>
        dash.id === selectedDashboard.id
          ? { ...dash, permissions: [...dash.permissions, permission] }
          : dash
      )
    )

    addActivity({
      workspaceId: selectedDashboard.workspaceId,
      workspaceName: selectedDashboard.workspaceName,
      userId: currentUser?.id || 'user-1',
      userName: currentUser?.name || 'You',
      action: 'shared',
      targetType: 'dashboard',
      targetId: selectedDashboard.id,
      targetName: selectedDashboard.name,
      details: `Shared with ${shareEmail} as ${shareRole}`,
      metadata: {
        sharedWith: shareEmail,
        role: shareRole
      }
    })

    toast.success('Dashboard shared!', {
      description: `${shareEmail} now has ${shareRole} access`
    })

    setShareEmail('')
    setShareRole('viewer')
    setIsSharing(false)
  }

  const handleToggleFavorite = (dashboardId: string) => {
    const dashboard = (dashboards || []).find(d => d.id === dashboardId)
    const isFavoriting = !dashboard?.isFavorite
    
    setDashboards(current =>
      (current || []).map(dash =>
        dash.id === dashboardId ? { ...dash, isFavorite: !dash.isFavorite } : dash
      )
    )
    
    if (dashboard) {
      addActivity({
        workspaceId: dashboard.workspaceId,
        workspaceName: dashboard.workspaceName,
        userId: currentUser?.id || 'user-1',
        userName: currentUser?.name || 'You',
        action: isFavoriting ? 'favorited' : 'unfavorited',
        targetType: 'dashboard',
        targetId: dashboard.id,
        targetName: dashboard.name
      })
    }
    
    toast.success('Favorites updated')
  }

  const handleDeleteDashboard = (dashboardId: string) => {
    const dashboard = (dashboards || []).find(d => d.id === dashboardId)
    if (!dashboard) return

    setDashboards(current =>
      (current || []).filter(d => d.id !== dashboardId)
    )
    
    addActivity({
      workspaceId: dashboard.workspaceId,
      workspaceName: dashboard.workspaceName,
      userId: currentUser?.id || 'user-1',
      userName: currentUser?.name || 'You',
      action: 'deleted',
      targetType: 'dashboard',
      targetId: dashboard.id,
      targetName: dashboard.name
    })
    
    if (selectedDashboard?.id === dashboardId) {
      setSelectedDashboard(null)
    }

    toast.success('Dashboard deleted', {
      description: `${dashboard.name} has been removed`
    })
  }

  const handleDuplicateDashboard = (dashboard: SharedDashboard) => {
    const duplicate: SharedDashboard = {
      ...dashboard,
      id: `dash-${Date.now()}`,
      name: `${dashboard.name} (Copy)`,
      createdAt: Date.now(),
      lastModified: Date.now(),
      views: 0,
      comments: 0,
      permissions: [{
        userId: currentUser?.id || 'user-1',
        userName: currentUser?.name || 'You',
        userEmail: currentUser?.email || 'you@company.com',
        role: 'admin',
        grantedAt: Date.now(),
        grantedBy: 'system'
      }]
    }

    setDashboards(current => [...(current || []), duplicate])
    
    addActivity({
      workspaceId: duplicate.workspaceId,
      workspaceName: duplicate.workspaceName,
      userId: currentUser?.id || 'user-1',
      userName: currentUser?.name || 'You',
      action: 'duplicated',
      targetType: 'dashboard',
      targetId: duplicate.id,
      targetName: duplicate.name,
      details: `Duplicated from "${dashboard.name}"`,
      metadata: {
        originalId: dashboard.id,
        originalName: dashboard.name
      }
    })
    
    toast.success('Dashboard duplicated', {
      description: `Created ${duplicate.name}`
    })
  }

  const handleCopyShareLink = (dashboard: SharedDashboard) => {
    if (dashboard.shareLink) {
      navigator.clipboard.writeText(dashboard.shareLink)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleApproveShareRequest = (request: ShareRequest) => {
    setShareRequests(current =>
      (current || []).map(req =>
        req.id === request.id ? { ...req, status: 'approved' } : req
      )
    )
    toast.success('Share request approved')
  }

  const handleRejectShareRequest = (request: ShareRequest) => {
    setShareRequests(current =>
      (current || []).map(req =>
        req.id === request.id ? { ...req, status: 'rejected' } : req
      )
    )
    toast.success('Share request rejected')
  }

  const favoriteDisshboards = (dashboards || []).filter(d => d.isFavorite)
  const recentDashboards = [...(dashboards || [])]
    .sort((a, b) => b.lastModified - a.lastModified)
    .slice(0, 5)
  const pendingRequests = (shareRequests || []).filter(r => r.status === 'pending')

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/30">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center">
                  <ShareNetwork size={28} weight="duotone" className="text-accent" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Shared Dashboards</h2>
                <p className="text-muted-foreground max-w-2xl">
                  Share dashboards with team members, manage access permissions, and collaborate on analytics
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              {pendingRequests.length > 0 && (
                <Badge className="bg-warning/20 text-warning border-warning/30">
                  {pendingRequests.length} pending requests
                </Badge>
              )}
              <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Plus size={18} weight="bold" />
                    New Dashboard
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Shared Dashboard</DialogTitle>
                    <DialogDescription>
                      Create a new dashboard and configure sharing settings
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="dash-name">Dashboard Name</Label>
                      <Input
                        id="dash-name"
                        placeholder="Q4 Revenue Analytics"
                        value={newDashboard.name}
                        onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dash-description">Description</Label>
                      <Textarea
                        id="dash-description"
                        placeholder="Key metrics and insights for Q4 performance"
                        value={newDashboard.description}
                        onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dash-visibility">Visibility</Label>
                      <Select
                        value={newDashboard.visibility}
                        onValueChange={(value) => setNewDashboard({ ...newDashboard, visibility: value as any })}
                      >
                        <SelectTrigger id="dash-visibility">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private - Only me and invited users</SelectItem>
                          <SelectItem value="workspace">Workspace - All workspace members</SelectItem>
                          <SelectItem value="organization">Organization - All company members</SelectItem>
                          <SelectItem value="public">Public - Anyone with the link</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newDashboard.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              onClick={() => setNewDashboard({
                                ...newDashboard,
                                tags: newDashboard.tags.filter((_, i) => i !== idx)
                              })}
                            >
                              <X size={12} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tag..."
                          value={newDashboard.newTag}
                          onChange={(e) => setNewDashboard({ ...newDashboard, newTag: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newDashboard.newTag.trim()) {
                              setNewDashboard({
                                ...newDashboard,
                                tags: [...newDashboard.tags, newDashboard.newTag.trim()],
                                newTag: ''
                              })
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (newDashboard.newTag.trim()) {
                              setNewDashboard({
                                ...newDashboard,
                                tags: [...newDashboard.tags, newDashboard.newTag.trim()],
                                newTag: ''
                              })
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateDashboard} className="gap-2">
                      <Plus size={16} weight="bold" />
                      Create Dashboard
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Dashboards</p>
          <p className="text-2xl font-bold font-mono">{(dashboards || []).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Views</p>
          <p className="text-2xl font-bold font-mono text-accent">
            {(dashboards || []).reduce((sum, d) => sum + d.views, 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Shared With</p>
          <p className="text-2xl font-bold font-mono text-success">
            {new Set((dashboards || []).flatMap(d => d.permissions.map(p => p.userId))).size}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Comments</p>
          <p className="text-2xl font-bold font-mono text-warning">
            {(dashboards || []).reduce((sum, d) => sum + d.comments, 0)}
          </p>
        </Card>
      </div>

      {pendingRequests.length > 0 && (
        <Card className="p-6 bg-warning/5 border-warning/30">
          <div className="flex items-start gap-4 mb-4">
            <Clock size={24} weight="fill" className="text-warning flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Pending Share Requests</h3>
              <p className="text-sm text-muted-foreground">
                {pendingRequests.length} user{pendingRequests.length !== 1 ? 's' : ''} requested access to your dashboards
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-accent/20 text-accent">
                        {getInitials(request.requesterName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{request.requesterName}</p>
                      <p className="text-xs text-muted-foreground">{request.requesterEmail}</p>
                      <p className="text-sm mt-2">
                        Requested access to <strong>{request.dashboardName}</strong>
                      </p>
                      {request.message && (
                        <p className="text-xs text-muted-foreground mt-1 italic">"{request.message}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => handleApproveShareRequest(request)}
                    >
                      <Check size={14} />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1"
                      onClick={() => handleRejectShareRequest(request)}
                    >
                      <X size={14} />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <ChartBar size={16} weight="duotone" />
            All Dashboards
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2">
            <Star size={16} weight="fill" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <Clock size={16} weight="duotone" />
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {(!dashboards || dashboards.length === 0) ? (
            <Card className="p-12 text-center border-dashed">
              <ChartBar size={64} weight="thin" className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Dashboards Yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first dashboard to start sharing insights with your team
              </p>
              <Button onClick={() => setIsCreating(true)} className="gap-2">
                <Plus size={16} weight="bold" />
                Create Dashboard
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboards.map((dashboard, index) => (
                <motion.div
                  key={dashboard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                    onClick={() => setSelectedDashboard(dashboard)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ChartBar size={20} weight="duotone" className="text-accent" />
                        <Badge variant="outline" className="text-xs gap-1">
                          {getVisibilityIcon(dashboard.visibility)}
                          {dashboard.visibility}
                        </Badge>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFavorite(dashboard.id)
                        }}
                        className="text-muted-foreground hover:text-warning transition-colors"
                      >
                        <Star
                          size={20}
                          weight={dashboard.isFavorite ? 'fill' : 'regular'}
                          className={dashboard.isFavorite ? 'text-warning' : ''}
                        />
                      </button>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-1">{dashboard.name}</h3>
                    {dashboard.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {dashboard.description}
                      </p>
                    )}
                    
                    {dashboard.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {dashboard.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {dashboard.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{dashboard.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <Separator className="my-3" />
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{dashboard.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChatCircle size={14} />
                        <span>{dashboard.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{dashboard.permissions.length}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          {favoriteDisshboards.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Star size={64} weight="thin" className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Favorite Dashboards</h3>
              <p className="text-sm text-muted-foreground">
                Mark dashboards as favorites for quick access
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteDisshboards.map((dashboard, index) => (
                <motion.div
                  key={dashboard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                    onClick={() => setSelectedDashboard(dashboard)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <ChartBar size={20} weight="duotone" className="text-accent" />
                      <Star size={20} weight="fill" className="text-warning" />
                    </div>
                    
                    <h3 className="font-bold text-lg mb-1">{dashboard.name}</h3>
                    {dashboard.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {dashboard.description}
                      </p>
                    )}
                    
                    <Separator className="my-3" />
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{dashboard.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChatCircle size={14} />
                        <span>{dashboard.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{dashboard.permissions.length}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          {recentDashboards.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Clock size={64} weight="thin" className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
              <p className="text-sm text-muted-foreground">
                Recently modified dashboards will appear here
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentDashboards.map((dashboard, index) => (
                <motion.div
                  key={dashboard.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-4 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => setSelectedDashboard(dashboard)}
                  >
                    <div className="flex items-center gap-4">
                      <ChartBar size={24} weight="duotone" className="text-accent flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">{dashboard.name}</h4>
                          {dashboard.isFavorite && (
                            <Star size={14} weight="fill" className="text-warning flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {dashboard.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {dashboard.permissions.length}
                          </span>
                          <span>Modified {new Date(dashboard.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="text-xs gap-1">
                        {getVisibilityIcon(dashboard.visibility)}
                        {dashboard.visibility}
                      </Badge>
                      
                      <Button size="sm" variant="ghost" className="gap-1">
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {selectedDashboard && (
          <Dialog open={!!selectedDashboard} onOpenChange={() => setSelectedDashboard(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <ChartBar size={28} weight="duotone" className="text-accent flex-shrink-0" />
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{selectedDashboard.name}</DialogTitle>
                    <DialogDescription>
                      {selectedDashboard.description || 'No description provided'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions ({selectedDashboard.permissions.length})</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Visibility</p>
                      <div className="flex items-center gap-2">
                        {getVisibilityIcon(selectedDashboard.visibility)}
                        <span className="text-sm font-semibold capitalize">{selectedDashboard.visibility}</span>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Owner</p>
                      <p className="text-sm font-semibold">{selectedDashboard.ownerName}</p>
                    </Card>
                  </div>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Activity Stats</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Views</p>
                        <p className="text-xl font-bold font-mono">{selectedDashboard.views}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Comments</p>
                        <p className="text-xl font-bold font-mono">{selectedDashboard.comments}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Shared With</p>
                        <p className="text-xl font-bold font-mono">{selectedDashboard.permissions.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Workspace</p>
                        <p className="text-sm font-semibold truncate">{selectedDashboard.workspaceName}</p>
                      </div>
                    </div>
                  </Card>

                  {selectedDashboard.shareLink && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Share Link</p>
                          <p className="text-sm font-mono truncate">{selectedDashboard.shareLink}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 flex-shrink-0"
                          onClick={() => handleCopyShareLink(selectedDashboard)}
                        >
                          <Copy size={14} />
                          Copy
                        </Button>
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="permissions" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Manage who can access this dashboard and their permission levels
                      </p>
                      <Dialog open={isSharing} onOpenChange={setIsSharing}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-2">
                            <Plus size={14} />
                            Share
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Share Dashboard</DialogTitle>
                            <DialogDescription>
                              Grant access to other users
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Email Address</Label>
                              <Input
                                placeholder="user@company.com"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Permission Level</Label>
                              <Select value={shareRole} onValueChange={(value) => setShareRole(value as any)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="viewer">Viewer - Can view only</SelectItem>
                                  <SelectItem value="commenter">Commenter - Can view and comment</SelectItem>
                                  <SelectItem value="editor">Editor - Can view and edit</SelectItem>
                                  <SelectItem value="admin">Admin - Full control</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsSharing(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleShareDashboard} className="gap-2">
                              <ShareNetwork size={16} />
                              Share
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-3">
                        {selectedDashboard.permissions.map((permission) => (
                          <Card key={permission.userId} className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-accent/20 text-accent">
                                  {getInitials(permission.userName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{permission.userName}</p>
                                <p className="text-xs text-muted-foreground truncate">{permission.userEmail}</p>
                              </div>
                              <Badge className={`text-xs ${getRoleColor(permission.role)}`}>
                                {permission.role}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => handleDuplicateDashboard(selectedDashboard)}
                    >
                      <Copy size={16} />
                      Duplicate Dashboard
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <PencilSimple size={16} />
                      Edit Details
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => handleCopyShareLink(selectedDashboard)}
                    >
                      <LinkIcon size={16} />
                      Copy Share Link
                    </Button>
                    
                    <Separator />
                    
                    <Button
                      variant="destructive"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        handleDeleteDashboard(selectedDashboard.id)
                        setSelectedDashboard(null)
                      }}
                    >
                      <Trash size={16} />
                      Delete Dashboard
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
