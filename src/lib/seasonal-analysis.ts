import { SeasonalPattern, SeasonalRecommendation, SeasonalForecast, Metric } from './types'

export function analyzeSeasonalPattern(metric: Metric, historicalData: number[]): SeasonalPattern {
  const quarters = [
    { name: 'Q1', data: historicalData.slice(0, 3) },
    { name: 'Q2', data: historicalData.slice(3, 6) },
    { name: 'Q3', data: historicalData.slice(6, 9) },
    { name: 'Q4', data: historicalData.slice(9, 12) }
  ]
  
  const quarterAvgs = quarters.map(q => ({
    name: q.name,
    avg: q.data.reduce((sum, val) => sum + val, 0) / q.data.length
  }))
  
  const peakQuarter = quarterAvgs.reduce((max, q) => q.avg > max.avg ? q : max)
  const lowQuarter = quarterAvgs.reduce((min, q) => q.avg < min.avg ? q : min)
  
  const avgValue = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length
  const variance = historicalData.reduce((sum, val) => sum + Math.pow(val - avgValue, 2), 0) / historicalData.length
  const stdDev = Math.sqrt(variance)
  const coefficientOfVariation = stdDev / avgValue
  
  let seasonality: 'strong' | 'moderate' | 'weak'
  if (coefficientOfVariation > 0.3) seasonality = 'strong'
  else if (coefficientOfVariation > 0.15) seasonality = 'moderate'
  else seasonality = 'weak'
  
  const volatility = coefficientOfVariation * 100
  const confidence = Math.min(95, 60 + (historicalData.length * 2))
  
  return {
    id: `pattern-${metric.id}`,
    metricName: metric.label,
    metricId: metric.id,
    seasonality,
    peakSeason: peakQuarter.name,
    lowSeason: lowQuarter.name,
    avgPeakValue: peakQuarter.avg,
    avgLowValue: lowQuarter.avg,
    volatility,
    confidence
  }
}

