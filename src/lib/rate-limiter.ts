export interface RateLimiterConfig {
  maxRequests: number
  windowMs: number
  minDelayBetweenRequests?: number
}

export class RateLimiter {
  private requests: number[] = []
  private config: RateLimiterConfig
  private lastRequestTime: number = 0
  private pendingQueue: Array<() => void> = []
  private isProcessingQueue: boolean = false

  constructor(config: RateLimiterConfig = { maxRequests: 10, windowMs: 60000, minDelayBetweenRequests: 2000 }) {
    this.config = config
  }

  canMakeRequest(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.config.windowMs)
    
    const hasCapacity = this.requests.length < this.config.maxRequests
    const hasMinDelay = !this.config.minDelayBetweenRequests || 
                        (now - this.lastRequestTime) >= this.config.minDelayBetweenRequests
    
    return hasCapacity && hasMinDelay
  }

  recordRequest(): void {
    const now = Date.now()
    this.requests.push(now)
    this.lastRequestTime = now
  }

  getTimeUntilNextRequest(): number {
    if (this.canMakeRequest()) return 0
    
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.config.windowMs)
    
    let timeToWait = 0
    
    if (this.requests.length >= this.config.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      timeToWait = Math.max(timeToWait, this.config.windowMs - (now - oldestRequest))
    }
    
    if (this.config.minDelayBetweenRequests) {
      const timeSinceLastRequest = now - this.lastRequestTime
      timeToWait = Math.max(timeToWait, this.config.minDelayBetweenRequests - timeSinceLastRequest)
    }
    
    return Math.max(0, timeToWait)
  }

  getRemainingRequests(): number {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.config.windowMs)
    return Math.max(0, this.config.maxRequests - this.requests.length)
  }

  reset(): void {
    this.requests = []
    this.lastRequestTime = 0
  }

  async waitForAvailability(): Promise<void> {
    const waitTime = this.getTimeUntilNextRequest()
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  async enqueueRequest<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.pendingQueue.push(async () => {
        try {
          await this.waitForAvailability()
          this.recordRequest()
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      
      if (!this.isProcessingQueue) {
        this.processQueue()
      }
    })
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.pendingQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.pendingQueue.length > 0) {
      const request = this.pendingQueue.shift()
      if (request) {
        await request()
      }
    }

    this.isProcessingQueue = false
  }
}

export const llmRateLimiter = new RateLimiter({
  maxRequests: 8,
  windowMs: 60000,
  minDelayBetweenRequests: 3000
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
