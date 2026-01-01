import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CalendarDots, 
  TrendUp, 
  Fire,
  ChartBar
} from '@phosphor-icons/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useKV } from '@github/spark/hooks'
import { WorkspaceActivity } from './WorkspaceActivityFeed'
import { format, subDays, startOfDay, endOfDay, isWithinInterval, getDay, startOfWeek, addWeeks } from 'date-fns'

interface HeatmapCell {
  date: Date
  count: number
  dayOfWeek: number
  weekIndex: number
  activities: WorkspaceActivity[]
}

interface ActivityHeatmapProps {
  timeRange?: number
}

export function ActivityHeatmap({ timeRange = 12 }: ActivityHeatmapProps) {
  const [activities] = useKV<WorkspaceActivity[]>('workspace-activities', [])
  const [selectedRange, setSelectedRange] = useState<string>('12')
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null)

  const weeks = parseInt(selectedRange)

  const heatmapData = useMemo(() => {
    const endDate = new Date()
    const startDate = subDays(endDate, weeks * 7)
    
    const cellMap = new Map<string, HeatmapCell>()
    
    const firstDay = startOfWeek(startDate, { weekStartsOn: 0 })
    for (let i = 0; i < weeks * 7; i++) {
      const date = addWeeks(firstDay, Math.floor(i / 7))
      const currentDate = new Date(date)
      currentDate.setDate(date.getDate() + (i % 7))
      
      const dateKey = format(currentDate, 'yyyy-MM-dd')
      const dayOfWeek = getDay(currentDate)
      const weekIndex = Math.floor(i / 7)
      
      cellMap.set(dateKey, {
        date: currentDate,
        count: 0,
        dayOfWeek,
        weekIndex,
        activities: []
      })
    }
    
    if (activities) {
      activities.forEach(activity => {
        const activityDate = new Date(activity.timestamp)
        const dateKey = format(activityDate, 'yyyy-MM-dd')
        
        if (cellMap.has(dateKey)) {
          const cell = cellMap.get(dateKey)!
          cell.count++
          cell.activities.push(activity)
        }
      })
    }
    
    return Array.from(cellMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [activities, weeks])

  const maxCount = useMemo(() => {
    return Math.max(...heatmapData.map(cell => cell.count), 1)
  }, [heatmapData])

  const totalActivities = useMemo(() => {
    return heatmapData.reduce((sum, cell) => sum + cell.count, 0)
  }, [heatmapData])

  const avgPerDay = useMemo(() => {
    const validDays = heatmapData.filter(cell => cell.count > 0).length
    return validDays > 0 ? (totalActivities / validDays).toFixed(1) : '0'
  }, [heatmapData, totalActivities])

  const mostActiveDay = useMemo(() => {
    const sorted = [...heatmapData].sort((a, b) => b.count - a.count)
    return sorted[0]
  }, [heatmapData])

  const streakInfo = useMemo(() => {
    let currentStreak = 0
    let maxStreak = 0
    let tempStreak = 0
    
    const sortedByDate = [...heatmapData].sort((a, b) => b.date.getTime() - a.date.getTime())
    
    for (const cell of sortedByDate) {
      if (cell.count > 0) {
        tempStreak++
        if (currentStreak === 0) currentStreak = tempStreak
      } else {
        if (tempStreak > maxStreak) maxStreak = tempStreak
        tempStreak = 0
        if (currentStreak > 0) currentStreak = 0
      }
    }
    
    return { currentStreak, maxStreak: Math.max(maxStreak, tempStreak) }
  }, [heatmapData])

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'oklch(0.30 0.02 240)'
    
    const intensity = count / maxCount
    if (intensity < 0.25) return 'oklch(0.45 0.10 250)'
    if (intensity < 0.50) return 'oklch(0.55 0.12 220)'
    if (intensity < 0.75) return 'oklch(0.65 0.14 200)'
    return 'oklch(0.70 0.15 195)'
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <CalendarDots size={28} weight="duotone" className="text-accent" />
            Activity Heatmap
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Workspace engagement patterns over time
          </p>
        </div>
        
        <Select value={selectedRange} onValueChange={setSelectedRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4">Last 4 weeks</SelectItem>
            <SelectItem value="8">Last 8 weeks</SelectItem>
            <SelectItem value="12">Last 12 weeks</SelectItem>
            <SelectItem value="26">Last 6 months</SelectItem>
            <SelectItem value="52">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Total Activities
              </p>
              <p className="text-2xl font-bold font-mono">{totalActivities}</p>
            </div>
            <ChartBar size={24} weight="duotone" className="text-accent" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Avg Per Active Day
              </p>
              <p className="text-2xl font-bold font-mono">{avgPerDay}</p>
            </div>
            <TrendUp size={24} weight="duotone" className="text-success" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Current Streak
              </p>
              <p className="text-2xl font-bold font-mono">{streakInfo.currentStreak} days</p>
            </div>
            <Fire size={24} weight="duotone" className="text-warning" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Best Streak
              </p>
              <p className="text-2xl font-bold font-mono">{streakInfo.maxStreak} days</p>
            </div>
            <Fire size={24} weight="fill" className="text-destructive" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Activity Distribution</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: level === 0 
                      ? 'oklch(0.30 0.02 240)'
                      : getIntensityColor((level / 4) * maxCount)
                  }}
                />
              ))}
              <span>More</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-flex gap-1">
              <div className="flex flex-col gap-1 mr-2 pt-6">
                {dayLabels.map((day, idx) => (
                  <div
                    key={day}
                    className="h-4 text-[10px] text-muted-foreground flex items-center justify-end pr-2"
                    style={{ lineHeight: '16px' }}
                  >
                    {idx % 2 === 1 ? day : ''}
                  </div>
                ))}
              </div>

              {Array.from({ length: weeks }).map((_, weekIdx) => {
                const weekCells = heatmapData.filter(cell => cell.weekIndex === weekIdx)
                const weekStart = weekCells[0]?.date
                
                return (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {weekIdx % 4 === 0 && weekStart && (
                      <div className="h-4 text-[10px] text-muted-foreground text-center mb-1">
                        {format(weekStart, 'MMM d')}
                      </div>
                    )}
                    {!weekStart && <div className="h-4 mb-1" />}
                    
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const cell = weekCells.find(c => c.dayOfWeek === dayIdx)
                      
                      if (!cell) {
                        return <div key={dayIdx} className="w-4 h-4" />
                      }

                      return (
                        <motion.div
                          key={`${weekIdx}-${dayIdx}`}
                          className="w-4 h-4 rounded-sm cursor-pointer transition-all"
                          style={{
                            backgroundColor: getIntensityColor(cell.count)
                          }}
                          whileHover={{ scale: 1.3, zIndex: 10 }}
                          onHoverStart={() => setHoveredCell(cell)}
                          onHoverEnd={() => setHoveredCell(null)}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (weekIdx * 7 + dayIdx) * 0.002 }}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {hoveredCell && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-border/50 pt-4 mt-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold">
                    {format(hoveredCell.date, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hoveredCell.count} {hoveredCell.count === 1 ? 'activity' : 'activities'}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {dayLabels[hoveredCell.dayOfWeek]}
                </Badge>
              </div>

              {hoveredCell.activities.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {hoveredCell.activities.slice(0, 10).map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30 text-xs"
                    >
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate">
                          {activity.action}
                        </p>
                        <p className="text-muted-foreground">
                          {activity.userName} • {format(new Date(activity.timestamp), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {hoveredCell.activities.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      +{hoveredCell.activities.length - 10} more activities
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Card>

      {mostActiveDay && mostActiveDay.count > 0 && (
        <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Fire size={24} weight="fill" className="text-accent" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                Most Active Day
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {format(mostActiveDay.date, 'EEEE, MMMM d, yyyy')} had the highest engagement with{' '}
                <span className="font-semibold text-accent">{mostActiveDay.count} activities</span>
              </p>
              <div className="flex gap-2">
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  Peak Performance
                </Badge>
                <Badge variant="outline">
                  {((mostActiveDay.count / maxCount) * 100).toFixed(0)}% of max
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
