import { SessionRecording } from './session-replay'

export interface ShareOptions {
  includeAnnotations?: boolean
  includeBookmarks?: boolean
  password?: string
  expiresIn?: '1hour' | '24hours' | '7days' | '30days'
}

export interface SharedReplayData {
  shareId: string
  recording: SessionRecording
  options: ShareOptions
  createdAt: number
  expiresAt?: number
  password?: string
  views: number
}

export async function generateShareableId(recordingId: string): Promise<string> {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  return `share-${recordingId}-${timestamp}-${random}`
}

function calculateExpirationTime(expiresIn: ShareOptions['expiresIn']): number | undefined {
  if (!expiresIn) return undefined
  
  const now = Date.now()
  const durations = {
    '1hour': 60 * 60 * 1000,
    '24hours': 24 * 60 * 60 * 1000,
    '7days': 7 * 24 * 60 * 60 * 1000,
    '30days': 30 * 24 * 60 * 60 * 1000
  }
  
  return now + durations[expiresIn]
}

export async function exportReplayAsShareableLink(
  recording: SessionRecording,
  shareId: string,
  options: ShareOptions = {}
): Promise<string> {
  const sanitizedRecording: SessionRecording = {
    ...recording,
    annotations: options.includeAnnotations ? recording.annotations : undefined,
    bookmarks: options.includeBookmarks ? recording.bookmarks : undefined
  }

  const sharedData: SharedReplayData = {
    shareId,
    recording: sanitizedRecording,
    options,
    createdAt: Date.now(),
    expiresAt: calculateExpirationTime(options.expiresIn),
    password: options.password,
    views: 0
  }

  await (window.spark as any).kv.set(`shared-replay-${shareId}`, sharedData)
  
  const baseUrl = window.location.origin
  return `${baseUrl}?replay=${shareId}`
}

export function exportReplayData(
  recording: SessionRecording,
  options: { includeAnnotations?: boolean; includeBookmarks?: boolean } = {}
): SessionRecording {
  return {
    ...recording,
    annotations: options.includeAnnotations ? recording.annotations : undefined,
    bookmarks: options.includeBookmarks ? recording.bookmarks : undefined
  }
}

export async function getSharedReplay(shareId: string): Promise<SharedReplayData | null> {
  const data: SharedReplayData | undefined = await (window.spark as any).kv.get(`shared-replay-${shareId}`)
  
  if (!data) return null
  
  if (data.expiresAt && data.expiresAt < Date.now()) {
    await (window.spark as any).kv.delete(`shared-replay-${shareId}`)
    return null
  }
  
  return data
}

export async function incrementReplayViews(shareId: string): Promise<void> {
  const data = await getSharedReplay(shareId)
  if (!data) return
  
  data.views += 1
  await (window.spark as any).kv.set(`shared-replay-${shareId}`, data)
}

export async function verifyReplayPassword(shareId: string, password: string): Promise<boolean> {
  const data = await getSharedReplay(shareId)
  if (!data) return false
  
  return data.password === password
}

export interface ExportVideoOptions {
  includeAnnotations?: boolean
  includeBookmarks?: boolean
  includeCursors?: boolean
  quality?: 'low' | 'medium' | 'high'
  fps?: 30 | 60
}

export async function exportReplayAsVideo(
  recording: SessionRecording,
  options: ExportVideoOptions = {}
): Promise<Blob> {
  throw new Error('Video export is not yet implemented')
}
