export interface ReplayView {
  id: string
  sessionId: string
  viewerId: string
  viewerName: string
  viewerColor: string
  startedAt: number
  endedAt?: number
  duration: number
  completionRate: number
  interactions: ViewerInteraction[]
  watchedSegments: TimeSegment[]
  engagementScore: number
}

export interface ViewerInteraction {
  id: string
  type: 'play' | 'pause' | 'seek' | 'speed-change' | 'add-annotation' | 'add-bookmark' | 'add-reply'
  timestamp: number
  playbackTime: number
  data?: any
}

export interface TimeSegment {
  start: number
  end: number
  watched: boolean
}

export interface ReplayAnalytics {
  sessionId: string
  totalViews: number
  uniqueViewers: number
  averageDuration: number
  averageCompletionRate: number
  totalEngagementTime: number
  peakViewingTime: number
  interactionHeatmap: HeatmapPoint[]
  viewerStats: ViewerStats[]
  popularSegments: PopularSegment[]
  dropOffPoints: DropOffPoint[]
}

export interface HeatmapPoint {
  timestamp: number
  intensity: number
  interactionCount: number
  viewCount: number
}

export interface ViewerStats {
  viewerId: string
  viewerName: string
  viewerColor: string
  viewCount: number
  totalWatchTime: number
  averageCompletionRate: number
  totalInteractions: number
  lastViewedAt: number
  engagementLevel: 'high' | 'medium' | 'low'
}

export interface PopularSegment {
  start: number
  end: number
  viewCount: number
  averageRewatchCount: number
  engagementScore: number
}

export interface DropOffPoint {
  timestamp: number
  dropOffCount: number
  dropOffRate: number
  possibleReason?: string
}

export function createReplayView(
  sessionId: string,
  viewerId: string,
  viewerName: string,
  viewerColor: string
): ReplayView {
  return {
    id: `view-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    sessionId,
    viewerId,
    viewerName,
    viewerColor,
    startedAt: Date.now(),
    duration: 0,
    completionRate: 0,
    interactions: [],
    watchedSegments: [],
    engagementScore: 0
  }
}

export function addViewerInteraction(
  view: ReplayView,
  type: ViewerInteraction['type'],
  playbackTime: number,
  data?: any
): ReplayView {
  const interaction: ViewerInteraction = {
    id: `int-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    type,
    timestamp: Date.now(),
    playbackTime,
    data
  }

  return {
    ...view,
    interactions: [...view.interactions, interaction]
  }
}

export function updateWatchedSegment(
  view: ReplayView,
  currentTime: number,
  sessionDuration: number
): ReplayView {
  const segmentSize = 1000
  const segmentIndex = Math.floor(currentTime / segmentSize)
  
  const updatedSegments = [...view.watchedSegments]
  const existingSegment = updatedSegments.find(s => 
    Math.floor(s.start / segmentSize) === segmentIndex
  )
  
  if (!existingSegment) {
    updatedSegments.push({
      start: segmentIndex * segmentSize,
      end: Math.min((segmentIndex + 1) * segmentSize, sessionDuration),
      watched: true
    })
  }
  
  const watchedTime = updatedSegments.reduce((sum, seg) => sum + (seg.end - seg.start), 0)
  const completionRate = (watchedTime / sessionDuration) * 100
  
  return {
    ...view,
    watchedSegments: updatedSegments,
    completionRate: Math.min(100, completionRate)
  }
}

export function finalizeReplayView(view: ReplayView): ReplayView {
  const now = Date.now()
  const duration = now - view.startedAt
  
  const engagementScore = calculateEngagementScore(view, duration)
  
  return {
    ...view,
    endedAt: now,
    duration,
    engagementScore
  }
}

export function calculateEngagementScore(view: ReplayView, duration: number): number {
  const completionWeight = 0.4
  const interactionWeight = 0.3
  const durationWeight = 0.3
  
  const completionScore = view.completionRate
  
  const interactionScore = Math.min(100, (view.interactions.length / 10) * 100)
  
  const expectedDuration = 60000
  const durationScore = Math.min(100, (duration / expectedDuration) * 100)
  
  const totalScore = 
    (completionScore * completionWeight) +
    (interactionScore * interactionWeight) +
    (durationScore * durationWeight)
  
  return Math.round(totalScore)
}

