import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badg
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
                      cla
                      {conversion
                  )}
              </div>
              <div className="relative h-14 flex items-center">
                  ini
                  transition={{ delay: index * 0.1 + 0.2, dur
                  style={{ 
                    
                >
                </mo
              
                <div className="flex justify-center my-1">
                </div>
            </motion.div>
        })}
      
        <div className="grid grid-cols-2 gap-4 text-sm">
            <p className="t
              {((data[data.length - 1].value / data[0].value) * 100).toFixed(2)}%
          </div>
            <p class
              {(d
          </div>
      </div>
  )






























