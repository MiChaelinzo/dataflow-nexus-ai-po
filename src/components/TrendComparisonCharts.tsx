import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { 
  TrendUp,
  TrendDown,
  CalendarBlank,
  ChartLineUp,
  ArrowUp,
  ArrowDown,
  Minus
} from '@phosphor-icons/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useKV } from '@github/spark/hooks'
import { WorkspaceActivity } from './WorkspaceActivityFeed'
import { 
  format, 
  subDays, 
  subWeeks, 
  subMonths,
  startOfWeek, 
  startOfMonth,
  endOfWeek,
  endOfMonth,
  isWithinInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfDay,
  endOfDay
} from 'date-fns'

interface TrendDataPoint {
  period: string
  count: number
  label: string
  startDate: Date
  endDate: Date
}

type ViewMode = 'weekly' | 'monthly'

export function TrendComparisonCharts() {
  const [activities] = useKV<WorkspaceActivity[]>('workspace-activities', [])
  const [viewMode, setViewMode] = useState<ViewMode>('weekly')
  const [comparisonPeriods, setComparisonPeriods] = useState<string>('8')

  const periods = parseInt(comparisonPeriods)

  const trendData = useMemo(() => {
    if (!activities || activities.length === 0) return []

    const endDate = new Date()
    const data: TrendDataPoint[] = []

    if (viewMode === 'weekly') {
      const startDate = subWeeks(endDate, periods)
      const weeks = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 0 }
      )

      weeks.forEach((weekStart, idx) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
        const count = activities.filter(activity => {
          const activityDate = new Date(activity.timestamp)
          return isWithinInterval(activityDate, {
            start: startOfDay(weekStart),
            end: endOfDay(weekEnd)
          })
        }).length

        data.push({
          period: `W${idx + 1}`,
          count,
          label: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
          startDate: weekStart,
          endDate: weekEnd
        })
      })
    } else {
      const startDate = subMonths(endDate, periods)
      const months = eachMonthOfInterval({ start: startDate, end: endDate })

      months.forEach((monthStart, idx) => {
        const monthEnd = endOfMonth(monthStart)
        const count = activities.filter(activity => {
          const activityDate = new Date(activity.timestamp)
          return isWithinInterval(activityDate, {
            start: startOfDay(monthStart),
            end: endOfDay(monthEnd)
          })
        }).length

        data.push({
          period: format(monthStart, 'MMM'),
          count,
          label: format(monthStart, 'MMMM yyyy'),
          startDate: monthStart,
          endDate: monthEnd
        })
      })
    }

    return data
  }, [activities, viewMode, periods])

  const maxCount = useMemo(() => {
    return Math.max(...trendData.map(d => d.count), 1)
  }, [trendData])

  const stats = useMemo(() => {
    if (trendData.length < 2) {
      return {
        currentPeriod: 0,
        previousPeriod: 0,
        change: 0,
        changePercent: 0,
        trend: 'neutral' as const,
        average: 0,
        total: 0,
        peak: { period: '', count: 0 },
        low: { period: '', count: 0 }
      }
    }

    const current = trendData[trendData.length - 1]
    const previous = trendData[trendData.length - 2]
    const change = current.count - previous.count
    const changePercent = previous.count > 0 ? (change / previous.count) * 100 : 0
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    const total = trendData.reduce((sum, d) => sum + d.count, 0)
    const average = total / trendData.length

    const sorted = [...trendData].sort((a, b) => b.count - a.count)
    const peak = sorted[0]
    const low = sorted[sorted.length - 1]

    return {
      currentPeriod: current.count,
      previousPeriod: previous.count,
      change,
      changePercent,
      trend,
      average,
      total,
      peak: { period: peak.label, count: peak.count },
      low: { period: low.label, count: low.count }
    }
  }, [trendData])

  const getBarHeight = (count: number) => {
    return `${(count / maxCount) * 100}%`
  }

  const getBarColor = (count: number) => {
    const ratio = count / maxCount
    if (ratio < 0.33) return 'bg-muted-foreground/30'
    if (ratio < 0.66) return 'bg-accent/60'
    return 'bg-accent'
  }

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'up':
        return <ArrowUp size={20} weight="bold" className="text-success" />
      case 'down':
        return <ArrowDown size={20} weight="bold" className="text-destructive" />
      default:
        return <Minus size={20} weight="bold" className="text-muted-foreground" />
    }
  }

  const getTrendColor = () => {
    switch (stats.trend) {
      case 'up':
        return 'text-success'
      case 'down':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <ChartLineUp size={28} weight="duotone" className="text-accent" />
            Trend Comparison
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {viewMode === 'weekly' ? 'Week-over-week' : 'Month-over-month'} activity trends
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

          <Select value={comparisonPeriods} onValueChange={setComparisonPeriods}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {viewMode === 'weekly' ? (
                <>
                  <SelectItem value="4">Last 4 weeks</SelectItem>
                  <SelectItem value="8">Last 8 weeks</SelectItem>
                  <SelectItem value="12">Last 12 weeks</SelectItem>
                  <SelectItem value="26">Last 6 months</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="3">Last 3 months</SelectItem>
                  <SelectItem value="6">Last 6 months</SelectItem>
                  <SelectItem value="12">Last 12 months</SelectItem>
                  <SelectItem value="24">Last 24 months</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Current {viewMode === 'weekly' ? 'Week' : 'Month'}
              </p>
              <p className="text-2xl font-bold font-mono">{stats.currentPeriod}</p>
            </div>
            <CalendarBlank size={24} weight="duotone" className="text-accent" />
          </div>
          <div className={`flex items-center gap-2 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="font-semibold">
              {stats.change > 0 ? '+' : ''}{stats.change} ({stats.changePercent > 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">vs previous period</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Average
              </p>
              <p className="text-2xl font-bold font-mono">{stats.average.toFixed(1)}</p>
            </div>
            <TrendUp size={24} weight="duotone" className="text-metric-purple" />
          </div>
          <p className="text-xs text-muted-foreground">
            Per {viewMode === 'weekly' ? 'week' : 'month'}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Peak Period
              </p>
              <p className="text-2xl font-bold font-mono text-success">{stats.peak.count}</p>
            </div>
            <TrendUp size={24} weight="fill" className="text-success" />
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {stats.peak.period}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Total Activities
              </p>
              <p className="text-2xl font-bold font-mono">{stats.total}</p>
            </div>
            <ChartLineUp size={24} weight="duotone" className="text-accent" />
          </div>
          <p className="text-xs text-muted-foreground">
            Across all periods
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-6">
          {viewMode === 'weekly' ? 'Weekly' : 'Monthly'} Activity Distribution
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-end gap-2 h-64">
            {trendData.map((dataPoint, idx) => (
              <motion.div
                key={dataPoint.period}
                className="flex-1 flex flex-col items-center gap-2 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="relative flex-1 w-full flex items-end">
                  <div className="relative w-full group cursor-pointer">
                    <motion.div
                      className={`w-full rounded-t-md transition-all ${getBarColor(dataPoint.count)} hover:opacity-80`}
                      initial={{ height: 0 }}
                      animate={{ height: getBarHeight(dataPoint.count) }}
                      transition={{ delay: idx * 0.05 + 0.2, duration: 0.5, ease: 'easeOut' }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                        <p className="text-xs font-semibold text-foreground">
                          {dataPoint.count} activities
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {dataPoint.label}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs font-medium text-foreground">
                    {dataPoint.period}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {dataPoint.count}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-muted-foreground/30" />
              <span className="text-xs text-muted-foreground">Low Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-accent/60" />
              <span className="text-xs text-muted-foreground">Medium Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-accent" />
              <span className="text-xs text-muted-foreground">High Activity</span>
            </div>
          </div>
        </div>
      </Card>

      {stats.trend !== 'neutral' && (
        <Card className={`p-6 bg-gradient-to-br ${
          stats.trend === 'up' 
            ? 'from-success/10 via-card to-accent/10 border-success/20'
            : 'from-destructive/10 via-card to-warning/10 border-destructive/20'
        }`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-lg ${
                stats.trend === 'up' ? 'bg-success/20' : 'bg-destructive/20'
              } flex items-center justify-center`}>
                {stats.trend === 'up' ? (
                  <TrendUp size={24} weight="fill" className="text-success" />
                ) : (
                  <TrendDown size={24} weight="fill" className="text-destructive" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {stats.trend === 'up' ? 'Activity Increasing' : 'Activity Decreasing'}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                The current {viewMode === 'weekly' ? 'week' : 'month'} shows{' '}
                <span className={`font-semibold ${
                  stats.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {Math.abs(stats.changePercent).toFixed(1)}% {stats.trend === 'up' ? 'increase' : 'decrease'}
                </span>{' '}
                compared to the previous period with {Math.abs(stats.change)} {stats.trend === 'up' ? 'more' : 'fewer'} activities.
              </p>
              <div className="flex gap-2">
                <Badge className={stats.trend === 'up' 
                  ? 'bg-success/20 text-success border-success/30'
                  : 'bg-destructive/20 text-destructive border-destructive/30'
                }>
                  {stats.trend === 'up' ? 'Positive Trend' : 'Declining Trend'}
                </Badge>
                <Badge variant="outline">
                  {stats.currentPeriod} vs {stats.previousPeriod}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
