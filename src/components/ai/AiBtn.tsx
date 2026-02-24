import { IC, ic } from '../ui/Icons'

interface AiBtnProps {
  onClick: () => void
  label?: string
}

export default function AiBtn({ onClick, label }: AiBtnProps) {
  return (
    <span className="inline-ai" onClick={onClick}>
      {ic(IC.Sparkle)} {label || "AI"}
    </span>
  )
}