export function generateSeasonalRecommendations(
  patterns: SeasonalPattern[],
  metrics: Metric[]
): SeasonalRecommendation[] {
  const recommendations: SeasonalRecommendation[] = []
  const currentMonth = new Date().getMonth()
  const currentQuarter = Math.floor(currentMonth / 3) + 1
  const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1
  const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4']
  
  patterns.forEach(pattern => {
    const metric = metrics.find(m => m.id === pattern.metricId)
    if (!metric) return
    
    if (pattern.seasonality === 'strong' && pattern.peakSeason === quarterNames[nextQuarter - 1]) {
      recommendations.push({
        id: `rec-peak-${pattern.metricId}-${Date.now()}`,
        title: `Prepare for Peak ${pattern.metricName} Season`,
        description: `Historical data shows ${pattern.metricName} typically peaks in ${pattern.peakSeason}. Your next quarter (${quarterNames[nextQuarter - 1]}) shows strong seasonal patterns with ${pattern.confidence}% confidence.`,
        type: 'opportunity',
        priority: 'high',
        impact: `Expected ${Math.round(((pattern.avgPeakValue - pattern.avgLowValue) / pattern.avgLowValue) * 100)}% increase from baseline`,
        actionItems: [
          'Increase inventory or capacity by 20-30% ahead of peak demand',
          'Scale marketing budget to capture seasonal opportunity',
          'Prepare customer support for higher volume',
          'Review pricing strategy for peak season optimization'
        ],
        season: quarterNames[nextQuarter - 1],
        confidence: pattern.confidence,
        timestamp: Date.now()
      })
    }
    
    if (pattern.seasonality === 'strong' && pattern.lowSeason === quarterNames[nextQuarter - 1]) {
      recommendations.push({
        id: `rec-low-${pattern.metricId}-${Date.now()}`,
        title: `Mitigate ${pattern.metricName} Seasonal Dip`,
        description: `Approaching ${pattern.peakSeason} which historically shows lower ${pattern.metricName}. Proactive measures can help minimize the expected decline.`,
        type: 'risk',
        priority: 'medium',
        impact: `Potential ${Math.round(((pattern.avgPeakValue - pattern.avgLowValue) / pattern.avgPeakValue) * 100)}% decline without intervention`,
        actionItems: [
          'Launch targeted promotional campaigns to stimulate demand',
          'Introduce seasonal product bundles or limited offers',
          'Focus on customer retention and upselling initiatives',
          'Optimize operational costs during slower period'
        ],
        season: quarterNames[nextQuarter - 1],
        confidence: pattern.confidence,
        timestamp: Date.now()
      })
    }
    
    if (pattern.volatility > 25) {
      recommendations.push({
        id: `rec-volatility-${pattern.metricId}-${Date.now()}`,
        title: `Stabilize ${pattern.metricName} Fluctuations`,
        description: `${pattern.metricName} shows high volatility (${pattern.volatility.toFixed(1)}%). Implementing stabilization strategies can improve predictability.`,
        type: 'optimization',
        priority: 'medium',
        impact: `Reduce variance by up to 40% with strategic planning`,
        actionItems: [
          'Implement demand smoothing techniques',
          'Diversify revenue streams to balance seasonal impacts',
          'Build buffer capacity for peak periods',
          'Create off-season engagement programs'
        ],
        season: 'All Quarters',
        confidence: 78,
        timestamp: Date.now()
      })
    }
    
    if (metric.trend === 'up' && pattern.seasonality !== 'weak') {
      recommendations.push({
        id: `rec-growth-${pattern.metricId}-${Date.now()}`,
        title: `Capitalize on ${pattern.metricName} Growth Trajectory`,
        description: `${pattern.metricName} is trending up (+${metric.change.toFixed(1)}%) with predictable seasonal patterns. This presents strategic expansion opportunities.`,
        type: 'planning',
        priority: 'high',
        impact: `Potential to accelerate growth by 15-25% with proper planning`,
        actionItems: [
          'Invest in scaling infrastructure before peak season',
          'Expand market reach in high-performing segments',
          'Lock in strategic partnerships for peak periods',
          'Allocate additional budget to high-ROI channels'
        ],
        season: pattern.peakSeason,
        confidence: 85,
        timestamp: Date.now()
      })
    }
  })
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

export function generateSeasonalForecasts(
  patterns: SeasonalPattern[],
  metrics: Metric[]
): SeasonalForecast[] {
  const forecasts: SeasonalForecast[] = []
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
  const currentMonth = new Date().getMonth()
  const currentQuarter = Math.floor(currentMonth / 3)
  
  patterns.forEach(pattern => {
    const metric = metrics.find(m => m.id === pattern.metricId)
    if (!metric) return
    
    for (let i = 0; i < 4; i++) {
      const quarterIndex = (currentQuarter + i) % 4
      const quarter = quarters[quarterIndex]
      const isPeakSeason = quarter === pattern.peakSeason
      const isLowSeason = quarter === pattern.lowSeason
      
      let forecast = metric.value
      if (isPeakSeason) {
        forecast = pattern.avgPeakValue
      } else if (isLowSeason) {
        forecast = pattern.avgLowValue
      } else {
        forecast = (pattern.avgPeakValue + pattern.avgLowValue) / 2
      }
      
      forecast *= (1 + (metric.change / 100) * 0.5)
      
      let trend: 'up' | 'down' | 'neutral' = 'neutral'
      if (isPeakSeason) trend = 'up'
      else if (isLowSeason) trend = 'down'
      
      let recommendation = ''
      if (isPeakSeason) {
        recommendation = 'Scale up resources and maximize opportunity'
      } else if (isLowSeason) {
        recommendation = 'Focus on efficiency and retention strategies'
      } else {
        recommendation = 'Maintain steady operations and plan ahead'
      }
      
      forecasts.push({
        period: quarter,
        metric: pattern.metricName,
        forecast,
        confidence: pattern.confidence,
        trend,
        recommendation
      })
    }
  })
  
  return forecasts
}
