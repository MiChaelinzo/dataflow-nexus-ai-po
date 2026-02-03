import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, TrendUp, TrendDown } from '@phosphor-icons/react'
import { DrillDownDialog, DrillDownData } from './DrillDownDialog'

interface BarData {
  label: string
  value: number
  color?: string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
}

interface InteractiveBarChartProps {
  data: BarData[]
  title: string
  subtitle?: string
  onBarClick?: (item: BarData, index: number) => DrillDownData | null
}

export function InteractiveBarChart({ data, title, subtitle, onBarClick }: InteractiveBarChartProps) {
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const maxValue = Math.max(...data.map(d => d.value))
  const total = data.reduce((sum, d) => sum + d.value, 0)
  
  const handleBarClick = (item: BarData, index: number) => {
    if (onBarClick) {
      const drillDown = onBarClick(item, index)
      if (drillDown) {
        setDrillDownData(drillDown)
      }
    }
  }

  return (
    <>
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const widthPercent = (item.value / maxValue) * 100
            const isHovered = hoveredIndex === index
            const isClickable = !!onBarClick

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.trend && (
                      <div className={`flex items-center gap-1 text-xs ${
                        item.trend === 'up' ? 'text-success' : 
                        item.trend === 'down' ? 'text-destructive' : 
                        'text-muted-foreground'
                      }`}>
                        {item.trend === 'up' ? (
                          <TrendUp size={12} weight="bold" />
                        ) : item.trend === 'down' ? (
                          <TrendDown size={12} weight="bold" />
                        ) : null}
                        {item.change !== undefined && (
                          <span>{Math.abs(item.change)}%</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-muted-foreground text-sm">
                      ${(item.value / 1000).toFixed(1)}K
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                
                <div 
                  className="relative h-10 bg-secondary rounded-md overflow-hidden group"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleBarClick(item, index)}
                  style={{ cursor: isClickable ? 'pointer' : 'default' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ delay: index * 0.05 + 0.2, duration: 0.6, ease: 'easeOut' }}
                    className={`h-full transition-all duration-300 ${
                      isHovered ? 'brightness-110' : ''
                    }`}
                    style={{ 
                      background: item.color || 'linear-gradient(90deg, oklch(0.70 0.15 195), oklch(0.60 0.18 290))'
                    }}
                  />
                  
                  {isClickable && (
                    <div className={`absolute inset-0 flex items-center justify-end px-3 transition-opacity ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="flex items-center gap-1 text-white text-xs font-medium bg-black/30 px-2 py-1 rounded">
                        <span>View Details</span>
                        <ArrowRight size={12} weight="bold" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Value</span>
          <span className="font-mono font-bold text-lg">
            ${(total / 1000).toFixed(1)}K
          </span>
        </div>
      </Card>

      <DrillDownDialog
        open={!!drillDownData}
        onOpenChange={(open) => !open && setDrillDownData(null)}
        data={drillDownData}
      />
    </>
  )
}
