import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApiResponse } from '@/App'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Copy, Check } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface ResponseViewerProps {
  response: ApiResponse | null
  isLoading: boolean
}

export function ResponseViewer({ response, isLoading }: ResponseViewerProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const getStatusClass = (status: number) => {
    if (status === 0) return 'status-5xx'
    if (status >= 200 && status < 300) return 'status-2xx'
    if (status >= 300 && status < 400) return 'status-3xx'
    if (status >= 400 && status < 500) return 'status-4xx'
    return 'status-5xx'
  }

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      toast.success(`${section} copied to clipboard`)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const formatJson = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(obj)
    }
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    )
  }

  if (!response) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Response Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Send a request to see the response here. The response body, headers, and timing information will be displayed.
          </p>
        </div>
      </Card>
    )
  }

  const bodyText = typeof response.body === 'string' ? response.body : formatJson(response.body)

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Response</h2>
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusClass(response.status)} border text-sm px-3 py-1`}>
              {response.status} {response.statusText}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {response.duration}ms
            </Badge>
            <Badge variant="outline" className="text-xs">
              {formatSize(response.size)}
            </Badge>
          </div>
        </div>

        <Accordion type="multiple" defaultValue={['body', 'headers']} className="space-y-2">
          <AccordionItem value="body" className="border border-border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between flex-1">
                <span className="font-medium">Response Body</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 mr-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(bodyText, 'Body')
                  }}
                >
                  {copiedSection === 'Body' ? (
                    <Check size={14} className="text-success" />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="bg-background/50 rounded-md p-4 border border-input overflow-x-auto">
                <pre className="font-mono text-xs whitespace-pre-wrap break-words">
                  {bodyText}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="headers" className="border border-border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between flex-1">
                <span className="font-medium">Response Headers</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 mr-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(formatJson(response.headers), 'Headers')
                  }}
                >
                  {copiedSection === 'Headers' ? (
                    <Check size={14} className="text-success" />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[200px,1fr] gap-4 text-sm">
                    <div className="font-mono text-muted-foreground truncate">{key}</div>
                    <div className="font-mono break-words">{value}</div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Card>
  )
}
