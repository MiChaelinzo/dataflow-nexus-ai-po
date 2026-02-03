import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useMemo } from 'react'

interface DataPoint {
  label: string
  value: number
  date?: string
}

interface AreaChartProps {
  data: DataPoint[]
  title: string
  color?: string
  secondaryColor?: string
  showGrid?: boolean
}

export function AreaChart({ 
  data, 
  title, 
  color = 'oklch(0.70 0.15 195)',
  secondaryColor = 'oklch(0.60 0.18 290)',
  showGrid = true 
}: AreaChartProps) {
  const { maxValue, minValue, pathData, areaData } = useMemo(() => {
    if (data.length === 0) return { maxValue: 0, minValue: 0, pathData: '', areaData: '' }
    
    const values = data.map(d => d.value)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min
    
    const width = 600
    const height = 200
    const padding = 20
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth
      const y = padding + chartHeight - ((d.value - min) / range) * chartHeight
      return { x, y, value: d.value }
    })
    
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    
    const area = [
      `M ${padding} ${height - padding}`,
      ...points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`),
      `L ${padding + chartWidth} ${height - padding}`,
      'Z'
    ].join(' ')
    
    return { maxValue: max, minValue: min, pathData: path, areaData: area }
  }, [data])
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      
      <div className="relative w-full" style={{ height: '200px' }}>
        <svg viewBox="0 0 600 200" className="w-full h-full">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
          </defs>
          
          {showGrid && (
            <g opacity="0.1">
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={`grid-h-${i}`}
                  x1="20"
                  y1={20 + i * 40}
                  x2="580"
                  y2={20 + i * 40}
                  stroke="currentColor"
                  strokeWidth="1"
                />
              ))}
            </g>
          )}
          
          <motion.path
            d={areaData}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
          
          {data.map((d, i) => {
            const x = 20 + (i / (data.length - 1)) * 560
            const y = 20 + 160 - ((d.value - minValue) / (maxValue - minValue)) * 160
            
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.02, duration: 0.3 }}
              />
            )
          })}
        </svg>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </Card>
  )
}
