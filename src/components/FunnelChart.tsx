import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowDown } from '@phosphor-icons/react'

interface FunnelStage {
  label: string
  value: number
  color: string
}

interface FunnelChartProps {
  data: FunnelStage[]
  title: string
  onStageClick?: (stage: FunnelStage, index: number) => void
}

export function FunnelChart({ data, title, onStageClick }: FunnelChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      
      <div className="space-y-3">
        {data.map((stage, index) => {
          const widthPercent = (stage.value / maxValue) * 100
          const conversionRate = index > 0 ? ((stage.value / data[index - 1].value) * 100) : 100
          const dropOff = index > 0 ? 100 - conversionRate : 0
          
          return (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-sm font-medium flex-shrink-0 w-32">
                  {stage.label}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <span className="font-mono text-lg font-semibold">
                    {stage.value.toLocaleString()}
                  </span>
                  {index > 0 && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        conversionRate >= 70 ? 'text-success border-success/30 bg-success/10' : 
                        conversionRate >= 50 ? 'text-warning border-warning/30 bg-warning/10' : 
                        'text-destructive border-destructive/30 bg-destructive/10'
                      }`}
                    >
                      {conversionRate.toFixed(1)}% conversion
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="relative h-14 flex items-center">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                  className={`h-full rounded-md cursor-pointer transition-all hover:opacity-80 hover:scale-[1.02] ${
                    onStageClick ? 'cursor-pointer' : ''
                  }`}
                  style={{ 
                    backgroundColor: stage.color,
                    clipPath: `polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)`
                  }}
                  onClick={() => onStageClick?.(stage, index)}
                >
                  <div className="flex items-center justify-center h-full text-white font-semibold text-sm">
                    {widthPercent > 30 && stage.label}
                  </div>
                </motion.div>
              </div>
              
              {index < data.length - 1 && dropOff > 0 && (
                <div className="flex justify-center my-1">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <ArrowDown size={12} weight="bold" />
                    {dropOff.toFixed(1)}% drop-off
                  </Badge>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-border/50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Overall Conversion</p>
            <p className="text-2xl font-bold font-mono text-accent">
              {((data[data.length - 1].value / data[0].value) * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Total Drop-off</p>
            <p className="text-2xl font-bold font-mono text-destructive">
              {(data[0].value - data[data.length - 1].value).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
