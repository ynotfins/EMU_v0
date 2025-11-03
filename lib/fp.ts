export type DeviceFingerprint = {
  vendor: string
  confidence: number
  visitorId: string
  ua: string
}

function simpleHash(s: string): string {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return (h >>> 0).toString(16)
}

export async function getFingerprint(): Promise<DeviceFingerprint> {
  const ua = navigator.userAgent || ""
  const vendor = navigator.vendor || ""
  const token = process.env.NEXT_PUBLIC_FINGERPRINTJS_TOKEN
  if (token) {
    try {
      // dynamic import so the bundle doesn't include it if unused
      const fpjs = await import('@fingerprintjs/fingerprintjs-pro')
      const agent = await fpjs.load({ token })
      const result = await agent.get()
      return {
        vendor: 'fpjs-pro',
        confidence: result.confidence.score,
        visitorId: result.visitorId,
        ua,
      }
    } catch {
      /* fall through */
    }
  }
  // Fallback: hash UA + timezone + language
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  const lang = navigator.language || ''
  return {
    vendor: 'fallback-hash',
    confidence: 0.3,
    visitorId: simpleHash([ua, tz, lang].join('|')),
    ua,
  }
}

