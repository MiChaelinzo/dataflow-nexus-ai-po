import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MagnifyingGlass, Function, Tag, Database, Sparkle, ArrowRight } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { SemanticMetric } from '@/lib/types'
import { useKV } from '@github/spark/hooks'

const mockSemanticMetrics: SemanticMetric[] = [
  {
    id: 'sm1',
    name: 'Total Revenue',
    description: 'Sum of all completed transaction amounts across all sales channels',
    formula: 'SUM(transactions.amount WHERE status = "completed")',
    category: 'Sales',
    dataSource: 'Sales Database',
    createdBy: 'admin@company.com',
    lastModified: Date.now() - 86400000,
    tags: ['revenue', 'sales', 'financial']
  },
  {
    id: 'sm2',
    name: 'Customer Lifetime Value',
    description: 'Average total revenue generated per customer over their entire relationship',
    formula: 'AVG(SUM(transactions.amount) GROUP BY customer_id)',
    category: 'Customer',
    dataSource: 'Customer Database',
    createdBy: 'analytics@company.com',
    lastModified: Date.now() - 172800000,
    tags: ['customer', 'ltv', 'revenue']
  },
  {
    id: 'sm3',
    name: 'Conversion Rate',
    description: 'Percentage of visitors who complete a purchase',
    formula: '(COUNT(DISTINCT purchases) / COUNT(DISTINCT visitors)) * 100',
    category: 'Marketing',
    dataSource: 'Analytics Stream',
    createdBy: 'marketing@company.com',
    lastModified: Date.now() - 259200000,
    tags: ['conversion', 'marketing', 'funnel']
  },
  {
    id: 'sm4',
    name: 'Monthly Recurring Revenue',
    description: 'Predictable revenue from active subscriptions normalized to monthly',
    formula: 'SUM(subscriptions.amount WHERE status = "active") / 12',
    category: 'Finance',
    dataSource: 'Subscription Database',
    createdBy: 'finance@company.com',
    lastModified: Date.now() - 345600000,
    tags: ['mrr', 'subscription', 'revenue']
  },
  {
    id: 'sm5',
    name: 'Churn Rate',
    description: 'Percentage of customers who stopped using the product in a given period',
    formula: '(COUNT(churned_customers) / COUNT(total_customers_start)) * 100',
    category: 'Customer',
    dataSource: 'Customer Database',
    createdBy: 'analytics@company.com',
    lastModified: Date.now() - 432000000,
    tags: ['churn', 'retention', 'customer']
  },
  {
    id: 'sm6',
    name: 'Net Promoter Score',
    description: 'Customer loyalty metric based on likelihood to recommend',
    formula: '(% Promoters - % Detractors) WHERE score >= 9 OR score <= 6',
    category: 'Customer',
    dataSource: 'Survey Database',
    createdBy: 'cx@company.com',
    lastModified: Date.now() - 518400000,
    tags: ['nps', 'satisfaction', 'loyalty']
  }
]

export function SemanticLayer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMetric, setSelectedMetric] = useKV<string | null>('selected-semantic-metric', null)
  const [isSearching, setIsSearching] = useState(false)

  const filteredMetrics = mockSemanticMetrics.filter(metric => 
    metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    metric.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    metric.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleNaturalQuery = async () => {
    if (!searchQuery) return
    setIsSearching(true)
    
    setTimeout(() => {
      const relevantMetrics = filteredMetrics.slice(0, 3)
      if (relevantMetrics.length > 0) {
        setSelectedMetric(relevantMetrics[0].id)
      }
      setIsSearching(false)
    }, 1000)
  }

  const selectedMetricData = mockSemanticMetrics.find(m => m.id === selectedMetric)

  const categories = Array.from(new Set(mockSemanticMetrics.map(m => m.category)))

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-metric-purple/20 flex items-center justify-center">
                <Function size={24} weight="duotone" className="text-metric-purple" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Semantic Data Layer</h2>
                <p className="text-sm text-muted-foreground">Business-friendly metrics with natural language queries</p>
              </div>
            </div>
          </div>
          <Badge className="bg-metric-purple/20 text-metric-purple border-metric-purple/30">
            {mockSemanticMetrics.length} Metrics Defined
          </Badge>
        </div>

        <Card className="p-6 bg-gradient-to-br from-card to-secondary/30">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlass 
                size={20} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              />
              <Input
                placeholder='Try: "show me revenue metrics" or "customer lifetime value"'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNaturalQuery()}
                className="pl-10 h-12 bg-background"
              />
            </div>
            <Button 
              onClick={handleNaturalQuery}
              disabled={!searchQuery || isSearching}
              size="lg"
              className="gap-2 bg-metric-purple text-white hover:bg-metric-purple/90"
            >
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkle size={20} />
                </motion.div>
              ) : (
                <Sparkle size={20} weight="fill" />
              )}
              Search
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Use natural language to search for metrics, or browse by category below
          </p>
        </Card>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Badge
            key={category}
            variant="outline"
            className="cursor-pointer hover:bg-metric-purple/10 hover:border-metric-purple transition-colors whitespace-nowrap"
          >
            {category}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {searchQuery ? 'Search Results' : 'All Metrics'}
          </h3>
          
          <AnimatePresence mode="popLayout">
            {filteredMetrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card 
                  className={`p-6 cursor-pointer transition-all hover:border-metric-purple/50 ${
                    selectedMetric === metric.id ? 'border-metric-purple bg-metric-purple/5' : ''
                  }`}
                  onClick={() => setSelectedMetric(metric.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Function size={20} weight="duotone" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{metric.name}</h4>
                        <p className="text-xs text-muted-foreground">{metric.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {metric.dataSource}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {metric.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {metric.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs bg-muted/50">
                        <Tag size={10} weight="fill" className="mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredMetrics.length === 0 && (
            <Card className="p-12 text-center border-dashed">
              <MagnifyingGlass size={48} weight="thin" className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No metrics found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or browse by category
              </p>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedMetricData ? (
            <motion.div
              key={selectedMetricData.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-4">Metric Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-semibold">{selectedMetricData.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{selectedMetricData.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Formula</p>
                    <div className="bg-secondary/50 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                      {selectedMetricData.formula}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Category</p>
                      <Badge variant="outline">{selectedMetricData.category}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Data Source</p>
                      <div className="flex items-center gap-1 text-xs">
                        <Database size={12} />
                        <span className="truncate">{selectedMetricData.dataSource}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Created By</p>
                    <p className="text-xs">{selectedMetricData.createdBy}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Modified</p>
                    <p className="text-xs">
                      {new Date(selectedMetricData.lastModified).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button className="w-full gap-2" variant="outline">
                      <ArrowRight size={16} />
                      Use in Dashboard
                    </Button>
                    <Button className="w-full gap-2" variant="outline">
                      <Function size={16} />
                      View Lineage
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <Card className="p-12 text-center border-dashed sticky top-6">
              <Function size={48} weight="thin" className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No metric selected</p>
              <p className="text-sm text-muted-foreground">
                Click on a metric to view its details
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
