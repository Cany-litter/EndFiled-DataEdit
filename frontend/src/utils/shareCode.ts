import type { TimelineExport } from '../engine/types/timeline'

/**
 * Encode timeline data to a shareable URL-safe string.
 * Format: base64url(JSON.stringify(data))
 */
export function encodeShareCode(data: TimelineExport): string {
  try {
    const json = JSON.stringify(data)
    const encoded = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    return encoded
  } catch {
    return ''
  }
}

/**
 * Decode a share code string back to timeline data.
 */
export function decodeShareCode(code: string): TimelineExport | null {
  try {
    const base64 = code.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const json = decodeURIComponent(escape(atob(padded)))
    return JSON.parse(json)
  } catch {
    return null
  }
}
