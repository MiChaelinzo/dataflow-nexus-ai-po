import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { PredictionData } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PredictionChartProps {
  data: PredictionData
  title: string
}

export function PredictionChart({ data, title }: PredictionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return
    
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    
    const containerWidth = containerRef.current.clientWidth
    const margin = { top: 20, right: 20, bottom: 40, left: 60 }
    const width = containerWidth - margin.left - margin.right
    const height = 350 - margin.top - margin.bottom
    
    const allData = [...data.historical, ...data.forecast]
    const allValues = [
      ...allData.map(d => d.value),
      ...data.confidence.upper.map(d => d.value),
      ...data.confidence.lower.map(d => d.value)
    ]
    
    const xScale = d3.scaleLinear()
      .domain([0, allData.length - 1])
      .range([0, width])
    
    const yScale = d3.scaleLinear()
      .domain([d3.min(allValues) || 0, d3.max(allValues) || 0])
      .nice()
      .range([height, 0])
    
    const historicalLine = d3.line<typeof data.historical[0]>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX)
    
    const forecastLine = d3.line<typeof data.forecast[0]>()
      .x((_, i) => xScale(data.historical.length - 1 + i))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX)
    
    const confidenceArea = d3.area<typeof data.confidence.upper[0]>()
      .x((_, i) => xScale(data.historical.length - 1 + i))
      .y0((_, i) => yScale(data.confidence.lower[i].value))
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX)
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickValues(d3.range(0, allData.length, Math.ceil(allData.length / 10)))
        .tickFormat(i => allData[Number(i)]?.label || ''))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .attr('fill', 'oklch(0.65 0.02 240)')
      .style('font-size', '10px')
    
    g.append('g')
      .call(d3.axisLeft(yScale)
        .ticks(6)
        .tickFormat(d => {
          const num = Number(d)
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
          if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
          return num.toString()
        }))
      .selectAll('text')
      .attr('fill', 'oklch(0.65 0.02 240)')
      .style('font-size', '12px')
    
    g.selectAll('.domain, .tick line')
      .attr('stroke', 'oklch(0.30 0.02 240)')
    
    const divider = xScale(data.historical.length - 1)
    g.append('line')
      .attr('x1', divider)
      .attr('x2', divider)
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'oklch(0.65 0.02 240)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
    
    g.append('path')
      .datum(data.confidence.upper)
      .attr('fill', 'oklch(0.60 0.18 290)')
      .attr('opacity', 0.2)
      .attr('d', confidenceArea)
    
    g.append('path')
      .datum(data.historical)
      .attr('fill', 'none')
      .attr('stroke', 'oklch(0.70 0.15 195)')
      .attr('stroke-width', 3)
      .attr('d', historicalLine)
    
    const forecastPath = g.append('path')
      .datum(data.forecast)
      .attr('fill', 'none')
      .attr('stroke', 'oklch(0.60 0.18 290)')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '8,4')
      .attr('d', forecastLine)
    
    const length = forecastPath.node()?.getTotalLength() || 0
    forecastPath
      .attr('stroke-dasharray', `${length} ${length}`)
      .attr('stroke-dashoffset', length)
      .transition()
      .duration(1200)
      .ease(d3.easeQuadOut)
      .attr('stroke-dasharray', '8,4')
      .attr('stroke-dashoffset', 0)
    
  }, [data])
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-accent" />
            <span className="text-xs text-muted-foreground">Historical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-metric-purple" style={{ backgroundImage: 'repeating-linear-gradient(90deg, oklch(0.60 0.18 290), oklch(0.60 0.18 290) 8px, transparent 8px, transparent 12px)' }} />
            <span className="text-xs text-muted-foreground">Forecast</span>
          </div>
          <Badge variant="outline" className="text-xs bg-metric-purple/10 border-metric-purple/30 text-metric-purple">
            14-day prediction
          </Badge>
        </div>
      </div>
      <div ref={containerRef} className="relative w-full">
        <svg 
          ref={svgRef} 
          className="w-full"
          height="350"
        />
      </div>
    </Card>
  )
}
