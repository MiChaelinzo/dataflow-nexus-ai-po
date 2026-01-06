export interface RateLimiterConfig {
  maxRequests: number
  windowMs: number
}

export class RateLimiter {
  private requests: number[] = []
  private config: RateLimiterConfig

  constructor(config: RateLimiterConfig = { maxRequests: 10, windowMs: 60000 }) {
    this.config = config
  }

  canMakeRequest(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.config.windowMs)
    return this.requests.length < this.config.maxRequests
  }

  recordRequest(): void {
    this.requests.push(Date.now())
  }

  getTimeUntilNextRequest(): number {
    if (this.canMakeRequest()) return 0
    
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.config.windowMs)
    
    if (this.requests.length === 0) return 0
    
    const oldestRequest = Math.min(...this.requests)
    return Math.max(0, this.config.windowMs - (now - oldestRequest))
  }

  getRemainingRequests(): number {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.config.windowMs)
    return Math.max(0, this.config.maxRequests - this.requests.length)
  }

  reset(): void {
    this.requests = []
  }
}

export const llmRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60000
})

export function withRateLimit<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  limiter: RateLimiter = llmRateLimiter
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    if (!limiter.canMakeRequest()) {
      const waitTime = limiter.getTimeUntilNextRequest()
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`)
    }
    
    limiter.recordRequest()
    
    try {
      return await fn(...args)
    } catch (error: any) {
      if (error?.message?.includes('429') || error?.message?.toLowerCase().includes('rate limit')) {
        limiter.reset()
        throw new Error('API rate limit exceeded. Please wait 60 seconds before trying again.')
      }
      throw error
    }
  }
}
