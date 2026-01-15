import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { 
  TrendUp,
  TrendDown, 
  Warning,
  Lightning,
  BellRinging,
  Sliders,
  X,
  Check
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

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

  useEffect(() => {
    if (!alertSettings?.enabled) return

    const detectAnomalies = () => {
      const newAnomalies: Anomaly[] = []
      const sensitivityFactor = (alertSettings?.sensitivity || 50) / 50

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
            severity: Math.abs(metric.change) > criticalThreshold * 1.5 ? 'critical' : 'warning',
            currentValue: metric.value,
            expectedValue: metric.value / (1 + metric.change / 100),
            deviation: Math.abs(metric.change),
            timestamp: Date.now(),
            acknowledged: false,
            explanation: `${metric.label} has ${isSpike ? 'spiked' : 'dropped'} by ${Math.abs(metric.change).toFixed(1)}%, which is ${Math.abs(metric.change) > criticalThreshold * 1.5 ? 'significantly' : 'noticeably'} higher than expected.`,
            recommendation: isSpike 
              ? `Investigate potential causes of the increase in ${metric.label}. Consider scaling resources if needed.`
              : `Review factors contributing to the decline in ${metric.label}. Take corrective action if trend continues.`
          })
        } else if (Math.abs(metric.change) > changeThreshold) {
          newAnomalies.push({
            id: `${metric.id}-${Date.now()}`,
            metricId: metric.id,
            metricLabel: metric.label,
            type: 'unusual_pattern',
            severity: 'info',
            currentValue: metric.value,
            expectedValue: metric.value / (1 + metric.change / 100),
            deviation: Math.abs(metric.change),
            timestamp: Date.now(),
            acknowledged: false,
            explanation: `${metric.label} shows an unusual pattern with a ${metric.change > 0 ? 'positive' : 'negative'} change of ${Math.abs(metric.change).toFixed(1)}%.`,
            recommendation: `Monitor ${metric.label} for continued deviation from normal patterns.`
          })
        }
      })

      if (newAnomalies.length > 0) {
        setAnomalies((current) => {
          const existingIds = new Set((current || []).map(a => a.metricId))
          const trulyNew = newAnomalies.filter(a => !existingIds.has(a.metricId))
          return [...(current || []), ...trulyNew]
        })

        newAnomalies.forEach(anomaly => {
          if (
            (anomaly.severity === 'critical' && alertSettings?.notifyOnCritical) ||
            (anomaly.severity === 'warning' && alertSettings?.notifyOnWarning) ||
            (anomaly.severity === 'info' && alertSettings?.notifyOnInfo)
          ) {
            toast.error(`Anomaly Detected: ${anomaly.metricLabel}`, {
              description: anomaly.explanation
            })
          }
        })
      }
    }

    detectAnomalies()
    const interval = setInterval(detectAnomalies, 30000)
    return () => clearInterval(interval)
  }, [metrics, alertSettings, setAnomalies])

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
                  checked={alertSettings?.enabled || false}
                  onCheckedChange={(checked) => 
                    setAlertSettings((current) => ({ 
                      ...(current || { sensitivity: 50, notifyOnCritical: true, notifyOnWarning: false, notifyOnInfo: false }),
                      enabled: checked 
                    }))
                  }
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Detection Sensitivity: {alertSettings?.sensitivity || 50}%</Label>
                  <Slider
                    value={[alertSettings?.sensitivity || 50]}
                    onValueChange={([value]) => 
                      setAlertSettings((current) => ({ 
                        ...(current || { enabled: true, notifyOnCritical: true, notifyOnWarning: false, notifyOnInfo: false }),
                        sensitivity: value 
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
                      checked={alertSettings?.notifyOnCritical || false}
                      onCheckedChange={(checked) =>
                        setAlertSettings((current) => ({ 
                          ...(current || { enabled: true, sensitivity: 50, notifyOnWarning: false, notifyOnInfo: false }),
                          notifyOnCritical: checked 
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
                      checked={alertSettings?.notifyOnWarning || false}
                      onCheckedChange={(checked) =>
                        setAlertSettings((current) => ({ 
                          ...(current || { enabled: true, sensitivity: 50, notifyOnCritical: true, notifyOnInfo: false }),
                          notifyOnWarning: checked 
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
                      checked={alertSettings?.notifyOnInfo || false}
                      onCheckedChange={(checked) =>
                        setAlertSettings((current) => ({ 
                          ...(current || { enabled: true, sensitivity: 50, notifyOnCritical: true, notifyOnWarning: false }),
                          notifyOnInfo: checked 
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

      {unacknowledgedAnomalies.length === 0 && acknowledgedAnomalies.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Check size={32} weight="bold" className="text-success" />
            </div>
            <div>
              <p className="font-semibold text-lg">All Clear</p>
              <p className="text-sm text-muted-foreground">No anomalies detected in your metrics</p>
            </div>
          </div>
        </Card>
      )}

      {unacknowledgedAnomalies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Alerts</h3>
          {unacknowledgedAnomalies.map((anomaly) => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className={`p-4 ${getSeverityBg(anomaly.severity)}`}>
                <div className="flex items-start gap-4">
                  <div className={getSeverityColor(anomaly.severity)}>
                    {getTypeIcon(anomaly.type)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">{anomaly.metricLabel}</h4>
                        <Badge variant="outline" className={`text-xs ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleAcknowledge(anomaly.id)}
                        >
                          <Check size={14} />
                          Acknowledge
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-2"
                          onClick={() => handleDismiss(anomaly.id)}
                        >
                          <X size={14} />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm">{anomaly.explanation}</p>
                    <p className="text-sm text-muted-foreground italic">{anomaly.recommendation}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {acknowledgedAnomalies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">Acknowledged Anomalies</h3>
          {acknowledgedAnomalies.map((anomaly) => (
            <Card key={anomaly.id} className="p-4 opacity-60">
              <div className="flex items-start gap-4">
                <div className="text-muted-foreground">
                  {getTypeIcon(anomaly.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold">{anomaly.metricLabel}</h4>
                      <Badge variant="outline" className="text-xs">
                        {anomaly.severity}
                      </Badge>
                      <Check size={14} className="inline ml-2 text-success" />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={() => handleDismiss(anomaly.id)}
                    >
                      <X size={14} />
                      Remove
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{anomaly.explanation}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
