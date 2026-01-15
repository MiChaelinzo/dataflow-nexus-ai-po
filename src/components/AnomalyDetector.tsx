import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { TrendUp, TrendDown, Warning, X, Gear, Check, BellRinging } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'

interface Metric {
  id: string
  label: string
  value: number
  change: number
}

interface Anomaly {
  id: string
  metricId: string
  metricLabel: string
  type: 'spike' | 'drop' | 'unusual'
  severity: 'critical' | 'warning' | 'info'
  actual: number
  expected: number
  deviation: number
  timestamp: number
  explanation: string
  recommendation: string
  acknowledged: boolean
}

interface AlertSettings {
  enabled: boolean
  sensitivity: number
  notifyOnCritical: boolean
  notifyOnWarning: boolean
  notifyOnInfo: boolean
}

interface AnomalyDetectorProps {
  metrics: Metric[]
}

export function AnomalyDetector({ metrics }: AnomalyDetectorProps) {
  const defaultSettings: AlertSettings = {
    enabled: true,
    sensitivity: 50,
    notifyOnCritical: true,
    notifyOnWarning: true,
    notifyOnInfo: false,
  }

  const [anomalies, setAnomalies] = useKV<Anomaly[]>('detected-anomalies', [])
  const [alertSettings, setAlertSettings] = useKV<AlertSettings>('anomaly-alert-settings', defaultSettings)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (!alertSettings?.enabled) return

    const detectAnomalies = () => {
      const sensitivity = (alertSettings?.sensitivity || 50) / 100
      const changeThreshold = 10 + (1 - sensitivity) * 30
      const criticalThreshold = changeThreshold * 1.5
      
      const newAnomalies: Anomaly[] = []
      
      metrics.forEach((metric) => {
        if (Math.abs(metric.change) > criticalThreshold) {
          newAnomalies.push({
            id: `${metric.id}-${Date.now()}`,
            metricId: metric.id,
            metricLabel: metric.label,
            type: metric.change > 0 ? 'spike' : 'drop',
            severity: 'critical',
            actual: metric.value,
            expected: metric.value / (1 + metric.change / 100),
            deviation: Math.abs(metric.change),
            timestamp: Date.now(),
            explanation: `${metric.label} has ${metric.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(metric.change).toFixed(1)}%, which is significantly higher than expected.`,
            recommendation: `Investigate the root cause immediately. This deviation exceeds critical thresholds.`,
            acknowledged: false,
          })
        } else if (Math.abs(metric.change) > changeThreshold) {
          newAnomalies.push({
            id: `${metric.id}-${Date.now()}`,
            metricId: metric.id,
            metricLabel: metric.label,
            type: metric.change > 0 ? 'spike' : 'drop',
            severity: 'warning',
            actual: metric.value,
            expected: metric.value / (1 + metric.change / 100),
            deviation: Math.abs(metric.change),
            timestamp: Date.now(),
            explanation: `${metric.label} shows unusual ${metric.change > 0 ? 'growth' : 'decline'} of ${Math.abs(metric.change).toFixed(1)}%.`,
            recommendation: `Monitor this metric closely for continued unusual patterns.`,
            acknowledged: false,
          })
        }
      })

      if (newAnomalies.length > 0) {
        setAnomalies((current) => {
          const existingIds = new Set((current || []).map(a => a.metricId))
          const uniqueNew = newAnomalies.filter(a => !existingIds.has(a.metricId))
          return [...uniqueNew, ...(current || [])]
        })

        newAnomalies.forEach((anomaly) => {
          if (
            (anomaly.severity === 'critical' && alertSettings?.notifyOnCritical) ||
            (anomaly.severity === 'warning' && alertSettings?.notifyOnWarning) ||
            (anomaly.severity === 'info' && alertSettings?.notifyOnInfo)
          ) {
            toast.error(`Anomaly Detected: ${anomaly.metricLabel}`, {
              description: anomaly.explanation,
            })
          }
        })
      }
    }

    detectAnomalies()
    const interval = setInterval(detectAnomalies, 60000)
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
  }

  const unacknowledgedAnomalies = (anomalies || []).filter(a => !a.acknowledged)
  const acknowledgedAnomalies = (anomalies || []).filter(a => a.acknowledged)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive'
      case 'warning': return 'text-warning'
      case 'info': return 'text-accent'
      default: return 'text-foreground'
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 border-destructive/30'
      case 'warning': return 'bg-warning/10 border-warning/30'
      case 'info': return 'bg-accent/10 border-accent/30'
      default: return 'bg-muted'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spike': return <TrendUp size={20} weight="duotone" />
      case 'drop': return <TrendDown size={20} weight="duotone" />
      default: return <Warning size={20} weight="duotone" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Anomaly Detection</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered monitoring for unusual metric patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unacknowledgedAnomalies.length > 0 && (
            <Badge variant="destructive" className="gap-2">
              <BellRinging size={16} weight="fill" />
              {unacknowledgedAnomalies.length}
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Gear size={16} weight="duotone" />
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
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Detection Settings</h3>
                  <Switch
                    checked={alertSettings?.enabled || false}
                    onCheckedChange={(checked) =>
                      setAlertSettings((current) => ({ 
                        ...defaultSettings,
                        ...current, 
                        enabled: checked 
                      }))
                    }
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">
                      Sensitivity: {alertSettings?.sensitivity || 50}%
                    </Label>
                    <Slider
                      value={[alertSettings?.sensitivity || 50]}
                      onValueChange={(value) =>
                        setAlertSettings((current) => ({ 
                          ...defaultSettings,
                          ...current, 
                          sensitivity: value[0] 
                        }))
                      }
                      min={0}
                      max={100}
                      step={10}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Notifications</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="notify-critical"
                        checked={alertSettings?.notifyOnCritical || false}
                        onCheckedChange={(checked) =>
                          setAlertSettings((current) => ({ 
                            ...defaultSettings,
                            ...current, 
                            notifyOnCritical: checked 
                          }))
                        }
                      />
                      <Label htmlFor="notify-critical" className="text-sm cursor-pointer">
                        Critical anomalies
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="notify-warning"
                        checked={alertSettings?.notifyOnWarning || false}
                        onCheckedChange={(checked) =>
                          setAlertSettings((current) => ({ 
                            ...defaultSettings,
                            ...current, 
                            notifyOnWarning: checked 
                          }))
                        }
                      />
                      <Label htmlFor="notify-warning" className="text-sm cursor-pointer">
                        Warning anomalies
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="notify-info"
                        checked={alertSettings?.notifyOnInfo || false}
                        onCheckedChange={(checked) =>
                          setAlertSettings((current) => ({ 
                            ...defaultSettings,
                            ...current, 
                            notifyOnInfo: checked 
                          }))
                        }
                      />
                      <Label htmlFor="notify-info" className="text-sm cursor-pointer">
                        Info anomalies
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {unacknowledgedAnomalies.length === 0 && acknowledgedAnomalies.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <Check size={32} weight="bold" className="text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Anomalies Detected</h3>
              <p className="text-sm text-muted-foreground">
                All metrics are performing within expected ranges
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {unacknowledgedAnomalies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Active Anomalies</h3>
              {unacknowledgedAnomalies.map((anomaly) => (
                <Card key={anomaly.id} className={`p-4 border-2 ${getSeverityBg(anomaly.severity)}`}>
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 ${getSeverityColor(anomaly.severity)}`}>
                      {getTypeIcon(anomaly.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{anomaly.metricLabel}</h4>
                            <Badge variant="outline" className={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(anomaly.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(anomaly.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">{anomaly.explanation}</p>
                        <p className="text-sm font-medium">{anomaly.recommendation}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Expected: </span>
                          <span className="font-medium">{anomaly.expected.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Actual: </span>
                          <span className="font-medium">{anomaly.actual.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deviation: </span>
                          <span className={`font-medium ${getSeverityColor(anomaly.severity)}`}>
                            {anomaly.deviation.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAcknowledge(anomaly.id)}
                        className="gap-2"
                      >
                        <Check size={16} weight="bold" />
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {acknowledgedAnomalies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-muted-foreground">Acknowledged</h3>
              {acknowledgedAnomalies.map((anomaly) => (
                <Card key={anomaly.id} className="p-4 opacity-60">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 text-muted-foreground">
                      {getTypeIcon(anomaly.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{anomaly.metricLabel}</h4>
                            <Badge variant="outline">{anomaly.severity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(anomaly.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(anomaly.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
