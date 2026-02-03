import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Lightning } from '@phosphor-icons/react'
import { AuthConfig } from '@/App'

interface EndpointTemplate {
  id: string
  name: string
  description: string
  method: string
  endpoint: string
  requiresAuth: boolean
  body?: string
}

interface EndpointTemplatesProps {
  onSelectTemplate: (template: Partial<{
    method: string
    url: string
    headers: Record<string, string>
    body?: string
  }>) => void
  authConfig: AuthConfig | null
}

const TEMPLATES: EndpointTemplate[] = [
  {
    id: 'list-workbooks',
    name: 'List Workbooks',
    description: 'Get all workbooks on the site',
    method: 'GET',
    endpoint: '/api/3.21/sites/{site-id}/workbooks',
    requiresAuth: true
  },
  {
    id: 'query-views',
    name: 'Query Views',
    description: 'Get all views for the site',
    method: 'GET',
    endpoint: '/api/3.21/sites/{site-id}/views',
    requiresAuth: true
  },
  {
    id: 'list-users',
    name: 'List Users',
    description: 'Get all users on the site',
    method: 'GET',
    endpoint: '/api/3.21/sites/{site-id}/users',
    requiresAuth: true
  },
  {
    id: 'query-datasources',
    name: 'Query Data Sources',
    description: 'Get all data sources',
    method: 'GET',
    endpoint: '/api/3.21/sites/{site-id}/datasources',
    requiresAuth: true
  },
  {
    id: 'query-projects',
    name: 'Query Projects',
    description: 'Get all projects on the site',
    method: 'GET',
    endpoint: '/api/3.21/sites/{site-id}/projects',
    requiresAuth: true
  },
  {
    id: 'create-project',
    name: 'Create Project',
    description: 'Create a new project',
    method: 'POST',
    endpoint: '/api/3.21/sites/{site-id}/projects',
    requiresAuth: true,
    body: JSON.stringify({
      project: {
        name: 'New Project',
        description: 'Project created via API',
        contentPermissions: 'ManagedByOwner'
      }
    }, null, 2)
  },
  {
    id: 'server-info',
    name: 'Server Info',
    description: 'Get server information',
    method: 'GET',
    endpoint: '/api/3.21/serverinfo',
    requiresAuth: false
  },
  {
    id: 'query-views-site',
    name: 'Query Views for Site',
    description: 'Returns the views for a site',
    method: 'GET',
    endpoint: '/api/3.21/sites/{site-id}/views',
    requiresAuth: true
  }
]

export function EndpointTemplates({ onSelectTemplate, authConfig }: EndpointTemplatesProps) {
  const getMethodClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'method-get'
      case 'POST': return 'method-post'
      case 'PUT': return 'method-put'
      case 'DELETE': return 'method-delete'
      case 'PATCH': return 'method-patch'
      default: return ''
    }
  }

  const handleSelectTemplate = (template: EndpointTemplate) => {
    let url = template.endpoint
    
    if (authConfig && authConfig.serverUrl) {
      url = `${authConfig.serverUrl}${template.endpoint}`
      if (authConfig.siteId && url.includes('{site-id}')) {
        url = url.replace('{site-id}', authConfig.siteId)
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    if (template.requiresAuth && authConfig?.token) {
      headers['X-Tableau-Auth'] = authConfig.token
    }

    onSelectTemplate({
      method: template.method,
      url,
      headers,
      body: template.body
    })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightning size={18} weight="duotone" />
        <h3 className="font-semibold text-sm">Quick Templates</h3>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-sm">{template.name}</h4>
                <Badge className={`endpoint-badge ${getMethodClass(template.method)} text-[10px] px-1.5`}>
                  {template.method}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {template.description}
              </p>
              {template.requiresAuth && (
                <Badge variant="outline" className="text-[10px] px-1.5">
                  Requires Auth
                </Badge>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
