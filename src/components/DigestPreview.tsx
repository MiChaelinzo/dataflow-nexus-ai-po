import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Sparkle, 
  TrendUp, 
  TrendDown,
  Lightning,
  Warning,
  CheckCircle,
  ChartBar,
  CalendarBlank,
  Clock
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { DigestSchedule } from '@/components/DigestScheduler'
import { MiniSparkline } from '@/components/MiniSparkline'

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
  actionable: boolean
  suggestedAction?: string
}

interface DigestPreviewProps {
  schedule: DigestSchedule
}

export function DigestPreview({ schedule }: DigestPreviewProps) {
  const [pulseInsights] = useKV<PulseInsight[]>('tableau-pulse-insights', [])
  const [filteredInsights, setFilteredInsights] = useState<PulseInsight[]>([])

  useEffect(() => {
    if (!pulseInsights) return

    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const minPriorityValue = priorityOrder[schedule.minPriority]

    const filtered = pulseInsights
      .filter(insight => {
        const meetsType = schedule.includeInsightTypes.includes(insight.type)
        const meetsPriority = priorityOrder[insight.priority] >= minPriorityValue
        const meetsConfidence = insight.confidence >= schedule.minConfidence
        return meetsType && meetsPriority && meetsConfidence
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return b.timestamp - a.timestamp
      })
      .slice(0, schedule.maxInsights)

    setFilteredInsights(filtered)
  }, [pulseInsights, schedule])

  const getInsightIcon = (type: PulseInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <Lightning weight="fill" className="text-accent" />
      case 'alert':
        return <Warning weight="fill" className="text-warning" />
      case 'trend':
        return <TrendUp weight="fill" className="text-success" />
      case 'anomaly':
        return <Warning weight="fill" className="text-destructive" />
      case 'achievement':
        return <CheckCircle weight="fill" className="text-success" />
    }
  }

  const getDayLabel = (dayOfWeek?: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return dayOfWeek !== undefined ? days[dayOfWeek] : ''
  }

  const mockMetrics = [
    { label: 'Total Revenue', value: '$2.85M', change: 21.6, trend: 'up' as const, sparkline: [65, 72, 68, 78, 85, 82, 92] },
    { label: 'Active Customers', value: '12,486', change: 15.3, trend: 'up' as const, sparkline: [45, 52, 58, 54, 62, 68, 73] },
    { label: 'Conversion Rate', value: '3.42%', change: 8.6, trend: 'up' as const, sparkline: [32, 34, 33, 36, 38, 37, 40] },
    { label: 'Customer Satisfaction', value: '4.7/5', change: 4.4, trend: 'up' as const, sparkline: [85, 86, 88, 87, 89, 91, 92] }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/30">
        <div className="flex items-center gap-3">
          <Sparkle size={24} weight="fill" className="text-accent" />
          <div>
            <p className="text-sm font-semibold">Preview Mode</p>
            <p className="text-xs text-muted-foreground">
              This is how your digest will appear when delivered
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-2">
          {filteredInsights.length} insights
        </Badge>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-accent/10 via-background to-metric-purple/10 p-8 rounded-lg border border-border">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-2">
                  <Sparkle size={32} weight="fill" className="text-accent" />
                </div>
                <h1 className="text-3xl font-bold">
                  {schedule.name}
                </h1>
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CalendarBlank size={16} weight="duotone" />
                    {schedule.frequency === 'daily' && 'Daily'}
                    {schedule.frequency === 'weekly' && `Every ${getDayLabel(schedule.dayOfWeek)}`}
                    {schedule.frequency === 'biweekly' && `Every other ${getDayLabel(schedule.dayOfWeek)}`}
                    {schedule.frequency === 'monthly' && `Monthly on day ${schedule.dayOfMonth}`}
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} weight="duotone" />
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <Separator />

              {schedule.includeTopMetrics && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ChartBar size={20} weight="duotone" className="text-accent" />
                    <h2 className="text-lg font-bold">Key Metrics Summary</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {mockMetrics.map((metric, index) => (
                      <Card key={index} className="p-4 bg-card/80">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                {metric.label}
                              </p>
                              <p className="text-2xl font-bold font-mono">{metric.value}</p>
                            </div>
                            <div className="w-16 h-12">
                              <MiniSparkline data={metric.sparkline} trend={metric.trend} />
                            </div>
                          </div>
                          <div className={`flex items-center gap-1.5 text-sm font-medium ${
                            metric.trend === 'up' ? 'text-success' : 'text-destructive'
                          }`}>
                            {metric.trend === 'up' ? (
                              <TrendUp size={16} weight="bold" />
                            ) : (
                              <TrendDown size={16} weight="bold" />
                            )}
                            {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {filteredInsights.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightning size={20} weight="duotone" className="text-accent" />
                    <h2 className="text-lg font-bold">Pulse Insights</h2>
                  </div>

                  <div className="space-y-3">
                    {filteredInsights.map((insight, index) => (
                      <Card key={insight.id} className="p-5 bg-card/80">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
                                {getInsightIcon(insight.type)}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-semibold text-foreground">
                                  {insight.title}
                                </h3>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs flex-shrink-0 ${
                                    insight.priority === 'high' 
                                      ? 'border-accent text-accent'
                                      : insight.priority === 'medium'
                                      ? 'border-metric-purple text-metric-purple'
                                      : ''
                                  }`}
                                >
                                  {insight.priority}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs font-mono">
                                  {insight.metric}
                                </Badge>
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
                              
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {insight.description}
                              </p>

                              {schedule.includeRecommendations && insight.actionable && insight.suggestedAction && (
                                <div className="mt-3 p-3 rounded-lg bg-accent/10 border border-accent/30">
                                  <div className="flex items-start gap-2">
                                    <Lightning size={16} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-semibold mb-0.5">Recommended Action</p>
                                      <p className="text-xs text-muted-foreground">
                                        {insight.suggestedAction}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {schedule.includePredictions && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendUp size={20} weight="duotone" className="text-metric-purple" />
                    <h2 className="text-lg font-bold">Predictions & Forecasts</h2>
                  </div>

                  <Card className="p-5 bg-card/80">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Expected Growth
                          </p>
                          <p className="text-2xl font-bold font-mono text-success">+23.4%</p>
                          <p className="text-xs text-muted-foreground mt-1">Over next 14 days</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Confidence Level
                          </p>
                          <p className="text-2xl font-bold font-mono text-accent">87%</p>
                          <p className="text-xs text-muted-foreground mt-1">Model accuracy</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Forecast Revenue
                          </p>
                          <p className="text-2xl font-bold font-mono text-metric-purple">$3.51M</p>
                          <p className="text-xs text-muted-foreground mt-1">14-day projection</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              <Separator />

              <div className="text-center text-xs text-muted-foreground space-y-2">
                <p>
                  This digest was automatically generated by Tableau Pulse
                </p>
                <p>
                  Analytics Intelligence Platform • Powered by AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
