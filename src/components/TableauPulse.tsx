import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Sparkle, 
  TrendUp, 
  TrendDown, 
  Bell, 
  Lightning, 
  Clock,
  CheckCircle,
  ArrowRight,
  BookmarkSimple,
  ShareNetwork,
  ChartLine,
  Warning,
  SlackLogo,
  CalendarBlank
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { Metric } from '@/lib/types'
import { SlackIntegration, SlackNotificationRule } from '@/components/SlackIntegration'
import { DigestScheduler } from '@/components/DigestScheduler'

interface PulseInsight {
  id: string
  title: string
  description: string
  type: 'opportunity' | 'alert' | 'trend' | 'anomaly' | 'achievement'
  metric: string
  metricValue: string
  change?: number
  confidence: number
  priority: 'high' | 'medium' | 'low'
  timestamp: number
  read: boolean
  bookmarked: boolean
  actionable: boolean
  suggestedAction?: string
  relatedMetrics?: string[]
}

interface TableauPulseProps {
  metrics: Metric[]
}

export function TableauPulse({ metrics }: TableauPulseProps) {
  const [pulseInsights, setPulseInsights] = useKV<PulseInsight[]>('tableau-pulse-insights', [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'bookmarked'>('all')
  const [selectedInsight, setSelectedInsight] = useState<PulseInsight | null>(null)
  const [activeView, setActiveView] = useState<'insights' | 'slack'>('insights')
  const [slackConnected] = useKV<boolean>('slack-connected', false)
  const [notificationRules] = useKV<SlackNotificationRule[]>('slack-notification-rules', [])

  useEffect(() => {
    if (!pulseInsights || pulseInsights.length === 0) {
      generateInitialInsights()
    }
  }, [])

  const generateInitialInsights = async () => {
    const insights: PulseInsight[] = [
      {
        id: '1',
        title: 'Revenue Surge Detected',
        description: 'Total revenue has increased by 21.6% compared to last period, reaching $2.85M. This is your highest revenue month this quarter. The growth is driven primarily by Enterprise segment customers.',
        type: 'achievement',
        metric: 'Total Revenue',
        metricValue: '$2.85M',
        change: 21.6,
        confidence: 94,
        priority: 'high',
        timestamp: Date.now() - 1000 * 60 * 30,
        read: false,
        bookmarked: false,
        actionable: true,
        suggestedAction: 'Review Enterprise pipeline and replicate successful strategies',
        relatedMetrics: ['Active Customers', 'Avg Order Value']
      },
      {
        id: '2',
        title: 'Churn Rate Improvement',
        description: 'Customer churn has decreased by 25% to 2.1%. This is a significant improvement and suggests your retention initiatives are working effectively.',
        type: 'opportunity',
        metric: 'Churn Rate',
        metricValue: '2.1%',
        change: -25.0,
        confidence: 89,
        priority: 'high',
        timestamp: Date.now() - 1000 * 60 * 60,
        read: false,
        bookmarked: false,
        actionable: true,
        suggestedAction: 'Document successful retention strategies for team playbook',
        relatedMetrics: ['Customer Satisfaction']
      },
      {
        id: '3',
        title: 'Conversion Rate Trending Upward',
        description: 'Your conversion rate has steadily improved to 3.42%, up 8.6% from last period. This indicates improved funnel optimization and messaging effectiveness.',
        type: 'trend',
        metric: 'Conversion Rate',
        metricValue: '3.42%',
        change: 8.6,
        confidence: 92,
        priority: 'medium',
        timestamp: Date.now() - 1000 * 60 * 120,
        read: true,
        bookmarked: false,
        actionable: true,
        suggestedAction: 'Analyze top-performing campaigns to identify optimization opportunities',
        relatedMetrics: ['Active Customers']
      },
      {
        id: '4',
        title: 'Customer Satisfaction at Peak',
        description: 'Your customer satisfaction score has reached 4.7/5, a 4.4% increase. This is your highest rating in the past 6 months.',
        type: 'achievement',
        metric: 'Customer Satisfaction',
        metricValue: '4.7/5',
        change: 4.4,
        confidence: 96,
        priority: 'medium',
        timestamp: Date.now() - 1000 * 60 * 180,
        read: true,
        bookmarked: true,
        actionable: false,
        relatedMetrics: ['Churn Rate']
      }
    ]

    setPulseInsights(insights)
  }

  const generateAIInsight = async () => {
    setIsGenerating(true)
    
    try {
      const metricsData = metrics.map(m => `${m.label}: ${m.value}${m.unit} (${m.change > 0 ? '+' : ''}${m.change.toFixed(1)}%)`).join(', ')
      
      const promptText = `You are an analytics expert for Tableau Pulse. Analyze these business metrics and generate ONE specific, actionable insight: ${metricsData}

Generate a JSON object with a single property "insight" that contains an object with these fields:
- title: A concise, attention-grabbing headline (max 8 words)
- description: A detailed explanation of the insight with specific numbers and business context (2-3 sentences)
- type: one of "opportunity", "alert", "trend", "anomaly", or "achievement"
- metric: The primary metric name this insight relates to
- metricValue: The current value with units
- change: The percentage change (positive or negative number)
- confidence: A score from 75-99 indicating confidence level
- priority: "high", "medium", or "low"
- actionable: true or false
- suggestedAction: If actionable is true, provide a specific recommended action (1 sentence)
- relatedMetrics: Array of 1-2 related metric names

Focus on finding meaningful patterns, correlations, or anomalies that would be valuable to business leaders.`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const parsed = JSON.parse(response)
      
      const newInsight: PulseInsight = {
        id: Date.now().toString(),
        ...parsed.insight,
        timestamp: Date.now(),
        read: false,
        bookmarked: false
      }

      setPulseInsights(current => [newInsight, ...(current || [])])
      
      await sendToSlackIfMatches(newInsight)
      
      toast.success('New Pulse insight generated!', {
        description: newInsight.title
      })
    } catch (error) {
      console.error('Error generating insight:', error)
      toast.error('Failed to generate insight', {
        description: 'Please try again'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const sendToSlackIfMatches = async (insight: PulseInsight) => {
    if (!slackConnected || !notificationRules || notificationRules.length === 0) {
      return
    }

    const matchingRules = notificationRules.filter(rule => 
      rule.enabled &&
      rule.insightTypes.includes(insight.type) &&
      rule.priorityLevel.includes(insight.priority) &&
      insight.confidence >= rule.confidenceThreshold &&
      rule.notifyImmediately
    )

    if (matchingRules.length > 0) {
      for (const rule of matchingRules) {
        await sendSlackNotification(insight, rule.channel)
      }
    }
  }

  const sendSlackNotification = async (insight: PulseInsight, channel: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success(`Sent to Slack: #${channel}`, {
        description: insight.title,
        icon: <SlackLogo size={16} weight="fill" />
      })
    } catch (error) {
      console.error('Error sending to Slack:', error)
    }
  }

  const shareToSlack = async (insight: PulseInsight) => {
    if (!slackConnected) {
      toast.error('Slack not connected', {
        description: 'Connect to Slack in the Notifications tab first'
      })
      return
    }

    const defaultChannel = notificationRules && notificationRules.length > 0 
      ? notificationRules[0].channel 
      : 'analytics-insights'

    await sendSlackNotification(insight, defaultChannel)
  }

  const markAsRead = (id: string) => {
    setPulseInsights(current =>
      (current || []).map(insight =>
        insight.id === id ? { ...insight, read: true } : insight
      )
    )
  }

  const toggleBookmark = (id: string) => {
    setPulseInsights(current =>
      (current || []).map(insight =>
        insight.id === id ? { ...insight, bookmarked: !insight.bookmarked } : insight
      )
    )
  }

  const getFilteredInsights = () => {
    const insights = pulseInsights || []
    switch (filter) {
      case 'unread':
        return insights.filter(i => !i.read)
      case 'bookmarked':
        return insights.filter(i => i.bookmarked)
      default:
        return insights
    }
  }

  const getInsightIcon = (type: PulseInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <Lightning weight="fill" className="text-accent" />
      case 'alert':
        return <Warning weight="fill" className="text-warning" />
      case 'trend':
        return <TrendUp weight="fill" className="text-success" />
      case 'anomaly':
        return <Bell weight="fill" className="text-destructive" />
      case 'achievement':
        return <CheckCircle weight="fill" className="text-success" />
    }
  }

  const getPriorityColor = (priority: PulseInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-accent/50 bg-accent/5'
      case 'medium':
        return 'border-metric-purple/50 bg-metric-purple/5'
      case 'low':
        return 'border-border bg-card'
    }
  }

  const unreadCount = (pulseInsights || []).filter(i => !i.read).length

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
                  <Sparkle size={28} weight="fill" className="text-accent" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  Tableau Pulse
                  {slackConnected && (
                    <Badge className="bg-[#4A154B]/20 text-[#4A154B] border-[#4A154B]/30 gap-1.5">
                      <SlackLogo size={14} weight="fill" />
                      Slack Active
                    </Badge>
                  )}
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  AI-driven insights delivered proactively. Tableau Pulse analyzes your data continuously and surfaces the most relevant insights, anomalies, and opportunities in real-time.
                </p>
              </div>
            </div>
            
            <Button
              onClick={generateAIInsight}
              disabled={isGenerating}
              className="flex-shrink-0 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkle size={18} weight="fill" />
                  Generate Insight
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
          <TabsTrigger value="insights" className="gap-2">
            <Bell size={16} weight="duotone" />
            Insights
            {unreadCount > 0 && (
              <Badge className="ml-1 h-5 px-1.5 text-xs bg-accent text-accent-foreground">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="digests" className="gap-2">
            <CalendarBlank size={16} weight="duotone" />
            Digests
          </TabsTrigger>
          <TabsTrigger value="slack" className="gap-2">
            <SlackLogo size={16} weight="fill" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all" className="gap-2">
                  All Insights
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {(pulseInsights || []).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="gap-2">
                  Unread
                  {unreadCount > 0 && (
                    <Badge className="ml-1 h-5 px-1.5 text-xs bg-accent text-accent-foreground">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="bookmarked" className="gap-2">
                  Bookmarked
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <AnimatePresence mode="popLayout">
              {getFilteredInsights().length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="p-12 text-center border-dashed">
                    <Bell size={48} weight="thin" className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
                    <p className="text-sm text-muted-foreground">
                      {filter === 'bookmarked' 
                        ? 'Bookmark insights to save them for later'
                        : 'Generate your first Pulse insight to get started'
                      }
                    </p>
                  </Card>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {getFilteredInsights().map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`p-5 cursor-pointer transition-all hover:shadow-lg ${getPriorityColor(insight.priority)} ${
                          !insight.read ? 'ring-1 ring-accent/50' : ''
                        } ${(selectedInsight && selectedInsight.id === insight.id) ? 'ring-2 ring-accent' : ''}`}
                        onClick={() => {
                          setSelectedInsight(insight)
                          markAsRead(insight.id)
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-lg bg-card/50 flex items-center justify-center">
                              {getInsightIcon(insight.type)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground">
                                  {insight.title}
                                </h3>
                                {!insight.read && (
                                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant="outline" className="text-xs">
                                  {insight.confidence}% confident
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleBookmark(insight.id)
                                  }}
                                >
                                  <BookmarkSimple 
                                    size={16} 
                                    weight={insight.bookmarked ? 'fill' : 'regular'}
                                    className={insight.bookmarked ? 'text-accent' : ''}
                                  />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className="text-xs font-mono">
                                {insight.metric}
                              </Badge>
                              <Separator orientation="vertical" className="h-4" />
                              <span className="text-sm font-mono font-semibold">
                                {insight.metricValue}
                              </span>
                              {insight.change && (
                                <>
                                  <Separator orientation="vertical" className="h-4" />
                                  <span className={`text-sm font-medium flex items-center gap-1 ${
                                    insight.change > 0 ? 'text-success' : 'text-destructive'
                                  }`}>
                                    {insight.change > 0 ? (
                                      <TrendUp size={14} weight="bold" />
                                    ) : (
                                      <TrendDown size={14} weight="bold" />
                                    )}
                                    {Math.abs(insight.change).toFixed(1)}%
                                  </span>
                                </>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {insight.description}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                              <Clock size={12} weight="bold" />
                              {new Date(insight.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>

        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedInsight ? (
              <motion.div
                key={selectedInsight.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="p-6 sticky top-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                          {getInsightIcon(selectedInsight.type)}
                        </div>
                        <Badge className={`${
                          selectedInsight.priority === 'high' 
                            ? 'bg-accent/20 text-accent border-accent/30'
                            : selectedInsight.priority === 'medium'
                            ? 'bg-metric-purple/20 text-metric-purple border-metric-purple/30'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {selectedInsight.priority} priority
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3">{selectedInsight.title}</h3>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <ChartLine size={16} className="text-muted-foreground" />
                          <span className="text-sm font-medium">{selectedInsight.metric}</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-lg font-mono font-bold">{selectedInsight.metricValue}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedInsight.description}
                      </p>
                    </div>

                    <Separator />

                    {selectedInsight.actionable && selectedInsight.suggestedAction && (
                      <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                        <div className="flex items-start gap-3">
                          <Lightning size={20} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold mb-1">Suggested Action</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedInsight.suggestedAction}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedInsight.relatedMetrics && selectedInsight.relatedMetrics.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-3">Related Metrics</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedInsight.relatedMetrics.map((metric, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button className="w-full gap-2" variant="default">
                        <ArrowRight size={16} weight="bold" />
                        View in Dashboard
                      </Button>
                      <Button 
                        className="w-full gap-2" 
                        variant="outline"
                        onClick={() => shareToSlack(selectedInsight)}
                      >
                        {slackConnected ? (
                          <>
                            <SlackLogo size={16} weight="fill" />
                            Send to Slack
                          </>
                        ) : (
                          <>
                            <ShareNetwork size={16} weight="bold" />
                            Share Insight
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="pt-4 border-t text-xs text-muted-foreground space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Confidence Level</span>
                        <span className="font-mono font-semibold">{selectedInsight.confidence}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Generated</span>
                        <span className="font-mono">
                          {new Date(selectedInsight.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Type</span>
                        <span className="capitalize">{selectedInsight.type}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="p-12 text-center border-dashed h-full flex flex-col items-center justify-center">
                  <Sparkle size={48} weight="thin" className="text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select an Insight</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on any insight to view details and suggested actions
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="digests">
          <DigestScheduler />
        </TabsContent>

        <TabsContent value="slack">
          <SlackIntegration />
        </TabsContent>
      </Tabs>
    </div>
  )
}
