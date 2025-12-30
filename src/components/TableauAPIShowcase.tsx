import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Code, 
  Play, 
  CheckCircle, 
  Database,
  CloudArrowUp,
  Users,
  ChartBar,
  Lock,
  Lightning
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface APIEndpoint {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  description: string
  category: 'auth' | 'workbooks' | 'datasources' | 'users' | 'projects' | 'views'
  parameters?: { name: string; type: string; required: boolean }[]
  response: string
}

const apiEndpoints: APIEndpoint[] = [
  {
    id: 'auth-signin',
    name: 'Sign In',
    method: 'POST',
    endpoint: '/api/{api-version}/auth/signin',
    description: 'Authenticate and receive a token for subsequent API calls',
    category: 'auth',
    parameters: [
      { name: 'name', type: 'string', required: true },
      { name: 'password', type: 'string', required: true },
      { name: 'site', type: 'string', required: false }
    ],
    response: `{
  "credentials": {
    "token": "12ab34cd56ef78ab90cd12ef34ab56cd",
    "site": {
      "id": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "contentUrl": "MarketingTeam"
    },
    "user": {
      "id": "dd2239f6-ddf1-4107-981a-4cf94e415794"
    }
  }
}`
  },
  {
    id: 'query-workbooks',
    name: 'Query Workbooks',
    method: 'GET',
    endpoint: '/api/{api-version}/sites/{site-id}/workbooks',
    description: 'Get a list of all workbooks on a site',
    category: 'workbooks',
    response: `{
  "workbooks": [
    {
      "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "Sales Dashboard",
      "description": "Q4 2025 Sales Analytics",
      "contentUrl": "SalesDashboard",
      "showTabs": true,
      "size": 2,
      "createdAt": "2025-01-15T12:00:00Z",
      "updatedAt": "2025-01-20T08:30:00Z",
      "project": {
        "id": "6a5b4c3d-2e1f-0a9b-8c7d-6e5f4a3b2c1d",
        "name": "Analytics"
      },
      "owner": {
        "id": "7b6c5d4e-3f2a-1b0c-9d8e-7f6a5b4c3d2e"
      },
      "tags": [
        { "label": "sales" },
        { "label": "quarterly" }
      ]
    }
  ]
}`
  },
  {
    id: 'query-views',
    name: 'Query Views',
    method: 'GET',
    endpoint: '/api/{api-version}/sites/{site-id}/views',
    description: 'Get all views for a site with usage statistics',
    category: 'views',
    response: `{
  "views": [
    {
      "id": "5d4e3f2a-1b0c-9d8e-7f6a-5b4c3d2e1f0a",
      "name": "Regional Performance",
      "contentUrl": "SalesDashboard/RegionalPerformance",
      "viewUrlName": "RegionalPerformance",
      "createdAt": "2025-01-10T10:00:00Z",
      "updatedAt": "2025-01-20T14:45:00Z",
      "workbook": {
        "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
      },
      "owner": {
        "id": "7b6c5d4e-3f2a-1b0c-9d8e-7f6a5b4c3d2e"
      },
      "usage": {
        "totalViewCount": 1247
      }
    }
  ]
}`
  },
  {
    id: 'query-datasources',
    name: 'Query Data Sources',
    method: 'GET',
    endpoint: '/api/{api-version}/sites/{site-id}/datasources',
    description: 'Get all data sources published to a site',
    category: 'datasources',
    response: `{
  "datasources": [
    {
      "id": "3c2d1e0f-9a8b-7c6d-5e4f-3a2b1c0d9e8f",
      "name": "Sales Database",
      "contentUrl": "SalesDatabase",
      "type": "sqlserver",
      "createdAt": "2024-12-01T08:00:00Z",
      "updatedAt": "2025-01-20T06:15:00Z",
      "isCertified": true,
      "certificationNote": "Verified by Data Team",
      "project": {
        "id": "6a5b4c3d-2e1f-0a9b-8c7d-6e5f4a3b2c1d",
        "name": "Analytics"
      },
      "owner": {
        "id": "7b6c5d4e-3f2a-1b0c-9d8e-7f6a5b4c3d2e"
      }
    }
  ]
}`
  },
  {
    id: 'add-user',
    name: 'Add User to Site',
    method: 'POST',
    endpoint: '/api/{api-version}/sites/{site-id}/users',
    description: 'Add a new user to a site',
    category: 'users',
    parameters: [
      { name: 'name', type: 'string', required: true },
      { name: 'siteRole', type: 'string', required: true },
      { name: 'authSetting', type: 'string', required: false }
    ],
    response: `{
  "user": {
    "id": "9e8f7a6b-5c4d-3e2f-1a0b-9c8d7e6f5a4b",
    "name": "alice.smith@company.com",
    "siteRole": "Viewer",
    "authSetting": "ServerDefault"
  }
}`
  },
  {
    id: 'update-permissions',
    name: 'Update Workbook Permissions',
    method: 'PUT',
    endpoint: '/api/{api-version}/sites/{site-id}/workbooks/{workbook-id}/permissions',
    description: 'Add or update permissions for a workbook',
    category: 'workbooks',
    parameters: [
      { name: 'granteeType', type: 'string', required: true },
      { name: 'granteeId', type: 'string', required: true },
      { name: 'capabilities', type: 'array', required: true }
    ],
    response: `{
  "permissions": {
    "granteeCapabilities": [
      {
        "user": {
          "id": "9e8f7a6b-5c4d-3e2f-1a0b-9c8d7e6f5a4b"
        },
        "capabilities": {
          "capability": [
            { "name": "Read", "mode": "Allow" },
            { "name": "Filter", "mode": "Allow" },
            { "name": "ViewComments", "mode": "Allow" }
          ]
        }
      }
    ]
  }
}`
  }
]

