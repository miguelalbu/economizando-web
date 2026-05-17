import { useState } from 'react'
import { TrendingUp, TrendingDown, FileText, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import MonthPicker from '../ui/MonthPicker'
import { nowMonth, filterByMonth, MonthValue } from '../../utils/monthFilter'

const fmt     = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

const PAYMENT_LABELS: Record<string, string> = { cash: 'Dinheiro', pix: 'Pix', debit: 'Débito', credit_card: 'Cartão' }
const INVESTMENT_LABELS: Record<string, string> = { fixed_income: 'Renda Fixa', variable_income: 'Renda Variável', crypto: 'Cripto', savings: 'Poupança', pension: 'Previdência', other: 'Outro' }
const STATUS_VALUE_CLS: Record<string, string> = { pending: 'text-amber-400', paid: 'text-emerald-400', overdue: 'text-rose-400' }

const colorMap: Record<string, { icon: string; border: string }> = {
  primary: { icon: 'bg-primary-600/20 text-primary-400', border: 'border-primary-500/20' },
  emerald: { icon: 'bg-emerald-600/20 text-emerald-400', border: 'border-emerald-500/20' },
  rose:    { icon: 'bg-rose-600/20 text-rose-400',       border: 'border-rose-500/20' },
  amber:   { icon: 'bg-amber-600/20 text-amber-400',     border: 'border-amber-500/20' },
  violet:  { icon: 'bg-violet-600/20 text-violet-400',   border: 'border-violet-500/20' },
}

export default function HomeSection() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { incomes: rawIncomes, expenses: rawExpenses, bills: rawBills, investments, loading } = useData()
  const [selectedMonth, setSelectedMonth] = useState<MonthValue>(nowMonth)

  const incomes  = filterByMonth(rawIncomes,  'received_at', selectedMonth)
  const expenses = filterByMonth(rawExpenses, 'spent_at',    selectedMonth)
  const bills    = filterByMonth(rawBills,    'due_date',    selectedMonth)

  const totalInvested = investments.reduce((s, i) => s + Number(i.net_invested), 0)

  const monthDeposits = investments.flatMap(inv =>
    inv.transactions
      .filter(tx => {
        if (tx.type !== 'deposit') return false
        const [y, m] = tx.transaction_date.split('-').map(Number)
        return y === selectedMonth.year && m === selectedMonth.month
      })
      .map(tx => ({ id: `${inv.id}-${tx.id}`, invName: inv.name, invType: inv.type, amount: Number(tx.amount), date: tx.transaction_date }))
  ).sort((a, b) => b.date.localeCompare(a.date))

  const totalIncome   = incomes.reduce((s, i) => s + Number(i.amount), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const totalBills    = bills.filter(b => b.status === 'pending').reduce((s, b) => s + Number(b.amount), 0)
  const balance       = totalIncome - totalExpenses - totalBills

  const summaryCards = [
    { label: 'Saldo do mês',   value: balance,       icon: Wallet,       color: balance >= 0 ? 'emerald' : 'rose', trend: balance >= 0,  nav: null as string | null },
    { label: 'Ganhos',         value: totalIncome,   icon: TrendingUp,   color: 'primary', trend: true,  nav: '/ganhos' },
    { label: 'Gastos',         value: totalExpenses, icon: TrendingDown, color: 'rose',    trend: false, nav: '/gastos' },
    { label: 'Boletos pend.',  value: totalBills,    icon: FileText,     color: 'amber',   trend: false, nav: '/boletos' },
    { label: 'Total investido',value: totalInvested, icon: PiggyBank,    color: 'violet',  trend: true,  nav: '/investimentos' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        {user?.income_day && (
          <p className="text-gray-600 text-xs">Ciclo: dia {user.income_day} de cada mês</p>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
            {summaryCards.map(({ label, value, icon: Icon, color, trend, nav }) => (
              <button
                key={label}
                onClick={() => nav && navigate(nav)}
                className={`glass rounded-2xl p-4 border ${colorMap[color].border} text-left transition-all ${nav ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color].icon}`}>
                    <Icon size={16} />
                  </div>
                  {trend ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-rose-500" />}
                </div>
                <p className="text-gray-500 text-xs mb-1">{label}</p>
                <p className={`text-lg font-bold ${value < 0 ? 'text-rose-400' : 'text-white'}`}>{fmt(value)}</p>
              </button>
            ))}
          </div>

          {/* Quick lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickList title="Últimos Ganhos" onSeeAll={() => navigate('/ganhos')} empty={incomes.length === 0} emptyMsg="Nenhum ganho neste mês">
              {incomes.slice(0, 4).map(i => (
                <Row key={i.id} title={i.description} sub={fmtDate(i.received_at)} value={fmt(Number(i.amount))} valueClass="text-emerald-400" />
              ))}
            </QuickList>

            <QuickList title="Últimos Gastos" onSeeAll={() => navigate('/gastos')} empty={expenses.length === 0} emptyMsg="Nenhum gasto neste mês">
              {expenses.slice(0, 4).map(e => (
                <Row key={e.id} title={e.description} sub={`${fmtDate(e.spent_at)} · ${PAYMENT_LABELS[e.payment_method] ?? e.payment_method}`} value={`-${fmt(Number(e.amount))}`} valueClass="text-rose-400" />
              ))}
            </QuickList>

            <QuickList title="Boletos Pendentes" onSeeAll={() => navigate('/boletos')} empty={bills.filter(b => b.status === 'pending').length === 0} emptyMsg="Nenhum boleto pendente neste mês">
              {bills.filter(b => b.status === 'pending').slice(0, 4).map(b => (
                <Row key={b.id} title={b.description} sub={`Vence em ${fmtDate(b.due_date)}`} value={fmt(Number(b.amount))} valueClass={STATUS_VALUE_CLS[b.status]} />
              ))}
            </QuickList>

            <QuickList title="Aportes do mês" onSeeAll={() => navigate('/investimentos')} empty={monthDeposits.length === 0} emptyMsg="Nenhum aporte neste mês">
              {monthDeposits.slice(0, 4).map(d => (
                <Row key={d.id} title={d.invName} sub={`${INVESTMENT_LABELS[d.invType] ?? d.invType} · ${fmtDate(d.date)}`} value={fmt(d.amount)} valueClass="text-violet-400" />
              ))}
            </QuickList>
          </div>
        </>
      )}
    </div>
  )
}

function QuickList({ title, onSeeAll, empty, emptyMsg, children }: { title: string; onSeeAll: () => void; empty: boolean; emptyMsg: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <button onClick={onSeeAll} className="text-primary-400 text-xs hover:text-primary-300 transition-colors">Ver todos</button>
      </div>
      {empty
        ? <p className="text-gray-700 text-sm text-center py-4">{emptyMsg}</p>
        : <ul className="space-y-1">{children}</ul>}
    </div>
  )
}

function Row({ title, sub, value, valueClass }: { title: string; sub: string; value: string; valueClass: string }) {
  return (
    <li className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="min-w-0 mr-4">
        <p className="text-white text-sm truncate">{title}</p>
        <p className="text-gray-600 text-xs truncate">{sub}</p>
      </div>
      <span className={`font-semibold text-sm shrink-0 ${valueClass}`}>{value}</span>
    </li>
  )
}
