import Image from "next/image"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = "", width = 200, height = 60 }: LogoProps) {
  return (
    <Image
      src="/emergency-alerts-logo.png"
      alt="Emergency Alerts - Professional Representation"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
