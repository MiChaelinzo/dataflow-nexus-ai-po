import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react'
import { Metric } from '@/lib/types'
import { formatNumber, formatChange, getChangeColor } from '@/lib/data'
import { motion } from 'framer-motion'
import { MiniSparkline } from './MiniSparkline'

interface MetricCardProps {
  metric: Metric
  onClick?: () => void
}

export function MetricCard({ metric, onClick }: MetricCardProps) {
  const isInverse = metric.id === 'churn'
  const changeColor = getChangeColor(metric.change, isInverse)
  
  const TrendIcon = metric.trend === 'up' ? TrendUp : metric.trend === 'down' ? TrendDown : Minus
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
    >
      <Card className="p-6 hover:border-accent/50 transition-all cursor-pointer relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                {metric.label}
              </p>
              <motion.div
                key={metric.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-baseline gap-2 mt-2"
              >
                <span className="text-3xl font-bold font-mono tabular-nums">
                  {metric.unit === '$' && metric.unit}
                  {metric.unit === '$' ? formatNumber(metric.value, '').replace('$', '') : 
                   metric.unit === '%' ? metric.value.toFixed(2) : 
                   formatNumber(metric.value, '')}
                </span>
                <span className="text-lg text-muted-foreground">
                  {metric.unit !== '$' && metric.unit}
                </span>
              </motion.div>
            </div>
            
            <Badge 
              variant="outline" 
              className={`${changeColor} border-current/20 gap-1`}
            >
              <TrendIcon size={14} weight="bold" />
              {formatChange(metric.change)}
            </Badge>
          </div>
          
          <div className="mt-4">
            <MiniSparkline data={metric.sparklineData} trend={metric.trend} />
          </div>
          
          <p className="text-xs text-muted-foreground mt-3">
            {metric.changeLabel}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
