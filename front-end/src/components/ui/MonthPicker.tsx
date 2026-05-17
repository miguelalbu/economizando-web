import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { MonthValue, prevMonth, nextMonth, isCurrentMonth, nowMonth } from '../../utils/monthFilter'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

interface Props {
  value: MonthValue
  onChange: (v: MonthValue) => void
}

export default function MonthPicker({ value, onChange }: Props) {
  const isCurrent = isCurrentMonth(value)

  return (
    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-1 py-1">
      <button
        onClick={() => onChange(prevMonth(value))}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
      >
        <ChevronLeft size={15} />
      </button>

      <span className="text-white text-sm font-medium px-2 min-w-[140px] text-center select-none">
        {MONTHS[value.month - 1]} {value.year}
      </span>

      <button
        onClick={() => onChange(nextMonth(value))}
        disabled={isCurrent}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={15} />
      </button>

      {!isCurrent && (
        <button
          onClick={() => onChange(nowMonth())}
          title="Voltar ao mês atual"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 transition-all ml-0.5"
        >
          <RotateCcw size={13} />
        </button>
      )}
    </div>
  )
}
