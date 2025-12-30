import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Bell,
  CheckCircle,
  CalendarBlank,
  EnvelopeSimple,
  SlackLogo,
  Sparkle,
  Crown,
  Shield,
  PencilSimple,
  Eye,
  Plus,
  Gear
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { TeamMember, DigestSubscription } from '@/lib/types'
import { DigestSchedule } from '@/components/DigestScheduler'

export function RoleBasedDigests() {
  const [teamMembers] = useKV<TeamMember[]>('team-members', [])
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
  const [digestSchedules] = useKV<DigestSchedule[]>('digest-schedules', [])
  const [selectedSchedule, setSelectedSchedule] = useState<DigestSchedule | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())

  const allMembers = currentUser ? [currentUser, ...(teamMembers || [])] : (teamMembers || [])
  const activeMembers = allMembers.filter(m => m.status === 'active')

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown size={14} weight="fill" className="text-warning" />
      case 'admin':
        return <Shield size={14} weight="fill" className="text-accent" />
      case 'editor':
        return <PencilSimple size={14} weight="fill" className="text-success" />
      default:
        return <Eye size={14} weight="duotone" className="text-muted-foreground" />
    }
  }

  const getMemberSubscriptionForSchedule = (member: TeamMember, scheduleId: string): DigestSubscription | null => {
    return member.digestSubscriptions?.find(sub => sub.scheduleId === scheduleId) || null
  }

  const handleToggleMemberSubscription = (memberId: string, scheduleId: string, enabled: boolean) => {
    const member = allMembers.find(m => m.id === memberId)
    if (!member) return

    const newSubscription: DigestSubscription = {
      scheduleId,
      enabled,
      deliveryChannel: 'email',
      subscribedAt: Date.now()
    }

    if (member.id === currentUser?.id) {
      const [, setUser] = [null, (updater: any) => {
        const updated = typeof updater === 'function' ? updater(currentUser) : updater
        localStorage.setItem('current-user', JSON.stringify(updated))
      }]
      
      const existingSub = member.digestSubscriptions?.find(s => s.scheduleId === scheduleId)
      const updatedSubs = existingSub
        ? member.digestSubscriptions.map(s => 
            s.scheduleId === scheduleId ? { ...s, enabled } : s
          )
        : [...(member.digestSubscriptions || []), newSubscription]
      
      setUser({ ...member, digestSubscriptions: updatedSubs })
    } else {
      const [, setMembers] = [null, (updater: any) => {
        const updated = typeof updater === 'function' ? updater(teamMembers) : updater
        localStorage.setItem('team-members', JSON.stringify(updated))
      }]
      
      setMembers((current: TeamMember[]) =>
        (current || []).map(m => {
          if (m.id !== memberId) return m
          
          const existingSub = m.digestSubscriptions?.find(s => s.scheduleId === scheduleId)
          const updatedSubs = existingSub
            ? m.digestSubscriptions.map(s => 
                s.scheduleId === scheduleId ? { ...s, enabled } : s
              )
            : [...(m.digestSubscriptions || []), newSubscription]
          
          return { ...m, digestSubscriptions: updatedSubs }
        })
      )
    }

    toast.success(`Subscription ${enabled ? 'enabled' : 'disabled'} for ${member.name}`)
  }

  const handleBulkSubscribe = (scheduleId: string) => {
    if (selectedMembers.size === 0) {
      toast.error('Please select at least one member')
      return
    }

    selectedMembers.forEach(memberId => {
      handleToggleMemberSubscription(memberId, scheduleId, true)
    })

    toast.success(`Subscribed ${selectedMembers.size} member(s) to digest`)
    setSelectedMembers(new Set())
  }

  const getSubscriptionStats = (scheduleId: string) => {
    const subscribedCount = activeMembers.filter(m =>
      m.digestSubscriptions?.some(s => s.scheduleId === scheduleId && s.enabled)
    ).length
    
    return {
      subscribed: subscribedCount,
      total: activeMembers.length,
      percentage: activeMembers.length > 0 ? Math.round((subscribedCount / activeMembers.length) * 100) : 0
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/30">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center">
                <Users size={28} weight="duotone" className="text-accent" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Role-Based Digest Subscriptions</h2>
              <p className="text-muted-foreground">
                Manage digest subscriptions for your team members. Configure who receives which digests and customize delivery preferences for each role.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {(!digestSchedules || digestSchedules.length === 0) ? (
        <Card className="p-12 text-center border-dashed">
          <CalendarBlank size={64} weight="thin" className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Digest Schedules</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create digest schedules first before managing team subscriptions
          </p>
          <Button className="gap-2">
            <CalendarBlank size={18} weight="fill" />
            Go to Digest Scheduler
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Digest Schedules</h3>
              <Badge variant="secondary">
                {digestSchedules.length} total
              </Badge>
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {digestSchedules.map((schedule, index) => {
                  const stats = getSubscriptionStats(schedule.id)
                  
                  return (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                          schedule.enabled 
                            ? 'border-accent/50 bg-accent/5' 
                            : 'border-border bg-card'
                        } ${selectedSchedule?.id === schedule.id ? 'ring-2 ring-accent' : ''}`}
                        onClick={() => setSelectedSchedule(schedule)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1 truncate">
                                {schedule.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {schedule.frequency} at {schedule.deliveryTime}
                              </p>
                            </div>
                            <Badge 
                              variant={schedule.enabled ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {schedule.enabled ? 'Active' : 'Paused'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-accent transition-all duration-300"
                                  style={{ width: `${stats.percentage}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                              {stats.subscribed}/{stats.total}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                            {schedule.channels.map(channel => (
                              <Badge key={channel} variant="outline" className="text-xs">
                                {channel === 'email' ? (
                                  <><EnvelopeSimple size={12} className="mr-1" /> Email</>
                                ) : (
                                  <><SlackLogo size={12} className="mr-1" /> Slack</>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="lg:col-span-2">
            {selectedSchedule ? (
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{selectedSchedule.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage subscriptions for this digest schedule
                        </p>
                      </div>
                      <Badge className="bg-accent/20 text-accent border-accent/30 gap-2">
                        <Users size={14} />
                        {getSubscriptionStats(selectedSchedule.id).subscribed} subscribed
                      </Badge>
                    </div>

                    {selectedMembers.size > 0 && (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/10 border border-accent/30">
                        <CheckCircle size={24} weight="fill" className="text-accent" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">
                            {selectedMembers.size} member(s) selected
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Subscribe them to this digest with one click
                          </p>
                        </div>
                        <Button
                          onClick={() => handleBulkSubscribe(selectedSchedule.id)}
                          size="sm"
                          className="gap-2"
                        >
                          <Plus size={16} weight="bold" />
                          Subscribe All
                        </Button>
                        <Button
                          onClick={() => setSelectedMembers(new Set())}
                          size="sm"
                          variant="ghost"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold">Team Members</h4>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const allIds = new Set(activeMembers.map(m => m.id))
                            setSelectedMembers(allIds)
                          }}
                        >
                          Select All
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-2">
                        {activeMembers.map((member, index) => {
                          const subscription = getMemberSubscriptionForSchedule(member, selectedSchedule.id)
                          const isSubscribed = subscription?.enabled || false
                          const isSelected = selectedMembers.has(member.id)

                          return (
                            <motion.div
                              key={member.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                            >
                              <Card className={`p-4 transition-all ${
                                isSubscribed ? 'border-accent/50 bg-accent/5' : 'bg-card'
                              }`}>
                                <div className="flex items-center gap-4">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      const newSelected = new Set(selectedMembers)
                                      if (checked) {
                                        newSelected.add(member.id)
                                      } else {
                                        newSelected.delete(member.id)
                                      }
                                      setSelectedMembers(newSelected)
                                    }}
                                  />

                                  <Avatar className="w-10 h-10 flex-shrink-0">
                                    <AvatarFallback className="bg-accent/20 text-accent text-xs font-semibold">
                                      {getInitials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium truncate">
                                        {member.name}
                                        {member.id === currentUser?.id && (
                                          <span className="text-xs text-muted-foreground ml-2">(You)</span>
                                        )}
                                      </span>
                                      <Badge variant="outline" className="text-xs gap-1">
                                        {getRoleIcon(member.role)}
                                        {member.role}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                    
                                    {subscription && (
                                      <div className="flex items-center gap-2 mt-2">
                                        {subscription.deliveryChannel === 'email' ? (
                                          <EnvelopeSimple size={12} className="text-accent" />
                                        ) : (
                                          <SlackLogo size={12} className="text-[#4A154B]" />
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                          via {subscription.deliveryChannel}
                                        </span>
                                        {subscription.customFilters && (
                                          <>
                                            <Separator orientation="vertical" className="h-3" />
                                            <Gear size={12} className="text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Custom filters</span>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isSubscribed && (
                                      <Badge className="bg-success/20 text-success border-success/30 text-xs gap-1">
                                        <CheckCircle size={12} weight="fill" />
                                        Subscribed
                                      </Badge>
                                    )}
                                    <Switch
                                      checked={isSubscribed}
                                      onCheckedChange={(checked) => {
                                        handleToggleMemberSubscription(member.id, selectedSchedule.id, checked)
                                      }}
                                    />
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center border-dashed h-full flex flex-col items-center justify-center">
                <CalendarBlank size={64} weight="thin" className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Digest Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a schedule from the list to manage team member subscriptions
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      <Card className="p-6 bg-metric-purple/5 border-metric-purple/30">
        <div className="flex items-start gap-4">
          <Sparkle size={24} weight="fill" className="text-metric-purple flex-shrink-0" />
          <div>
            <h4 className="font-semibold mb-2">Smart Digest Recommendations</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Based on user roles, we recommend different digest configurations:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-card border">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={14} weight="fill" className="text-warning" />
                  <strong>Executives (Owner/Admin)</strong>
                </div>
                <p className="text-muted-foreground">Daily high-priority insights with strategic recommendations</p>
              </div>
              <div className="p-3 rounded-lg bg-card border">
                <div className="flex items-center gap-2 mb-2">
                  <PencilSimple size={14} weight="fill" className="text-success" />
                  <strong>Analysts (Editor)</strong>
                </div>
                <p className="text-muted-foreground">Daily detailed insights with all anomalies and trends</p>
              </div>
              <div className="p-3 rounded-lg bg-card border">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={14} weight="duotone" className="text-muted-foreground" />
                  <strong>Stakeholders (Viewer)</strong>
                </div>
                <p className="text-muted-foreground">Weekly summary with key achievements and important alerts</p>
              </div>
              <div className="p-3 rounded-lg bg-card border">
                <div className="flex items-center gap-2 mb-2">
                  <Bell size={14} weight="fill" className="text-accent" />
                  <strong>Custom Preferences</strong>
                </div>
                <p className="text-muted-foreground">Each user can customize their own digest filters and frequency</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
