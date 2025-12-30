import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { At, Bell, ChatCircle, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function MentionFeatureShowcase() {
  return (
    <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/20">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <At size={24} weight="fill" className="text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">@Mention Team Members</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Type @ in annotation replies to mention specific team members and send them instant notifications. 
              Perfect for directing questions or calling attention to important insights.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 border border-border/50 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <At size={16} className="text-accent" />
              </div>
              <span className="text-sm font-semibold">Type @</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Start typing @ followed by a name to see autocomplete suggestions
            </p>
            <div className="mt-2 bg-muted/30 rounded p-2 text-xs font-mono">
              "Hey <span className="text-accent font-medium bg-accent/10 px-1 rounded">@Alex</span>, check this"
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 border border-border/50 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <Bell size={16} className="text-success" />
              </div>
              <span className="text-sm font-semibold">Get Notified</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mentioned users receive instant notifications with context and navigation
            </p>
            <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/30">
              <Bell size={12} weight="fill" className="mr-1" />
              3 new mentions
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 border border-border/50 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-metric-purple/20 flex items-center justify-center">
                <ChatCircle size={16} className="text-metric-purple" />
              </div>
              <span className="text-sm font-semibold">Quick Response</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Click notifications to jump directly to the conversation and reply
            </p>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
              View Thread
              <CheckCircle size={12} />
            </Button>
          </motion.div>
        </div>

        <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkle size={16} className="text-accent" />
            How @Mentions Work
          </h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <span className="text-accent font-mono">1.</span>
              <span>Navigate to the <strong>Replay</strong> tab and open any session recording</span>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-mono">2.</span>
              <span>Click on an annotation to view its thread and add replies</span>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-mono">3.</span>
              <span>Type @ in the reply box to mention team members (use arrow keys to navigate suggestions)</span>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-mono">4.</span>
              <span>Mentioned users receive notifications in the bell icon at the top of the page</span>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-mono">5.</span>
              <span>Click a notification to jump directly to the annotation thread</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

const Sparkle = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 256 256"
    className={className}
    fill="currentColor"
  >
    <path d="M197.58,129.06,146,110l-19-51.62a15.92,15.92,0,0,0-29.88,0L78,110,26.42,129.06a16,16,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0L146,178l51.62-19a16,16,0,0,0,0-29.88ZM137.27,162.94a8,8,0,0,0-4.33,4.33L112,217.7,91.06,167.27a8,8,0,0,0-4.33-4.33L36.3,144l50.43-19.06a8,8,0,0,0,4.33-4.33L112,70.3l19.06,50.43a8,8,0,0,0,4.33,4.33L185.7,144ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z" />
  </svg>
)
