import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useMemo } from 'react'

interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutSegment[]
  title: string
  centerLabel?: string
  centerValue?: string
}

export function DonutChart({ data, title, centerLabel, centerValue }: DonutChartProps) {
  const { segments, total } = useMemo(() => {
    const totalValue = data.reduce((sum, d) => sum + d.value, 0)
    let cumulativePercent = 0
    
    const calculatedSegments = data.map(segment => {
      const percent = (segment.value / totalValue) * 100
      const startAngle = (cumulativePercent / 100) * 360
      const endAngle = ((cumulativePercent + percent) / 100) * 360
      
      cumulativePercent += percent
      
      return {
        ...segment,
        percent,
        startAngle,
        endAngle
      }
    })
    
    return { segments: calculatedSegments, total: totalValue }
  }, [data])
  
  const createArc = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const start = polarToCartesian(100, 100, outerRadius, endAngle)
    const end = polarToCartesian(100, 100, outerRadius, startAngle)
    const startInner = polarToCartesian(100, 100, innerRadius, endAngle)
    const endInner = polarToCartesian(100, 100, innerRadius, startAngle)
    
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
    
    return [
      `M ${start.x} ${start.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${startInner.x} ${startInner.y}`,
      'Z'
    ].join(' ')
  }
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    }
  }
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {segments.map((segment, index) => (
              <motion.path
                key={segment.label}
                d={createArc(segment.startAngle, segment.endAngle, 55, 90)}
                fill={segment.color}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                style={{ transformOrigin: '100px 100px' }}
              />
            ))}
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              className="text-3xl font-bold font-mono"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {centerValue || total.toLocaleString()}
            </motion.p>
            {centerLabel && (
              <p className="text-xs text-muted-foreground mt-1">{centerLabel}</p>
            )}
          </div>
        </div>
        
        <div className="flex-1 space-y-3 w-full">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm font-medium">{segment.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-muted-foreground">
                  {segment.value.toLocaleString()}
                </span>
                <span className="text-sm font-semibold font-mono w-14 text-right">
                  {segment.percent.toFixed(1)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
}
