import { Metric, ChartDataPoint, PredictionData } from './types'

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
