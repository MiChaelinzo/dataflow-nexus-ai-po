import { WorkspaceActivity } from '@/components/WorkspaceActivityFeed'
import { format, addDays, subDays, startOfDay, endOfDay, isWithinInterval, getHours, getDay } from 'date-fns'

export interface ActivityForecast {
  date: Date
  predicted: number
  confidenceIntervalLow: number
  confidenceIntervalHigh: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface ForecastMetrics {
  totalPredictedActivities: number
  avgDailyPredicted: number
  peakDay: { day: string; count: number }
  peakHour: { hour: number; count: number }
  overallTrend: 'increasing' | 'decreasing' | 'stable'
  trendPercentage: number
  confidence: number
}

export interface HourlyPattern {
  hour: number
  avgActivity: number
  label: string
}

export interface WeekdayPattern {
  day: number
  dayName: string
  avgActivity: number
}

interface TimeSeriesPoint {
  date: Date
  count: number
}

export function generateActivityForecast(
  activities: WorkspaceActivity[],
  forecastDays: number = 14
): {
  forecast: ActivityForecast[]
  metrics: ForecastMetrics
  hourlyPatterns: HourlyPattern[]
  weekdayPatterns: WeekdayPattern[]
} {
  const historicalData = aggregateActivitiesByDay(activities)
  
  const weekdayPatterns = calculateWeekdayPatterns(activities)
  const hourlyPatterns = calculateHourlyPatterns(activities)
  
  const trend = calculateTrend(historicalData)
  const seasonality = calculateSeasonality(historicalData)
  const avgActivity = historicalData.length > 0
    ? historicalData.reduce((sum, p) => sum + p.count, 0) / historicalData.length
    : 5
  
  const forecast: ActivityForecast[] = []
  const today = new Date()
  
  for (let i = 1; i <= forecastDays; i++) {
    const futureDate = addDays(today, i)
    const dayOfWeek = getDay(futureDate)
    
    const trendComponent = avgActivity + (trend * i)
    
    const weekdayMultiplier = weekdayPatterns.find(p => p.day === dayOfWeek)?.avgActivity || avgActivity
    const weekdayFactor = avgActivity > 0 ? weekdayMultiplier / avgActivity : 1
    
    const seasonalFactor = 1 + (Math.sin(i / 7 * Math.PI) * 0.15)
    
    const predicted = Math.max(0, Math.round(trendComponent * weekdayFactor * seasonalFactor))
    
    const variance = Math.sqrt(
      historicalData.reduce((sum, p) => sum + Math.pow(p.count - avgActivity, 2), 0) / 
      Math.max(historicalData.length, 1)
    )
    
    const confidenceInterval = variance * 1.96
    
    const trendDirection = trend > 0.5 ? 'increasing' : trend < -0.5 ? 'decreasing' : 'stable'
    
    forecast.push({
      date: futureDate,
      predicted,
      confidenceIntervalLow: Math.max(0, Math.round(predicted - confidenceInterval)),
      confidenceIntervalHigh: Math.round(predicted + confidenceInterval),
      trend: trendDirection
    })
  }
  
  const totalPredicted = forecast.reduce((sum, f) => sum + f.predicted, 0)
  const avgDailyPredicted = totalPredicted / forecastDays
  
  const peakDayForecast = [...forecast].sort((a, b) => b.predicted - a.predicted)[0]
  const peakDay = {
    day: format(peakDayForecast.date, 'EEEE, MMM d'),
    count: peakDayForecast.predicted
  }
  
  const peakHourPattern = [...hourlyPatterns].sort((a, b) => b.avgActivity - a.avgActivity)[0]
  const peakHour = {
    hour: peakHourPattern?.hour || 14,
    count: Math.round(peakHourPattern?.avgActivity || 0)
  }
  
  const overallTrend = trend > 0.5 ? 'increasing' : trend < -0.5 ? 'decreasing' : 'stable'
  const trendPercentage = historicalData.length > 1
    ? ((historicalData[historicalData.length - 1].count - historicalData[0].count) / 
       Math.max(historicalData[0].count, 1)) * 100
    : 0
  
  const variance = historicalData.length > 0
    ? Math.sqrt(
        historicalData.reduce((sum, p) => sum + Math.pow(p.count - avgActivity, 2), 0) / 
        historicalData.length
      )
    : 0
  
  const confidence = calculateConfidence(historicalData, variance)
  
  const metrics: ForecastMetrics = {
    totalPredictedActivities: totalPredicted,
    avgDailyPredicted: Math.round(avgDailyPredicted * 10) / 10,
    peakDay,
    peakHour,
    overallTrend,
    trendPercentage: Math.round(trendPercentage * 10) / 10,
    confidence
  }
  
  return {
    forecast,
    metrics,
    hourlyPatterns,
    weekdayPatterns
  }
}

function aggregateActivitiesByDay(activities: WorkspaceActivity[]): TimeSeriesPoint[] {
  const dayMap = new Map<string, number>()
  
  activities.forEach(activity => {
    const date = startOfDay(new Date(activity.timestamp))
    const key = format(date, 'yyyy-MM-dd')
    dayMap.set(key, (dayMap.get(key) || 0) + 1)
  })
  
  const sorted = Array.from(dayMap.entries())
    .map(([dateStr, count]) => ({
      date: new Date(dateStr),
      count
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  
  return sorted
}

function calculateTrend(data: TimeSeriesPoint[]): number {
  if (data.length < 2) return 0
  
  const n = data.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  
  data.forEach((point, index) => {
    sumX += index
    sumY += point.count
    sumXY += index * point.count
    sumX2 += index * index
  })
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  
  return slope
}

function calculateSeasonality(data: TimeSeriesPoint[]): number {
  if (data.length < 7) return 0
  
  let weeklyVariance = 0
  for (let i = 7; i < data.length; i++) {
    weeklyVariance += Math.abs(data[i].count - data[i - 7].count)
  }
  
  return weeklyVariance / Math.max(data.length - 7, 1)
}

function calculateWeekdayPatterns(activities: WorkspaceActivity[]): WeekdayPattern[] {
  const dayMap = new Map<number, number[]>()
  
  activities.forEach(activity => {
    const date = new Date(activity.timestamp)
    const dayOfWeek = getDay(date)
    if (!dayMap.has(dayOfWeek)) {
      dayMap.set(dayOfWeek, [])
    }
    dayMap.get(dayOfWeek)!.push(1)
  })
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  return Array.from({ length: 7 }, (_, day) => {
    const counts = dayMap.get(day) || []
    const avgActivity = counts.length > 0 
      ? counts.reduce((sum, c) => sum + c, 0) / (counts.length / 7 || 1)
      : 0
    
    return {
      day,
      dayName: dayNames[day],
      avgActivity: Math.round(avgActivity * 10) / 10
    }
  })
}

function calculateHourlyPatterns(activities: WorkspaceActivity[]): HourlyPattern[] {
  const hourMap = new Map<number, number>()
  
  activities.forEach(activity => {
    const date = new Date(activity.timestamp)
    const hour = getHours(date)
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
  })
  
  const totalDays = new Set(activities.map(a => format(new Date(a.timestamp), 'yyyy-MM-dd'))).size || 1
  
  return Array.from({ length: 24 }, (_, hour) => {
    const count = hourMap.get(hour) || 0
    const avgActivity = count / totalDays
    
    const period = hour < 12 ? 'AM' : 'PM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    
    return {
      hour,
      avgActivity: Math.round(avgActivity * 10) / 10,
      label: `${displayHour}${period}`
    }
  })
}

function calculateConfidence(data: TimeSeriesPoint[], variance: number): number {
  if (data.length < 7) return 50
  
  if (data.length >= 30) return 85
  if (data.length >= 14) return 75
  
  const consistencyScore = variance < 5 ? 20 : variance < 10 ? 10 : 0
  
  const baseScore = 50 + (data.length * 1.5)
  
  return Math.min(95, Math.round(baseScore + consistencyScore))
}

export function generateForecastInsights(
  metrics: ForecastMetrics,
  hourlyPatterns: HourlyPattern[],
  weekdayPatterns: WeekdayPattern[]
): string[] {
  const insights: string[] = []
  
  if (metrics.overallTrend === 'increasing') {
    insights.push(
      `Activity is trending upward with a ${Math.abs(metrics.trendPercentage).toFixed(1)}% increase expected. Team engagement is growing!`
    )
  } else if (metrics.overallTrend === 'decreasing') {
    insights.push(
      `Activity is trending downward by ${Math.abs(metrics.trendPercentage).toFixed(1)}%. Consider initiatives to boost engagement.`
    )
  } else {
    insights.push(
      `Activity levels are stable with consistent engagement patterns.`
    )
  }
  
  insights.push(
    `Peak activity is expected on ${metrics.peakDay.day} with approximately ${metrics.peakDay.count} activities.`
  )
  
  const peakHourLabel = hourlyPatterns.find(p => p.hour === metrics.peakHour.hour)?.label || 'afternoon'
  insights.push(
    `Team members are most active around ${peakHourLabel}, averaging ${metrics.peakHour.count} actions per hour.`
  )
  
  const mostActiveDay = [...weekdayPatterns].sort((a, b) => b.avgActivity - a.avgActivity)[0]
  const leastActiveDay = [...weekdayPatterns].sort((a, b) => a.avgActivity - b.avgActivity)[0]
  
  if (mostActiveDay && leastActiveDay && mostActiveDay.day !== leastActiveDay.day) {
    insights.push(
      `${mostActiveDay.dayName}s show the highest engagement, while ${leastActiveDay.dayName}s are typically quieter.`
    )
  }
  
  if (metrics.confidence >= 75) {
    insights.push(
      `Forecast confidence is ${metrics.confidence}% based on consistent historical patterns.`
    )
  } else {
    insights.push(
      `Forecast confidence is ${metrics.confidence}%. More historical data will improve prediction accuracy.`
    )
  }
  
  return insights
}
