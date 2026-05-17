export interface MonthValue { year: number; month: number }

export function nowMonth(): MonthValue {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export function prevMonth(v: MonthValue): MonthValue {
  return v.month === 1 ? { year: v.year - 1, month: 12 } : { year: v.year, month: v.month - 1 }
}

export function nextMonth(v: MonthValue): MonthValue {
  return v.month === 12 ? { year: v.year + 1, month: 1 } : { year: v.year, month: v.month + 1 }
}

export function isCurrentMonth(v: MonthValue): boolean {
  const n = nowMonth()
  return v.year === n.year && v.month === n.month
}

export function filterByMonth<T extends Record<string, any>>(
  items: T[],
  dateKey: keyof T,
  { year, month }: MonthValue,
): T[] {
  return items.filter(item => {
    const raw = item[dateKey] as string | null
    if (!raw) return false
    const d = new Date(raw + 'T00:00:00')
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })
}
