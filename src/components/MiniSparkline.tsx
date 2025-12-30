import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface MiniSparklineProps {
  data: number[]
  trend: 'up' | 'down' | 'neutral'
}

export function MiniSparkline({ data, trend }: MiniSparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return
    
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    
    const width = svgRef.current.clientWidth
    const height = 40
    const margin = { top: 5, right: 0, bottom: 5, left: 0 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom
    
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth])
    
    const yScale = d3.scaleLinear()
      .domain([d3.min(data) || 0, d3.max(data) || 0])
      .range([innerHeight, 0])
    
    const line = d3.line<number>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX)
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    
    const area = d3.area<number>()
      .x((_, i) => xScale(i))
      .y0(innerHeight)
      .y1(d => yScale(d))
      .curve(d3.curveMonotoneX)
    
    const color = trend === 'up' ? 'oklch(0.65 0.15 145)' : 
                  trend === 'down' ? 'oklch(0.55 0.22 25)' : 
                  'oklch(0.70 0.15 195)'
    
    g.append('path')
      .datum(data)
      .attr('fill', color)
      .attr('opacity', 0.2)
      .attr('d', area)
    
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line)
      .attr('stroke-dasharray', function(this: SVGPathElement) {
        const length = this.getTotalLength()
        return `${length} ${length}`
      })
      .attr('stroke-dashoffset', function(this: SVGPathElement) {
        return this.getTotalLength()
      })
      .transition()
      .duration(600)
      .ease(d3.easeQuadOut)
      .attr('stroke-dashoffset', 0)
    
  }, [data, trend])
  
  return (
    <svg 
      ref={svgRef} 
      className="w-full h-10"
      style={{ overflow: 'visible' }}
    />
  )
}
