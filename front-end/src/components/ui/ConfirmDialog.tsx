import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

interface Props {
  open: boolean
  title?: string
  message?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open, title = 'Confirmar exclusão', message = 'Essa ação não pode ser desfeita.',
  loading, onConfirm, onCancel,
}: Props) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center">
          <AlertTriangle size={24} className="text-rose-400" />
        </div>
        <p className="text-gray-400 text-sm">{message}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Excluir'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
