import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { PaperPlaneTilt, Plus, Trash } from '@phosphor-icons/react'
import { ApiRequest, AuthConfig } from '@/App'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface RequestBuilderProps {
  request: ApiRequest | null
  authConfig: AuthConfig | null
  isLoading: boolean
  onSendRequest: (request: ApiRequest) => void
  onRequestChange: (request: ApiRequest) => void
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

export function RequestBuilder({
  request,
  authConfig,
  isLoading,
  onSendRequest,
  onRequestChange
}: RequestBuilderProps) {
  const [method, setMethod] = useState(request?.method || 'GET')
  const [url, setUrl] = useState(request?.url || '')
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>(
    request?.headers ? Object.entries(request.headers).map(([key, value]) => ({ key, value })) : [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Accept', value: 'application/json' }
    ]
  )
  const [body, setBody] = useState(request?.body || '')

  useEffect(() => {
    if (request) {
      setMethod(request.method)
      setUrl(request.url)
      setHeaders(Object.entries(request.headers).map(([key, value]) => ({ key, value })))
      setBody(request.body || '')
    }
  }, [request])

  useEffect(() => {
    if (authConfig && authConfig.token) {
      const hasAuthHeader = headers.some(h => h.key.toLowerCase() === 'x-tableau-auth')
      if (!hasAuthHeader) {
        setHeaders(prev => [...prev, { key: 'X-Tableau-Auth', value: authConfig.token }])
      } else {
        setHeaders(prev => prev.map(h => 
          h.key.toLowerCase() === 'x-tableau-auth' ? { ...h, value: authConfig.token } : h
        ))
      }
    }
  }, [authConfig])

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const handleSend = () => {
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    if (!authConfig?.token && !url.includes('/auth/signin')) {
      toast.error('Please authenticate first')
      return
    }

    const headersObj: Record<string, string> = {}
    headers.forEach(({ key, value }) => {
      if (key && value) {
        headersObj[key] = value
      }
    })

    const newRequest: ApiRequest = {
      id: crypto.randomUUID(),
      method,
      url,
      headers: headersObj,
      body: body || undefined,
      timestamp: Date.now()
    }

    onRequestChange(newRequest)
    onSendRequest(newRequest)
  }

  const getMethodClass = (m: string) => {
    switch (m.toUpperCase()) {
      case 'GET': return 'method-get'
      case 'POST': return 'method-post'
      case 'PUT': return 'method-put'
      case 'DELETE': return 'method-delete'
      case 'PATCH': return 'method-patch'
      default: return ''
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Request Builder</h2>
          
          {!authConfig?.token && (
            <Alert className="mb-4 border-warning/50 bg-warning/10">
              <AlertDescription className="text-sm">
                You are not authenticated. Some endpoints require authentication.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-3">
          <div className="w-32">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className={`endpoint-badge ${getMethodClass(method)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map(m => (
                  <SelectItem key={m} value={m}>
                    <span className={`endpoint-badge ${getMethodClass(m)}`}>{m}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Input
              placeholder="https://your-server.tableau.com/api/3.21/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          
          <Button
            onClick={handleSend}
            disabled={isLoading || !url}
            className="gap-2 px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <PaperPlaneTilt size={16} weight="duotone" />
                Send
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Headers</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={addHeader}
              className="gap-2 h-8"
            >
              <Plus size={14} weight="bold" />
              Add Header
            </Button>
          </div>
          
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Header name"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  className="font-mono text-sm"
                />
                <Input
                  placeholder="Header value"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  className="font-mono text-sm flex-1"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeHeader(index)}
                  className="px-3"
                >
                  <Trash size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {method !== 'GET' && method !== 'DELETE' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Request Body</Label>
            <Textarea
              placeholder='{"key": "value"}'
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="code-editor"
              rows={12}
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>JSON format</span>
              <span>{body.length} characters</span>
            </div>
          </div>
        )}

        {authConfig && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Session</span>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono text-xs">
                  {authConfig.serverUrl}
                </Badge>
                {authConfig.siteName && (
                  <Badge variant="outline" className="font-mono text-xs">
                    Site: {authConfig.siteName}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
