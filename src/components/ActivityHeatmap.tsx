import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
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
import { format, subDays, startOfWeek, addWeeks, getDay } from 'date-fns'

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
    if (count === 0) return 'var(--muted)'
    
    const intensity = count / maxCount
    if (intensity < 0.25) return 'oklch(0.70 0.15 195 / 0.3)'
    if (intensity < 0.50) return 'oklch(0.70 0.15 195 / 0.5)'
    if (intensity < 0.75) return 'oklch(0.70 0.15 195 / 0.7)'
    return 'oklch(0.70 0.15 195)'
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* ... Header and metrics cards remain the same ... */}
      
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Activity Distribution</h3>
            {/* Legend */}
          </div>

          <div className="overflow-x-auto pb-4">
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
                      <div className="h-4 text-[10px] text-muted-foreground text-center mb-1 w-max">
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
                          className="w-4 h-4 rounded-sm cursor-pointer transition-all border border-transparent hover:border-accent"
                          style={{
                            backgroundColor: getIntensityColor(cell.count)
                          }}
                          // Use simpler event handlers to prevent thrashing
                          onMouseEnter={() => setHoveredCell(cell)}
                          // Remove onMouseLeave or use a safe delay if needed
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Fixed height container to prevent layout thrashing loop */}
          <div className="min-h-[200px] border-t border-border/50 pt-4 mt-4">
            {hoveredCell ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={hoveredCell.date.toISOString()}
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

                {hoveredCell.activities.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
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
                            {format(new Date(activity.timestamp), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                   <p className="text-sm text-muted-foreground italic">No activity recorded for this day.</p>
                )}
              </motion.div>
            ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                 Hover over a cell to view daily activity details
               </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}