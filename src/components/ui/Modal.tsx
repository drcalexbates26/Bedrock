import type { ReactNode } from 'react'
import { IC, ic } from './Icons'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  size?: 'lg'
}

export default function Modal({ title, onClose, children, size }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${size === 'lg' ? 'lg' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>{ic(IC.X, 15)}</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
