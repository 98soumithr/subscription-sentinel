interface CountdownRingProps {
  days: number
  size?: number
  strokeWidth?: number
}

export function CountdownRing({ days, size = 48, strokeWidth = 4 }: CountdownRingProps) {
  const maxDays = 30
  const clamped = Math.max(0, Math.min(days, maxDays))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = clamped / maxDays
  const dashOffset = circumference * (1 - progress)

  const color = days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : days <= 14 ? '#fb923c' : '#10b981'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(0,0,0,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="absolute text-[9px] font-bold leading-none text-center" style={{ color }}>
        {days < 0 ? 'OVR' : days === 0 ? 'NOW' : days > 99 ? '99+' : days}
      </span>
    </div>
  )
}
