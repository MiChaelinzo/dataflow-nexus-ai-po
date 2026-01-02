import { useEffect, useRef } from 'react'

  y: number
  opacity: 
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

    }
    resizeCanvas()

      mousePos.current = { x: e.
      trailPoints.current.push({
        y: e.clientY,
     

        trailPoint
    }



      
      trailPoints.current = trai
        return age < 

        ctx.strokeStyle = 'okl
        ctx.lineCa
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
          
          ctx.beginPath()
          
      }
      ctx.
      animationFrameId.cu

    animate()
    return () => {
      win

    }

    <canvas
      className="fixed inset-0 pointer-events-none z-50"
    />
}









































