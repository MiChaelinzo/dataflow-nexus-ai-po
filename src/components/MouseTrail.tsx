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

      trailPoints.current = trailPoints.current.filter(point => {
        const age = Date.now() - point.timestamp
        return age < 500
      })
    }

    const animate = () => {
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = Date.now()
      trailPoints.current.forEach((point, i) => {
        const age = now - point.timestamp
        const maxAge = 500
        const opacity = Math.max(0, 1 - age / maxAge)
        point.opacity = opacity

        if (i > 0) {
          const prevPoint = trailPoints.current[i - 1]
          const gradient = ctx.createLinearGradient(
            prevPoint.x,
            prevPoint.y,
            point.x,
            point.y
          )
          
          gradient.addColorStop(0, `rgba(112, 182, 246, ${prevPoint.opacity * 0.6})`)
          gradient.addColorStop(1, `rgba(153, 102, 255, ${point.opacity * 0.6})`)

          ctx.beginPath()
          ctx.strokeStyle = gradient
          ctx.lineWidth = 2
          ctx.lineCap = 'round'
          ctx.moveTo(prevPoint.x, prevPoint.y)
          ctx.lineTo(point.x, point.y)
          ctx.stroke()
        }
      })

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
      className="pointer-events-none fixed inset-0 z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

export default MouseTrail
