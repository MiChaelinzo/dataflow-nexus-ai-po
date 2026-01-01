import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChartLineUp,
  TrendUp,
  TrendDown,
  Equals,
  Calendar,
  Clock,
  Sparkle,
  ChartBar,
  Target,
  Lightning
} from '@phosphor-icons/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { WorkspaceActivity } from '@/components/WorkspaceActivityFeed'
import { generateActivityForecast, generateForecastInsights } from '@/lib/activity-forecasting'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

export function ActivityForecast() {
  const [activities] = useKV<WorkspaceActivity[]>('workspace-activities', [])
  const [forecastDays, setForecastDays] = useState<string>('14')
  
  const { forecast, metrics, hourlyPatterns, weekdayPatterns } = useMemo(() => {
    return generateActivityForecast(activities || [], parseInt(forecastDays))
  }, [activities, forecastDays])

  const insights = useMemo(() => {
    return generateForecastInsights(metrics, hourlyPatterns, weekdayPatterns)
  }, [metrics, hourlyPatterns, weekdayPatterns])

  const chartData = useMemo(() => {
    return forecast.map(f => ({
      date: format(f.date, 'MMM d'),
      fullDate: format(f.date, 'EEEE, MMMM d'),
      predicted: f.predicted,
      low: f.confidenceIntervalLow,
      high: f.confidenceIntervalHigh,
      trend: f.trend
    }))
  }, [forecast])

  const hourlyChartData = useMemo(() => {
    return hourlyPatterns.map(p => ({
      hour: p.label,
      activity: p.avgActivity,
      fullHour: p.hour
    }))
  }, [hourlyPatterns])

  const weekdayChartData = useMemo(() => {
    return weekdayPatterns.map(p => ({
      day: p.dayName.substring(0, 3),
      fullDay: p.dayName,
      activity: p.avgActivity
    }))
  }, [weekdayPatterns])

  const getTrendIcon = () => {
    switch (metrics.overallTrend) {
      case 'increasing':
        return <TrendUp size={24} weight="duotone" className="text-success" />
      case 'decreasing':
        return <TrendDown size={24} weight="duotone" className="text-destructive" />
      default:
        return <Equals size={24} weight="duotone" className="text-muted-foreground" />
    }
  }

  const getTrendColor = () => {
    switch (metrics.overallTrend) {
      case 'increasing':
        return 'text-success'
      case 'decreasing':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <ChartLineUp size={28} weight="duotone" className="text-accent" />
            Activity Forecast
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Predictive analytics based on historical patterns
          </p>
        </div>
        
        <Select value={forecastDays} onValueChange={setForecastDays}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Next 7 days</SelectItem>
            <SelectItem value="14">Next 14 days</SelectItem>
            <SelectItem value="30">Next 30 days</SelectItem>
            <SelectItem value="60">Next 60 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Predicted Activities
            </p>
            <Target size={20} weight="duotone" className="text-accent" />
          </div>
          <p className="text-2xl font-bold font-mono">{metrics.totalPredictedActivities}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Over next {forecastDays} days
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Daily Average
            </p>
            <ChartBar size={20} weight="duotone" className="text-metric-purple" />
          </div>
          <p className="text-2xl font-bold font-mono">{metrics.avgDailyPredicted}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Expected per day
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Trend Direction
            </p>
            {getTrendIcon()}
          </div>
          <p className={`text-2xl font-bold font-mono ${getTrendColor()}`}>
            {metrics.overallTrend === 'increasing' ? '+' : metrics.overallTrend === 'decreasing' ? '-' : ''}
            {Math.abs(metrics.trendPercentage).toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {metrics.overallTrend} pattern
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Confidence Level
            </p>
            <Lightning size={20} weight="duotone" className="text-warning" />
          </div>
          <p className="text-2xl font-bold font-mono text-warning">{metrics.confidence}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            Model accuracy
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Calendar size={20} weight="duotone" />
            {forecastDays}-Day Activity Forecast
          </h3>
          <p className="text-sm text-muted-foreground">
            Predicted activity levels with confidence intervals
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.70 0.15 195)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="oklch(0.70 0.15 195)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.60 0.18 290)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="oklch(0.60 0.18 290)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 240)" />
            <XAxis 
              dataKey="date" 
              stroke="oklch(0.65 0.02 240)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="oklch(0.65 0.02 240)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.25 0.01 240)',
                border: '1px solid oklch(0.30 0.02 240)',
                borderRadius: '8px',
                color: 'oklch(0.95 0.01 240)'
              }}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.date === label)
                return item?.fullDate || label
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="high"
              stroke="none"
              fill="url(#colorConfidence)"
              name="Upper Bound"
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="none"
              fill="url(#colorConfidence)"
              name="Lower Bound"
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="oklch(0.70 0.15 195)"
              strokeWidth={3}
              fill="url(#colorPredicted)"
              name="Predicted Activity"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Clock size={20} weight="duotone" />
              Hourly Activity Pattern
            </h3>
            <p className="text-sm text-muted-foreground">
              Average activity levels throughout the day
            </p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 240)" />
              <XAxis 
                dataKey="hour" 
                stroke="oklch(0.65 0.02 240)"
                style={{ fontSize: '11px' }}
              />
              <YAxis 
                stroke="oklch(0.65 0.02 240)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.25 0.01 240)',
                  border: '1px solid oklch(0.30 0.02 240)',
                  borderRadius: '8px',
                  color: 'oklch(0.95 0.01 240)'
                }}
              />
              <Bar 
                dataKey="activity" 
                fill="oklch(0.60 0.18 290)" 
                radius={[4, 4, 0, 0]}
                name="Avg Activity"
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 rounded-lg bg-metric-purple/10 border border-metric-purple/20">
            <p className="text-sm">
              <span className="font-semibold text-metric-purple">Peak Hour: </span>
              <span className="text-foreground">
                {hourlyPatterns.find(p => p.hour === metrics.peakHour.hour)?.label || 'N/A'}
              </span>
              <span className="text-muted-foreground"> ({metrics.peakHour.count} avg activities)</span>
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Calendar size={20} weight="duotone" />
              Weekly Pattern Analysis
            </h3>
            <p className="text-sm text-muted-foreground">
              Activity distribution across weekdays
            </p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={weekdayChartData}>
              <PolarGrid stroke="oklch(0.30 0.02 240)" />
              <PolarAngleAxis 
                dataKey="day" 
                stroke="oklch(0.65 0.02 240)"
                style={{ fontSize: '12px' }}
              />
              <PolarRadiusAxis 
                stroke="oklch(0.65 0.02 240)"
                style={{ fontSize: '11px' }}
              />
              <Radar
                name="Activity Level"
                dataKey="activity"
                stroke="oklch(0.70 0.15 195)"
                fill="oklch(0.70 0.15 195)"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-sm">
              <span className="font-semibold text-accent">Peak Day: </span>
              <span className="text-foreground">{metrics.peakDay.day}</span>
              <span className="text-muted-foreground"> ({metrics.peakDay.count} predicted)</span>
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
              <Sparkle size={24} weight="fill" className="text-accent" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              AI-Generated Insights
            </h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                >
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                  <p className="text-sm text-foreground">{insight}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Forecast Details</h3>
          <p className="text-sm text-muted-foreground">
            Day-by-day predictions with confidence intervals
          </p>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {forecast.map((f, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-center min-w-[60px]">
                  <p className="text-xs text-muted-foreground">
                    {format(f.date, 'EEE')}
                  </p>
                  <p className="text-sm font-semibold">
                    {format(f.date, 'MMM d')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-mono font-semibold">
                    {f.predicted} activities
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Range: {f.confidenceIntervalLow} - {f.confidenceIntervalHigh}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={
                  f.trend === 'increasing' 
                    ? 'border-success/50 text-success' 
                    : f.trend === 'decreasing'
                    ? 'border-destructive/50 text-destructive'
                    : 'border-muted-foreground/50'
                }
              >
                {f.trend === 'increasing' && <TrendUp size={14} weight="bold" className="mr-1" />}
                {f.trend === 'decreasing' && <TrendDown size={14} weight="bold" className="mr-1" />}
                {f.trend === 'stable' && <Equals size={14} weight="bold" className="mr-1" />}
                {f.trend}
              </Badge>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}
