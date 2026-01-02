import { useEffect, useRef } from 'react'

interface TrailPoint {
  x: number
  y: number
  timestamp: number
  opacity: number
}

export function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const trailPoints = useRef<TrailPoint[]>([])
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const animationFrameId = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

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
          
          const gradient = ctx.createLinearGradient(
            point.x, point.y,
            nextPoint.x, nextPoint.y
          )
          gradient.addColorStop(0, `oklch(0.70 0.15 195 / ${opacity * 0.3})`)
          gradient.addColorStop(1, `oklch(0.60 0.18 290 / ${opacity * 0.5})`)
          
          ctx.strokeStyle = gradient
          
          ctx.beginPath()
          ctx.moveTo(point.x, point.y)
          ctx.lineTo(nextPoint.x, nextPoint.y)
          ctx.stroke()
        }

        trailPoints.current.forEach((point, index) => {
          const age = now - point.timestamp
          const opacity = Math.max(0, 1 - age / maxAge)
          const size = 6 * opacity * (index / trailPoints.current.length)
          
          ctx.globalAlpha = opacity * 0.4
          
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, size
          )
          gradient.addColorStop(0, `oklch(0.70 0.15 195 / ${opacity * 0.6})`)
          gradient.addColorStop(0.5, `oklch(0.60 0.18 290 / ${opacity * 0.3})`)
          gradient.addColorStop(1, 'transparent')
          
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      ctx.globalAlpha = 1

      animationFrameId.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
