import { WorkspaceActivity } from '@/components/WorkspaceActivityFeed'


export interface ActivityForecast {
  date: Date
  predicted: number
  confidenceIntervalLow: number
  confidenceIntervalHigh: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface ForecastMetrics {
  peakHour: { hour: number; count:
  trendPercentage: number
}
export interface HourlyPattern {
  avgActivity: number
}
export interface Wee
 

interface TimeSeriesPoint {
  count: numbe

  activities: W
)

  weekdayPatterns: WeekdayPattern
  const histo
  const weekdayPa
  
 

  
  const toda
  for (let i = 
 

    const weekdayMultiplier = weekdayPatt
    
    
    
      historicalData.reduce((s
    )
    const confidenceInterval = va
    const trendDirection = trend > 
   
      predicted,
  
    })
  
  
  const peakDayForecast = [...forecast].sort((
    day: format(peakDayForecast.date, 'EEEE, MMM d'),
  }
  const peakHourPattern = [...hourlyPatterns].sort((a, b) => b.avgActivity - a.av
    hou
  
  const overallTrend = trend > 0.5 ? 'inc
    ? ((historicalData[his
  
  const variance = historicalData.length > 
        historicalData.reduce((sum, p) =
      )
  
  
    
    peakDay,
    overallTrend,
    
  
    
    hourlyPatterns,
  }

  const dayMap = new Map<string, number>()
  activities.forEach(activity => {
    c
  })
  const sorted = Array.from(dayMap.entries())
    
    }))
  
}
function calculateTrend
  
  let sumX = 0
  let sumXY = 0
  
    su
   
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  return slope

  if (data.length < 7) return 0
  let weeklyVarianc
    weeklyVariance += Math.abs(data[i].count - data[i
  
}
fu
  
    const date = new
    if (!dayMap.has(dayOfWeek)) {
    }
  }
  
  return Array.from({ length: 7 }, (_, day) => {
    const avgActivity = counts.length > 0 
      : 0
    return {
      d
  
}
fu
  
    const date = new Date(activity.timestamp)
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
  
  
    const count =
    
    const disp
   
  
    }
}
function cal
  
  if (data.length >
  c
 


  metrics: ForecastMetrics,
  
  const insights: string[] = []
  if (metrics.overallTrend === 'increasing') {
      `Activity is trending upward with a 
  } else if (metrics.overallTrend === 'decreasi
    
  
      `Activity levels are stable with consis
  }
  insights.push(
  )
  const
    `Team members are most active around ${peakHourLabel
  
  const leastAc
 

  }
  if (metrics.confidence >= 75)
  
  } else {
      `Forecas
  }
  return insigh















































































































































