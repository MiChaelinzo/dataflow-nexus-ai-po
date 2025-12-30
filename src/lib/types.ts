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
