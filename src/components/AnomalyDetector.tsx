import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Warning, TrendUp, TrendDown, Lightning, X, Check, BellRinging, Sliders } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface Metric {
  id: string
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
}

interface Anomaly {
  id: string
  metricId: string
  metricLabel: string
  type: 'spike' | 'drop' | 'unusual_pattern' | 'threshold_breach'
  severity: 'critical' | 'warning' | 'info'
  currentValue: number
  expectedValue: number
  deviation: number
  timestamp: number
  acknowledged: boolean
  explanation: string
  recommendation: string
}

interface AnomalyDetectorProps {
  metrics: Metric[]
}

interface AlertSettings {
  enabled: boolean
  sensitivity: number
  notifyOnCritical: boolean
  notifyOnWarning: boolean
  notifyOnInfo: boolean
}

export function AnomalyDetector({ metrics }: AnomalyDetectorProps) {
  const [anomalies, setAnomalies] = useKV<Anomaly[]>('detected-anomalies', [])
  const [alertSettings, setAlertSettings] = useKV<AlertSettings>('anomaly-alert-settings', {
    enabled: true,
    sensitivity: 50,
    notifyOnCritical: true,
    notifyOnWarning: false,
    notifyOnInfo: false,
  })
  const [showSettings, setShowSettings] = useState(false)

  const detectAnomalies = useMemo(() => {
    if (!alertSettings) return []
    const newAnomalies: Anomaly[] = []
    const sensitivityFactor = (alertSettings?.sensitivity ?? 50) / 50

    metrics.forEach((metric) => {
      const changeThreshold = 15 * sensitivityFactor
      const criticalThreshold = 30 * sensitivityFactor

      if (Math.abs(metric.change) > criticalThreshold) {
        const isSpike = metric.change > 0
        newAnomalies.push({
          id: `${metric.id}-${Date.now()}`,
          metricId: metric.id,
          metricLabel: metric.label,
          type: isSpike ? 'spike' : 'drop',
          severity: 'critical',
          currentValue: metric.value,
          expectedValue: metric.value / (1 + metric.change / 100),
          deviation: Math.abs(metric.change),
          timestamp: Date.now(),
          acknowledged: false,
          explanation: `${metric.label} has ${isSpike ? 'spiked' : 'dropped'} by ${Math.abs(metric.change).toFixed(1)}%, which is significantly outside normal range.`,
          recommendation: isSpike 
            ? `Investigate cause of spike. Verify data quality and check for external factors driving this increase.`
            : `Urgent: Investigate cause of decline. Review recent changes and competitive factors immediately.`
        })
      } else if (Math.abs(metric.change) > changeThreshold) {
        newAnomalies.push({
          id: `${metric.id}-${Date.now()}`,
          metricId: metric.id,
          metricLabel: metric.label,
          type: 'unusual_pattern',
          severity: 'warning',
          currentValue: metric.value,
          expectedValue: metric.value / (1 + metric.change / 100),
          deviation: Math.abs(metric.change),
          timestamp: Date.now(),
          acknowledged: false,
          explanation: `${metric.label} is showing unusual patterns with ${Math.abs(metric.change).toFixed(1)}% change.`,
          recommendation: `Monitor closely over the next 48 hours. Consider investigating if pattern continues.`
        })
      }
    })

    return newAnomalies
  }, [metrics, alertSettings?.sensitivity])

  useEffect(() => {
    if (!alertSettings || !anomalies || !alertSettings.enabled) return
    if (detectAnomalies.length > 0) {
      const existingIds = new Set(anomalies.map(a => a.metricId))
      const newOnes = detectAnomalies.filter(a => !existingIds.has(a.metricId))
      
      if (newOnes.length > 0) {
        setAnomalies((current) => [...detectAnomalies, ...(current || [])].slice(0, 50))
        
        newOnes.forEach(anomaly => {
          const shouldNotify = 
            (anomaly.severity === 'critical' && alertSettings.notifyOnCritical) ||
            (anomaly.severity === 'warning' && alertSettings.notifyOnWarning) ||
            (anomaly.severity === 'info' && alertSettings.notifyOnInfo)

          if (shouldNotify) {
            toast.warning(`Anomaly Detected: ${anomaly.metricLabel}`, {
              description: anomaly.explanation,
              duration: 5000,
            })
          }
        })
      }
    }
  }, [detectAnomalies, alertSettings, anomalies, setAnomalies])

  const handleAcknowledge = (anomalyId: string) => {
    setAnomalies((current) =>
      (current || []).map(a => a.id === anomalyId ? { ...a, acknowledged: true } : a)
    )
    toast.success('Anomaly acknowledged')
  }

  const handleDismiss = (anomalyId: string) => {
    setAnomalies((current) => (current || []).filter(a => a.id !== anomalyId))
    toast.success('Anomaly dismissed')
  }

  const unacknowledgedAnomalies = (anomalies || []).filter(a => !a.acknowledged)
  const acknowledgedAnomalies = (anomalies || []).filter(a => a.acknowledged)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive'
      case 'warning': return 'text-warning'
      case 'info': return 'text-accent'
      default: return 'text-muted-foreground'
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 border-destructive/30'
      case 'warning': return 'bg-warning/10 border-warning/30'
      case 'info': return 'bg-accent/10 border-accent/30'
      default: return 'bg-muted/10 border-border'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spike': return <TrendUp size={20} weight="duotone" />
      case 'drop': return <TrendDown size={20} weight="duotone" />
      case 'unusual_pattern': return <Lightning size={20} weight="duotone" />
      default: return <Warning size={20} weight="duotone" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Anomaly Detection</h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered monitoring alerts you to unusual patterns
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unacknowledgedAnomalies.length > 0 && (
            <Badge variant="destructive" className="gap-2 px-3 py-1 text-sm">
              <BellRinging size={16} weight="fill" className="animate-pulse" />
              {unacknowledgedAnomalies.length} Alert{unacknowledgedAnomalies.length !== 1 ? 's' : ''}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Sliders size={16} />
            Settings
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Alert Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure anomaly detection preferences</p>
                </div>
                <Switch
                  checked={alertSettings?.enabled ?? true}
                  onCheckedChange={(checked) => 
                    setAlertSettings((current) => ({
                      enabled: checked,
                      sensitivity: current?.sensitivity ?? 50,
                      notifyOnCritical: current?.notifyOnCritical ?? true,
                      notifyOnWarning: current?.notifyOnWarning ?? false,
                      notifyOnInfo: current?.notifyOnInfo ?? false
                    }))
                  }
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Detection Sensitivity: {alertSettings?.sensitivity ?? 50}%</Label>
                  <Slider
                    value={[alertSettings?.sensitivity ?? 50]}
                    onValueChange={([value]) => 
                      setAlertSettings((current) => ({
                        sensitivity: value,
                        enabled: current?.enabled ?? true,
                        notifyOnCritical: current?.notifyOnCritical ?? true,
                        notifyOnWarning: current?.notifyOnWarning ?? false,
                        notifyOnInfo: current?.notifyOnInfo ?? false
                      }))
                    }
                    min={10}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher sensitivity detects smaller anomalies
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <Label className="text-sm font-semibold">Notification Preferences</Label>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-critical" className="text-sm cursor-pointer">
                      Critical anomalies
                    </Label>
                    <Switch
                      id="notify-critical"
                      checked={alertSettings?.notifyOnCritical ?? true}
                      onCheckedChange={(checked) =>
                        setAlertSettings((current) => ({
                          notifyOnCritical: checked,
                          enabled: current?.enabled ?? true,
                          sensitivity: current?.sensitivity ?? 50,
                          notifyOnWarning: current?.notifyOnWarning ?? false,
                          notifyOnInfo: current?.notifyOnInfo ?? false
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-warning" className="text-sm cursor-pointer">
                      Warning anomalies
                    </Label>
                    <Switch
                      id="notify-warning"
                      checked={alertSettings?.notifyOnWarning ?? false}
                      onCheckedChange={(checked) =>
                        setAlertSettings((current) => ({
                          notifyOnWarning: checked,
                          enabled: current?.enabled ?? true,
                          sensitivity: current?.sensitivity ?? 50,
                          notifyOnCritical: current?.notifyOnCritical ?? true,
                          notifyOnInfo: current?.notifyOnInfo ?? false
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-info" className="text-sm cursor-pointer">
                      Info anomalies
                    </Label>
                    <Switch
                      id="notify-info"
                      checked={alertSettings?.notifyOnInfo ?? false}
                      onCheckedChange={(checked) =>
                        setAlertSettings((current) => ({
                          notifyOnInfo: checked,
                          enabled: current?.enabled ?? true,
                          sensitivity: current?.sensitivity ?? 50,
                          notifyOnCritical: current?.notifyOnCritical ?? true,
                          notifyOnWarning: current?.notifyOnWarning ?? false
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <BellRinging size={16} />
            Active ({unacknowledgedAnomalies.length})
          </TabsTrigger>
          <TabsTrigger value="acknowledged" className="gap-2">
            <Check size={16} />
            Acknowledged ({acknowledgedAnomalies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3">
          {unacknowledgedAnomalies.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                  <Check size={32} weight="bold" className="text-success" />
                </div>
                <h3 className="text-lg font-semibold">All Clear!</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No active anomalies detected. Your metrics are performing within expected ranges.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {unacknowledgedAnomalies.map((anomaly, index) => (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`p-4 ${getSeverityBg(anomaly.severity)}`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getSeverityBg(anomaly.severity)} flex items-center justify-center ${getSeverityColor(anomaly.severity)}`}>
                        {getTypeIcon(anomaly.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{anomaly.metricLabel}</h4>
                              <Badge variant="outline" className="text-xs">
                                {anomaly.deviation.toFixed(1)}% deviation
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {anomaly.explanation}
                            </p>
                            <p className="text-sm font-medium mb-3">
                              💡 {anomaly.recommendation}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Current: {anomaly.currentValue.toLocaleString()}</span>
                              <span>Expected: {anomaly.expectedValue.toFixed(0)}</span>
                              <span>{new Date(anomaly.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(anomaly.id)}
                          className="gap-2"
                        >
                          <Check size={16} />
                          Acknowledge
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(anomaly.id)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="acknowledged" className="space-y-3">
          {acknowledgedAnomalies.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No acknowledged anomalies yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {acknowledgedAnomalies.map((anomaly) => (
                <Card key={anomaly.id} className="p-4 opacity-60">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getSeverityBg(anomaly.severity)} flex items-center justify-center ${getSeverityColor(anomaly.severity)}`}>
                      {getTypeIcon(anomaly.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{anomaly.metricLabel}</h4>
                      <p className="text-sm text-muted-foreground">{anomaly.explanation}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(anomaly.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
