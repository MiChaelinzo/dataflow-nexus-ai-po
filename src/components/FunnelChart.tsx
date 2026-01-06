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
}

export function FunnelChart({ data, title }: FunnelChartProps) {
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
                      className={`text-xs ${dropOff > 50 ? 'border-destructive text-destructive' : 'border-muted-foreground text-muted-foreground'}`}
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
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-lg relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${stage.color}, ${stage.color}dd)`,
                    boxShadow: `0 2px 8px ${stage.color}40`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10" />
                </motion.div>
              </div>
              
              {index < data.length - 1 && (
                <div className="flex justify-center my-1">
                  <ArrowDown size={16} weight="bold" className="text-muted-foreground/50" />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Overall Conversion</p>
            <p className="text-2xl font-bold font-mono mt-1">
              {((data[data.length - 1].value / data[0].value) * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Drop-off</p>
            <p className="text-2xl font-bold font-mono mt-1 text-destructive">
              {(data[0].value - data[data.length - 1].value).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
