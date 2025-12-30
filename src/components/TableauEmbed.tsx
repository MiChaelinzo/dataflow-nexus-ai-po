import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ChartBar, 
  ArrowsOutSimple, 
  Download, 
  ShareNetwork, 
  Funnel,
  Calendar,
  MapPin,
  Lightning,
  Code
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface TableauViz {
  id: string
  name: string
  description: string
  embedUrl: string
  category: 'sales' | 'operations' | 'finance' | 'marketing'
  interactive: boolean
  filters?: string[]
}

const tableauExamples: TableauViz[] = [
  {
    id: 'sales-dashboard',
    name: 'Regional Sales Performance',
    description: 'Interactive dashboard showing sales metrics across regions with drill-down capabilities',
    embedUrl: 'https://public.tableau.com/views/RegionalSalesPerformance/Dashboard',
    category: 'sales',
    interactive: true,
    filters: ['Region', 'Product Category', 'Time Period']
  },
  {
    id: 'covid-tracker',
    name: 'COVID-19 Global Tracker',
    description: 'Real-time visualization of global COVID-19 statistics and trends',
    embedUrl: 'https://public.tableau.com/views/COVID-19Cases_15840488375320/Dashboard',
    category: 'operations',
    interactive: true,
    filters: ['Country', 'Date Range', 'Metric Type']
  },
  {
    id: 'financial-overview',
    name: 'Financial Performance Overview',
    description: 'Comprehensive financial metrics with predictive analytics and trend analysis',
    embedUrl: 'https://public.tableau.com/views/FinancialAnalysisDashboard/Dashboard',
    category: 'finance',
    interactive: true,
    filters: ['Quarter', 'Department', 'Account Type']
  },
  {
    id: 'customer-analytics',
    name: 'Customer Behavior Analytics',
    description: 'Deep dive into customer segmentation, retention, and lifetime value',
    embedUrl: 'https://public.tableau.com/views/CustomerSegmentation_16/Dashboard',
    category: 'marketing',
    interactive: true,
    filters: ['Segment', 'Cohort', 'Channel']
  }
]

