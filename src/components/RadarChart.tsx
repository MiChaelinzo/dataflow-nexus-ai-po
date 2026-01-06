import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useMemo } from 'react'

interface RadarDataPoint {
  label: string
  value: number
  maxValue?: number
}

interface RadarChartProps {
  data: RadarDataPoint[]
  title: string
  color?: string
}

export function RadarChart({ 
  data, 
  title,
  color = 'oklch(0.70 0.15 195)'
}: RadarChartProps) {
  const { pathData, points, gridLevels } = useMemo(() => {
    const centerX = 150
    const centerY = 150
    const radius = 100
    const angleStep = (2 * Math.PI) / data.length
    
    const calculatedPoints = data.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2
      const maxVal = d.maxValue || 100
      const normalizedValue = (d.value / maxVal) * radius
      const x = centerX + normalizedValue * Math.cos(angle)
      const y = centerY + normalizedValue * Math.sin(angle)
      const labelX = centerX + (radius + 30) * Math.cos(angle)
      const labelY = centerY + (radius + 30) * Math.sin(angle)
      
      return { x, y, labelX, labelY, label: d.label, value: d.value }
    })
    
    const path = calculatedPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ') + ' Z'
    
    const levels = [0.25, 0.5, 0.75, 1].map(level => {
      const levelPoints = data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2
        const x = centerX + radius * level * Math.cos(angle)
        const y = centerY + radius * level * Math.sin(angle)
        return { x, y }
      })
      return levelPoints
    })
    
    return { pathData: path, points: calculatedPoints, gridLevels: levels }
  }, [data])
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      
      <div className="relative w-full aspect-square max-w-md mx-auto">
        <svg viewBox="0 0 300 300" className="w-full h-full">
          <defs>
            <radialGradient id="radarGradient">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </radialGradient>
          </defs>
          
          {gridLevels.map((levelPoints, levelIndex) => (
            <path
              key={`level-${levelIndex}`}
              d={levelPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'}
              fill="none"
              stroke="oklch(0.30 0.02 240)"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          
          {data.map((_, i) => {
            const angle = (i * 2 * Math.PI) / data.length - Math.PI / 2
            const x = 150 + 100 * Math.cos(angle)
            const y = 150 + 100 * Math.sin(angle)
            
            return (
              <line
                key={`axis-${i}`}
                x1="150"
                y1="150"
                x2={x}
                y2={y}
                stroke="oklch(0.30 0.02 240)"
                strokeWidth="1"
                opacity="0.3"
              />
            )
          })}
          
          <motion.path
            d={pathData}
            fill="url(#radarGradient)"
            stroke={color}
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ transformOrigin: '150px 150px' }}
          />
          
          {points.map((p, i) => (
            <g key={i}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill={color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
              />
              
              <motion.text
                x={p.labelX}
                y={p.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-current"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                {p.label}
              </motion.text>
              
              <motion.text
                x={p.labelX}
                y={p.labelY + 12}
                textAnchor="middle"
                className="text-[10px] fill-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                {p.value}
              </motion.text>
            </g>
          ))}
        </svg>
      </div>
    </Card>
  )
}