export function calculateReplayAnalytics(
  sessionId: string,
  sessionDuration: number,
  views: ReplayView[]
): ReplayAnalytics {
  const sessionViews = views.filter(v => v.sessionId === sessionId)
  
  const uniqueViewers = new Set(sessionViews.map(v => v.viewerId)).size
  const totalViews = sessionViews.length
  
  const totalDuration = sessionViews.reduce((sum, v) => sum + v.duration, 0)
  const averageDuration = totalViews > 0 ? totalDuration / totalViews : 0
  
  const totalCompletion = sessionViews.reduce((sum, v) => sum + v.completionRate, 0)
  const averageCompletionRate = totalViews > 0 ? totalCompletion / totalViews : 0
  
  const totalEngagementTime = sessionViews.reduce((sum, v) => {
    const watchedTime = v.watchedSegments.reduce((t, seg) => t + (seg.end - seg.start), 0)
    return sum + watchedTime
  }, 0)
  
  const interactionHeatmap = generateInteractionHeatmap(sessionViews, sessionDuration)
  
  const viewerStats = generateViewerStats(sessionViews)
  
  const popularSegments = findPopularSegments(sessionViews, sessionDuration)
  
  const dropOffPoints = findDropOffPoints(sessionViews, sessionDuration)
  
  const peakViewingTime = findPeakViewingTime(interactionHeatmap)
  
  return {
    sessionId,
    totalViews,
    uniqueViewers,
    averageDuration,
    averageCompletionRate,
    totalEngagementTime,
    peakViewingTime,
    interactionHeatmap,
    viewerStats,
    popularSegments,
    dropOffPoints
  }
}

function generateInteractionHeatmap(
  views: ReplayView[],
  sessionDuration: number
): HeatmapPoint[] {
  const bucketSize = 5000
  const bucketCount = Math.ceil(sessionDuration / bucketSize)
  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    timestamp: i * bucketSize,
    intensity: 0,
    interactionCount: 0,
    viewCount: 0
  }))
  
  views.forEach(view => {
    view.watchedSegments.forEach(segment => {
      const startBucket = Math.floor(segment.start / bucketSize)
      const endBucket = Math.floor(segment.end / bucketSize)
      
      for (let i = startBucket; i <= endBucket && i < buckets.length; i++) {
        buckets[i].viewCount++
      }
    })
    
    view.interactions.forEach(interaction => {
      const bucket = Math.floor(interaction.playbackTime / bucketSize)
      if (bucket < buckets.length) {
        buckets[bucket].interactionCount++
      }
    })
  })
  
  const maxViews = Math.max(...buckets.map(b => b.viewCount), 1)
  const maxInteractions = Math.max(...buckets.map(b => b.interactionCount), 1)
  
  return buckets.map(bucket => ({
    ...bucket,
    intensity: ((bucket.viewCount / maxViews) * 0.6 + (bucket.interactionCount / maxInteractions) * 0.4) * 100
  }))
}

function generateViewerStats(views: ReplayView[]): ViewerStats[] {
  const viewerMap = new Map<string, ReplayView[]>()
  
  views.forEach(view => {
    const existing = viewerMap.get(view.viewerId) || []
    viewerMap.set(view.viewerId, [...existing, view])
  })
  
  const stats: ViewerStats[] = []
  
  viewerMap.forEach((viewerViews, viewerId) => {
    const firstView = viewerViews[0]
    const viewCount = viewerViews.length
    const totalWatchTime = viewerViews.reduce((sum, v) => sum + v.duration, 0)
    const totalCompletion = viewerViews.reduce((sum, v) => sum + v.completionRate, 0)
    const averageCompletionRate = totalCompletion / viewCount
    const totalInteractions = viewerViews.reduce((sum, v) => sum + v.interactions.length, 0)
    const lastViewedAt = Math.max(...viewerViews.map(v => v.startedAt))
    
    let engagementLevel: 'high' | 'medium' | 'low' = 'low'
    if (averageCompletionRate > 75 && totalInteractions > 5) {
      engagementLevel = 'high'
    } else if (averageCompletionRate > 40 || totalInteractions > 2) {
      engagementLevel = 'medium'
    }
    
    stats.push({
      viewerId,
      viewerName: firstView.viewerName,
      viewerColor: firstView.viewerColor,
      viewCount,
      totalWatchTime,
      averageCompletionRate,
      totalInteractions,
      lastViewedAt,
      engagementLevel
    })
  })
  
  return stats.sort((a, b) => b.totalWatchTime - a.totalWatchTime)
}

