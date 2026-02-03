import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, Sparkle, ArrowRight, Clock } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface QueryResult {
  id: string
  query: string
  answer: string
  timestamp: number
  chartType?: 'line' | 'bar' | 'pie'
  dataPoints?: Array<{ label: string; value: number }>
}

const suggestedQueries = [
  "What were our top performing products last month?",
  "Show me revenue trends for Q4",
  "Which regions have the highest growth?",
  "How do sales compare year over year?",
  "What's the customer retention rate?",
  "Show conversion funnel breakdown"
]

export function NaturalLanguageQuery() {
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useKV<QueryResult[]>('query-history', [])
  const [currentResult, setCurrentResult] = useState<QueryResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleSlash = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          inputRef.current?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleSlash)
    return () => document.removeEventListener('keydown', handleSlash)
  }, [])

  const processQuery = async (queryText: string) => {
    setIsProcessing(true)
    setCurrentResult(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const mockResult: QueryResult = {
        id: `query-${Date.now()}`,
        query: queryText,
        answer: `Based on the analysis, here's what I found: Revenue increased by 23% compared to last quarter, with the highest growth in the enterprise segment (+35%). Key drivers include successful product launches and improved customer retention rates (92%). Notable trends show weekend sales outperforming weekdays by 18%.`,
        timestamp: Date.now(),
        chartType: 'bar',
        dataPoints: [
          { label: 'Enterprise', value: 35 },
          { label: 'Mid-Market', value: 22 },
          { label: 'SMB', value: 15 },
          { label: 'Startup', value: 12 },
        ]
      }

      setCurrentResult(mockResult)
      setHistory((current) => [mockResult, ...(current || [])].slice(0, 20))
      toast.success('Query processed successfully')
    } catch (error) {
      toast.error('Failed to process query')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      processQuery(query)
      setQuery('')
    }
  }

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery)
    processQuery(suggestedQuery)
    setQuery('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Natural Language Query</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ask questions about your data in plain English
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-accent/5 via-background to-background border-accent/20">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <MagnifyingGlass 
              size={20} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your data... (press / to focus)"
              className="pl-12 pr-12 h-14 text-base bg-background"
              disabled={isProcessing}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!query.trim() || isProcessing}
              className="absolute right-2 top-1/2 -translate-y-1/2 gap-2"
            >
              {isProcessing ? (
                <>
                  <Sparkle size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRight size={16} />
                  Ask
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((sq, idx) => (
              <Button
                key={idx}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedQuery(sq)}
                disabled={isProcessing}
                className="text-xs"
              >
                {sq}
              </Button>
            ))}
          </div>
        </form>
      </Card>

      <AnimatePresence mode="wait">
        {currentResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 border-accent/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Sparkle size={20} weight="fill" className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">Answer</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(currentResult.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 text-accent">{currentResult.query}</h3>
                  <p className="text-sm leading-relaxed mb-4">{currentResult.answer}</p>
                  
                  {currentResult.dataPoints && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
                      {currentResult.dataPoints.map((point, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-2xl font-bold text-accent mb-1">
                            {point.value}%
                          </div>
                          <div className="text-xs text-muted-foreground">{point.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {(history && history.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold">Recent Queries</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {history.slice(0, 5).map((item) => (
              <Card 
                key={item.id} 
                className="p-4 hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => setCurrentResult(item)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.query}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(!history || history.length === 0) && !currentResult && !isProcessing && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <MagnifyingGlass size={32} weight="duotone" className="text-accent" />
            </div>
            <h3 className="text-lg font-semibold">Ask Your First Question</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Use natural language to query your data. Try asking about trends, comparisons, or specific metrics.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
