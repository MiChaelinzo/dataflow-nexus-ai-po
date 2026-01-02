import { useEffect, useRef } from 'react'

interface TrailPoint {
  x: number
  y: number
  timestamp: number
  opacity: number
}

export function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailPoints = useRef<TrailPoint[]>([])
  const mousePos = useRef({ x: 0, y: 0 })
  const animationFrameId = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    resizeCanvas()

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      trailPoints.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
        opacity: 1
      })

      if (trailPoints.current.length > 30) {
        trailPoints.current.shift()
      }
    }

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = Date.now()
      const maxAge = 600

      trailPoints.current = trailPoints.current.filter(point => {
        const age = now - point.timestamp
        return age < maxAge
      })

      if (trailPoints.current.length > 1) {
        ctx.strokeStyle = 'oklch(0.70 0.15 195)'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        for (let i = 0; i < trailPoints.current.length - 1; i++) {
          const point = trailPoints.current[i]
          const nextPoint = trailPoints.current[i + 1]
          const age = now - point.timestamp
          const opacity = Math.max(0, 1 - age / maxAge)
          
          ctx.globalAlpha = opacity * 0.6
          
          ctx.beginPath()
          ctx.moveTo(point.x, point.y)
          ctx.lineTo(nextPoint.x, nextPoint.y)
          ctx.stroke()
        }
      }
      
      ctx.globalAlpha = 1
      animationFrameId.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', resizeCanvas)
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  )
}
