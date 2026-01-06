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

export const SAMPLE_USERS = [
  { id: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@company.com', avatar: undefined },
  { id: 'user-2', name: 'Michael Rodriguez', email: 'michael.r@company.com', avatar: undefined },
  { id: 'user-3', name: 'Emily Johnson', email: 'emily.j@company.com', avatar: undefined },
  { id: 'user-4', name: 'David Kim', email: 'david.kim@company.com', avatar: undefined },
  { id: 'user-5', name: 'Jessica Williams', email: 'jessica.w@company.com', avatar: undefined },
  { id: 'user-6', name: 'Alex Thompson', email: 'alex.t@company.com', avatar: undefined },
  { id: 'user-7', name: 'Maria Garcia', email: 'maria.g@company.com', avatar: undefined },
  { id: 'user-8', name: 'James Liu', email: 'james.liu@company.com', avatar: undefined }
]

export const SAMPLE_WORKSPACES = [
  { id: 'ws-1', name: 'Marketing Analytics', description: 'Track marketing campaigns and ROI' },
  { id: 'ws-2', name: 'Sales Performance', description: 'Monitor sales pipeline and revenue' },
  { id: 'ws-3', name: 'Product Insights', description: 'Analyze product usage and engagement' },
  { id: 'ws-4', name: 'Customer Success', description: 'Customer health and satisfaction metrics' },
  { id: 'ws-5', name: 'Finance Dashboard', description: 'Financial KPIs and budget tracking' },
  { id: 'ws-6', name: 'Operations Hub', description: 'Operational efficiency metrics' }
]

export const SAMPLE_DASHBOARDS = [
  'Q4 Revenue Dashboard',
  'Customer Engagement Metrics',
  'Sales Pipeline Analysis',
  'Marketing Campaign Performance',
  'Product Usage Analytics',
  'Regional Performance Report',
  'Customer Churn Analysis',
  'Lead Generation Tracker',
  'Social Media Analytics',
  'Email Campaign Dashboard',
  'Website Traffic Analysis',
  'Conversion Funnel Report',
  'Customer Lifetime Value',
  'Inventory Management',
  'Support Ticket Analytics',
  'Employee Performance Dashboard'
]

export function generateSampleActivities(): WorkspaceActivity[] {
  const now = Date.now()
  const users = SAMPLE_USERS
  const workspaces = SAMPLE_WORKSPACES
  const dashboards = SAMPLE_DASHBOARDS
  
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

export function generateSampleWorkspaces(currentUserId: string = 'user-1', currentUserName: string = 'You') {
  const now = Date.now()
  const colors = [
    'oklch(0.70 0.15 195)',
    'oklch(0.60 0.18 290)',
    'oklch(0.65 0.15 145)',
    'oklch(0.70 0.15 70)',
    'oklch(0.55 0.22 25)',
    'oklch(0.45 0.15 250)'
  ]
  
  return SAMPLE_WORKSPACES.map((ws, index) => ({
    id: ws.id,
    name: ws.name,
    description: ws.description,
    type: (index === 0 ? 'personal' : index < 4 ? 'team' : 'organization') as 'personal' | 'team' | 'organization',
    visibility: (index < 2 ? 'private' : index < 4 ? 'shared' : 'public') as 'private' | 'shared' | 'public',
    ownerId: index === 0 ? currentUserId : SAMPLE_USERS[index % SAMPLE_USERS.length].id,
    ownerName: index === 0 ? currentUserName : SAMPLE_USERS[index % SAMPLE_USERS.length].name,
    members: [
      {
        id: index === 0 ? currentUserId : SAMPLE_USERS[index % SAMPLE_USERS.length].id,
        name: index === 0 ? currentUserName : SAMPLE_USERS[index % SAMPLE_USERS.length].name,
        email: index === 0 ? 'you@company.com' : SAMPLE_USERS[index % SAMPLE_USERS.length].email,
        role: 'owner' as const,
        joinedAt: now - 30 * 24 * 60 * 60 * 1000
      },
      ...SAMPLE_USERS.slice(0, 2 + (index % 3)).map((user, idx) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: (idx === 0 ? 'admin' : idx === 1 ? 'editor' : 'viewer') as 'owner' | 'admin' | 'editor' | 'viewer',
        joinedAt: now - (20 - idx * 5) * 24 * 60 * 60 * 1000
      }))
    ],
    dashboards: 3 + (index % 8),
    createdAt: now - (45 - index * 5) * 24 * 60 * 60 * 1000,
    lastModified: now - (index * 2) * 24 * 60 * 60 * 1000,
    color: colors[index % colors.length],
    isFavorite: index < 3
  }))
}

