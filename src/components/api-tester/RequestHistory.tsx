import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ApiRequest } from '@/App'
import { ClockCounterClockwise, Trash } from '@phosphor-icons/react'

interface RequestHistoryProps {
  history: ApiRequest[]
  onLoadRequest: (request: ApiRequest) => void
  onClearHistory: () => void
}

export function RequestHistory({ history, onLoadRequest, onClearHistory }: RequestHistoryProps) {
  const getMethodClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'method-get'
      case 'POST': return 'method-post'
      case 'PUT': return 'method-put'
      case 'DELETE': return 'method-delete'
      case 'PATCH': return 'method-patch'
      default: return ''
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClockCounterClockwise size={18} weight="duotone" />
          <h3 className="font-semibold text-sm">History</h3>
        </div>
        {history.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearHistory}
            className="h-7 w-7 p-0"
          >
            <Trash size={14} />
          </Button>
        )}
      </div>

      <ScrollArea className="h-[300px]">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No requests yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((request) => (
              <button
                key={request.id}
                onClick={() => onLoadRequest(request)}
                className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-2 mb-2">
                  <Badge className={`endpoint-badge ${getMethodClass(request.method)} text-[10px] px-1.5`}>
                    {request.method}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(request.timestamp)}
                  </span>
                </div>
                <p className="text-xs font-mono truncate text-foreground">
                  {request.url}
                </p>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}
