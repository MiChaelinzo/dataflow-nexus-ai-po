import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkle, ArrowClockwise, Warning, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

// Assumed internal imports - keeping these but ensuring types match logic
import { InsightCard } from './InsightCard'
import { ExportButton } from './ExportButton'
import { exportInsights, ExportFormat } from '@/lib/data-export'
import { llmRateLimiter } from '@/lib/rate-limiter'

// Importing the custom hook from the previous UserProfile component
import { useUserStats } from './UserProfile'

// ------------------------------------------------------------------
// Types & Interfaces
// ------------------------------------------------------------------

export interface Metric {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  unit?: string
}

export interface Insight {
  id: string
  title: string
  description: string
  confidence: number
  type: 'opportunity' | 'warning' | 'trend' | 'anomaly'
  metric: string
  timestamp: number
  saved: boolean
}

// Global declaration for the window.spark object
declare global {
  interface Window {
    spark: {
      llm: (prompt: string, model: string, json?: boolean) => Promise<string>
    }
  }
}

// Simple Mock for useKV if @github/spark/hooks isn't available locally
// In a real Spark environment, keep the original import.
function useKV<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue)
  return [value, setValue]
}

interface InsightGeneratorProps {
  metrics: Metric[]
}

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------

export function InsightGenerator({ metrics }: InsightGeneratorProps) {
  const [insights, setInsights] = useKV<Insight[]>('analytics-insights', [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Adjusted to use the hook from UserProfile
  const { addActivity, incrementStat } = useUserStats()
  const trackActivity = addActivity // Alias to match your existing logic

  const [remainingRequests, setRemainingRequests] = useState(
    llmRateLimiter ? llmRateLimiter.getRemainingRequests() : 5
  )
  
  const generateInsights = async () => {
    // Safety check for rate limiter
    if (llmRateLimiter && !llmRateLimiter.canMakeRequest()) {
      const waitTime = Math.ceil(llmRateLimiter.getTimeUntilNextRequest() / 1000)
      toast.error('Rate limit reached', {
        description: `Please wait ${waitTime} seconds before generating more insights.`
      })
      return
    }

    setIsGenerating(true)
    setProgress(10)
    
    try {
      if (llmRateLimiter) setRemainingRequests(llmRateLimiter.getRemainingRequests())
      
      const metricsData = metrics.map(m => ({
        label: m.label,
        value: m.value,
        change: m.change,
        trend: m.trend,
        unit: m.unit
      }))
      
      setProgress(30)
      
      const promptText = `You are an expert data analyst. Analyze these business metrics and generate 4 actionable insights.

Metrics:
${JSON.stringify(metricsData, null, 2)}

Generate exactly 4 insights as a JSON object with a single property "insights" containing an array. Each insight should have:
- title: Brief, compelling headline (under 60 chars)
- description: Detailed explanation with specific recommendations (2-3 sentences)
- confidence: Number between 75-95 representing confidence level
- type: one of "opportunity", "warning", "trend", or "anomaly"
- metric: The label of the related metric

Make insights specific, actionable, and data-driven. Focus on business impact.

Return format:
{
  "insights": [
    {
      "title": "...",
      "description": "...",
      "confidence": 85,
      "type": "opportunity",
      "metric": "Total Revenue"
    }
  ]
}`

      setProgress(60)
      
      // Execute LLM Request
      const makeRequest = async () => {
        return await window.spark.llm(promptText, 'gpt-4o-mini', true)
      }

      const response = llmRateLimiter 
        ? await llmRateLimiter.enqueueRequest(makeRequest) 
        : await makeRequest()
      
      setProgress(80)
      
      // Sanitize response: Remove Markdown code blocks if present
      let cleanResponse = response.trim()
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      }

      const parsed = JSON.parse(cleanResponse)
      
      const newInsights: Insight[] = parsed.insights.map((insight: any, index: number) => ({
        id: `insight-${Date.now()}-${index}`,
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence,
        type: insight.type,
        metric: insight.metric,
        timestamp: Date.now(),
        saved: false
      }))
      
      setInsights(newInsights)
      setProgress(100)
      
      incrementStat('insightsGenerated')
      trackActivity('Generated AI insights', 'insight', `Count: ${newInsights.length}`)
      
      toast.success('Insights generated successfully', {
        description: `Generated ${newInsights.length} actionable insights from your data`
      })
    } catch (error: any) {
      console.error('Failed to generate insights:', error)
      
      const errorMessage = error?.message || String(error)
      
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
        const waitTime = llmRateLimiter ? Math.ceil(llmRateLimiter.getTimeUntilNextRequest() / 1000) : 60
        toast.error('API rate limit reached', {
          description: `Too many requests. Please wait ${Math.max(waitTime, 30)} seconds before trying again.`
        })
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('Network error', {
          description: 'Please check your connection and try again'
        })
      } else {
        toast.error('Failed to generate insights', {
          description: 'An unexpected error occurred. Please try again later.'
        })
      }
    } finally {
      setTimeout(() => {
        setIsGenerating(false)
        setProgress(0)
        if (llmRateLimiter) setRemainingRequests(llmRateLimiter.getRemainingRequests())
      }, 500)
    }
  }
  
  const toggleSaveInsight = (id: string) => {
    setInsights((current) => {
      if (!current) return []
      return current.map(insight => 
        insight.id === id ? { ...insight, saved: !insight.saved } : insight
      )
    })
    incrementStat('bookmarksCount')
    trackActivity('Bookmarked an insight', 'bookmark', 'AI Insights')
  }

  const handleExportInsights = (format: ExportFormat, filename: string, includeHeaders: boolean) => {
    exportInsights(insights || [], format, { filename, includeHeaders })
    trackActivity(`Exported insights as ${format.toUpperCase()}`, 'report', 'insights')
  }
  
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-card to-secondary/30 border-accent/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkle size={24} weight="fill" className="text-purple-500" />
              <h2 className="text-xl font-bold">AI-Powered Insights</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Our AI analyzes your metrics to surface trends, opportunities, and actionable recommendations
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={generateInsights}
              disabled={isGenerating || remainingRequests === 0}
              size="lg"
              className="flex-shrink-0 gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkle size={18} weight="fill" />
                  Generate Insights
                  {remainingRequests < 5 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {remainingRequests}/5
                    </Badge>
                  )}
                </>
              )}
            </Button>
            
            {insights && insights.length > 0 && (
              <ExportButton
                onExport={handleExportInsights}
                defaultFilename="ai-insights"
                title="Export Insights"
                description="Export all generated AI insights with confidence scores"
                variant="outline"
                size="lg"
                label="Export"
              />
            )}
          </div>
        </div>
        
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Analyzing patterns and generating insights...
            </p>
          </motion.div>
        )}
      </Card>
      
      <AnimatePresence mode="popLayout">
        {insights && insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4"
          >
            {insights.map((insight) => (
              <InsightCard 
                key={insight.id} 
                insight={insight}
                onSave={toggleSaveInsight}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isGenerating && (!insights || insights.length === 0) && (
        <Card className="p-12 text-center border-dashed">
          <Sparkle size={48} weight="thin" className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No insights generated yet</p>
          <p className="text-sm text-muted-foreground">
            Click "Generate Insights" to analyze your metrics
          </p>
        </Card>
      )}
    </div>
  )
}