export function generateSampleDashboards(currentUserId: string = 'user-1', currentUserName: string = 'You') {
  const now = Date.now()
  const visibilities = ['private', 'workspace', 'organization', 'public'] as const
  const tags = ['revenue', 'customers', 'marketing', 'sales', 'product', 'analytics', 'quarterly', 'monthly', 'real-time', 'forecast']
  
  return SAMPLE_DASHBOARDS.map((dashName, index) => {
    const workspace = SAMPLE_WORKSPACES[index % SAMPLE_WORKSPACES.length]
    const owner = index === 0 ? { id: currentUserId, name: currentUserName, email: 'you@company.com' } : SAMPLE_USERS[index % SAMPLE_USERS.length]
    
    return {
      id: `dash-${index + 1}`,
      name: dashName,
      description: `Comprehensive ${dashName.toLowerCase()} with interactive visualizations and real-time data`,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      ownerId: owner.id,
      ownerName: owner.name,
      visibility: visibilities[index % visibilities.length],
      shareLink: index % 3 === 0 ? `https://analytics.app/share/${Math.random().toString(36).substring(7)}` : undefined,
      permissions: [
        {
          userId: owner.id,
          userName: owner.name,
          userEmail: owner.email,
          role: 'admin' as const,
          grantedAt: now - 30 * 24 * 60 * 60 * 1000,
          grantedBy: owner.id
        },
        ...SAMPLE_USERS.slice(0, 1 + (index % 4)).map((user, idx) => ({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          role: (idx === 0 ? 'editor' : idx === 1 ? 'commenter' : 'viewer') as 'viewer' | 'commenter' | 'editor' | 'admin',
          grantedAt: now - (25 - idx * 5) * 24 * 60 * 60 * 1000,
          grantedBy: owner.id
        }))
      ],
      views: Math.floor(Math.random() * 5000) + 100,
      comments: Math.floor(Math.random() * 50) + 5,
      lastModified: now - (index * 3) * 24 * 60 * 60 * 1000,
      createdAt: now - (60 - index * 2) * 24 * 60 * 60 * 1000,
      isFavorite: index < 5,
      tags: tags.slice(index % 5, (index % 5) + 3)
    }
  })
}

