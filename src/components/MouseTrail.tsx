import { useEffect, useRef } from 'react'

interface TrailPoint {
  x: number
  y: number
  timestamp: number

 


    const canvas = canvasRef.current

    if (!ctx) return
    const resizeCanvas = () => {

      }
    resizeCanvas()
    const handleMouseMo

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    const animate 

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }

        x: e.clientX,
        return age < 
        timestamp: Date.now(),
        opacity: 1
        

        }
      
      a



      window.removeEventListener(

      }

  return (
      ref={canvasRef}

}



















          ctx.moveTo(point.x, point.y)
          ctx.lineTo(nextPoint.x, nextPoint.y)
          ctx.stroke()
        }

      
      ctx.globalAlpha = 1
      animationFrameId.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', resizeCanvas)



      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }

  }, [])

  return (

      ref={canvasRef}


  )

