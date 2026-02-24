interface BadgeProps {
  value: string
  type?: string
}

const colorMap: Record<string, { bg: string; color: string }> = {
  Critical: { bg: 'rgba(248,113,113,.15)', color: '#F87171' },
  High: { bg: 'rgba(248,113,113,.15)', color: '#F87171' },
  Medium: { bg: 'rgba(251,191,36,.15)', color: '#FBBF24' },
  Low: { bg: 'rgba(96,165,250,.15)', color: '#60A5FA' },
  Active: { bg: 'rgba(52,211,153,.15)', color: '#34D399' },
  Complete: { bg: 'rgba(52,211,153,.15)', color: '#34D399' },
  Current: { bg: 'rgba(52,211,153,.15)', color: '#34D399' },
  Resolved: { bg: 'rgba(52,211,153,.15)', color: '#34D399' },
  Closed: { bg: 'rgba(138,155,181,.15)', color: '#8A9BB5' },
  'In Progress': { bg: 'rgba(251,191,36,.15)', color: '#FBBF24' },
  Pending: { bg: 'rgba(138,155,181,.15)', color: '#8A9BB5' },
  Upcoming: { bg: 'rgba(96,165,250,.15)', color: '#60A5FA' },
  Open: { bg: 'rgba(251,191,36,.15)', color: '#FBBF24' },
  'Same Day': { bg: 'rgba(248,113,113,.15)', color: '#F87171' },
  '1 Day': { bg: 'rgba(251,191,36,.15)', color: '#FBBF24' },
  '2-5 Days': { bg: 'rgba(52,211,153,.15)', color: '#34D399' },
  '6+ Days': { bg: 'rgba(96,165,250,.15)', color: '#60A5FA' },
  'Tier 1': { bg: 'rgba(248,113,113,.15)', color: '#F87171' },
  'Tier 2': { bg: 'rgba(96,165,250,.15)', color: '#60A5FA' },
  Standard: { bg: 'rgba(138,155,181,.15)', color: '#8A9BB5' },
  info: { bg: 'rgba(0,240,255,.12)', color: '#00F0FF' },
}

export default function Badge({ value, type }: BadgeProps) {
  const style = colorMap[type || ''] || colorMap[value] || { bg: 'rgba(138,155,181,.12)', color: '#8A9BB5' }
  return (
    <span className="badge" style={{ background: style.bg, color: style.color }}>
      {value}
    </span>
  )
}
