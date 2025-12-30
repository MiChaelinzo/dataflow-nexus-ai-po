import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkle, TrendUp, Warning, ChartLine, Lightning, BookmarkSimple } from '@phosphor-icons/react'
import { Insight } from '@/lib/types'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'

interface InsightCardProps {
  insight: Insight
  onSave?: (id: string) => void
}

export function InsightCard({ insight, onSave }: InsightCardProps) {
  const getIcon = () => {
    switch (insight.type) {
      case 'opportunity':
        return <Sparkle size={20} weight="fill" className="text-accent" />
      case 'warning':
        return <Warning size={20} weight="fill" className="text-warning" />
      case 'trend':
        return <TrendUp size={20} weight="fill" className="text-success" />
      case 'anomaly':
        return <Lightning size={20} weight="fill" className="text-metric-purple" />
      default:
        return <ChartLine size={20} weight="fill" className="text-accent" />
    }
  }
  
  const getTypeLabel = () => {
    switch (insight.type) {
      case 'opportunity':
        return 'Opportunity'
      case 'warning':
        return 'Warning'
      case 'trend':
        return 'Trend'
      case 'anomaly':
        return 'Anomaly'
      default:
        return 'Insight'
    }
  }
  
  const getTypeColor = () => {
    switch (insight.type) {
      case 'opportunity':
        return 'border-accent/30 bg-accent/10 text-accent'
      case 'warning':
        return 'border-warning/30 bg-warning/10 text-warning'
      case 'trend':
        return 'border-success/30 bg-success/10 text-success'
      case 'anomaly':
        return 'border-metric-purple/30 bg-metric-purple/10 text-metric-purple'
      default:
        return 'border-accent/30 bg-accent/10 text-accent'
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, type: 'spring' }}
    >
      <Card className="p-5 hover:border-accent/50 transition-all relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-metric-purple to-accent opacity-50" />
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={getTypeColor()}>
                  {getTypeLabel()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {insight.confidence}% confidence
                </Badge>
              </div>
              
              <Button
                size="icon"
                variant="ghost"
                className="flex-shrink-0 h-8 w-8"
                onClick={() => onSave?.(insight.id)}
              >
                <BookmarkSimple 
                  size={18} 
                  weight={insight.saved ? 'fill' : 'regular'}
                  className={insight.saved ? 'text-accent' : ''}
                />
              </Button>
            </div>
            
            <h4 className="font-semibold text-base mb-2 leading-snug">
              {insight.title}
            </h4>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insight.description}
            </p>
            
            {insight.metric && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Related to: <span className="text-foreground font-medium">{insight.metric}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