export function TableauEmbed() {
  const [selectedViz, setSelectedViz] = useState<TableauViz>(tableauExamples[0])
  const [embedMode, setEmbedMode] = useState<'live' | 'screenshot'>('screenshot')
  const [isLoading, setIsLoading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleVizChange = (vizId: string) => {
    const viz = tableauExamples.find(v => v.id === vizId)
    if (viz) {
      setIsLoading(true)
      setSelectedViz(viz)
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      sales: 'bg-accent/20 text-accent border-accent/30',
      operations: 'bg-success/20 text-success border-success/30',
      finance: 'bg-metric-purple/20 text-metric-purple border-metric-purple/30',
      marketing: 'bg-warning/20 text-warning border-warning/30'
    }
    return colors[category as keyof typeof colors] || colors.sales
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-primary/10 border-accent/20">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Lightning size={24} weight="duotone" className="text-accent" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Tableau Integration Examples</h2>
              <p className="text-muted-foreground">
                Demonstrating real-world Tableau dashboard embeds with interactive filtering, 
                responsive design, and seamless platform integration
              </p>
            </div>
            <Badge className="bg-accent/20 text-accent border-accent/30 gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Live Integration
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {tableauExamples.map((viz) => (
              <motion.button
                key={viz.id}
                onClick={() => handleVizChange(viz.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedViz.id === viz.id
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-card hover:border-accent/50'
                }`}
              >
                <Badge className={`${getCategoryColor(viz.category)} mb-2 text-xs`}>
                  {viz.category}
                </Badge>
                <h3 className="font-semibold text-sm mb-1">{viz.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{viz.description}</p>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">{selectedViz.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedViz.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={embedMode} onValueChange={(v: any) => setEmbedMode(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="screenshot">Demo View</SelectItem>
                <SelectItem value="live">Live Embed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedViz.filters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Funnel size={16} weight="duotone" />
              Available Filters:
            </span>
            {selectedViz.filters.map((filter) => (
              <Badge key={filter} variant="outline" className="text-xs">
                {filter}
              </Badge>
            ))}
          </div>
        )}

        <div className="relative bg-secondary rounded-lg overflow-hidden border border-border">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading Tableau visualization...</p>
              </div>
            </div>
          )}

          {embedMode === 'live' ? (
            <div className="relative w-full" style={{ height: '600px' }}>
              <iframe
                ref={iframeRef}
                src={`${selectedViz.embedUrl}?:embed=yes&:toolbar=top&:tabs=no&:display_count=no&:showVizHome=no`}
                className="w-full h-full border-0"
                title={selectedViz.name}
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : (
            <TableauScreenshot viz={selectedViz} />
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowsOutSimple size={16} />
              Fullscreen
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download size={16} />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ShareNetwork size={16} />
              Share
            </Button>
          </div>
          <Badge variant="outline" className="gap-2">
            <ChartBar size={14} weight="duotone" />
            Interactive Dashboard
          </Badge>
        </div>
      </Card>

      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Code size={20} weight="duotone" />
          Integration Code Example
        </h3>
        <Tabs defaultValue="js" className="w-full">
          <TabsList>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
            <TabsTrigger value="api">REST API</TabsTrigger>
          </TabsList>
          <TabsContent value="js" className="mt-4">
            <pre className="bg-card p-4 rounded-lg text-xs font-mono overflow-x-auto border border-border">
              <code>{`// Tableau JavaScript API Integration
import tableau from 'tableau-api';

const viz = new tableau.Viz(
  containerDiv,
  '${selectedViz.embedUrl}',
  {
    width: '100%',
    height: '600px',
    hideTabs: true,
    hideToolbar: false,
    onFirstInteractive: () => {
      // Dashboard is ready
      console.log('Tableau viz loaded');
      
      // Apply filters programmatically
      viz.getWorkbook()
        .getActiveSheet()
        .applyFilterAsync('Region', 'West', 
          tableau.FilterUpdateType.REPLACE);
    }
  }
);`}</code>
            </pre>
          </TabsContent>
          <TabsContent value="react" className="mt-4">
            <pre className="bg-card p-4 rounded-lg text-xs font-mono overflow-x-auto border border-border">
              <code>{`// React Component with Tableau Embed
import { TableauEmbed } from '@tableau/embedding-react';

function Dashboard() {
  const handleFirstInteractive = (viz) => {
    console.log('Viz loaded:', viz);
  };

  return (
    <TableauEmbed
      src="${selectedViz.embedUrl}"
      width="100%"
      height="600px"
      hideTabs
      toolbar="top"
      onFirstInteractive={handleFirstInteractive}
    />
  );
}`}</code>
            </pre>
          </TabsContent>
          <TabsContent value="api" className="mt-4">
            <pre className="bg-card p-4 rounded-lg text-xs font-mono overflow-x-auto border border-border">
              <code>{`// Tableau REST API Integration
const tableauServer = 'https://your-server.tableau.com';
const apiVersion = '3.19';

// Authenticate
const authResponse = await fetch(
  \`\${tableauServer}/api/\${apiVersion}/auth/signin\`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      credentials: {
        name: 'username',
        password: 'password',
        site: { contentUrl: 'site-name' }
      }
    })
  }
);

const { token } = await authResponse.json();

// Query workbooks
const workbooks = await fetch(
  \`\${tableauServer}/api/\${apiVersion}/sites/site-id/workbooks\`,
  { headers: { 'X-Tableau-Auth': token } }
);`}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

function TableauScreenshot({ viz }: { viz: TableauViz }) {
  const screenshots = {
    'sales-dashboard': (
      <div className="w-full h-[600px] bg-gradient-to-br from-card via-secondary to-muted p-8 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Regional Sales Dashboard</h2>
          <div className="flex gap-2">
            <Badge className="bg-success/20 text-success border-success/30">↑ 23.5%</Badge>
            <Badge variant="outline">Q4 2025</Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-card/80 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Revenue</p>
            <p className="text-2xl font-bold font-mono">$4.2M</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-success">
              <span>↑ 15.3%</span>
            </div>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Orders</p>
            <p className="text-2xl font-bold font-mono">8,421</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-success">
              <span>↑ 8.7%</span>
            </div>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Avg Order Value</p>
            <p className="text-2xl font-bold font-mono">$499</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-accent">
              <span>↑ 6.1%</span>
            </div>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Customers</p>
            <p className="text-2xl font-bold font-mono">6,234</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-success">
              <span>↑ 12.4%</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1">
          <Card className="p-4 bg-card/80 backdrop-blur-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin size={16} weight="duotone" />
              Revenue by Region
            </h3>
            <div className="space-y-3">
              {[
                { region: 'West', value: 1250000, percent: 29.8, color: 'bg-accent' },
                { region: 'East', value: 1120000, percent: 26.7, color: 'bg-success' },
                { region: 'Central', value: 980000, percent: 23.3, color: 'bg-metric-purple' },
                { region: 'South', value: 850000, percent: 20.2, color: 'bg-warning' }
              ].map((item) => (
                <div key={item.region}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{item.region}</span>
                    <span className="font-mono text-xs">${(item.value / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-card/80 backdrop-blur-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar size={16} weight="duotone" />
              Monthly Trend
            </h3>
            <div className="h-full flex items-end justify-between gap-2 pb-4">
              {[65, 72, 68, 85, 92, 88, 95, 100, 110, 105, 115, 120].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-gradient-to-t from-accent to-accent/40 rounded-t transition-all hover:from-accent/80"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[8px] text-muted-foreground">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Data refreshed: 2 minutes ago</span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Live data connection active
          </span>
        </div>
      </div>
    ),
    'covid-tracker': (
      <div className="w-full h-[600px] bg-gradient-to-br from-destructive/5 via-card to-warning/5 p-8 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">COVID-19 Global Tracker</h2>
          <Badge variant="outline" className="gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Real-time Data
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-card/80 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Cases</p>
            <p className="text-2xl font-bold font-mono">756.2M</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <span>Global</span>
            </div>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Recoveries</p>
            <p className="text-2xl font-bold font-mono">742.8M</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-success">
              <span>98.2%</span>
            </div>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Active Cases</p>
            <p className="text-2xl font-bold font-mono">6.8M</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-warning">
              <span>0.9%</span>
            </div>
          </Card>
        </div>

        <Card className="flex-1 p-6 bg-card/80 backdrop-blur-sm">
          <div className="text-center text-muted-foreground py-16">
            <MapPin size={64} weight="thin" className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold mb-2">Interactive Map View</p>
            <p className="text-sm">
              Live Tableau embed would display an interactive world map<br />
              with heat zones, drill-down by country, and time-series playback
            </p>
          </div>
        </Card>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Data source: WHO • Updated hourly • Click regions for detailed statistics
        </div>
      </div>
    ),
    'financial-overview': (
      <div className="w-full h-[600px] bg-gradient-to-br from-metric-purple/10 via-card to-accent/10 p-8 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Financial Performance Overview</h2>
          <div className="flex gap-2">
            <Badge className="bg-metric-purple/20 text-metric-purple border-metric-purple/30">FY 2025</Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Revenue', value: '$12.4M', change: '+18.2%', positive: true },
            { label: 'Expenses', value: '$8.1M', change: '+12.1%', positive: false },
            { label: 'Net Profit', value: '$4.3M', change: '+31.5%', positive: true },
            { label: 'Margin', value: '34.7%', change: '+3.2%', positive: true },
            { label: 'EBITDA', value: '$5.2M', change: '+28.9%', positive: true }
          ].map((item) => (
            <Card key={item.label} className="p-3 bg-card/80 backdrop-blur-sm">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{item.label}</p>
              <p className="text-xl font-bold font-mono">{item.value}</p>
              <div className={`text-[10px] mt-1 ${item.positive ? 'text-success' : 'text-destructive'}`}>
                {item.change}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1">
          <Card className="p-4 bg-card/80 backdrop-blur-sm overflow-hidden">
            <h3 className="font-semibold mb-4">Quarterly Performance</h3>
            <div className="h-full flex items-end justify-between gap-3 pb-4">
              {[
                { q: 'Q1', revenue: 2.8, profit: 0.9 },
                { q: 'Q2', revenue: 3.1, profit: 1.1 },
                { q: 'Q3', revenue: 3.2, profit: 1.2 },
                { q: 'Q4', revenue: 3.3, profit: 1.1 }
              ].map((item) => (
                <div key={item.q} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1">
                    <div 
                      className="flex-1 bg-accent rounded-t"
                      style={{ height: `${item.revenue * 30}px` }}
                    />
                    <div 
                      className="flex-1 bg-success rounded-t"
                      style={{ height: `${item.profit * 30}px` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{item.q}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 text-xs mt-2">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-accent rounded" />
                Revenue
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-success rounded" />
                Profit
              </span>
            </div>
          </Card>

          <Card className="p-4 bg-card/80 backdrop-blur-sm">
            <h3 className="font-semibold mb-4">Department Breakdown</h3>
            <div className="space-y-3">
              {[
                { dept: 'Sales', value: 4.2, color: 'bg-accent' },
                { dept: 'R&D', value: 2.8, color: 'bg-metric-purple' },
                { dept: 'Marketing', value: 2.1, color: 'bg-success' },
                { dept: 'Operations', value: 1.8, color: 'bg-warning' },
                { dept: 'Admin', value: 1.5, color: 'bg-muted-foreground' }
              ].map((item) => (
                <div key={item.dept}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{item.dept}</span>
                    <span className="font-mono text-xs">${item.value}M</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${(item.value / 4.2) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    ),
    'customer-analytics': (
      <div className="w-full h-[600px] bg-gradient-to-br from-success/10 via-card to-accent/10 p-8 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Customer Behavior Analytics</h2>
          <Badge className="bg-success/20 text-success border-success/30">Active Users: 142K</Badge>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Customers', value: '156K', icon: '👥' },
            { label: 'Avg LTV', value: '$2,840', icon: '💰' },
            { label: 'Retention', value: '87.3%', icon: '🔄' },
            { label: 'NPS Score', value: '72', icon: '⭐' }
          ].map((item) => (
            <Card key={item.label} className="p-4 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-2xl font-bold font-mono">{item.value}</p>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 flex-1">
          <Card className="p-4 bg-card/80 backdrop-blur-sm col-span-2">
            <h3 className="font-semibold mb-4">Customer Segmentation</h3>
            <div className="grid grid-cols-3 gap-3 h-[calc(100%-2rem)]">
              {[
                { segment: 'Champions', count: '24K', ltv: '$4.2K', color: 'bg-success' },
                { segment: 'Loyal', count: '38K', ltv: '$3.1K', color: 'bg-accent' },
                { segment: 'Potential', count: '42K', ltv: '$2.4K', color: 'bg-metric-purple' },
                { segment: 'At Risk', count: '28K', ltv: '$1.8K', color: 'bg-warning' },
                { segment: 'Hibernating', count: '18K', ltv: '$1.2K', color: 'bg-muted-foreground' },
                { segment: 'Lost', count: '6K', ltv: '$0.8K', color: 'bg-destructive/50' }
              ].map((item) => (
                <div key={item.segment} className={`${item.color} rounded-lg p-4 flex flex-col justify-between`}>
                  <div>
                    <p className="font-bold text-lg mb-1">{item.segment}</p>
                    <p className="text-sm opacity-90">{item.count} customers</p>
                  </div>
                  <p className="text-xs font-mono opacity-90">Avg LTV: {item.ltv}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-card/80 backdrop-blur-sm">
            <h3 className="font-semibold mb-4">Cohort Retention</h3>
            <div className="space-y-2">
              {[
                { month: 'Jan', r: [100, 85, 78, 72] },
                { month: 'Feb', r: [100, 87, 80] },
                { month: 'Mar', r: [100, 88] },
                { month: 'Apr', r: [100] }
              ].map((cohort) => (
                <div key={cohort.month} className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{cohort.month} 2025</p>
                  <div className="grid grid-cols-4 gap-1">
                    {cohort.r.map((rate, i) => (
                      <div 
                        key={i}
                        className="h-8 rounded flex items-center justify-center text-xs font-bold"
                        style={{ 
                          backgroundColor: `oklch(${rate > 90 ? 0.65 : rate > 80 ? 0.70 : rate > 70 ? 0.75 : 0.80} 0.15 ${rate > 90 ? 145 : rate > 80 ? 195 : rate > 70 ? 70 : 25})`,
                          opacity: 0.8
                        }}
                      >
                        {rate}%
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return screenshots[viz.id as keyof typeof screenshots] || screenshots['sales-dashboard']
}
