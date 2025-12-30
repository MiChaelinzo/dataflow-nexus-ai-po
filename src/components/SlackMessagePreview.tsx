import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  SlackLogo,
  ThumbsUp,
  ChatCircle,
  BookmarkSimple,
  ArrowRight,
  TrendUp,
  Lightning
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface SlackMessagePreviewProps {
  title: string
  description: string
  metric: string
  metricValue: string
  change?: number
  type: string
  priority: string
  confidence: number
  suggestedAction?: string
}

export function SlackMessagePreview({
  title,
  description,
  metric,
  metricValue,
  change,
  type,
  priority,
  confidence,
  suggestedAction
}: SlackMessagePreviewProps) {
  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'opportunity': return '⚡'
      case 'alert': return '🚨'
      case 'trend': return '📈'
      case 'anomaly': return '🔔'
      case 'achievement': return '✨'
      default: return '💡'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#E8965A'
      case 'medium': return '#9B7EDE'
      case 'low': return '#6B7280'
      default: return '#6B7280'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <Card className="p-0 overflow-hidden border-l-4" style={{ borderLeftColor: getPriorityColor(priority) }}>
        <div className="p-4 bg-[#1E1E1E] text-white">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded bg-[#4A154B] flex items-center justify-center flex-shrink-0">
              <SlackLogo size={20} weight="fill" className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">Tableau Pulse</span>
                <Badge className="text-xs bg-white/10 text-white border-white/20">APP</Badge>
                <span className="text-xs text-gray-400">just now</span>
              </div>
              
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl flex-shrink-0">{getTypeEmoji(type)}</span>
                  <div>
                    <h3 className="font-bold text-base mb-1">{title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-300 mb-2">
                      <span className="font-mono font-semibold">{metric}: {metricValue}</span>
                      {change !== undefined && (
                        <>
                          <span>•</span>
                          <span className={change > 0 ? 'text-green-400' : 'text-red-400'}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}%
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-gray-400">{confidence}% confident</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
                  </div>
                </div>

                {suggestedAction && (
                  <div className="ml-9 p-3 rounded-lg bg-[#2A2A2A] border border-gray-700">
                    <div className="flex items-start gap-2">
                      <Lightning size={16} weight="fill" className="text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-300 mb-1">Suggested Action</p>
                        <p className="text-sm text-gray-400">{suggestedAction}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="ml-9 flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-7 px-3 text-xs bg-[#007A5A] hover:bg-[#006644] text-white border-0"
                  >
                    View in Dashboard →
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs bg-transparent hover:bg-white/10 text-white border-gray-600"
                  >
                    Share
                  </Button>
                </div>
              </div>

              <Separator className="my-3 bg-gray-700" />

              <div className="flex items-center gap-4 text-sm">
                <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                  <ThumbsUp size={16} weight="bold" />
                  <span className="text-xs">3</span>
                </button>
                <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                  <ChatCircle size={16} weight="bold" />
                  <span className="text-xs">1 reply</span>
                </button>
                <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                  <BookmarkSimple size={16} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-3 px-2">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="inline-flex w-2 h-2 rounded-full bg-green-500" />
          Preview of how this insight will appear in Slack
        </p>
      </div>
    </motion.div>
  )
}
