import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShareNetwork, ChatCircle, Bell, Export, Users, PaperPlaneTilt, UserList, CalendarBlank, Cursor } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Comment, UserPresence } from '@/lib/types'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { TeamManagement } from '@/components/TeamManagement'
import { RoleBasedDigests } from '@/components/RoleBasedDigests'
import { CollaborationPanel } from '@/components/CollaborationPanel'

const mockComments: Comment[] = [
  {
    id: 'c1',
    dashboardId: 'main',
    author: 'Sarah Chen',
    content: 'Revenue numbers look great this quarter! The new marketing campaign is definitely paying off.',
    timestamp: Date.now() - 3600000,
    replies: [
      {
        id: 'c1-r1',
        dashboardId: 'main',
        author: 'Mike Johnson',
        content: 'Agreed! We should double down on the digital channels that are performing best.',
        timestamp: Date.now() - 1800000
      }
    ]
  },
  {
    id: 'c2',
    dashboardId: 'main',
    author: 'Alex Rivera',
    content: 'Has anyone looked into the dip in conversion rate last week? Might be worth investigating.',
    timestamp: Date.now() - 7200000
  },
  {
    id: 'c3',
    dashboardId: 'main',
    author: 'Emily Watson',
    content: 'The customer satisfaction metrics are trending upward. Great work team!',
    timestamp: Date.now() - 10800000
  }
]

const mockSharedUsers = [
  { id: '1', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'Editor' },
  { id: '2', name: 'Mike Johnson', email: 'mike.j@company.com', role: 'Viewer' },
  { id: '3', name: 'Alex Rivera', email: 'alex.r@company.com', role: 'Editor' },
  { id: '4', name: 'Emily Watson', email: 'emily.w@company.com', role: 'Viewer' }
]

export function CollaborationHub({ 
  activeUsers, 
  currentUser 
}: { 
  activeUsers: UserPresence[]
  currentUser: {
    userId: string
    userName: string
    userColor: string
  }
}) {
  const [comments, setComments] = useKV<Comment[]>('dashboard-comments', mockComments)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [shareEmail, setShareEmail] = useState('')

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `c-${Date.now()}`,
      dashboardId: 'main',
      author: 'You',
      content: newComment,
      timestamp: Date.now()
    }

    setComments((current) => [comment, ...(current || [])])
    setNewComment('')
    toast.success('Comment added')
  }

  const handleShare = () => {
    if (!shareEmail.trim()) return
    toast.success('Dashboard shared', {
      description: `Shared with ${shareEmail}`
    })
    setShareEmail('')
  }

  const handleExport = (format: string) => {
    toast.success(`Exporting as ${format}...`, {
      description: 'Your download will start shortly'
    })
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Users size={24} weight="duotone" className="text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Collaboration Hub</h2>
                <p className="text-sm text-muted-foreground">Share insights and work together in real-time</p>
              </div>
            </div>
          </div>
          <Badge className="bg-success/20 text-success border-success/30">
            {activeUsers.length + 1} Active Now
          </Badge>
        </div>
      </motion.div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="live" className="gap-2">
            <Cursor size={16} weight="duotone" />
            Live
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-2">
            <ChatCircle size={16} weight="duotone" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <UserList size={16} weight="duotone" />
            Team
          </TabsTrigger>
          <TabsTrigger value="digests" className="gap-2">
            <CalendarBlank size={16} weight="duotone" />
            Digests
          </TabsTrigger>
          <TabsTrigger value="share" className="gap-2">
            <ShareNetwork size={16} weight="duotone" />
            Share
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6">
          <CollaborationPanel activeUsers={activeUsers} currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Comments & Discussion</h3>
                
                <div className="space-y-4 mb-6">
                  <Textarea
                    placeholder="Add a comment or mention a team member with @..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setNewComment('')}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <PaperPlaneTilt size={16} weight="fill" />
                      Post Comment
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {(comments || []).map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-l-2 border-border pl-4 py-2"
                      >
                        <div className="flex gap-3">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-accent/20 text-accent text-xs">
                              {getInitials(comment.author)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mb-2">{comment.content}</p>
                            
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-3 space-y-3 pl-4 border-l border-border">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex gap-2">
                                    <Avatar className="w-6 h-6 flex-shrink-0">
                                      <AvatarFallback className="bg-secondary text-xs">
                                        {getInitials(reply.author)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-semibold text-xs">{reply.author}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {formatTimeAgo(reply.timestamp)}
                                        </span>
                                      </div>
                                      <p className="text-xs text-foreground">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {(!comments || comments.length === 0) && (
                    <div className="text-center py-8">
                      <ChatCircle size={48} weight="thin" className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No comments yet. Start the conversation!</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                
                <div className="space-y-3">
                  {mockSharedUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-accent/20 text-accent">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Bell size={20} weight="fill" className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Activity Notifications</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Get notified when team members comment, share insights, or mention you.
                    </p>
                    <Button size="sm" variant="outline" className="text-xs">
                      Configure Alerts
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  Quick Stats
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Views</span>
                    <span className="text-lg font-bold font-mono">1,847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Comments</span>
                    <span className="text-lg font-bold font-mono">{(comments || []).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Shares</span>
                    <span className="text-lg font-bold font-mono">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Exports</span>
                    <span className="text-lg font-bold font-mono">47</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="digests" className="mt-6">
          <RoleBasedDigests />
        </TabsContent>

        <TabsContent value="share" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Export & Share</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => handleExport('PDF')}
              >
                <Export size={16} />
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => handleExport('Excel')}
              >
                <Export size={16} />
                Export Excel
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => handleExport('Image')}
              >
                <Export size={16} />
                Export Image
              </Button>
            </div>

            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ShareNetwork size={20} weight="duotone" className="text-accent" />
                <p className="text-sm font-medium">Share Dashboard</p>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address..."
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                />
                <Button 
                  onClick={handleShare}
                  disabled={!shareEmail.trim()}
                  className="gap-2"
                >
                  <ShareNetwork size={16} />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
