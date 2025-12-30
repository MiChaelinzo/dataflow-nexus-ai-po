import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  UserPlus, 
  Shield,
  Crown,
  Eye,
  PencilSimple,
  Trash,
  EnvelopeSimple,
  Bell,
  Check,
  X,
  Warning,
  CalendarBlank,
  Gear
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { TeamMember, UserRole, DigestSubscription } from '@/lib/types'

interface TeamManagementProps {
  onMemberAdded?: (member: TeamMember) => void
}

export function TeamManagement({ onMemberAdded }: TeamManagementProps) {
  const [teamMembers, setTeamMembers] = useKV<TeamMember[]>('team-members', [])
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('viewer')
  const [currentUser] = useKV<TeamMember>('current-user', {
    id: 'current-user',
    name: 'You',
    email: 'you@company.com',
    role: 'owner',
    status: 'active',
    joinedAt: Date.now(),
    lastActive: Date.now(),
    digestSubscriptions: []
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return <Crown size={16} weight="fill" className="text-warning" />
      case 'admin':
        return <Shield size={16} weight="fill" className="text-accent" />
      case 'editor':
        return <PencilSimple size={16} weight="fill" className="text-success" />
      default:
        return <Eye size={16} weight="duotone" className="text-muted-foreground" />
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'admin':
        return 'bg-accent/20 text-accent border-accent/30'
      case 'editor':
        return 'bg-success/20 text-success border-success/30'
      case 'viewer':
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getRolePermissions = (role: UserRole): string[] => {
    switch (role) {
      case 'owner':
        return ['Full system access', 'Manage team', 'Configure integrations', 'Export data', 'Create & edit content', 'View all content']
      case 'admin':
        return ['Manage team members', 'Configure settings', 'Export data', 'Create & edit content', 'View all content']
      case 'editor':
        return ['Create & edit content', 'Share dashboards', 'Comment & collaborate', 'View all content']
      case 'viewer':
        return ['View shared content', 'Comment on dashboards', 'Receive digests']
    }
  }

  const handleAddMember = async () => {
    if (!newMemberEmail.trim() || !newMemberName.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newMemberEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    const existingMember = (teamMembers || []).find(
      m => m.email.toLowerCase() === newMemberEmail.toLowerCase()
    )

    if (existingMember) {
      toast.error('This email is already on the team')
      return
    }

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      status: 'invited',
      joinedAt: Date.now(),
      lastActive: Date.now(),
      digestSubscriptions: []
    }

    setTeamMembers(current => [...(current || []), newMember])
    
    toast.success('Team member invited!', {
      description: `Invitation sent to ${newMemberEmail}`
    })

    setNewMemberEmail('')
    setNewMemberName('')
    setNewMemberRole('viewer')
    setIsAddingMember(false)

    if (onMemberAdded) {
      onMemberAdded(newMember)
    }
  }

  const handleUpdateMemberRole = (memberId: string, newRole: UserRole) => {
    setTeamMembers(current =>
      (current || []).map(member =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    )
    toast.success('Member role updated')
  }

  const handleRemoveMember = (memberId: string) => {
    const member = (teamMembers || []).find(m => m.id === memberId)
    if (!member) return

    setTeamMembers(current =>
      (current || []).filter(m => m.id !== memberId)
    )
    
    if (selectedMember?.id === memberId) {
      setSelectedMember(null)
    }

    toast.success('Member removed', {
      description: `${member.name} has been removed from the team`
    })
  }

  const handleResendInvite = (member: TeamMember) => {
    toast.success('Invitation resent', {
      description: `New invitation sent to ${member.email}`
    })
  }

  const getRoleStats = () => {
    const members = teamMembers || []
    return {
      total: members.length + 1,
      owners: members.filter(m => m.role === 'owner').length + (currentUser?.role === 'owner' ? 1 : 0),
      admins: members.filter(m => m.role === 'admin').length + (currentUser?.role === 'admin' ? 1 : 0),
      editors: members.filter(m => m.role === 'editor').length + (currentUser?.role === 'editor' ? 1 : 0),
      viewers: members.filter(m => m.role === 'viewer').length + (currentUser?.role === 'viewer' ? 1 : 0),
      active: members.filter(m => m.status === 'active').length + 1,
      invited: members.filter(m => m.status === 'invited').length
    }
  }

  const stats = getRoleStats()
  const allMembers = currentUser ? [currentUser, ...(teamMembers || [])] : (teamMembers || [])

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
                  <Users size={28} weight="duotone" className="text-accent" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Team Management</h2>
                <p className="text-muted-foreground max-w-2xl">
                  Invite team members, manage roles and permissions, and configure personalized digest subscriptions for each user.
                </p>
              </div>
            </div>
            
            <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
              <DialogTrigger asChild>
                <Button className="flex-shrink-0 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <UserPlus size={18} weight="bold" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Add a new member to your team. They'll receive an email invitation.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-name">Full Name</Label>
                    <Input
                      id="member-name"
                      placeholder="John Doe"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="member-email">Email Address</Label>
                    <Input
                      id="member-email"
                      type="email"
                      placeholder="john@company.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="member-role">Role</Label>
                    <Select value={newMemberRole} onValueChange={(value) => setNewMemberRole(value as UserRole)}>
                      <SelectTrigger id="member-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer - View only access</SelectItem>
                        <SelectItem value="editor">Editor - Can create and edit</SelectItem>
                        <SelectItem value="admin">Admin - Full team management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                    <p className="font-semibold mb-2">Permissions for {newMemberRole}:</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {getRolePermissions(newMemberRole).map((permission, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check size={14} weight="bold" className="text-success flex-shrink-0 mt-0.5" />
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMember} className="gap-2">
                    <EnvelopeSimple size={16} weight="fill" />
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Members</p>
          <p className="text-2xl font-bold font-mono">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Active</p>
          <p className="text-2xl font-bold font-mono text-success">{stats.active}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Invited</p>
          <p className="text-2xl font-bold font-mono text-warning">{stats.invited}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Admins</p>
          <p className="text-2xl font-bold font-mono text-accent">{stats.admins}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Editors</p>
          <p className="text-2xl font-bold font-mono text-success">{stats.editors}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Viewers</p>
          <p className="text-2xl font-bold font-mono text-muted-foreground">{stats.viewers}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Team Members</h3>
            
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {allMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                        member.status === 'invited' 
                          ? 'border-warning/50 bg-warning/5'
                          : 'border-border bg-card'
                      } ${selectedMember?.id === member.id ? 'ring-2 ring-accent' : ''}`}
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarFallback className="bg-accent/20 text-accent font-semibold">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm">
                                  {member.name}
                                  {member.id === currentUser?.id && (
                                    <span className="text-xs text-muted-foreground ml-2">(You)</span>
                                  )}
                                </h4>
                                {member.status === 'invited' && (
                                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                                    Invited
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                            </div>
                            
                            <Badge className={`text-xs gap-1.5 ${getRoleColor(member.role)}`}>
                              {getRoleIcon(member.role)}
                              {member.role}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                            {member.status === 'active' && (
                              <>
                                <Separator orientation="vertical" className="h-3" />
                                <span>Last active {new Date(member.lastActive).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                          
                          {member.digestSubscriptions && member.digestSubscriptions.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <Bell size={12} className="text-accent" />
                              <span className="text-xs text-muted-foreground">
                                {member.digestSubscriptions.length} digest subscription{member.digestSubscriptions.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedMember ? (
              <motion.div
                key={selectedMember.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="p-6 sticky top-6">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="digests">Digests</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                      <div className="text-center">
                        <Avatar className="w-20 h-20 mx-auto mb-4">
                          <AvatarFallback className="bg-accent/20 text-accent text-2xl font-bold">
                            {getInitials(selectedMember.name)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold mb-1">{selectedMember.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{selectedMember.email}</p>
                        <Badge className={`${getRoleColor(selectedMember.role)} gap-1.5`}>
                          {getRoleIcon(selectedMember.role)}
                          {selectedMember.role}
                        </Badge>
                      </div>

                      <Separator />

                      {selectedMember.id !== currentUser?.id && selectedMember.role !== 'owner' && (
                        <>
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold">Change Role</Label>
                            <Select
                              value={selectedMember.role}
                              onValueChange={(value) => handleUpdateMemberRole(selectedMember.id, value as UserRole)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Separator />
                        </>
                      )}

                      <div>
                        <Label className="text-sm font-semibold mb-3 block">Permissions</Label>
                        <div className="space-y-2">
                          {getRolePermissions(selectedMember.role).map((permission, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <Check size={16} weight="bold" className="text-success flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{permission}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        {selectedMember.status === 'invited' && (
                          <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => handleResendInvite(selectedMember)}
                          >
                            <EnvelopeSimple size={16} weight="fill" />
                            Resend Invitation
                          </Button>
                        )}
                        
                        {selectedMember.id !== currentUser?.id && (
                          <Button
                            variant="destructive"
                            className="w-full gap-2"
                            onClick={() => handleRemoveMember(selectedMember.id)}
                          >
                            <Trash size={16} weight="fill" />
                            Remove Member
                          </Button>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="digests" className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Digest Subscriptions</Label>
                          <Badge variant="secondary" className="text-xs">
                            {selectedMember.digestSubscriptions?.length || 0}
                          </Badge>
                        </div>
                        
                        {!selectedMember.digestSubscriptions || selectedMember.digestSubscriptions.length === 0 ? (
                          <div className="text-center py-8">
                            <CalendarBlank size={48} weight="thin" className="text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground mb-4">
                              No digest subscriptions yet
                            </p>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Bell size={14} />
                              Add Subscription
                            </Button>
                          </div>
                        ) : (
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-3">
                              {selectedMember.digestSubscriptions.map((sub, idx) => (
                                <Card key={idx} className="p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <CalendarBlank size={16} weight="duotone" className="text-accent" />
                                      <span className="text-sm font-medium">{sub.scheduleId}</span>
                                    </div>
                                    <Badge 
                                      variant={sub.enabled ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {sub.enabled ? 'Active' : 'Paused'}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <EnvelopeSimple size={12} />
                                      <span>via {sub.deliveryChannel}</span>
                                    </div>
                                    {sub.customFilters && (
                                      <div className="flex items-center gap-2">
                                        <Gear size={12} />
                                        <span>Custom filters applied</span>
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="p-12 text-center border-dashed h-full flex flex-col items-center justify-center">
                  <Users size={48} weight="thin" className="text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Team Member</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on any member to view details and manage their permissions
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Card className="p-6 bg-accent/5 border-accent/30">
        <div className="flex items-start gap-4">
          <Warning size={24} weight="fill" className="text-accent flex-shrink-0" />
          <div>
            <h4 className="font-semibold mb-2">Role-Based Access Control</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Team members are assigned specific roles that determine their permissions. Only Owners and Admins can manage team members and modify settings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Crown size={14} weight="fill" className="text-warning" />
                <span className="text-muted-foreground"><strong>Owner:</strong> Full control</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} weight="fill" className="text-accent" />
                <span className="text-muted-foreground"><strong>Admin:</strong> Team & settings management</span>
              </div>
              <div className="flex items-center gap-2">
                <PencilSimple size={14} weight="fill" className="text-success" />
                <span className="text-muted-foreground"><strong>Editor:</strong> Create & edit content</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={14} weight="duotone" className="text-muted-foreground" />
                <span className="text-muted-foreground"><strong>Viewer:</strong> Read-only access</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
