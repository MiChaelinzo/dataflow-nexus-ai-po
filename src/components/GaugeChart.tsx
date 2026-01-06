import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useMemo } from 'react'

interface GaugeChartProps {
  value: number
  max: number
  title: string
  subtitle?: string
  thresholds?: {
    low: number
    medium: number
    high: number
  }
}

export function GaugeChart({ value, max, title, subtitle, thresholds = { low: 33, medium: 66, high: 100 } }: GaugeChartProps) {
  const percentage = (value / max) * 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100)
  
  const color = useMemo(() => {
    if (clampedPercentage < thresholds.low) return 'oklch(0.55 0.22 25)'
    if (clampedPercentage < thresholds.medium) return 'oklch(0.70 0.15 70)'
    return 'oklch(0.65 0.15 145)'
  }, [clampedPercentage, thresholds])
  
  const rotation = (clampedPercentage / 100) * 180 - 90
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>}
      
      <div className="relative w-full aspect-[2/1] flex items-end justify-center">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.55 0.22 25)" />
              <stop offset="50%" stopColor="oklch(0.70 0.15 70)" />
              <stop offset="100%" stopColor="oklch(0.65 0.15 145)" />
            </linearGradient>
          </defs>
          
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="oklch(0.30 0.02 240)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          <motion.path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 251.2 - (251.2 * clampedPercentage) / 100 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ transformOrigin: '100px 90px' }}
          >
            <line
              x1="100"
              y1="90"
              x2="100"
              y2="25"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="90" r="6" fill={color} />
          </motion.g>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
          <motion.p
            className="text-4xl font-bold font-mono"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ color }}
          >
            {value.toLocaleString()}
          </motion.p>
          <p className="text-sm text-muted-foreground mt-1">
            of {max.toLocaleString()}
          </p>
          <motion.p
            className="text-xs text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {clampedPercentage.toFixed(1)}%
          </motion.p>
        </div>
      </div>
    </Card>
  )
}
