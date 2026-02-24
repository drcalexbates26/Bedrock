interface BarItem {
  l: string
  v: number
  d: string
  c?: string
}

interface BarsProps {
  items: BarItem[]
}

export default function Bars({ items }: BarsProps) {
  const mx = Math.max(...items.map(i => i.v), 1)
  return (
    <div>
      {items.map((it, i) => (
        <div className="rb" key={i}>
          <div className="rb-l">{it.l}</div>
          <div className="rb-t">
            <div className="rb-f" style={{ width: `${Math.max((it.v / mx) * 100, 8)}%`, background: it.c || 'var(--ac)' }}>
              {it.v}
            </div>
          </div>
          <div className="rb-c">{it.d}</div>
        </div>
      ))}
    </div>
  )
}
