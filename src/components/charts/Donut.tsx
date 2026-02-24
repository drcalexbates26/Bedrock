interface DonutData {
  l: string
  v: number
  c: string
}

interface DonutProps {
  data: DonutData[]
  size?: number
}

export default function Donut({ data, size = 120 }: DonutProps) {
  const total = data.reduce((s, d) => s + d.v, 0)
  if (!total) return <div className="tc t3" style={{ padding: 16 }}>No data</div>

  const r = size / 2 - 10
  const cx = size / 2
  const cy = size / 2
  let cum = 0

  const paths = data.map((d, i) => {
    if (!d.v) return null
    const s = cum
    cum += d.v / total
    const sa = s * 2 * Math.PI - Math.PI / 2
    const ea = cum * 2 * Math.PI - Math.PI / 2
    const la = d.v / total > .5 ? 1 : 0
    const ir = r * .55
    return (
      <path
        key={i}
        d={`M ${cx + r * Math.cos(sa)} ${cy + r * Math.sin(sa)} A ${r} ${r} 0 ${la} 1 ${cx + r * Math.cos(ea)} ${cy + r * Math.sin(ea)} L ${cx + ir * Math.cos(ea)} ${cy + ir * Math.sin(ea)} A ${ir} ${ir} 0 ${la} 0 ${cx + ir * Math.cos(sa)} ${cy + ir * Math.sin(sa)} Z`}
        fill={d.c}
      />
    )
  })

  return (
    <div className="donut">
      <svg width={size} height={size}>
        {paths}
        <text x={cx} y={cy} textAnchor="middle" dy="5" fill="var(--tx)" fontSize="17" fontWeight="700" fontFamily="var(--mono)">{total}</text>
      </svg>
      <div className="dleg">
        {data.map((d, i) => (
          <div key={i} className="dli">
            <div className="dld" style={{ background: d.c }} />
            <span className="t2">{d.l}</span>
            <span className="mono fw6" style={{ marginLeft: 'auto' }}>{d.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
