import { WorkspaceActivity } from '@/components/WorkspaceActivityFeed'
import { addDays, format, getDay, getHours, startOfDay, subDays, differenceInDays } from 'date-fns'

export interface ActivityForecast {
  date: Date
  predicted: number
  confidenceIntervalLow: number
  confidenceIntervalHigh: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface HourlyPattern {
  hour: number
  label: string
  avgActivity: number
}

export interface WeekdayPattern {
  day: number
  label: string
  avgActivity: number
}

export interface ForecastMetrics {
  peakHour: { hour: number; count: number; label: string }
  trendPercentage: number
  overallTrend: 'increasing' | 'decreasing' | 'stable'
  peakDay: string
  confidence: number
  hourlyPatterns: HourlyPattern[]
  weekdayPatterns: WeekdayPattern[]
}

interface TimeSeriesPoint {
  date: Date
  count: number
}

export function generateForecast(
  activities: WorkspaceActivity[], 
  daysToForecast: number = 7
): { forecast: ActivityForecast[]; metrics: ForecastMetrics } {
  
  if (!activities.length) {
    return {
      forecast: [],
      metrics: {
        peakHour: { hour: 0, count: 0, label: '12 AM' },
        trendPercentage: 0,
        overallTrend: 'stable',
        peakDay: 'N/A',
        confidence: 0,
        hourlyPatterns: [],
        weekdayPatterns: []
      }
    }
  }

  // 1. Process Historical Data
  const dayMap = new Map<string, number>()
  activities.forEach(activity => {
    const dateKey = format(new Date(activity.timestamp), 'yyyy-MM-dd')
    dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + 1)
  })

  // Fill in missing days with 0
  const sortedDates = Array.from(dayMap.keys()).sort()
  const startDate = new Date(sortedDates[0])
  const endDate = new Date(sortedDates[sortedDates.length - 1])
  const totalDays = differenceInDays(endDate, startDate) + 1
  
  const historicalData: TimeSeriesPoint[] = []
  for (let i = 0; i < totalDays; i++) {
    const date = addDays(startDate, i)
    const key = format(date, 'yyyy-MM-dd')
    historicalData.push({
      date,
      count: dayMap.get(key) || 0
    })
  }

  // 2. Calculate Patterns
  const weekdayPatterns = calculateWeekdayPatterns(activities)
  const hourlyPatterns = calculateHourlyPatterns(activities)
  
  // 3. Calculate Trend
  const counts = historicalData.map(d => d.count)
  const slope = calculateTrend(counts)
  const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length
  const trendPercentage = avgCount ? (slope / avgCount) * 100 : 0
  
  const overallTrend = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable'

  // 4. Calculate Variance for Confidence Interval
  const variance = calculateVariance(counts)
  const stdDev = Math.sqrt(variance)

  // 5. Generate Forecast
  const forecast: ActivityForecast[] = []
  const lastDate = historicalData[historicalData.length - 1].date

  for (let i = 1; i <= daysToForecast; i++) {
    const targetDate = addDays(lastDate, i)
    const dayIndex = getDay(targetDate)
    
    // Base prediction on linear trend
    const trendBase = counts[counts.length - 1] + (slope * i)
    
    // Adjust for weekday seasonality
    const weekdayPattern = weekdayPatterns.find(p => p.day === dayIndex)
    const avgForWeekday = weekdayPattern ? weekdayPattern.avgActivity : 0
    const overallAvg = weekdayPatterns.reduce((sum, p) => sum + p.avgActivity, 0) / 7
    const seasonalityMultiplier = overallAvg ? avgForWeekday / overallAvg : 1
    
    let predicted = Math.max(0, trendBase * seasonalityMultiplier)
    
    // Simple confidence interval growing with time
    const confidenceWidth = stdDev * (1 + (i * 0.1))

    forecast.push({
      date: targetDate,
      predicted: Math.round(predicted),
      confidenceIntervalLow: Math.max(0, Math.round(predicted - confidenceWidth)),
      confidenceIntervalHigh: Math.round(predicted + confidenceWidth),
      trend: overallTrend
    })
  }