export function TableauAPIShowcase() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint>(apiEndpoints[0])
  const [isExecuting, setIsExecuting] = useState(false)
  const [showResponse, setShowResponse] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const handleExecute = async () => {
    setIsExecuting(true)
    setShowResponse(false)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsExecuting(false)
    setShowResponse(true)
    toast.success(`API call successful: ${selectedEndpoint.name}`)
  }

  const categories = [
    { id: 'all', label: 'All', icon: Code },
    { id: 'auth', label: 'Authentication', icon: Lock },
    { id: 'workbooks', label: 'Workbooks', icon: ChartBar },
    { id: 'datasources', label: 'Data Sources', icon: Database },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'views', label: 'Views', icon: Lightning }
  ]

  const filteredEndpoints = activeCategory === 'all' 
    ? apiEndpoints 
    : apiEndpoints.filter(e => e.category === activeCategory)

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-accent/20 text-accent border-accent/30',
      POST: 'bg-success/20 text-success border-success/30',
      PUT: 'bg-warning/20 text-warning border-warning/30',
      DELETE: 'bg-destructive/20 text-destructive border-destructive/30'
    }
    return colors[method as keyof typeof colors]
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Code size={24} weight="duotone" className="text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Tableau REST API Integration</h2>
              <p className="text-muted-foreground mb-4">
                Interactive demonstration of Tableau Developer Platform APIs for workbooks, data sources, 
                users, and permissions management. Test API endpoints and view real response structures.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-2">
                  <Database size={14} />
                  REST API v3.19
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <CloudArrowUp size={14} />
                  Tableau Cloud
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <Lightning size={14} />
                  Real-time Updates
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <h3 className="font-semibold mb-4">API Categories</h3>
          <div className="space-y-2">
            {categories.map((cat) => {
              const Icon = cat.icon
              const count = cat.id === 'all' 
                ? apiEndpoints.length 
                : apiEndpoints.filter(e => e.category === cat.id).length
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${
                    activeCategory === cat.id
                      ? 'bg-accent/20 border-2 border-accent text-accent'
                      : 'bg-secondary border-2 border-transparent hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} weight="duotone" />
                    <span className="font-medium text-sm">{cat.label}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {count}
                  </Badge>
                </button>
              )
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-semibold text-sm mb-3">Quick Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Endpoints</span>
                <span className="font-mono font-bold">{apiEndpoints.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">API Version</span>
                <span className="font-mono font-bold">3.19</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auth Required</span>
                <span className="font-mono font-bold">OAuth 2.0</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Available Endpoints</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredEndpoints.map((endpoint) => (
                  <motion.button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedEndpoint.id === endpoint.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border bg-card hover:border-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{endpoint.name}</span>
                      <Badge className={`${getMethodColor(endpoint.method)} text-xs font-mono`}>
                        {endpoint.method}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mb-1">
                      {endpoint.endpoint}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {endpoint.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Request Details</h4>
                <Badge className={getMethodColor(selectedEndpoint.method)}>
                  {selectedEndpoint.method}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Endpoint</Label>
                  <Input 
                    value={selectedEndpoint.endpoint} 
                    readOnly 
                    className="font-mono text-sm mt-1"
                  />
                </div>

                {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                      Parameters
                    </Label>
                    <div className="space-y-2">
                      {selectedEndpoint.parameters.map((param) => (
                        <div key={param.name} className="flex items-center gap-2">
                          <Input 
                            placeholder={param.name}
                            className="flex-1 text-sm"
                          />
                          <Badge variant="outline" className="text-xs">
                            {param.type}
                          </Badge>
                          {param.required && (
                            <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleExecute} 
                  disabled={isExecuting}
                  className="w-full gap-2"
                >
                  {isExecuting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play size={16} weight="fill" />
                      Execute API Call
                    </>
                  )}
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showResponse && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle size={18} weight="fill" className="text-success" />
                        Response (200 OK)
                      </h4>
                      <Badge className="bg-success/20 text-success border-success/30 text-xs">
                        142ms
                      </Badge>
                    </div>
                    <pre className="bg-card p-4 rounded-lg text-xs font-mono overflow-x-auto border border-border max-h-[300px] overflow-y-auto">
                      <code>{selectedEndpoint.response}</code>
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Integration Examples</h3>
        <Tabs defaultValue="embedding" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="embedding">Embedding</TabsTrigger>
            <TabsTrigger value="filtering">Dynamic Filtering</TabsTrigger>
            <TabsTrigger value="publishing">Publishing</TabsTrigger>
            <TabsTrigger value="metadata">Metadata API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="embedding" className="mt-4">
            <pre className="bg-card p-4 rounded-lg text-xs font-mono overflow-x-auto border border-border">
              <code>{`// Embedding Tableau with JavaScript API
import tableauSoftware from '@tableau/embedding-api';

const viz = new tableauSoftware.Viz(
  document.getElementById('tableau-container'),
  'https://public.tableau.com/views/Dashboard/Sheet1',
  {
    width: '100%',
    height: '800px',
    hideTabs: true,
    hideToolbar: false,
    device: 'desktop',
    onFirstInteractive: function() {
      const workbook = viz.getWorkbook();
      const activeSheet = workbook.getActiveSheet();
      console.log('Dashboard loaded:', activeSheet.getName());
      
      // Get all filters
      activeSheet.getFiltersAsync().then(filters => {
        filters.forEach(filter => {
          console.log('Filter:', filter.getFieldName());
        });
      });
    }
  }
);

// Apply filter programmatically
viz.getWorkbook()
  .getActiveSheet()
  .applyFilterAsync(
    'Region',
    ['West', 'East'],
    tableauSoftware.FilterUpdateType.REPLACE
  );`}</code>
            </pre>
          </TabsContent>

          <TabsContent value="filtering" className="mt-4">
            <pre className="bg-card p-4 rounded-lg text-xs font-mono overflow-x-auto border border-border">
              <code>{`// Dynamic filtering and parameter updates
async function updateDashboardFilters(viz, filters) {
  const workbook = viz.getWorkbook();
  const sheet = workbook.getActiveSheet();
  
  // Apply multiple filters
  for (const [fieldName, values] of Object.entries(filters)) {
    await sheet.applyFilterAsync(
      fieldName,
      values,
      tableau.FilterUpdateType.REPLACE
    );
  }
  
  // Update parameter
  await workbook.changeParameterValueAsync(
    'Target Quarter',
    'Q4 2025'
  );
  
  // Get current selections
  const selectedMarks = await sheet.getSelectedMarksAsync();
  console.log('Selected marks:', selectedMarks);
}

// Usage
updateDashboardFilters(viz, {
  'Region': ['West', 'Central'],
  'Product Category': ['Electronics', 'Furniture'],
  'Date Range': ['2025-01-01', '2025-12-31']
});`}</code>
            </pre>
          </TabsContent>

          <TabsContent value="publishing" className="mt-4">
            <pre className="bg-card p-4 rounded-lg text-xs font-mono overflow-x-auto border border-border">
              <code>{`// Publishing workbooks via REST API
async function publishWorkbook(file, projectId, token) {
  const formData = new FormData();
  
  // Add workbook file
  formData.append('request_payload', JSON.stringify({
    workbook: {
      name: 'Sales Dashboard',
      description: 'Q4 2025 Performance',
      project: { id: projectId },
      showTabs: false
    }
  }));
  formData.append('tableau_workbook', file);
  
  const response = await fetch(
    'https://tableau.server.com/api/3.19/sites/site-id/workbooks',
    {
      method: 'POST',
      headers: {
        'X-Tableau-Auth': token
      },
      body: formData
    }
  );
  
  const data = await response.json();
  console.log('Published workbook:', data.workbook);
  
  return data.workbook;
}`}</code>
            </pre>
          </TabsContent>

          <TabsContent value="metadata" className="mt-4">
            <pre className="bg-card p-4 rounded-lg text-xs font-mono overflow-x-auto border border-border">
              <code>{`// Querying Tableau Metadata API (GraphQL)
const metadataQuery = \`
  query GetDashboardLineage {
    workbooks(filter: {name: "Sales Dashboard"}) {
      id
      name
      description
      upstreamDatasources {
        id
        name
        connectionType
        upstreamTables {
          id
          name
          schema
          fullName
          columns {
            id
            name
            dataType
          }
        }
      }
      sheets {
        id
        name
        path
      }
      owner {
        name
        email
      }
    }
  }
\`;

async function queryMetadata(query, token) {
  const response = await fetch(
    'https://tableau.server.com/api/metadata/graphql',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tableau-Auth': token
      },
      body: JSON.stringify({ query })
    }
  );
  
  const result = await response.json();
  return result.data;
}`}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
