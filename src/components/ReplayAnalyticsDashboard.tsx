import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SessionRecording } from '@/lib/session-replay'
import { ReplayView, ReplayAnalytics, calculateReplayAnalytics, formatEngagementLevel } from '@/lib/replay-analytics'
import { formatDuration } from '@/lib/session-replay'
import { Eye, Clock, TrendUp, Users, ChartBar, Fire, Target, ArrowDown } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ReplayAnalyticsDashboardProps {
  recording: SessionRecording
  views: ReplayView[]
}

export function ReplayAnalyticsDashboard({ recording, views }: ReplayAnalyticsDashboardProps) {
  const analytics = calculateReplayAnalytics(recording.id, recording.duration, views)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Replay Analytics</h3>
        <p className="text-muted-foreground">
          Comprehensive insights into viewer engagement and interaction patterns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Eye size={20} weight="duotone" className="text-accent" />
            </div>
            <Badge variant="secondary" className="text-xs">Total</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold font-mono">{analytics.totalViews}</p>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users size={14} weight="duotone" />
              {analytics.uniqueViewers} unique viewers
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Clock size={20} weight="duotone" className="text-success" />
            </div>
            <Badge variant="secondary" className="text-xs">Avg</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold font-mono">{formatDuration(analytics.averageDuration)}</p>
            <p className="text-sm text-muted-foreground">Watch Time</p>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={14} weight="duotone" />
              {formatDuration(analytics.totalEngagementTime)} total
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-metric-purple/20 flex items-center justify-center">
              <TrendUp size={20} weight="duotone" className="text-metric-purple" />
            </div>
            <Badge variant="secondary" className="text-xs">Rate</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold font-mono">{analytics.averageCompletionRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Completion</p>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs">
              {analytics.averageCompletionRate >= 75 ? (
                <span className="text-success">● High engagement</span>
              ) : analytics.averageCompletionRate >= 40 ? (
                <span className="text-warning">● Medium engagement</span>
              ) : (
                <span className="text-muted-foreground">● Low engagement</span>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Fire size={20} weight="duotone" className="text-warning" />
            </div>
            <Badge variant="secondary" className="text-xs">Peak</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold font-mono">{formatDuration(analytics.peakViewingTime)}</p>
            <p className="text-sm text-muted-foreground">Most Viewed</p>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ChartBar size={14} weight="duotone" />
              Highest engagement
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="heatmap" className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="viewers">Viewers</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="dropoff">Drop-off</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-4 mt-6">
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Interaction Heatmap</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Shows viewer engagement intensity across the replay timeline
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Timeline</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-accent/20" />
                    <span>Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-accent/60" />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-accent" />
                    <span>High</span>
                  </div>
                </div>
              </div>
              
              <div className="h-32 flex items-end gap-1">
                {analytics.interactionHeatmap.map((point, index) => (
                  <motion.div
                    key={point.timestamp}
                    initial={{ height: 0 }}
                    animate={{ height: `${point.intensity}%` }}
                    transition={{ delay: index * 0.01, duration: 0.3 }}
                    className="flex-1 rounded-t-sm cursor-pointer group relative"
                    style={{
                      backgroundColor: `oklch(0.70 0.15 195 / ${point.intensity / 100})`,
                      minHeight: '4px'
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded border border-border/50 shadow-lg whitespace-nowrap">
                        <div className="font-semibold">{formatDuration(point.timestamp)}</div>
                        <div className="text-muted-foreground">{point.viewCount} views</div>
                        <div className="text-muted-foreground">{point.interactionCount} interactions</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>0:00</span>
                <span>{formatDuration(recording.duration)}</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="viewers" className="space-y-4 mt-6">
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Viewer Statistics</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Individual viewer engagement metrics and activity
            </p>
            
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {analytics.viewerStats.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} weight="thin" className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No viewer data yet</p>
                  </div>
                ) : (
                  analytics.viewerStats.map((viewer, index) => {
                    const engagement = formatEngagementLevel(viewer.engagementLevel)
                    
                    return (
                      <motion.div
                        key={viewer.viewerId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-4 bg-card/50 border-border/50">
                          <div className="flex items-start gap-4">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold"
                              style={{ backgroundColor: viewer.viewerColor }}
                            >
                              {viewer.viewerName.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="font-semibold">{viewer.viewerName}</h5>
                                <Badge 
                                  variant="secondary" 
                                  style={{ 
                                    backgroundColor: `${engagement.color}20`,
                                    color: engagement.color,
                                    borderColor: `${engagement.color}40`
                                  }}
                                  className="text-xs"
                                >
                                  {engagement.label}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <div className="text-muted-foreground">Views</div>
                                  <div className="font-semibold font-mono">{viewer.viewCount}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Watch Time</div>
                                  <div className="font-semibold font-mono">{formatDuration(viewer.totalWatchTime)}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Completion</div>
                                  <div className="font-semibold font-mono">{viewer.averageCompletionRate.toFixed(0)}%</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Interactions</div>
                                  <div className="font-semibold font-mono">{viewer.totalInteractions}</div>
                                </div>
                              </div>

                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${viewer.averageCompletionRate}%` }}
                                  transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: engagement.color }}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4 mt-6">
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Popular Segments</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Most viewed and re-watched sections of the replay
            </p>
            
            <div className="space-y-3">
              {analytics.popularSegments.length === 0 ? (
                <div className="text-center py-12">
                  <Target size={48} weight="thin" className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No segment data yet</p>
                </div>
              ) : (
                analytics.popularSegments.map((segment, index) => (
                  <motion.div
                    key={`${segment.start}-${segment.end}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 bg-gradient-to-r from-accent/10 to-transparent border-accent/20">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <span className="text-sm font-semibold font-mono">
                              {formatDuration(segment.start)} - {formatDuration(segment.end)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Duration: {formatDuration(segment.end - segment.start)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent">{segment.viewCount}</div>
                          <div className="text-xs text-muted-foreground">views</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-card/50 rounded p-2">
                          <div className="text-muted-foreground">Avg Rewatches</div>
                          <div className="font-semibold font-mono">{segment.averageRewatchCount.toFixed(1)}x</div>
                        </div>
                        <div className="bg-card/50 rounded p-2">
                          <div className="text-muted-foreground">Engagement</div>
                          <div className="font-semibold font-mono">{segment.engagementScore.toFixed(0)}</div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="dropoff" className="space-y-4 mt-6">
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Drop-off Analysis</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Points where viewers stop watching the replay
            </p>
            
            <div className="space-y-3">
              {analytics.dropOffPoints.length === 0 ? (
                <div className="text-center py-12">
                  <TrendUp size={48} weight="thin" className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No drop-off data yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Great retention so far!</p>
                </div>
              ) : (
                analytics.dropOffPoints.map((point, index) => (
                  <motion.div
                    key={point.timestamp}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`p-4 ${
                      point.dropOffRate > 20 
                        ? 'bg-gradient-to-r from-destructive/10 to-transparent border-destructive/20'
                        : 'bg-gradient-to-r from-warning/10 to-transparent border-warning/20'
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          point.dropOffRate > 20 ? 'bg-destructive/20' : 'bg-warning/20'
                        }`}>
                          <ArrowDown 
                            size={20} 
                            weight="duotone" 
                            className={point.dropOffRate > 20 ? 'text-destructive' : 'text-warning'}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold font-mono">
                              {formatDuration(point.timestamp)}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                point.dropOffRate > 20 
                                  ? 'bg-destructive/20 text-destructive border-destructive/40'
                                  : 'bg-warning/20 text-warning border-warning/40'
                              }`}
                            >
                              {point.dropOffRate.toFixed(1)}% drop-off
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div>
                              <span className="text-muted-foreground">Viewers stopped: </span>
                              <span className="font-semibold">{point.dropOffCount}</span>
                            </div>
                          </div>
                          
                          {point.possibleReason && (
                            <p className="text-xs text-muted-foreground italic">
                              {point.possibleReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