export function generateSampleScheduledExports(currentUserId: string = 'user-1', currentUserName: string = 'You') {
  const now = Date.now()
  const nowISO = new Date(now).toISOString()
  
  return [
    {
      id: 'export-1',
      name: 'Daily Metrics Report',
      description: 'Automated daily export of key performance metrics',
      dataType: 'metrics' as const,
      format: 'excel' as const,
      frequency: 'daily' as const,
      time: '09:00',
      enabled: true,
      recipients: ['you@company.com', 'team@company.com'],
      lastRun: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
      createdBy: currentUserId,
      createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'export-2',
      name: 'Weekly Sales Report',
      description: 'Comprehensive weekly sales analytics export',
      dataType: 'timeseries' as const,
      format: 'csv' as const,
      frequency: 'weekly' as const,
      time: '08:00',
      dayOfWeek: 1,
      enabled: true,
      recipients: ['sales-team@company.com'],
      lastRun: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(now + 21 * 60 * 60 * 1000).toISOString(),
      createdBy: SAMPLE_USERS[1].id,
      createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'export-3',
      name: 'Monthly Executive Summary',
      description: 'Full analytics report for executive team',
      dataType: 'all' as const,
      format: 'excel' as const,
      frequency: 'monthly' as const,
      time: '07:00',
      dayOfMonth: 1,
      enabled: true,
      recipients: ['executives@company.com', 'board@company.com'],
      lastRun: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      createdBy: currentUserId,
      createdAt: new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'export-4',
      name: 'AI Insights Digest',
      description: 'Weekly compilation of AI-generated insights',
      dataType: 'insights' as const,
      format: 'excel' as const,
      frequency: 'weekly' as const,
      time: '10:00',
      dayOfWeek: 5,
      enabled: true,
      recipients: ['analytics@company.com', 'strategy@company.com'],
      lastRun: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: SAMPLE_USERS[3].id,
      createdAt: new Date(now - 21 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'export-5',
      name: 'Customer Metrics Export',
      description: 'Daily customer engagement and satisfaction metrics',
      dataType: 'metrics' as const,
      format: 'csv' as const,
      frequency: 'daily' as const,
      time: '11:00',
      enabled: false,
      recipients: ['customer-success@company.com'],
      lastRun: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      createdBy: SAMPLE_USERS[4].id,
      createdAt: new Date(now - 45 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}

export function generateSampleExportHistory() {
  const now = Date.now()
  const exports = [
    { id: 'export-1', name: 'Daily Metrics Report', format: 'excel' as const, dataType: 'metrics' as const, frequency: 'daily' as const },
    { id: 'export-2', name: 'Weekly Sales Report', format: 'csv' as const, dataType: 'timeseries' as const, frequency: 'weekly' as const },
    { id: 'export-3', name: 'Monthly Executive Summary', format: 'excel' as const, dataType: 'all' as const, frequency: 'monthly' as const },
    { id: 'export-4', name: 'AI Insights Digest', format: 'excel' as const, dataType: 'insights' as const, frequency: 'weekly' as const }
  ]
  
  const history: Array<{
    id: string
    exportId: string
    exportName: string
    timestamp: string
    format: 'excel' | 'csv'
    dataType: 'metrics' | 'timeseries' | 'all' | 'insights'
    recipientCount: number
    status: 'success' | 'failed'
    fileSize?: number
    errorMessage?: string
  }> = []
  
  for (let i = 0; i < 30; i++) {
    const exportConfig = exports[i % exports.length]
    const daysAgo = i + 1
    const isSuccess = Math.random() > 0.05
    
    history.push({
      id: crypto.randomUUID(),
      exportId: exportConfig.id,
      exportName: exportConfig.name,
      timestamp: new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      format: exportConfig.format,
      dataType: exportConfig.dataType,
      recipientCount: 1 + Math.floor(Math.random() * 4),
      status: isSuccess ? 'success' : 'failed',
      fileSize: isSuccess ? Math.floor(Math.random() * 500000) + 50000 : undefined,
      errorMessage: isSuccess ? undefined : 'Connection timeout - retrying in 5 minutes'
    })
  }
  
  return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function generateFunnelData() {
  return [
    { label: 'Website Visitors', value: 125000, color: 'oklch(0.70 0.15 195)' },
    { label: 'Product Views', value: 87500, color: 'oklch(0.65 0.15 210)' },
    { label: 'Add to Cart', value: 43750, color: 'oklch(0.60 0.18 225)' },
    { label: 'Checkout Started', value: 21875, color: 'oklch(0.55 0.20 240)' },
    { label: 'Purchase Complete', value: 15313, color: 'oklch(0.50 0.22 255)' }
  ]
}

export function generateDonutData() {
  return [
    { label: 'Desktop', value: 45230, color: 'oklch(0.70 0.15 195)' },
    { label: 'Mobile', value: 38420, color: 'oklch(0.60 0.18 290)' },
    { label: 'Tablet', value: 18650, color: 'oklch(0.65 0.15 145)' },
    { label: 'Other', value: 5847, color: 'oklch(0.70 0.15 70)' }
  ]
}

export function generateRadarData() {
  return [
    { label: 'Performance', value: 85, maxValue: 100 },
    { label: 'Quality', value: 92, maxValue: 100 },
    { label: 'Reliability', value: 78, maxValue: 100 },
    { label: 'Support', value: 88, maxValue: 100 },
    { label: 'Features', value: 75, maxValue: 100 },
    { label: 'Value', value: 82, maxValue: 100 }
  ]
}

export function generateEngagementData() {
  const data: ChartDataPoint[] = []
  const now = Date.now()
  const baseValue = 3500
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(now - (14 - i) * 24 * 60 * 60 * 1000)
    const trend = i * 80
    const variance = Math.random() * 500 - 250
    const weekendEffect = date.getDay() === 0 || date.getDay() === 6 ? -400 : 0
    
    data.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: date.toISOString(),
      value: Math.round(baseValue + trend + variance + weekendEffect)
    })
  }
  
  return data
}
