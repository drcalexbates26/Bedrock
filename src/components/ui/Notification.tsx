import { useEffect } from 'react'
import { IC, ic } from './Icons'

interface NotifProps {
  msg: string
  type: string
  onClose: () => void
}

export default function Notification({ msg, type, onClose }: NotifProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const iconMap: Record<string, typeof IC.Check> = {
    success: IC.Check,
    error: IC.Warn,
    warning: IC.Warn,
    info: IC.Sparkle,
  }
  const Icon = iconMap[type] || IC.Check

  return (
    <div className={`notif ${type}`}>
      {ic(Icon, 16)}
      <span style={{ fontSize: 13, flex: 1 }}>{msg}</span>
      <button className="modal-close" style={{ fontSize: 14 }} onClick={onClose}>×</button>
    </div>
  )
}
