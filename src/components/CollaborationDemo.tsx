import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, PlayCircle, StopCircle, Sparkle } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { UserPresence } from '@/lib/types'
import { toast } from 'sonner'

const DEMO_USERS = [
  { name: 'Alex Rivera', color: 'oklch(0.70 0.15 195)', view: 'Dashboard' },
  { name: 'Sam Chen', color: 'oklch(0.60 0.18 290)', view: 'AI Insights' },
  { name: 'Jordan Lee', color: 'oklch(0.65 0.15 145)', view: 'Predictions' },
  { name: 'Morgan Taylor', color: 'oklch(0.70 0.15 70)', view: 'Tableau' }
]

export function CollaborationDemo() {
  const [isActive, setIsActive] = useState(false)
  const [allPresence, setAllPresence] = useKV<Record<string, UserPresence>>('user-presence', {})

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setAllPresence(current => {
        const updated = { ...(current || {}) }
        
        DEMO_USERS.forEach((user, index) => {
          const userId = `demo-${index}`
          const x = 100 + Math.random() * (window.innerWidth - 200)
          const y = 100 + Math.random() * (window.innerHeight - 200)
          
          updated[userId] = {
            userId,
            userName: user.name,
            userColor: user.color,
            currentView: user.view,
            isActive: true,
            lastSeen: Date.now(),
            cursor: {
              userId,
              userName: user.name,
              userColor: user.color,
              x,
              y,
              timestamp: Date.now()
            }
          }
        })
        
        return updated
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [isActive, setAllPresence])

  const handleToggle = () => {
    if (isActive) {
      setAllPresence(current => {
        const updated = { ...(current || {}) }
        DEMO_USERS.forEach((_, index) => {
          delete updated[`demo-${index}`]
        })
        return updated
      })
      toast.success('Demo mode disabled')
    } else {
      toast.success('Demo mode enabled', {
        description: 'Watch as simulated users collaborate in real-time'
      })
    }
    setIsActive(!isActive)
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Sparkle size={20} weight="fill" className="text-accent" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">Collaboration Demo</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Simulate multiple users to see live cursor tracking in action
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleToggle}
              className="gap-2"
              variant={isActive ? 'outline' : 'default'}
            >
              {isActive ? (
                <>
                  <StopCircle size={16} weight="fill" />
                  Stop Demo
                </>
              ) : (
                <>
                  <PlayCircle size={16} weight="fill" />
                  Start Demo
                </>
              )}
            </Button>
            {isActive && (
              <Badge className="bg-success/20 text-success border-success/30 gap-1.5">
                <Users size={12} weight="fill" />
                {DEMO_USERS.length} Active
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
