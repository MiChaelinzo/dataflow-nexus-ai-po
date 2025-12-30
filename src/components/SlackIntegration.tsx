import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SlackLogo,
  CheckCircle,
  XCircle,
  Bell,
  Lightning,
  Warning,
  Sparkle,
  Users,
  Hash,
  CaretRight,
  PaperPlaneTilt
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { SlackMessagePreview } from '@/components/SlackMessagePreview'

export interface SlackChannel {
  id: string
  name: string
  type: 'channel' | 'dm' | 'private'
  memberCount?: number
}

export interface SlackNotificationRule {
  id: string
  name: string
  enabled: boolean
  channel: string
  insightTypes: ('opportunity' | 'alert' | 'trend' | 'anomaly' | 'achievement')[]
  priorityLevel: ('high' | 'medium' | 'low')[]
  confidenceThreshold: number
  notifyImmediately: boolean
  digestEnabled: boolean
  digestSchedule?: 'hourly' | 'daily' | 'weekly'
}

interface SlackIntegrationProps {
  onNotificationSent?: (message: string) => void
}

export function SlackIntegration({ onNotificationSent }: SlackIntegrationProps) {
  const [slackConnected, setSlackConnected] = useKV<boolean>('slack-connected', false)
  const [webhookUrl, setWebhookUrl] = useKV<string>('slack-webhook-url', '')
  const [workspaceName, setWorkspaceName] = useKV<string>('slack-workspace-name', '')
  const [channels, setChannels] = useKV<SlackChannel[]>('slack-channels', [])
  const [notificationRules, setNotificationRules] = useKV<SlackNotificationRule[]>('slack-notification-rules', [])
  
  const [testWebhookUrl, setTestWebhookUrl] = useState('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<SlackNotificationRule | null>(null)

  const mockChannels: SlackChannel[] = [
    { id: 'C001', name: 'analytics-insights', type: 'channel', memberCount: 42 },
    { id: 'C002', name: 'data-team', type: 'channel', memberCount: 15 },
    { id: 'C003', name: 'executive-dashboard', type: 'private', memberCount: 8 },
    { id: 'C004', name: 'sales-alerts', type: 'channel', memberCount: 28 },
    { id: 'C005', name: 'customer-success', type: 'channel', memberCount: 19 }
  ]

  const connectToSlack = async () => {
    setIsConnecting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSlackConnected(true)
      setWebhookUrl(testWebhookUrl)
      setWorkspaceName('Analytics Team')
      setChannels(mockChannels)
      
      const defaultRule: SlackNotificationRule = {
        id: Date.now().toString(),
        name: 'High Priority Insights',
        enabled: true,
        channel: 'analytics-insights',
        insightTypes: ['opportunity', 'alert', 'anomaly', 'achievement'],
        priorityLevel: ['high'],
        confidenceThreshold: 85,
        notifyImmediately: true,
        digestEnabled: false
      }
      
      setNotificationRules([defaultRule])
      
      toast.success('Connected to Slack!', {
        description: 'You can now send Pulse insights to your team'
      })
      
      setShowSetupDialog(false)
    } catch (error) {
      toast.error('Failed to connect', {
        description: 'Please check your webhook URL and try again'
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectSlack = () => {
    setSlackConnected(false)
    setWebhookUrl('')
    setWorkspaceName('')
    setChannels([])
    setNotificationRules([])
    
    toast.success('Disconnected from Slack')
  }

  const testConnection = async () => {
    if (!testWebhookUrl) {
      toast.error('Please enter a webhook URL')
      return
    }

    setIsTestingConnection(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Connection test successful!', {
        description: 'Your webhook URL is valid'
      })
    } catch (error) {
      toast.error('Connection test failed', {
        description: 'Please check your webhook URL'
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const toggleRule = (ruleId: string) => {
    setNotificationRules((current) =>
      (current || []).map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    )
  }

  const deleteRule = (ruleId: string) => {
    setNotificationRules((current) =>
      (current || []).filter(rule => rule.id !== ruleId)
    )
    toast.success('Notification rule deleted')
  }

  const saveRule = (rule: SlackNotificationRule) => {
    if (editingRule) {
      setNotificationRules((current) =>
        (current || []).map(r => r.id === rule.id ? rule : r)
      )
      toast.success('Notification rule updated')
    } else {
      setNotificationRules((current) => [...(current || []), rule])
      toast.success('Notification rule created')
    }
    setShowRuleDialog(false)
    setEditingRule(null)
  }

  const sendTestNotification = async (channelName: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast.success('Test notification sent!', {
        description: `Check #${channelName} in Slack`
      })
      
      if (onNotificationSent) {
        onNotificationSent(`Test message sent to #${channelName}`)
      }
    } catch (error) {
      toast.error('Failed to send test notification')
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-gradient-to-br from-[#4A154B]/10 via-card to-[#4A154B]/5 border-[#4A154B]/30">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-[#4A154B]/20 flex items-center justify-center">
                  <SlackLogo size={28} weight="fill" className="text-[#4A154B]" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  Slack Integration
                  {slackConnected && (
                    <Badge className="bg-success/20 text-success border-success/30 gap-1.5">
                      <CheckCircle size={14} weight="fill" />
                      Connected
                    </Badge>
                  )}
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  Send Tableau Pulse insights directly to your team's Slack channels. Configure notification rules to keep your team informed about critical metrics and opportunities.
                </p>
              </div>
            </div>
            
            {!slackConnected ? (
              <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
                <DialogTrigger asChild>
                  <Button className="flex-shrink-0 gap-2 bg-[#4A154B] hover:bg-[#4A154B]/90 text-white">
                    <SlackLogo size={18} weight="fill" />
                    Connect to Slack
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Connect to Slack</DialogTitle>
                    <DialogDescription>
                      Enter your Slack webhook URL to enable notifications. You can create a webhook in your Slack workspace settings.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://hooks.slack.com/services/..."
                        value={testWebhookUrl}
                        onChange={(e) => setTestWebhookUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Get your webhook URL from Slack's{' '}
                        <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener noreferrer" className="text-accent underline">
                          Incoming Webhooks
                        </a>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={testConnection}
                        disabled={isTestingConnection || !testWebhookUrl}
                        className="flex-1"
                      >
                        {isTestingConnection ? 'Testing...' : 'Test Connection'}
                      </Button>
                      <Button
                        onClick={connectToSlack}
                        disabled={isConnecting || !testWebhookUrl}
                        className="flex-1 bg-[#4A154B] hover:bg-[#4A154B]/90"
                      >
                        {isConnecting ? 'Connecting...' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                variant="outline"
                onClick={disconnectSlack}
                className="flex-shrink-0 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <XCircle size={18} weight="bold" />
                Disconnect
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      {slackConnected && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Bell size={20} weight="fill" className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Rules</p>
                  <p className="text-2xl font-bold font-mono">
                    {(notificationRules || []).filter(r => r.enabled).length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Hash size={20} weight="bold" className="text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Connected Channels</p>
                  <p className="text-2xl font-bold font-mono">{(channels || []).length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#4A154B]/20 flex items-center justify-center">
                  <SlackLogo size={20} weight="fill" className="text-[#4A154B]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Workspace</p>
                  <p className="text-lg font-semibold">{workspaceName}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Notification Rules</h3>
                <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2" onClick={() => setEditingRule(null)}>
                      <Lightning size={16} weight="fill" />
                      Add Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{editingRule ? 'Edit' : 'Create'} Notification Rule</DialogTitle>
                      <DialogDescription>
                        Configure when and where Pulse insights should be sent to Slack
                      </DialogDescription>
                    </DialogHeader>
                    <NotificationRuleForm
                      rule={editingRule}
                      channels={channels || []}
                      onSave={saveRule}
                      onCancel={() => {
                        setShowRuleDialog(false)
                        setEditingRule(null)
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                {(!notificationRules || notificationRules.length === 0) ? (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <Bell size={48} weight="thin" className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No notification rules yet. Create one to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {notificationRules.map((rule, index) => (
                        <motion.div
                          key={rule.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className={`p-4 ${rule.enabled ? 'border-accent/30 bg-accent/5' : 'opacity-60'}`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <Switch
                                  checked={rule.enabled}
                                  onCheckedChange={() => toggleRule(rule.id)}
                                />
                                <div>
                                  <h4 className="font-semibold text-sm">{rule.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Hash size={12} className="text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{rule.channel}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() => {
                                    setEditingRule(rule)
                                    setShowRuleDialog(true)
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-destructive hover:text-destructive"
                                  onClick={() => deleteRule(rule.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1.5">
                                {rule.insightTypes.map(type => (
                                  <Badge key={type} variant="secondary" className="text-xs capitalize">
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CaretRight size={12} weight="bold" />
                                  Priority: {rule.priorityLevel.join(', ')}
                                </span>
                                <span>•</span>
                                <span>Min confidence: {rule.confidenceThreshold}%</span>
                              </div>
                              {rule.notifyImmediately && (
                                <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                                  Instant Notifications
                                </Badge>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Available Channels</h3>
              
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {(channels || []).map((channel, index) => (
                    <motion.div
                      key={channel.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {channel.type === 'private' ? (
                              <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                                <Warning size={16} weight="fill" className="text-warning" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                                <Hash size={16} weight="bold" className="text-accent" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-sm">{channel.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users size={12} />
                                <span>{channel.memberCount} members</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => sendTestNotification(channel.name)}
                          >
                            <PaperPlaneTilt size={14} weight="fill" />
                            Test
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Message Preview</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Here's how Pulse insights will appear when sent to Slack:
            </p>
            <SlackMessagePreview
              title="Revenue Surge Detected"
              description="Total revenue has increased by 21.6% compared to last period, reaching $2.85M. This is your highest revenue month this quarter."
              metric="Total Revenue"
              metricValue="$2.85M"
              change={21.6}
              type="achievement"
              priority="high"
              confidence={94}
              suggestedAction="Review Enterprise pipeline and replicate successful strategies"
            />
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Sparkle size={24} weight="fill" className="text-accent" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Automatic Insight Delivery
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Pulse insights matching your notification rules will be automatically sent to the configured Slack channels. Team members can react, comment, and take action directly from Slack.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1.5">
                    <CheckCircle size={14} weight="fill" />
                    Real-time delivery
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <CheckCircle size={14} weight="fill" />
                    Rich formatting
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <CheckCircle size={14} weight="fill" />
                    Interactive actions
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

interface NotificationRuleFormProps {
  rule: SlackNotificationRule | null
  channels: SlackChannel[]
  onSave: (rule: SlackNotificationRule) => void
  onCancel: () => void
}

function NotificationRuleForm({ rule, channels, onSave, onCancel }: NotificationRuleFormProps) {
  const [name, setName] = useState(rule?.name || '')
  const [channel, setChannel] = useState(rule?.channel || '')
  const [insightTypes, setInsightTypes] = useState<Set<string>>(
    new Set(rule?.insightTypes || ['opportunity', 'alert'])
  )
  const [priorityLevel, setPriorityLevel] = useState<Set<string>>(
    new Set(rule?.priorityLevel || ['high'])
  )
  const [confidenceThreshold, setConfidenceThreshold] = useState(rule?.confidenceThreshold || 85)
  const [notifyImmediately, setNotifyImmediately] = useState(rule?.notifyImmediately ?? true)

  const toggleInsightType = (type: string) => {
    const newSet = new Set(insightTypes)
    if (newSet.has(type)) {
      newSet.delete(type)
    } else {
      newSet.add(type)
    }
    setInsightTypes(newSet)
  }

  const togglePriority = (priority: string) => {
    const newSet = new Set(priorityLevel)
    if (newSet.has(priority)) {
      newSet.delete(priority)
    } else {
      newSet.add(priority)
    }
    setPriorityLevel(newSet)
  }

  const handleSave = () => {
    if (!name || !channel || insightTypes.size === 0 || priorityLevel.size === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    const newRule: SlackNotificationRule = {
      id: rule?.id || Date.now().toString(),
      name,
      enabled: rule?.enabled ?? true,
      channel,
      insightTypes: Array.from(insightTypes) as any,
      priorityLevel: Array.from(priorityLevel) as any,
      confidenceThreshold,
      notifyImmediately,
      digestEnabled: false
    }

    onSave(newRule)
  }

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="rule-name">Rule Name *</Label>
        <Input
          id="rule-name"
          placeholder="e.g., High Priority Alerts"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="channel">Slack Channel *</Label>
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger id="channel">
            <SelectValue placeholder="Select a channel" />
          </SelectTrigger>
          <SelectContent>
            {channels.map(ch => (
              <SelectItem key={ch.id} value={ch.name}>
                <div className="flex items-center gap-2">
                  {ch.type === 'private' ? (
                    <Warning size={14} weight="fill" />
                  ) : (
                    <Hash size={14} weight="bold" />
                  )}
                  {ch.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Insight Types *</Label>
        <div className="flex flex-wrap gap-2">
          {['opportunity', 'alert', 'trend', 'anomaly', 'achievement'].map(type => (
            <Badge
              key={type}
              variant={insightTypes.has(type) ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => toggleInsightType(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Priority Levels *</Label>
        <div className="flex gap-2">
          {['high', 'medium', 'low'].map(priority => (
            <Badge
              key={priority}
              variant={priorityLevel.has(priority) ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => togglePriority(priority)}
            >
              {priority}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confidence">Minimum Confidence: {confidenceThreshold}%</Label>
        <input
          id="confidence"
          type="range"
          min="50"
          max="99"
          value={confidenceThreshold}
          onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border">
        <div>
          <Label htmlFor="instant" className="cursor-pointer">Instant Notifications</Label>
          <p className="text-xs text-muted-foreground">Send immediately when insights are generated</p>
        </div>
        <Switch
          id="instant"
          checked={notifyImmediately}
          onCheckedChange={setNotifyImmediately}
        />
      </div>

      <Separator />

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {rule ? 'Update' : 'Create'} Rule
        </Button>
      </div>
    </div>
  )
}
