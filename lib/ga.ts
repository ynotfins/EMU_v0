export function gaEvent(name: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return
  // only if GA ID configured
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return
  ;(window as any).dataLayer = (window as any).dataLayer || []
  ;(window as any).dataLayer.push({ event: name, ...params })
}

