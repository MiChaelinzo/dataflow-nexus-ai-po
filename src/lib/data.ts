import { Metric, ChartDataPoint, PredictionData, YoYDataPoint, SeasonalTrend } from './types'
import { WorkspaceActivity } from '@/components/WorkspaceActivityFeed'

export function generateMetrics(): Metric[] {
  return [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: 2847650,
      previousValue: 2341000,
      unit: '$',
      trend: 'up',
      change: 21.6,
      changeLabel: 'vs last period',
      sparklineData: [2100000, 2200000, 2150000, 2300000, 2400000, 2350000, 2500000, 2600000, 2700000, 2847650],
      icon: 'TrendUp'
    },
    {
      id: 'customers',
      label: 'Active Customers',
      value: 12847,
      previousValue: 11230,
      unit: '',
      trend: 'up',
      change: 14.4,
      changeLabel: 'vs last period',
      sparklineData: [10500, 10800, 11000, 11200, 11400, 11600, 11800, 12100, 12400, 12847],
      icon: 'Users'
    },
    {
      id: 'conversion',
      label: 'Conversion Rate',
      value: 3.42,
      previousValue: 3.15,
      unit: '%',
      trend: 'up',
      change: 8.6,
      changeLabel: 'vs last period',
      sparklineData: [2.8, 2.9, 3.0, 3.1, 3.15, 3.2, 3.25, 3.3, 3.38, 3.42],
      icon: 'Target'
    },
    {
      id: 'churn',
      label: 'Churn Rate',
      value: 2.1,
      previousValue: 2.8,
      unit: '%',
      trend: 'down',
      change: -25.0,
      changeLabel: 'vs last period',
      sparklineData: [3.2, 3.1, 3.0, 2.9, 2.8, 2.7, 2.5, 2.3, 2.2, 2.1],
      icon: 'ArrowDown'
    },
    {
      id: 'avg-order',
      label: 'Avg Order Value',
      value: 221.50,
      previousValue: 208.40,
      unit: '$',
      trend: 'up',
      change: 6.3,
      changeLabel: 'vs last period',
      sparklineData: [195, 198, 202, 205, 208, 212, 215, 217, 220, 221.5],
      icon: 'CurrencyDollar'
    },
    {
      id: 'satisfaction',
      label: 'Customer Satisfaction',
      value: 4.7,
      previousValue: 4.5,
      unit: '/5',
      trend: 'up',
      change: 4.4,
      changeLabel: 'vs last period',
      sparklineData: [4.3, 4.35, 4.4, 4.42, 4.45, 4.5, 4.55, 4.6, 4.65, 4.7],
      icon: 'Star'
    }
  ]
}

export function generateTimeSeriesData(points: number = 30): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  const now = Date.now()
  const baseValue = 50000
  
  for (let i = 0; i < points; i++) {
    const date = new Date(now - (points - i) * 24 * 60 * 60 * 1000)
    const trend = i * 1500
    const variance = Math.random() * 10000 - 5000
    const seasonal = Math.sin(i / 7) * 5000
    
    data.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: date.toISOString(),
      value: Math.round(baseValue + trend + variance + seasonal)
    })
  }
  
  return data
}

export function generateCategoryData(): ChartDataPoint[] {
  return [
    { label: 'Enterprise', value: 425000, category: 'segment' },
    { label: 'Mid-Market', value: 315000, category: 'segment' },
    { label: 'Small Business', value: 198000, category: 'segment' },
    { label: 'Startup', value: 142000, category: 'segment' }
  ]
}

export function generatePredictionData(): PredictionData {
  const historical = generateTimeSeriesData(30)
  const lastValue = historical[historical.length - 1].value
  const forecast: ChartDataPoint[] = []
  const upper: ChartDataPoint[] = []
  const lower: ChartDataPoint[] = []
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
    const trend = i * 2000
    const baseValue = lastValue + trend
    
    forecast.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: date.toISOString(),
      value: Math.round(baseValue)
    })
    
    upper.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: date.toISOString(),
      value: Math.round(baseValue + i * 1000 + 5000)
    })
    
    lower.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: date.toISOString(),
      value: Math.round(baseValue - i * 800 - 3000)
    })
  }
  
  return { historical, forecast, confidence: { upper, lower } }
}

export function formatNumber(value: number, unit: string = ''): string {
  if (unit === '$') {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }
  
  if (unit === '%') {
    return `${value.toFixed(2)}%`
  }
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M${unit}`
  }
  
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K${unit}`
  }
  
  return `${value.toLocaleString()}${unit}`
}

