import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { ChartDataPoint } from '@/lib/types'
import { Card } from '@/components/ui/card'

interface TimeSeriesChartProps {
  data: ChartDataPoint[]
  title: string
  color?: string
}

export function TimeSeriesChart({ data, title, color = 'oklch(0.70 0.15 195)' }: TimeSeriesChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return
    
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    
    const containerWidth = containerRef.current.clientWidth
    const margin = { top: 20, right: 20, bottom: 40, left: 60 }
    const width = containerWidth - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom
    
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, width])
    
    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.value) || 0, d3.max(data, d => d.value) || 0])
      .nice()
      .range([height, 0])
    
    const line = d3.line<ChartDataPoint>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX)
    
    const area = d3.area<ChartDataPoint>()
      .x((_, i) => xScale(i))
      .y0(height)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX)
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickValues(d3.range(0, data.length, Math.ceil(data.length / 8)))
        .tickFormat(i => data[Number(i)]?.label || ''))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .attr('fill', 'oklch(0.65 0.02 240)')
      .style('font-size', '11px')
    
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
    
    g.append('path')
      .datum(data)
      .attr('fill', color)
      .attr('opacity', 0.15)
      .attr('d', area)
      .attr('transform', 'translate(0,0) scale(1,0)')
      .transition()
      .duration(800)
      .ease(d3.easeQuadOut)
      .attr('transform', 'translate(0,0) scale(1,1)')
    
    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('d', line)
    
    const length = path.node()?.getTotalLength() || 0
    path
      .attr('stroke-dasharray', `${length} ${length}`)
      .attr('stroke-dashoffset', length)
      .transition()
      .duration(1000)
      .ease(d3.easeQuadOut)
      .attr('stroke-dashoffset', 0)
    
    const tooltip = d3.select(containerRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'oklch(0.20 0.015 240)')
      .style('color', 'oklch(0.95 0.01 240)')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('border', '1px solid oklch(0.30 0.02 240)')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '10')
    
    g.selectAll('.dot')
      .data(data)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', (_, i) => xScale(i))
      .attr('cy', d => yScale(d.value))
      .attr('r', 0)
      .attr('fill', color)
      .attr('stroke', 'oklch(0.95 0.01 240)')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 6)
        
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div style="font-weight: 600; margin-bottom: 4px;">${d.label}</div>
            <div style="font-family: 'JetBrains Mono', monospace;">
              ${d.value.toLocaleString()}
            </div>
          `)
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', `${event.pageY - containerRef.current!.offsetTop - 50}px`)
          .style('left', `${event.pageX - containerRef.current!.offsetLeft + 10}px`)
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 0)
        
        tooltip.style('visibility', 'hidden')
      })
    
    return () => {
      tooltip.remove()
    }
  }, [data, color])
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div ref={containerRef} className="relative w-full">
        <svg 
          ref={svgRef} 
          className="w-full"
          height="300"
        />
      </div>
    </Card>
  )
}
