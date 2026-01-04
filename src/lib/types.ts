export interface Metric {
  id: string
  label: string
  value: number
  previousValue: number
  unit: string
  trend: 'up' | 'down' | 'neutral'
  change: number
  changeLabel: string
  sparklineData: number[]
  icon: string
}

export interface ChartDataPoint {
  label: string
  value: number
  category?: string
  date?: string
}

export interface Insight {
  id: string
  title: string
  description: string
  confidence: number
  type: 'opportunity' | 'warning' | 'trend' | 'anomaly'
  metric?: string
  timestamp: number
  saved?: boolean
  priority?: 'high' | 'medium' | 'low'
}

export interface PredictionData {
  historical: ChartDataPoint[]
  forecast: ChartDataPoint[]
  confidence: {
    upper: ChartDataPoint[]
    lower: ChartDataPoint[]
  }
}

export interface FilterState {
  timeRange: 'day' | 'week' | 'month' | 'quarter' | 'year'
  category?: string
  segment?: string
}

export interface DataSource {
  id: string
  name: string
  type: 'database' | 'api' | 'file' | 'stream'
  status: 'connected' | 'disconnected' | 'syncing'
  lastSync?: number
  recordCount?: number
  owner?: string
}

export interface SemanticMetric {
  id: string
  name: string
  description: string
  formula: string
  category: string
  dataSource: string
  createdBy: string
  lastModified: number
  tags: string[]
}

export interface AuditLog {
  id: string
  timestamp: number
  user: string
  action: 'view' | 'edit' | 'share' | 'export' | 'delete'
  resource: string
  details?: string
}

export interface DataQualityMetric {
  id: string
  name: string
  score: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  issues?: string[]
  lastChecked: number
}

export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnail?: string
  components: DashboardComponent[]
}

export interface DashboardComponent {
  id: string
  type: 'metric' | 'chart' | 'table' | 'text'
  position: { x: number; y: number; w: number; h: number }
  config: any
}

export interface Comment {
  id: string
  dashboardId: string
  author: string
  content: string
  timestamp: number
  replies?: Comment[]
}

export interface Alert {
  id: string
  name: string
  condition: string
  metric: string
  threshold: number
  active: boolean
  lastTriggered?: number
}

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface DigestSubscription {
  scheduleId: string
  enabled: boolean
  deliveryChannel: 'email' | 'slack'
  customFilters?: {
    insightTypes?: string[]
    minPriority?: string
    minConfidence?: number
  }
  subscribedAt: number
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'invited' | 'inactive'
  joinedAt: number
  lastActive: number
  digestSubscriptions: DigestSubscription[]
}

export interface CursorPosition {
  userId: string
  userName: string
  userColor: string
  x: number
  y: number
  timestamp: number
}

export interface UserPresence {
  userId: string
  userName: string
  userColor: string
  currentView: string
  isActive: boolean
  lastSeen: number
  cursor?: CursorPosition
}

export interface YoYDataPoint {
  month: string
  monthIndex: number
  currentYear: number
  previousYear: number
  yoyChange: number
  yoyChangePercent: number
}

export interface SeasonalTrend {
  season: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  seasonName: string
  months: string[]
  currentYearAvg: number
  previousYearAvg: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'neutral'
}

export interface SeasonalPattern {
  id: string
  metricName: string
  metricId: string
  seasonality: 'strong' | 'moderate' | 'weak'
  peakSeason: string
  lowSeason: string
  avgPeakValue: number
  avgLowValue: number
  volatility: number
  confidence: number
}

export interface SeasonalRecommendation {
  id: string
  title: string
  description: string
  type: 'opportunity' | 'risk' | 'optimization' | 'planning'
  priority: 'high' | 'medium' | 'low'
  impact: string
  actionItems: string[]
  season: string
  confidence: number
  timestamp: number
  applied?: boolean
}

export interface SeasonalForecast {
  period: string
  metric: string
  forecast: number
  confidence: number
  trend: 'up' | 'down' | 'neutral'
  recommendation?: string
}