export function formatChange(change: number): string {
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

export function getChangeColor(change: number, inverse: boolean = false): string {
  if (change === 0) return 'text-muted-foreground'
  const isPositive = inverse ? change < 0 : change > 0
  return isPositive ? 'text-success' : 'text-destructive'
}

export function generateYoYData(metricId: string = 'revenue'): YoYDataPoint[] {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  const baseValues: { [key: string]: number[] } = {
    revenue: [180000, 175000, 195000, 210000, 225000, 240000, 235000, 245000, 250000, 255000, 260000, 270000],
    customers: [8500, 8700, 9100, 9500, 9800, 10200, 10500, 10800, 11100, 11400, 11700, 12000],
    conversion: [2.8, 2.85, 2.9, 2.95, 3.0, 3.05, 3.1, 3.15, 3.2, 3.25, 3.3, 3.35]
  }
  
  const currentYearValues = baseValues[metricId] || baseValues.revenue
  
  return months.map((month, index) => {
    const currentYear = currentYearValues[index]
    const growthFactor = 0.15 + (Math.random() * 0.1 - 0.05)
    const previousYear = currentYear / (1 + growthFactor)
    const yoyChange = currentYear - previousYear
    const yoyChangePercent = (yoyChange / previousYear) * 100
    
    return {
      month,
      monthIndex: index,
      currentYear: Math.round(currentYear),
      previousYear: Math.round(previousYear),
      yoyChange: Math.round(yoyChange),
      yoyChangePercent: Math.round(yoyChangePercent * 10) / 10
    }
  })
}

export function calculateSeasonalTrends(yoyData: YoYDataPoint[]): SeasonalTrend[] {
  const seasons = [
    { season: 'Q1' as const, seasonName: 'Winter (Q1)', months: ['Jan', 'Feb', 'Mar'], indices: [0, 1, 2] },
    { season: 'Q2' as const, seasonName: 'Spring (Q2)', months: ['Apr', 'May', 'Jun'], indices: [3, 4, 5] },
    { season: 'Q3' as const, seasonName: 'Summer (Q3)', months: ['Jul', 'Aug', 'Sep'], indices: [6, 7, 8] },
    { season: 'Q4' as const, seasonName: 'Fall (Q4)', months: ['Oct', 'Nov', 'Dec'], indices: [9, 10, 11] }
  ]
  
  return seasons.map(({ season, seasonName, months, indices }) => {
    const seasonData = indices.map(i => yoyData[i])
    const currentYearAvg = seasonData.reduce((sum, d) => sum + d.currentYear, 0) / seasonData.length
    const previousYearAvg = seasonData.reduce((sum, d) => sum + d.previousYear, 0) / seasonData.length
    const change = currentYearAvg - previousYearAvg
    const changePercent = (change / previousYearAvg) * 100
    
    return {
      season,
      seasonName,
      months,
      currentYearAvg: Math.round(currentYearAvg),
      previousYearAvg: Math.round(previousYearAvg),
      change: Math.round(change),
      changePercent: Math.round(changePercent * 10) / 10,
      trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral'
    }
  })
}

export function generateSampleActivities(): WorkspaceActivity[] {
  const now = Date.now()
  const users = [
    { id: 'user-1', name: 'Sarah Chen', avatar: undefined },
    { id: 'user-2', name: 'Michael Rodriguez', avatar: undefined },
    { id: 'user-3', name: 'Emily Johnson', avatar: undefined },
    { id: 'user-4', name: 'David Kim', avatar: undefined },
    { id: 'user-5', name: 'Jessica Williams', avatar: undefined }
  ]
  
  const workspaces = [
    { id: 'ws-1', name: 'Marketing Analytics' },
    { id: 'ws-2', name: 'Sales Performance' },
    { id: 'ws-3', name: 'Product Insights' },
    { id: 'ws-4', name: 'Customer Success' }
  ]
  
  const dashboards = [
    'Q4 Revenue Dashboard',
    'Customer Engagement Metrics',
    'Sales Pipeline Analysis',
    'Marketing Campaign Performance',
    'Product Usage Analytics',
    'Regional Performance Report'
  ]
  
  const activities: Omit<WorkspaceActivity, 'id' | 'timestamp'>[] = [
    {
      workspaceId: workspaces[0].id,
      workspaceName: workspaces[0].name,
      userId: users[0].id,
      userName: users[0].name,
      userAvatar: users[0].avatar,
      action: 'created',
      targetType: 'dashboard',
      targetName: dashboards[0],
      details: 'Created new revenue tracking dashboard with year-over-year comparisons',
      metadata: { visibility: 'workspace', tags: 'revenue, quarterly, analytics' }
    },
    {
      workspaceId: workspaces[1].id,
      workspaceName: workspaces[1].name,
      userId: users[1].id,
      userName: users[1].name,
      userAvatar: users[1].avatar,
      action: 'shared',
      targetType: 'dashboard',
      targetName: dashboards[2],
      details: 'Shared with 5 team members as editors',
      metadata: { sharedWith: 'Team', role: 'editor' }
    },
    {
      workspaceId: workspaces[0].id,
      workspaceName: workspaces[0].name,
      userId: users[2].id,
      userName: users[2].name,
      userAvatar: users[2].avatar,
      action: 'commented',
      targetType: 'dashboard',
      targetName: dashboards[0],
      details: 'Added comment: "Great insights! Can we add conversion rate trends?"'
    },
    {
      workspaceId: workspaces[2].id,
      workspaceName: workspaces[2].name,
      userId: users[3].id,
      userName: users[3].name,
      userAvatar: users[3].avatar,
      action: 'created',
      targetType: 'workspace',
      targetName: workspaces[2].name,
      details: 'Created new team workspace for product analytics',
      metadata: { type: 'team', visibility: 'private' }
    },
    {
      workspaceId: workspaces[1].id,
      workspaceName: workspaces[1].name,
      userId: users[4].id,
      userName: users[4].name,
      userAvatar: users[4].avatar,
      action: 'viewed',
      targetType: 'dashboard',
      targetName: dashboards[1],
      details: 'Viewed customer engagement dashboard'
    },
    {
      workspaceId: workspaces[0].id,
      workspaceName: workspaces[0].name,
      userId: users[0].id,
      userName: users[0].name,
      userAvatar: users[0].avatar,
      action: 'generated',
      targetType: 'insight',
      targetName: 'Revenue Forecast Analysis',
      details: 'Generated AI insights showing 23% growth prediction for next quarter',
      metadata: { confidence: '87%', trend: 'positive' }
    },
    {
      workspaceId: workspaces[3].id,
      workspaceName: workspaces[3].name,
      userId: users[1].id,
      userName: users[1].name,
      userAvatar: users[1].avatar,
      action: 'joined',
      targetType: 'workspace',
      targetName: workspaces[3].name,
      details: 'Joined workspace as an editor'
    },
    {
      workspaceId: workspaces[1].id,
      workspaceName: workspaces[1].name,
      userId: users[2].id,
      userName: users[2].name,
      userAvatar: users[2].avatar,
      action: 'favorited',
      targetType: 'dashboard',
      targetName: dashboards[3],
      details: 'Added to favorites for quick access'
    },
    {
      workspaceId: workspaces[2].id,
      workspaceName: workspaces[2].name,
      userId: users[3].id,
      userName: users[3].name,
      userAvatar: users[3].avatar,
      action: 'edited',
      targetType: 'dashboard',
      targetName: dashboards[4],
      details: 'Updated product usage metrics and added new visualizations',
      metadata: { charts_added: 3, filters_updated: 2 }
    },
    {
      workspaceId: workspaces[0].id,
      workspaceName: workspaces[0].name,
      userId: users[4].id,
      userName: users[4].name,
      userAvatar: users[4].avatar,
      action: 'exported',
      targetType: 'report',
      targetName: 'Monthly Performance Report',
      details: 'Exported report as PDF with annotations',
      metadata: { format: 'PDF', pages: 12 }
    },
    {
      workspaceId: workspaces[1].id,
      workspaceName: workspaces[1].name,
      userId: users[0].id,
      userName: users[0].name,
      userAvatar: users[0].avatar,
      action: 'duplicated',
      targetType: 'dashboard',
      targetName: dashboards[2],
      details: 'Created copy for regional analysis',
      metadata: { originalName: dashboards[2] }
    },
    {
      workspaceId: workspaces[3].id,
      workspaceName: workspaces[3].name,
      userId: users[1].id,
      userName: users[1].name,
      userAvatar: users[1].avatar,
      action: 'invited',
      targetType: 'member',
      targetName: 'Alex Thompson',
      details: 'Invited new team member as viewer',
      metadata: { role: 'viewer' }
    },
    {
      workspaceId: workspaces[2].id,
      workspaceName: workspaces[2].name,
      userId: users[2].id,
      userName: users[2].name,
      userAvatar: users[2].avatar,
      action: 'recorded',
      targetType: 'session',
      targetName: 'Product Demo Session',
      details: 'Recorded analytics walkthrough session (12 min)',
      metadata: { duration: '12:34', annotations: 8 }
    }
  ]
  
  return activities.map((activity, index) => ({
    ...activity,
    id: `activity-${Date.now()}-${index}`,
    timestamp: now - (activities.length - index) * 3600000 - Math.random() * 1800000
  }))
}
