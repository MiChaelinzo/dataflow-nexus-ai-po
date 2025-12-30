import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Database, Clock, CheckCircle, Warning, X, Eye, Download } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { DataSource, AuditLog, DataQualityMetric } from '@/lib/types'
import { useKV } from '@github/spark/hooks'

const mockDataSources: DataSource[] = [
  { id: 'ds1', name: 'Sales Database', type: 'database', status: 'connected', lastSync: Date.now() - 300000, recordCount: 2847650, owner: 'admin@company.com' },
  { id: 'ds2', name: 'Customer API', type: 'api', status: 'connected', lastSync: Date.now() - 120000, recordCount: 12847, owner: 'api@company.com' },
  { id: 'ds3', name: 'Marketing Stream', type: 'stream', status: 'syncing', recordCount: 458920, owner: 'marketing@company.com' },
  { id: 'ds4', name: 'Finance Reports', type: 'file', status: 'connected', lastSync: Date.now() - 600000, recordCount: 3421, owner: 'finance@company.com' }
]

const mockAuditLogs: AuditLog[] = [
  { id: 'a1', timestamp: Date.now() - 180000, user: 'john.doe@company.com', action: 'export', resource: 'Revenue Dashboard', details: 'Exported to PDF' },
  { id: 'a2', timestamp: Date.now() - 360000, user: 'jane.smith@company.com', action: 'share', resource: 'Customer Insights', details: 'Shared with Marketing Team' },
  { id: 'a3', timestamp: Date.now() - 540000, user: 'admin@company.com', action: 'edit', resource: 'Data Source Config', details: 'Updated sync frequency' },
  { id: 'a4', timestamp: Date.now() - 720000, user: 'mike.jones@company.com', action: 'view', resource: 'Sales Analytics', details: 'Accessed dashboard' }
]

const mockQualityMetrics: DataQualityMetric[] = [
  { id: 'q1', name: 'Completeness', score: 98.5, status: 'excellent', lastChecked: Date.now() - 60000 },
  { id: 'q2', name: 'Accuracy', score: 96.2, status: 'excellent', lastChecked: Date.now() - 60000 },
  { id: 'q3', name: 'Consistency', score: 87.3, status: 'good', lastChecked: Date.now() - 60000 },
  { id: 'q4', name: 'Timeliness', score: 72.8, status: 'warning', issues: ['2 stale data sources', 'Sync delay detected'], lastChecked: Date.now() - 60000 }
]

export function DataGovernance() {
  const [selectedSource, setSelectedSource] = useKV<string | null>('selected-data-source', null)

  const getStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'connected': return 'text-success'
      case 'syncing': return 'text-accent'
      case 'disconnected': return 'text-destructive'
    }
  }

  const getQualityColor = (status: DataQualityMetric['status']) => {
    switch (status) {
      case 'excellent': return 'text-success'
      case 'good': return 'text-accent'
      case 'warning': return 'text-warning'
      case 'critical': return 'text-destructive'
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
              <Shield size={24} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Data Governance</h2>
              <p className="text-sm text-muted-foreground">Security, compliance, and data quality monitoring</p>
            </div>
          </div>
        </div>
        <Badge className="bg-success/20 text-success border-success/30">
          <CheckCircle size={14} weight="fill" className="mr-1" />
          All Systems Operational
        </Badge>
      </motion.div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="sources" className="gap-2">
            <Database size={16} weight="duotone" />
            Data Sources
          </TabsTrigger>
          <TabsTrigger value="quality" className="gap-2">
            <CheckCircle size={16} weight="duotone" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Clock size={16} weight="duotone" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield size={16} weight="duotone" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockDataSources.map((source, index) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`p-6 cursor-pointer transition-all hover:border-accent/50 ${
                    selectedSource === source.id ? 'border-accent bg-accent/5' : ''
                  }`}
                  onClick={() => setSelectedSource(source.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Database size={20} weight="duotone" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{source.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{source.type}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(source.status)} border-current/20 capitalize`}>
                      {source.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {source.recordCount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Records:</span>
                        <span className="font-mono">{source.recordCount.toLocaleString()}</span>
                      </div>
                    )}
                    {source.lastSync && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Sync:</span>
                        <span className="font-mono">{formatTimeAgo(source.lastSync)}</span>
                      </div>
                    )}
                    {source.owner && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Owner:</span>
                        <span className="text-xs">{source.owner}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-card to-secondary/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Data Quality Score</h3>
                <p className="text-sm text-muted-foreground">Overall health of your data pipeline</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold font-mono text-accent">
                  {((mockQualityMetrics.reduce((sum, m) => sum + m.score, 0) / mockQualityMetrics.length)).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Average Score</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockQualityMetrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{metric.name}</h4>
                      <p className="text-xs text-muted-foreground">Last checked {formatTimeAgo(metric.lastChecked)}</p>
                    </div>
                    <Badge variant="outline" className={`${getQualityColor(metric.status)} border-current/20 capitalize`}>
                      {metric.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Score</span>
                        <span className="font-mono font-semibold">{metric.score}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.score}%` }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                          className={`h-full ${
                            metric.status === 'excellent' ? 'bg-success' :
                            metric.status === 'good' ? 'bg-accent' :
                            metric.status === 'warning' ? 'bg-warning' : 'bg-destructive'
                          }`}
                        />
                      </div>
                    </div>
                    
                    {metric.issues && metric.issues.length > 0 && (
                      <div className="space-y-1">
                        {metric.issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-warning">
                            <Warning size={14} weight="fill" className="mt-0.5 flex-shrink-0" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <Button variant="outline" size="sm" className="gap-2">
                <Download size={16} />
                Export Log
              </Button>
            </div>
            
            <div className="space-y-3">
              {mockAuditLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    log.action === 'export' ? 'bg-accent/20 text-accent' :
                    log.action === 'share' ? 'bg-metric-purple/20 text-metric-purple' :
                    log.action === 'edit' ? 'bg-warning/20 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {log.action === 'view' && <Eye size={16} weight="duotone" />}
                    {log.action === 'export' && <Download size={16} weight="duotone" />}
                    {log.action === 'share' && <Database size={16} weight="duotone" />}
                    {log.action === 'edit' && <Shield size={16} weight="duotone" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{log.user}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="capitalize">{log.action}</span> {log.resource}
                        </p>
                        {log.details && <p className="text-xs text-muted-foreground mt-1">{log.details}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(log.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle size={20} weight="duotone" className="text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Encrypted</p>
                  <p className="text-2xl font-bold font-mono">100%</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">All data encrypted at rest and in transit</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Shield size={20} weight="duotone" className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Policies</p>
                  <p className="text-2xl font-bold font-mono">12</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Data access and governance policies</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-metric-purple/20 flex items-center justify-center">
                  <Eye size={20} weight="duotone" className="text-metric-purple" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Audit Events</p>
                  <p className="text-2xl font-bold font-mono">1,847</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Events logged in the last 30 days</p>
            </Card>
          </div>

          <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Shield size={24} weight="fill" className="text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Security Compliance</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your platform is compliant with SOC 2, GDPR, and HIPAA standards. All security controls are actively monitored and regularly audited.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-accent/30">SOC 2 Type II</Badge>
                  <Badge variant="outline" className="border-accent/30">GDPR Compliant</Badge>
                  <Badge variant="outline" className="border-accent/30">HIPAA Ready</Badge>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