function findPopularSegments(
  views: ReplayView[],
  sessionDuration: number
): PopularSegment[] {
  const segmentSize = 10000
  const segmentCount = Math.ceil(sessionDuration / segmentSize)
  const segments = Array.from({ length: segmentCount }, (_, i) => ({
    start: i * segmentSize,
    end: Math.min((i + 1) * segmentSize, sessionDuration),
    viewCount: 0,
    rewatchCounts: [] as number[]
  }))
  
  views.forEach(view => {
    const viewedSegments = new Map<number, number>()
    
    view.watchedSegments.forEach(watched => {
      const startSegment = Math.floor(watched.start / segmentSize)
      const endSegment = Math.floor(watched.end / segmentSize)
      
      for (let i = startSegment; i <= endSegment && i < segments.length; i++) {
        viewedSegments.set(i, (viewedSegments.get(i) || 0) + 1)
      }
    })
    
    viewedSegments.forEach((count, segmentIndex) => {
      segments[segmentIndex].viewCount++
      segments[segmentIndex].rewatchCounts.push(count)
    })
  })
  
  return segments
    .map(seg => ({
      start: seg.start,
      end: seg.end,
      viewCount: seg.viewCount,
      averageRewatchCount: seg.rewatchCounts.length > 0 
        ? seg.rewatchCounts.reduce((a, b) => a + b, 0) / seg.rewatchCounts.length 
        : 0,
      engagementScore: seg.viewCount * (seg.rewatchCounts.length > 0 
        ? seg.rewatchCounts.reduce((a, b) => a + b, 0) / seg.rewatchCounts.length 
        : 1)
    }))
    .filter(seg => seg.viewCount > 0)
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 5)
}

function findDropOffPoints(
  views: ReplayView[],
  sessionDuration: number
): DropOffPoint[] {
  const bucketSize = 5000
  const bucketCount = Math.ceil(sessionDuration / bucketSize)
  const dropOffs = Array.from({ length: bucketCount }, (_, i) => ({
    timestamp: i * bucketSize,
    activeViewers: 0,
    dropOffCount: 0
  }))
  
  views.forEach(view => {
    if (!view.endedAt) return
    
    const lastWatchedSegment = view.watchedSegments.reduce((max, seg) => 
      seg.end > max ? seg.end : max, 0
    )
    
    const bucket = Math.floor(lastWatchedSegment / bucketSize)
    if (bucket < dropOffs.length && lastWatchedSegment < sessionDuration * 0.9) {
      dropOffs[bucket].dropOffCount++
    }
    
    view.watchedSegments.forEach(segment => {
      const startBucket = Math.floor(segment.start / bucketSize)
      const endBucket = Math.floor(segment.end / bucketSize)
      
      for (let i = startBucket; i <= endBucket && i < dropOffs.length; i++) {
        dropOffs[i].activeViewers++
      }
    })
  })
  
  const totalViews = views.length
  
  return dropOffs
    .map(d => ({
      timestamp: d.timestamp,
      dropOffCount: d.dropOffCount,
      dropOffRate: totalViews > 0 ? (d.dropOffCount / totalViews) * 100 : 0,
      possibleReason: d.dropOffCount > totalViews * 0.2 ? 'High drop-off point' : undefined
    }))
    .filter(d => d.dropOffCount > 0)
    .sort((a, b) => b.dropOffRate - a.dropOffRate)
    .slice(0, 3)
}

function findPeakViewingTime(heatmap: HeatmapPoint[]): number {
  if (heatmap.length === 0) return 0
  
  const peak = heatmap.reduce((max, point) => 
    point.intensity > max.intensity ? point : max
  , heatmap[0])
  
  return peak.timestamp
}

export function formatEngagementLevel(level: 'high' | 'medium' | 'low'): { label: string; color: string } {
  switch (level) {
    case 'high':
      return { label: 'High Engagement', color: 'oklch(0.65 0.15 145)' }
    case 'medium':
      return { label: 'Medium Engagement', color: 'oklch(0.70 0.15 70)' }
    case 'low':
      return { label: 'Low Engagement', color: 'oklch(0.65 0.02 240)' }
  }
}
