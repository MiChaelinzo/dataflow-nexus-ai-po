import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  EnvelopeSimple, 
  Clock, 
  CalendarBlank,
  CheckCircle,
  Bell,
  Lightning,
  Sparkle,
  PlayCircle,
  Gear,
  At,
  SlackLogo,
  Eye
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { DigestPreview } from '@/components/DigestPreview'

export interface DigestSchedule {
  id: string
  name: string
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  deliveryTime: string
  dayOfWeek?: number
  dayOfMonth?: number
  channels: ('email' | 'slack')[]
  emailRecipients: string[]
  slackChannel?: string
  includeInsightTypes: ('opportunity' | 'alert' | 'trend' | 'anomaly' | 'achievement')[]
  minPriority: 'low' | 'medium' | 'high'
  minConfidence: number
  includeTopMetrics: boolean
  includePredictions: boolean
  includeRecommendations: boolean
  maxInsights: number
  lastSent?: number
  createdAt: number
}

export function DigestScheduler() {
  const [schedules, setSchedules] = useKV<DigestSchedule[]>('digest-schedules', [])
  const [selectedSchedule, setSelectedSchedule] = useState<DigestSchedule | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [previewSchedule, setPreviewSchedule] = useState<DigestSchedule | null>(null)
  const [slackConnected] = useKV<boolean>('slack-connected', false)

  const createDefaultSchedule = (): DigestSchedule => ({
    id: Date.now().toString(),
    name: 'Daily Insights Digest',
    enabled: false,
    frequency: 'daily',
    deliveryTime: '09:00',
    channels: ['email'],
    emailRecipients: [],
    includeInsightTypes: ['opportunity', 'alert', 'trend', 'anomaly', 'achievement'],
    minPriority: 'medium',
    minConfidence: 75,
    includeTopMetrics: true,
    includePredictions: true,
    includeRecommendations: true,
    maxInsights: 10,
    createdAt: Date.now()
  })

  const handleCreateSchedule = () => {
    const newSchedule = createDefaultSchedule()
    setSchedules(current => [...(current || []), newSchedule])
    setSelectedSchedule(newSchedule)
    setIsCreating(true)
    toast.success('New digest schedule created')
  }

  const handleUpdateSchedule = (updated: DigestSchedule) => {
    setSchedules(current =>
      (current || []).map(s => s.id === updated.id ? updated : s)
    )
    setSelectedSchedule(updated)
  }

  const handleToggleSchedule = (id: string, enabled: boolean) => {
    setSchedules(current =>
      (current || []).map(s => 
        s.id === id ? { ...s, enabled } : s
      )
    )
    toast.success(enabled ? 'Digest schedule enabled' : 'Digest schedule disabled')
  }

  const handleDeleteSchedule = (id: string) => {
    setSchedules(current =>
      (current || []).filter(s => s.id !== id)
    )
    if (selectedSchedule?.id === id) {
      setSelectedSchedule(null)
      setIsCreating(false)
    }
    toast.success('Digest schedule deleted')
  }

  const handleTestSend = async (schedule: DigestSchedule) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Sending test digest...',
        success: () => {
          setSchedules(current =>
            (current || []).map(s =>
              s.id === schedule.id ? { ...s, lastSent: Date.now() } : s
            )
          )
          return `Test digest sent successfully via ${schedule.channels.join(', ')}`
        },
        error: 'Failed to send test digest'
      }
    )
  }

  const getNextDeliveryTime = (schedule: DigestSchedule): string => {
    const now = new Date()
    const [hours, minutes] = schedule.deliveryTime.split(':').map(Number)
    
    let nextDate = new Date()
    nextDate.setHours(hours, minutes, 0, 0)
    
    if (nextDate <= now) {
      nextDate.setDate(nextDate.getDate() + 1)
    }
    
    switch (schedule.frequency) {
      case 'weekly':
        while (nextDate.getDay() !== (schedule.dayOfWeek || 1)) {
          nextDate.setDate(nextDate.getDate() + 1)
        }
        break
      case 'biweekly':
        while (nextDate.getDay() !== (schedule.dayOfWeek || 1)) {
          nextDate.setDate(nextDate.getDate() + 1)
        }
        break
      case 'monthly':
        nextDate.setDate(schedule.dayOfMonth || 1)
        if (nextDate <= now) {
          nextDate.setMonth(nextDate.getMonth() + 1)
        }
        break
    }
    
    return nextDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getFrequencyLabel = (frequency: DigestSchedule['frequency']): string => {
    switch (frequency) {
      case 'daily': return 'Every day'
      case 'weekly': return 'Every week'
      case 'biweekly': return 'Every 2 weeks'
      case 'monthly': return 'Every month'
    }
  }

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
                  <EnvelopeSimple size={28} weight="fill" className="text-accent" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Scheduled Digests</h2>
                <p className="text-muted-foreground max-w-2xl">
                  Automatically receive curated summaries of Pulse insights on your schedule. Get daily or weekly digests delivered via email or Slack with the most important trends, alerts, and opportunities.
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleCreateSchedule}
              className="flex-shrink-0 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <CalendarBlank size={18} weight="fill" />
              Create Schedule
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Schedules</h3>
            <Badge variant="secondary">
              {(schedules || []).length} total
            </Badge>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            {!schedules || schedules.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <CalendarBlank size={48} weight="thin" className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-sm font-semibold mb-2">No schedules yet</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Create your first digest schedule to start receiving automated summaries
                </p>
                <Button size="sm" variant="outline" onClick={handleCreateSchedule}>
                  Create Schedule
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule, index) => (
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
                      onClick={() => {
                        setSelectedSchedule(schedule)
                        setIsCreating(false)
                      }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1 truncate">
                              {schedule.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {getFrequencyLabel(schedule.frequency)} at {schedule.deliveryTime}
                            </p>
                          </div>
                          <Switch
                            checked={schedule.enabled}
                            onCheckedChange={(checked) => {
                              handleToggleSchedule(schedule.id, checked)
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {schedule.channels.map(channel => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channel === 'email' ? (
                                <><EnvelopeSimple size={12} className="mr-1" /> Email</>
                              ) : (
                                <><SlackLogo size={12} className="mr-1" /> Slack</>
                              )}
                            </Badge>
                          ))}
                        </div>

                        {schedule.enabled && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                            <Clock size={12} weight="bold" />
                            Next: {getNextDeliveryTime(schedule)}
                          </div>
                        )}

                        {schedule.lastSent && (
                          <div className="flex items-center gap-2 text-xs text-success pt-2 border-t">
                            <CheckCircle size={12} weight="fill" />
                            Last sent {new Date(schedule.lastSent).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="lg:col-span-2">
          {selectedSchedule || isCreating ? (
            <Card className="p-6">
              <Tabs defaultValue="settings" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                  <TabsTrigger value="settings" className="gap-2">
                    <Gear size={16} weight="duotone" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye size={16} weight="duotone" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="schedule-name" className="text-sm font-semibold mb-2 block">
                        Schedule Name
                      </Label>
                      <input
                        id="schedule-name"
                        type="text"
                        value={selectedSchedule?.name || ''}
                        onChange={(e) => selectedSchedule && handleUpdateSchedule({
                          ...selectedSchedule,
                          name: e.target.value
                        })}
                        className="w-full px-3 py-2 bg-secondary border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="e.g., Daily Insights Digest"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <CalendarBlank size={18} weight="duotone" />
                        Delivery Schedule
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="frequency" className="text-xs mb-2 block">
                            Frequency
                          </Label>
                          <Select
                            value={selectedSchedule?.frequency}
                            onValueChange={(value) => selectedSchedule && handleUpdateSchedule({
                              ...selectedSchedule,
                              frequency: value as DigestSchedule['frequency']
                            })}
                          >
                            <SelectTrigger id="frequency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="delivery-time" className="text-xs mb-2 block">
                            Delivery Time
                          </Label>
                          <input
                            id="delivery-time"
                            type="time"
                            value={selectedSchedule?.deliveryTime || '09:00'}
                            onChange={(e) => selectedSchedule && handleUpdateSchedule({
                              ...selectedSchedule,
                              deliveryTime: e.target.value
                            })}
                            className="w-full px-3 py-2 bg-secondary border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>

                      {selectedSchedule?.frequency === 'weekly' || selectedSchedule?.frequency === 'biweekly' ? (
                        <div>
                          <Label htmlFor="day-of-week" className="text-xs mb-2 block">
                            Day of Week
                          </Label>
                          <Select
                            value={selectedSchedule?.dayOfWeek?.toString() || '1'}
                            onValueChange={(value) => selectedSchedule && handleUpdateSchedule({
                              ...selectedSchedule,
                              dayOfWeek: parseInt(value)
                            })}
                          >
                            <SelectTrigger id="day-of-week">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Monday</SelectItem>
                              <SelectItem value="2">Tuesday</SelectItem>
                              <SelectItem value="3">Wednesday</SelectItem>
                              <SelectItem value="4">Thursday</SelectItem>
                              <SelectItem value="5">Friday</SelectItem>
                              <SelectItem value="6">Saturday</SelectItem>
                              <SelectItem value="0">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null}

                      {selectedSchedule?.frequency === 'monthly' ? (
                        <div>
                          <Label htmlFor="day-of-month" className="text-xs mb-2 block">
                            Day of Month
                          </Label>
                          <Select
                            value={selectedSchedule?.dayOfMonth?.toString() || '1'}
                            onValueChange={(value) => selectedSchedule && handleUpdateSchedule({
                              ...selectedSchedule,
                              dayOfMonth: parseInt(value)
                            })}
                          >
                            <SelectTrigger id="day-of-month">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                <SelectItem key={day} value={day.toString()}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Bell size={18} weight="duotone" />
                        Delivery Channels
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <EnvelopeSimple size={20} weight="duotone" className="text-accent" />
                            <div>
                              <p className="text-sm font-medium">Email</p>
                              <p className="text-xs text-muted-foreground">Send digest to email addresses</p>
                            </div>
                          </div>
                          <Switch
                            checked={selectedSchedule?.channels.includes('email')}
                            onCheckedChange={(checked) => {
                              if (!selectedSchedule) return
                              const channels = checked
                                ? [...selectedSchedule.channels, 'email']
                                : selectedSchedule.channels.filter(c => c !== 'email')
                              handleUpdateSchedule({ ...selectedSchedule, channels: channels as any })
                            }}
                          />
                        </div>

                        {selectedSchedule?.channels.includes('email') && (
                          <div className="ml-8 space-y-2">
                            <Label htmlFor="email-recipients" className="text-xs">
                              Email Recipients (comma-separated)
                            </Label>
                            <input
                              id="email-recipients"
                              type="text"
                              value={selectedSchedule?.emailRecipients.join(', ') || ''}
                              onChange={(e) => selectedSchedule && handleUpdateSchedule({
                                ...selectedSchedule,
                                emailRecipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                              })}
                              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="user@example.com, team@example.com"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <SlackLogo size={20} weight="fill" className="text-[#4A154B]" />
                            <div>
                              <p className="text-sm font-medium">Slack</p>
                              <p className="text-xs text-muted-foreground">Post digest to Slack channel</p>
                            </div>
                          </div>
                          <Switch
                            checked={selectedSchedule?.channels.includes('slack')}
                            onCheckedChange={(checked) => {
                              if (!selectedSchedule) return
                              if (checked && !slackConnected) {
                                toast.error('Connect to Slack first', {
                                  description: 'Set up Slack integration in the Notifications tab'
                                })
                                return
                              }
                              const channels = checked
                                ? [...selectedSchedule.channels, 'slack']
                                : selectedSchedule.channels.filter(c => c !== 'slack')
                              handleUpdateSchedule({ ...selectedSchedule, channels: channels as any })
                            }}
                            disabled={!slackConnected}
                          />
                        </div>

                        {selectedSchedule?.channels.includes('slack') && (
                          <div className="ml-8 space-y-2">
                            <Label htmlFor="slack-channel" className="text-xs">
                              Slack Channel
                            </Label>
                            <input
                              id="slack-channel"
                              type="text"
                              value={selectedSchedule?.slackChannel || ''}
                              onChange={(e) => selectedSchedule && handleUpdateSchedule({
                                ...selectedSchedule,
                                slackChannel: e.target.value
                              })}
                              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="analytics-digest"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Sparkle size={18} weight="duotone" />
                        Content Filters
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs mb-2 block">Minimum Priority</Label>
                          <Select
                            value={selectedSchedule?.minPriority}
                            onValueChange={(value) => selectedSchedule && handleUpdateSchedule({
                              ...selectedSchedule,
                              minPriority: value as DigestSchedule['minPriority']
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low and above</SelectItem>
                              <SelectItem value="medium">Medium and above</SelectItem>
                              <SelectItem value="high">High only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="min-confidence" className="text-xs mb-2 block">
                            Minimum Confidence: {selectedSchedule?.minConfidence}%
                          </Label>
                          <input
                            id="min-confidence"
                            type="range"
                            min="50"
                            max="99"
                            value={selectedSchedule?.minConfidence || 75}
                            onChange={(e) => selectedSchedule && handleUpdateSchedule({
                              ...selectedSchedule,
                              minConfidence: parseInt(e.target.value)
                            })}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <Label htmlFor="max-insights" className="text-xs mb-2 block">
                            Maximum Insights: {selectedSchedule?.maxInsights}
                          </Label>
                          <input
                            id="max-insights"
                            type="range"
                            min="5"
                            max="25"
                            step="5"
                            value={selectedSchedule?.maxInsights || 10}
                            onChange={(e) => selectedSchedule && handleUpdateSchedule({
                              ...selectedSchedule,
                              maxInsights: parseInt(e.target.value)
                            })}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
                            <Label htmlFor="include-metrics" className="text-xs cursor-pointer">
                              Include top metrics summary
                            </Label>
                            <Switch
                              id="include-metrics"
                              checked={selectedSchedule?.includeTopMetrics}
                              onCheckedChange={(checked) => selectedSchedule && handleUpdateSchedule({
                                ...selectedSchedule,
                                includeTopMetrics: checked
                              })}
                            />
                          </div>

                          <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
                            <Label htmlFor="include-predictions" className="text-xs cursor-pointer">
                              Include predictions & forecasts
                            </Label>
                            <Switch
                              id="include-predictions"
                              checked={selectedSchedule?.includePredictions}
                              onCheckedChange={(checked) => selectedSchedule && handleUpdateSchedule({
                                ...selectedSchedule,
                                includePredictions: checked
                              })}
                            />
                          </div>

                          <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
                            <Label htmlFor="include-recommendations" className="text-xs cursor-pointer">
                              Include actionable recommendations
                            </Label>
                            <Switch
                              id="include-recommendations"
                              checked={selectedSchedule?.includeRecommendations}
                              onCheckedChange={(checked) => selectedSchedule && handleUpdateSchedule({
                                ...selectedSchedule,
                                includeRecommendations: checked
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => selectedSchedule && handleTestSend(selectedSchedule)}
                      variant="outline"
                      className="gap-2"
                      disabled={!selectedSchedule?.channels.length}
                    >
                      <PlayCircle size={18} weight="fill" />
                      Send Test Digest
                    </Button>

                    {selectedSchedule && !isCreating && (
                      <Button
                        onClick={() => handleDeleteSchedule(selectedSchedule.id)}
                        variant="destructive"
                        className="gap-2"
                      >
                        Delete Schedule
                      </Button>
                    )}

                    <div className="flex-1" />

                    <Badge variant={selectedSchedule?.enabled ? 'default' : 'secondary'} className="gap-2">
                      {selectedSchedule?.enabled ? (
                        <>
                          <CheckCircle size={14} weight="fill" />
                          Active
                        </>
                      ) : (
                        <>
                          <Clock size={14} />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  {selectedSchedule && (
                    <DigestPreview schedule={selectedSchedule} />
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <Card className="p-12 text-center border-dashed h-full flex flex-col items-center justify-center">
              <CalendarBlank size={64} weight="thin" className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Schedule Selected</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Select an existing schedule from the list or create a new one to configure your digest delivery settings
              </p>
              <Button onClick={handleCreateSchedule} className="gap-2">
                <CalendarBlank size={18} weight="fill" />
                Create Your First Schedule
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