  // 6. Metrics
  const peakHourObj = [...hourlyPatterns].sort((a, b) => b.avgActivity - a.avgActivity)[0] || { hour: 12, label: '12 PM', avgActivity: 0 }
  const peakDayObj = [...weekdayPatterns].sort((a, b) => b.avgActivity - a.avgActivity)[0]

  const metrics: ForecastMetrics = {
    peakHour: { 
      hour: peakHourObj.hour, 
      count: peakHourObj.avgActivity,
      label: peakHourObj.label
    },
    trendPercentage,
    overallTrend,
    peakDay: peakDayObj ? peakDayObj.label : 'N/A',
    confidence: Math.max(0, Math.min(100, 100 - (variance / (avgCount || 1) * 10))), // Rough confidence score
    hourlyPatterns,
    weekdayPatterns
  }

  return { forecast, metrics }
}

function calculateTrend(data: number[]): number {
  const n = data.length
  if (n < 2) return 0

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += data[i]
    sumXY += i * data[i]
    sumX2 += i * i
  }

  const denominator = (n * sumX2 - sumX * sumX)
  if (denominator === 0) return 0
  
  const slope = (n * sumXY - sumX * sumY) / denominator
  return slope
}

function calculateVariance(data: number[]): number {
  if (data.length < 2) return 0
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  return data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / (data.length - 1)
}

function calculateWeekdayPatterns(activities: WorkspaceActivity[]): WeekdayPattern[] {
  const dayMap = new Map<number, number[]>()
  
  activities.forEach(activity => {
    const day = getDay(new Date(activity.timestamp))
    if (!dayMap.has(day)) dayMap.set(day, [])
    dayMap.get(day)?.push(1) // Just counting occurrences per day bucket isn't enough, we need avg per specific day
  })

  // Better approach: Group by specific date first, then by weekday
  const dateCounts = new Map<string, number>()
  activities.forEach(activity => {
    const key = format(new Date(activity.timestamp), 'yyyy-MM-dd')
    dateCounts.set(key, (dateCounts.get(key) || 0) + 1)
  })

  const weekdaySums = new Map<number, { total: number; count: number }>()
  for (let i = 0; i < 7; i++) weekdaySums.set(i, { total: 0, count: 0 })

  dateCounts.forEach((count, dateStr) => {
    const day = getDay(new Date(dateStr))
    const current = weekdaySums.get(day)!
    current.total += count
    current.count += 1
  })

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  return Array.from(weekdaySums.entries()).map(([day, data]) => ({
    day,
    label: days[day],
    avgActivity: data.count > 0 ? data.total / data.count : 0
  }))
}

function calculateHourlyPatterns(activities: WorkspaceActivity[]): HourlyPattern[] {
  const hourMap = new Map<number, number>()
  
  activities.forEach(activity => {
    const hour = getHours(new Date(activity.timestamp))
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
  })

  const totalDays = new Set(activities.map(a => format(new Date(a.timestamp), 'yyyy-MM-dd'))).size || 1

  return Array.from({ length: 24 }, (_, hour) => {
    const totalCount = hourMap.get(hour) || 0
    const date = new Date()
    date.setHours(hour)
    return {
      hour,
      label: format(date, 'h a'),
      avgActivity: totalCount / totalDays
    }
  })
}

export function generateInsights(metrics: ForecastMetrics): string[] {
  const insights: string[] = []
  
  // Trend Insight
  if (metrics.overallTrend === 'increasing') {
    insights.push(`Activity is trending upward with a ${metrics.trendPercentage.toFixed(1)}% increase.`)
  } else if (metrics.overallTrend === 'decreasing') {
    insights.push(`Activity is trending downward with a ${Math.abs(metrics.trendPercentage).toFixed(1)}% decrease.`)
  } else {
    insights.push('Activity levels are stable with consistent patterns.')
  }

  // Peak Time Insight
  if (metrics.peakHour) {
    insights.push(`Team members are most active around ${metrics.peakHour.label}.`)
  }

  // Peak Day Insight
  insights.push(`The busiest day of the week is usually ${metrics.peakDay}.`)

  // Forecast Confidence
  if (metrics.confidence >= 75) {
    insights.push('Forecast confidence is high based on consistent historical data.')
  } else if (metrics.confidence < 40) {
    insights.push('Forecast confidence is low due to high variability in activity.')
  }

  return insights
}