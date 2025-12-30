import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { At, ArrowDown, ArrowUp, Keyboard, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function MentionTestingCard() {
  return (
    <Card className="p-6 border-accent/30 bg-gradient-to-br from-accent/5 via-card to-background">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <At size={20} weight="fill" className="text-accent" />
            Test @Mentions Feature
          </h3>
          <Badge className="bg-accent/20 text-accent border-accent/30">
            Quick Guide
          </Badge>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-accent">Testing Steps:</h4>
          
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Create or play a recording</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Start a new session or click "Play" on an existing recording
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Add an annotation</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click "Add Annotation" and create a discussion point
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Open annotation thread</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click the annotation in the "Notes" tab to view the thread
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent">
                4
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Type @ to mention someone</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  In the reply box, type @ followed by a username
                </p>
                <div className="mt-2 bg-card border border-border/50 rounded p-2 text-xs font-mono">
                  <span className="text-muted-foreground">Can you review this</span> <span className="text-accent font-medium bg-accent/10 px-1 rounded">@User123</span><span className="text-muted-foreground">?</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 text-xs">
                <CheckCircle size={14} weight="fill" className="text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Send and verify</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click "Reply" and check notification toast + bell icon
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="bg-card/50 border border-border/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3">Keyboard Shortcuts</h4>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Show mentions</span>
              <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">
                @
              </kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Navigate suggestions</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-muted rounded text-foreground">
                  <ArrowUp size={12} weight="bold" />
                </kbd>
                <kbd className="px-2 py-1 bg-muted rounded text-foreground">
                  <ArrowDown size={12} weight="bold" />
                </kbd>
              </div>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Select mention</span>
              <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">
                Enter
              </kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Send reply</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-muted rounded text-foreground text-xs">
                  Cmd/Ctrl
                </kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">
                  Enter
                </kbd>
              </div>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Close suggestions</span>
              <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono">
                Esc
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-accent/10 rounded-lg p-3 border border-accent/20">
          <At size={16} className="text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> You can mention multiple users in one reply. 
            Each mentioned user will receive a separate notification with context.
          </p>
        </div>
      </div>
    </Card>
  )
}
