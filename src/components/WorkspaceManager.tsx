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
import { 
  FolderOpen, 
  Plus, 
  Users, 
  Lock, 
  LockOpen,
  Star,
  Trash,
  PencilSimple,
  Copy,
  ShareNetwork,
  ChartBar,
  Clock,
  Check,
  SquaresFour,
  Crown,
  Eye,
  Buildings,
  Pulse
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { WorkspaceActivityFeed, useWorkspaceActivity } from '@/components/WorkspaceActivityFeed'
import { generateSampleWorkspaces } from '@/lib/data'

export interface Workspace {
  id: string
  name: string
  description: string
  type: 'personal' | 'team' | 'organization'
  visibility: 'private' | 'shared' | 'public'
  ownerId: string
  ownerName: string
  members: WorkspaceMember[]
  dashboards: number
  createdAt: number
  lastModified: number
  color: string
  isFavorite?: boolean
}

export interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  joinedAt: number
}

export function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useKV<Workspace[]>('user-workspaces', [])
  const [workspacesInitialized, setWorkspacesInitialized] = useKV<boolean>('workspaces-initialized', false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [isCreating, setIsCreating] = useState(false)
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
    if (!workspacesInitialized) {
      const userName = user?.login || 'You'
      const sampleWorkspaces = generateSampleWorkspaces('user-1', userName)
      setWorkspaces(() => sampleWorkspaces)
      setWorkspacesInitialized(true)
    }
  }, [workspacesInitialized, setWorkspaces, setWorkspacesInitialized, user])

  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    type: 'team' as 'personal' | 'team' | 'organization',
    visibility: 'private' as 'private' | 'shared' | 'public',
    color: 'oklch(0.70 0.15 195)'
  })

  const workspaceColors = [
    { name: 'Cyan', value: 'oklch(0.70 0.15 195)' },
    { name: 'Purple', value: 'oklch(0.60 0.18 290)' },
    { name: 'Green', value: 'oklch(0.65 0.15 145)' },
    { name: 'Orange', value: 'oklch(0.70 0.15 70)' },
    { name: 'Pink', value: 'oklch(0.70 0.18 350)' },
    { name: 'Blue', value: 'oklch(0.45 0.15 250)' }
  ]

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getWorkspaceIcon = (type: string) => {
    switch (type) {
      case 'personal':
        return <Crown size={20} weight="fill" />
      case 'team':
        return <Users size={20} weight="fill" />
      case 'organization':
        return <Buildings size={20} weight="fill" />
      default:
        return <FolderOpen size={20} weight="fill" />
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return <Lock size={16} weight="fill" />
      case 'shared':
        return <Users size={16} weight="fill" />
      case 'public':
        return <LockOpen size={16} weight="fill" />
      default:
        return <Lock size={16} weight="fill" />
    }
  }

  const handleCreateWorkspace = () => {
    if (!newWorkspace.name.trim()) {
      toast.error('Please enter a workspace name')
      return
    }

    const workspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: newWorkspace.name,
      description: newWorkspace.description,
      type: newWorkspace.type,
      visibility: newWorkspace.visibility,
      ownerId: currentUser?.id || 'user-1',
      ownerName: currentUser?.name || 'You',
      members: [{
        id: currentUser?.id || 'user-1',
        name: currentUser?.name || 'You',
        email: currentUser?.email || 'you@company.com',
        role: 'owner',
        joinedAt: Date.now()
      }],
      dashboards: 0,
      createdAt: Date.now(),
      lastModified: Date.now(),
      color: newWorkspace.color,
      isFavorite: false
    }

    setWorkspaces(current => [...(current || []), workspace])
    
    addActivity({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      userId: currentUser?.id || 'user-1',
      userName: user?.login || currentUser?.name || 'You',
      userAvatar: user?.avatarUrl,
      action: 'created',
      targetType: 'workspace',
      targetId: workspace.id,
      targetName: workspace.name,
      details: `Created new ${workspace.type} workspace with ${workspace.visibility} visibility`,
      metadata: {
        type: workspace.type,
        visibility: workspace.visibility
      }
    })
    
    toast.success('Workspace created!', {
      description: `${workspace.name} is ready to use`
    })

    setNewWorkspace({
      name: '',
      description: '',
      type: 'team',
      visibility: 'private',
      color: 'oklch(0.70 0.15 195)'
    })
    setIsCreating(false)
    setSelectedWorkspace(workspace)
  }

  const handleToggleFavorite = (workspaceId: string) => {
    const workspace = (workspaces || []).find(ws => ws.id === workspaceId)
    const isFavoriting = !workspace?.isFavorite
    
    setWorkspaces(current =>
      (current || []).map(ws =>
        ws.id === workspaceId ? { ...ws, isFavorite: !ws.isFavorite } : ws
      )
    )
    
    if (workspace) {
      addActivity({
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        userId: currentUser?.id || 'user-1',
        userName: user?.login || currentUser?.name || 'You',
        userAvatar: user?.avatarUrl,
        action: isFavoriting ? 'favorited' : 'unfavorited',
        targetType: 'workspace',
        targetId: workspace.id,
        targetName: workspace.name
      })
    }
    
    toast.success('Favorites updated')
  }

  const handleDeleteWorkspace = (workspaceId: string) => {
    const workspace = (workspaces || []).find(ws => ws.id === workspaceId)
    if (!workspace) return

    setWorkspaces(current =>
      (current || []).filter(ws => ws.id !== workspaceId)
    )
    
    addActivity({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      userId: currentUser?.id || 'user-1',
      userName: user?.login || currentUser?.name || 'You',
      userAvatar: user?.avatarUrl,
      action: 'deleted',
      targetType: 'workspace',
      targetId: workspace.id,
      targetName: workspace.name
    })
    
    if (selectedWorkspace?.id === workspaceId) {
      setSelectedWorkspace(null)
    }

    toast.success('Workspace deleted', {
      description: `${workspace.name} has been removed`
    })
  }

  const handleDuplicateWorkspace = (workspace: Workspace) => {
    const duplicate: Workspace = {
      ...workspace,
      id: `ws-${Date.now()}`,
      name: `${workspace.name} (Copy)`,
      createdAt: Date.now(),
      lastModified: Date.now()
    }

    setWorkspaces(current => [...(current || []), duplicate])
    
    addActivity({
      workspaceId: duplicate.id,
      workspaceName: duplicate.name,
      userId: currentUser?.id || 'user-1',
      userName: user?.login || currentUser?.name || 'You',
      userAvatar: user?.avatarUrl,
      action: 'duplicated',
      targetType: 'workspace',
      targetId: duplicate.id,
      targetName: duplicate.name,
      details: `Duplicated from "${workspace.name}"`,
      metadata: {
        originalId: workspace.id,
        originalName: workspace.name
      }
    })
    
    toast.success('Workspace duplicated', {
      description: `Created ${duplicate.name}`
    })
  }

  const favoriteWorkspaces = (workspaces || []).filter(ws => ws.isFavorite)
  const recentWorkspaces = [...(workspaces || [])]
    .sort((a, b) => b.lastModified - a.lastModified)
    .slice(0, 5)

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
                  <SquaresFour size={28} weight="duotone" className="text-accent" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Workspaces</h2>
                <p className="text-muted-foreground max-w-2xl">
                  Organize dashboards into separate workspaces for different teams, projects, or departments
                </p>
              </div>
            </div>
            
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="flex-shrink-0 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Plus size={18} weight="bold" />
                  New Workspace
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Workspace</DialogTitle>
                  <DialogDescription>
                    Set up a new workspace to organize your dashboards and collaborate with your team
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ws-name">Workspace Name</Label>
                    <Input
                      id="ws-name"
                      placeholder="Marketing Analytics"
                      value={newWorkspace.name}
                      onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ws-description">Description (Optional)</Label>
                    <Textarea
                      id="ws-description"
                      placeholder="Dashboards and reports for the marketing team"
                      value={newWorkspace.description}
                      onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ws-type">Workspace Type</Label>
                      <Select
                        value={newWorkspace.type}
                        onValueChange={(value) => setNewWorkspace({ ...newWorkspace, type: value as any })}
                      >
                        <SelectTrigger id="ws-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">Personal - Just for me</SelectItem>
                          <SelectItem value="team">Team - For a specific team</SelectItem>
                          <SelectItem value="organization">Organization - Company-wide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ws-visibility">Visibility</Label>
                      <Select
                        value={newWorkspace.visibility}
                        onValueChange={(value) => setNewWorkspace({ ...newWorkspace, visibility: value as any })}
                      >
                        <SelectTrigger id="ws-visibility">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private - Only invited members</SelectItem>
                          <SelectItem value="shared">Shared - Team members can view</SelectItem>
                          <SelectItem value="public">Public - Anyone can view</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Workspace Color</Label>
                    <div className="flex gap-2">
                      {workspaceColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setNewWorkspace({ ...newWorkspace, color: color.value })}
                          className="relative w-10 h-10 rounded-lg transition-transform hover:scale-110"
                          style={{ backgroundColor: color.value }}
                        >
                          {newWorkspace.color === color.value && (
                            <Check size={20} weight="bold" className="absolute inset-0 m-auto text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWorkspace} className="gap-2">
                    <Plus size={16} weight="bold" />
                    Create Workspace
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Workspaces</p>
          <p className="text-2xl font-bold font-mono">{(workspaces || []).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Favorites</p>
          <p className="text-2xl font-bold font-mono text-warning">{favoriteWorkspaces.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Dashboards</p>
          <p className="text-2xl font-bold font-mono text-accent">
            {(workspaces || []).reduce((sum, ws) => sum + ws.dashboards, 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Team Members</p>
          <p className="text-2xl font-bold font-mono text-success">
            {new Set((workspaces || []).flatMap(ws => ws.members.map(m => m.id))).size}
          </p>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <SquaresFour size={16} weight="duotone" />
            All Workspaces
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
          {(!workspaces || workspaces.length === 0) ? (
            <Card className="p-12 text-center border-dashed">
              <FolderOpen size={64} weight="thin" className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Workspaces Yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first workspace to start organizing your dashboards
              </p>
              <Button onClick={() => setIsCreating(true)} className="gap-2">
                <Plus size={16} weight="bold" />
                Create Workspace
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((workspace, index) => (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                    onClick={() => setSelectedWorkspace(workspace)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: workspace.color }}
                      >
                        {getWorkspaceIcon(workspace.type)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFavorite(workspace.id)
                          }}
                          className="text-muted-foreground hover:text-warning transition-colors"
                        >
                          <Star
                            size={20}
                            weight={workspace.isFavorite ? 'fill' : 'regular'}
                            className={workspace.isFavorite ? 'text-warning' : ''}
                          />
                        </button>
                        <Badge variant="outline" className="text-xs gap-1">
                          {getVisibilityIcon(workspace.visibility)}
                          {workspace.visibility}
                        </Badge>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-1">{workspace.name}</h3>
                    {workspace.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {workspace.description}
                      </p>
                    )}
                    
                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <ChartBar size={14} />
                        <span>{workspace.dashboards} dashboards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>{workspace.members.length} members</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          {favoriteWorkspaces.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Star size={64} weight="thin" className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Favorite Workspaces</h3>
              <p className="text-sm text-muted-foreground">
                Mark workspaces as favorites for quick access
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteWorkspaces.map((workspace, index) => (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                    onClick={() => setSelectedWorkspace(workspace)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: workspace.color }}
                      >
                        {getWorkspaceIcon(workspace.type)}
                      </div>
                      <Star size={20} weight="fill" className="text-warning" />
                    </div>
                    
                    <h3 className="font-bold text-lg mb-1">{workspace.name}</h3>
                    {workspace.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {workspace.description}
                      </p>
                    )}
                    
                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <ChartBar size={14} />
                        <span>{workspace.dashboards} dashboards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>{workspace.members.length} members</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          {recentWorkspaces.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Clock size={64} weight="thin" className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
              <p className="text-sm text-muted-foreground">
                Recently accessed workspaces will appear here
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentWorkspaces.map((workspace, index) => (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-4 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => setSelectedWorkspace(workspace)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: workspace.color }}
                      >
                        {getWorkspaceIcon(workspace.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">{workspace.name}</h4>
                          {workspace.isFavorite && (
                            <Star size={14} weight="fill" className="text-warning flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ChartBar size={12} />
                            {workspace.dashboards}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {workspace.members.length}
                          </span>
                          <span>Modified {new Date(workspace.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="text-xs gap-1">
                        {getVisibilityIcon(workspace.visibility)}
                        {workspace.visibility}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {selectedWorkspace && (
          <Dialog open={!!selectedWorkspace} onOpenChange={() => setSelectedWorkspace(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedWorkspace.color }}
                  >
                    {getWorkspaceIcon(selectedWorkspace.type)}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{selectedWorkspace.name}</DialogTitle>
                    <DialogDescription>
                      {selectedWorkspace.description || 'No description provided'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity" className="gap-2">
                    <Pulse size={14} weight="duotone" />
                    Activity
                  </TabsTrigger>
                  <TabsTrigger value="members">Members ({selectedWorkspace.members.length})</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Type</p>
                      <p className="text-sm font-semibold capitalize">{selectedWorkspace.type}</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Visibility</p>
                      <p className="text-sm font-semibold capitalize">{selectedWorkspace.visibility}</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Owner</p>
                      <p className="text-sm font-semibold">{selectedWorkspace.ownerName}</p>
                    </Card>
                  </div>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Quick Stats</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Dashboards</span>
                        <span className="font-mono font-semibold">{selectedWorkspace.dashboards}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Team Members</span>
                        <span className="font-mono font-semibold">{selectedWorkspace.members.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-mono text-xs">{new Date(selectedWorkspace.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Modified</span>
                        <span className="font-mono text-xs">{new Date(selectedWorkspace.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  <WorkspaceActivityFeed 
                    workspaceId={selectedWorkspace.id}
                    limit={20}
                    showFilters={false}
                    className="space-y-4"
                  />
                </TabsContent>

                <TabsContent value="members" className="mt-4">
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {selectedWorkspace.members.map((member) => (
                        <Card key={member.id} className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-accent/20 text-accent">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{member.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                            </div>
                            <Badge variant="outline" className="text-xs capitalize">
                              {member.role}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <Button className="w-full mt-4 gap-2" variant="outline">
                    <Plus size={16} />
                    Invite Members
                  </Button>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => handleDuplicateWorkspace(selectedWorkspace)}
                    >
                      <Copy size={16} />
                      Duplicate Workspace
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <ShareNetwork size={16} />
                      Share Workspace
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <PencilSimple size={16} />
                      Edit Details
                    </Button>
                    
                    <Separator />
                    
                    <Button
                      variant="destructive"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        handleDeleteWorkspace(selectedWorkspace.id)
                        setSelectedWorkspace(null)
                      }}
                    >
                      <Trash size={16} />
                      Delete Workspace
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
