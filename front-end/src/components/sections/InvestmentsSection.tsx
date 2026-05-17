import { useState, useEffect, FormEvent } from 'react'
import { Plus, Pencil, Trash2, PiggyBank, History, ArrowDownCircle, ArrowUpCircle, X } from 'lucide-react'
import api from '../../services/api'
import { useData, type Investment } from '../../context/DataContext'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import { Input, Select, Textarea, FormActions } from '../ui/FormField'

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPES = [
  { value: 'fixed_income',    label: 'Renda Fixa' },
  { value: 'variable_income', label: 'Renda Variável' },
  { value: 'crypto',          label: 'Criptomoedas' },
  { value: 'savings',         label: 'Poupança' },
  { value: 'pension',         label: 'Previdência' },
  { value: 'other',           label: 'Outros' },
]

const TYPE_COLOR: Record<string, string> = {
  fixed_income:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  variable_income: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  crypto:          'text-orange-400 bg-orange-500/10 border-orange-500/20',
  savings:         'text-teal-400 bg-teal-500/10 border-teal-500/20',
  pension:         'text-violet-400 bg-violet-500/10 border-violet-500/20',
  other:           'text-gray-400 bg-gray-500/10 border-gray-500/20',
}

const emptyInv = { name: '', type: 'fixed_income', current_value: '', maturity_date: '', institution: '', notes: '' }
const emptyTx  = { type: 'deposit' as 'deposit' | 'withdrawal', amount: '', transaction_date: new Date().toISOString().split('T')[0], notes: '' }

const fmt      = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const fmtDate  = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
const typeLabel = (v: string) => TYPES.find(t => t.value === v)?.label ?? v

// ── Main Component ────────────────────────────────────────────────────────────

export default function InvestmentsSection() {
  const { investments: items, loading: fetching, refresh } = useData()

  // Modais de investimento
  const [invModal, setInvModal]       = useState(false)
  const [editing, setEditing]         = useState<Investment | null>(null)
  const [deleteId, setDeleteId]       = useState<number | null>(null)
  const [invForm, setInvForm]         = useState(emptyInv)
  const [savingInv, setSavingInv]     = useState(false)
  const [deletingInv, setDeletingInv] = useState(false)
  const [invError, setInvError]       = useState('')

  // Painel de histórico
  const [histInvestment, setHistInvestment] = useState<Investment | null>(null)
  const [txForm, setTxForm]         = useState(emptyTx)
  const [showTxForm, setShowTxForm] = useState(false)
  const [savingTx, setSavingTx]     = useState(false)
  const [deletingTx, setDeletingTx] = useState<number | null>(null)
  const [txError, setTxError]       = useState('')

  // Mantém histInvestment sincronizado quando os dados do contexto atualizam
  useEffect(() => {
    if (histInvestment) {
      const updated = items.find(i => i.id === histInvestment.id)
      if (updated) setHistInvestment(updated)
    }
  }, [items])

  // ── Investment CRUD ──────────────────────────────────────────────────────

  function openCreate() { setEditing(null); setInvForm(emptyInv); setInvError(''); setInvModal(true) }

  function openEdit(item: Investment) {
    setEditing(item)
    setInvForm({
      name: item.name, type: item.type,
      current_value: item.current_value ? String(item.current_value) : '',
      maturity_date: item.maturity_date ?? '', institution: item.institution ?? '', notes: item.notes ?? '',
    })
    setInvError(''); setInvModal(true)
  }

  function closeInvModal() { setInvModal(false); setEditing(null); setInvForm(emptyInv); setInvError('') }
  const changeInv = (k: string, v: string) => setInvForm(p => ({ ...p, [k]: v }))

  async function handleInvSubmit(e: FormEvent) {
    e.preventDefault(); setSavingInv(true); setInvError('')
    try {
      const payload = {
        name: invForm.name, type: invForm.type,
        current_value: invForm.current_value ? parseFloat(invForm.current_value) : null,
        maturity_date: invForm.maturity_date || null,
        institution: invForm.institution || null,
        notes: invForm.notes || null,
      }
      editing ? await api.patch(`/investments/${editing.id}`, payload) : await api.post('/investments', payload)
      await refresh('investments'); closeInvModal()
    } catch (err: any) {
      setInvError(err?.response?.data?.detail ?? 'Erro ao salvar.')
    } finally { setSavingInv(false) }
  }

  async function handleInvDelete() {
    if (!deleteId) return
    setDeletingInv(true)
    try {
      await api.delete(`/investments/${deleteId}`)
      await refresh('investments')
      setDeleteId(null)
      if (histInvestment?.id === deleteId) setHistInvestment(null)
    } finally { setDeletingInv(false) }
  }

  // ── Transaction CRUD ─────────────────────────────────────────────────────

  function openHistory(item: Investment) {
    setHistInvestment(item)
    setTxForm({ ...emptyTx, transaction_date: new Date().toISOString().split('T')[0] })
    setShowTxForm(false)
    setTxError('')
  }

  const changeTx = (k: string, v: string) => setTxForm(p => ({ ...p, [k]: v }))

  async function handleTxSubmit(e: FormEvent) {
    e.preventDefault()
    if (!histInvestment) return
    setSavingTx(true); setTxError('')
    try {
      await api.post(`/investments/${histInvestment.id}/transactions`, {
        type: txForm.type,
        amount: parseFloat(txForm.amount),
        transaction_date: txForm.transaction_date,
        notes: txForm.notes || null,
      })
      await refresh('investments')
      setTxForm({ ...emptyTx, transaction_date: new Date().toISOString().split('T')[0] })
      setShowTxForm(false)
    } catch (err: any) {
      setTxError(err?.response?.data?.detail ?? 'Erro ao salvar transação.')
    } finally { setSavingTx(false) }
  }

  async function handleTxDelete(txId: number) {
    if (!histInvestment) return
    setDeletingTx(txId)
    try {
      await api.delete(`/investments/${histInvestment.id}/transactions/${txId}`)
      await refresh('investments')
    } finally { setDeletingTx(null) }
  }

  // ── Totais globais ───────────────────────────────────────────────────────

  const globalNetInvested  = items.reduce((s, i) => s + Number(i.net_invested), 0)
  const globalCurrentValue = items.reduce((s, i) => s + Number(i.current_value ?? i.net_invested), 0)
  const globalGain         = globalCurrentValue - globalNetInvested
  const globalGainPct      = globalNetInvested > 0 ? (globalGain / globalNetInvested) * 100 : 0

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-4">

      {/* Resumo global */}
      {items.length > 0 && !fetching && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total investido', value: fmt(globalNetInvested),  cls: 'text-white' },
            { label: 'Valor atual',     value: fmt(globalCurrentValue), cls: 'text-violet-400' },
            { label: 'Rentabilidade',   value: `${globalGain >= 0 ? '+' : ''}${globalGainPct.toFixed(2)}%`, cls: globalGain >= 0 ? 'text-emerald-400' : 'text-rose-400' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <p className="text-gray-600 text-xs">{s.label}</p>
              <p className={`text-lg font-bold mt-1 ${s.cls}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{items.length} {items.length === 1 ? 'posição' : 'posições'}</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all glow-sm">
          <Plus size={16} /> Nova Posição
        </button>
      </div>

      {/* Cards de investimentos */}
      {fetching ? (
        <div className="py-16 flex justify-center"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl py-16 flex flex-col items-center gap-3">
          <PiggyBank size={36} className="text-gray-700" />
          <p className="text-gray-600 text-sm">Nenhum investimento cadastrado ainda.</p>
          <button onClick={openCreate} className="text-primary-400 hover:text-primary-300 text-sm transition-colors">Adicionar o primeiro</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(inv => {
            const net     = Number(inv.net_invested)
            const current = Number(inv.current_value ?? inv.net_invested)
            const gain    = current - net
            const pct     = net > 0 ? (gain / net) * 100 : 0
            const colorCls = TYPE_COLOR[inv.type] ?? TYPE_COLOR.other

            return (
              <div key={inv.id} className={`glass rounded-2xl p-5 border ${colorCls.split(' ')[2]} hover:border-opacity-60 transition-all group relative overflow-hidden`}>
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-20"
                     style={{ background: inv.type === 'fixed_income' ? '#10b981' : inv.type === 'crypto' ? '#f97316' : '#8b5cf6' }} />

                {/* Header */}
                <div className="flex items-start justify-between mb-3 relative">
                  <div className="flex-1 min-w-0">
                    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium mb-1.5 ${colorCls}`}>
                      {typeLabel(inv.type)}
                    </span>
                    <h3 className="text-white font-semibold truncate">{inv.name}</h3>
                    {inv.institution && <p className="text-gray-500 text-xs truncate">{inv.institution}</p>}
                  </div>
                  <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(inv)} className="p-1.5 text-gray-600 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeleteId(inv.id)} className="p-1.5 text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Valores */}
                <div className="border-t border-white/5 pt-3 mt-3 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-500 text-xs">Investido</span>
                    <span className="text-white font-bold">{fmt(net)}</span>
                  </div>
                  {inv.current_value !== null && (
                    <div className="flex justify-between items-baseline">
                      <span className="text-gray-500 text-xs">Valor atual</span>
                      <div className="text-right">
                        <span className="text-violet-400 font-semibold">{fmt(current)}</span>
                        <span className={`ml-2 text-xs font-medium ${pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}
                  {inv.maturity_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">Vencimento</span>
                      <span className="text-gray-400 text-xs">{fmtDate(inv.maturity_date)}</span>
                    </div>
                  )}
                </div>

                {/* Botão histórico */}
                <button
                  onClick={() => openHistory(inv)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-all"
                >
                  <History size={13} />
                  Histórico
                  <span className="bg-white/10 px-1.5 py-0.5 rounded-md">{inv.transactions.length}</span>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal: criar/editar investimento ─────────────────────────────── */}
      <Modal open={invModal} onClose={closeInvModal} title={editing ? 'Editar Posição' : 'Nova Posição'}>
        <form onSubmit={handleInvSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome" required placeholder="Ex: CDB Nubank 120% CDI" value={invForm.name} onChange={e => changeInv('name', e.target.value)} />
            <Select label="Tipo" required value={invForm.type} onChange={e => changeInv('type', e.target.value)} disabled={!!editing}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor atual (R$)" type="number" step="0.01" min="0" placeholder="Opcional" value={invForm.current_value} onChange={e => changeInv('current_value', e.target.value)} />
            <Input label="Vencimento" type="date" value={invForm.maturity_date} onChange={e => changeInv('maturity_date', e.target.value)} />
          </div>
          <Input label="Instituição" placeholder="Ex: Nubank, XP, BTG..." value={invForm.institution} onChange={e => changeInv('institution', e.target.value)} />
          <Textarea label="Observações" placeholder="Informações adicionais..." value={invForm.notes} onChange={e => changeInv('notes', e.target.value)} />
          {invError && <p className="text-rose-400 text-xs">{invError}</p>}
          <FormActions onCancel={closeInvModal} loading={savingInv} isEdit={!!editing} />
        </form>
      </Modal>

      {/* ── Modal: histórico de transações ───────────────────────────────── */}
      <Modal open={!!histInvestment} onClose={() => setHistInvestment(null)} title={histInvestment?.name ?? ''} size="lg">
        {histInvestment && (
          <div className="space-y-5">

            {/* Resumo do investimento */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total depositado', value: fmt(Number(histInvestment.total_deposited)), cls: 'text-emerald-400' },
                { label: 'Total sacado',     value: fmt(Number(histInvestment.total_withdrawn)), cls: 'text-rose-400' },
                { label: 'Saldo investido',  value: fmt(Number(histInvestment.net_invested)),    cls: 'text-white' },
              ].map(s => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-gray-600 text-xs mb-1">{s.label}</p>
                  <p className={`font-bold text-sm ${s.cls}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Botão nova transação */}
            {!showTxForm ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { setTxForm({ ...emptyTx, type: 'deposit', transaction_date: new Date().toISOString().split('T')[0] }); setShowTxForm(true) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 text-sm font-medium transition-all"
                >
                  <ArrowDownCircle size={16} /> Depositar
                </button>
                <button
                  onClick={() => { setTxForm({ ...emptyTx, type: 'withdrawal', transaction_date: new Date().toISOString().split('T')[0] }); setShowTxForm(true) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600/30 text-sm font-medium transition-all"
                >
                  <ArrowUpCircle size={16} /> Sacar
                </button>
              </div>
            ) : (
              <form onSubmit={handleTxSubmit} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white text-sm font-medium">
                    {txForm.type === 'deposit'
                      ? <span className="text-emerald-400">↓ Novo Depósito</span>
                      : <span className="text-rose-400">↑ Novo Saque</span>}
                  </p>
                  <button type="button" onClick={() => setShowTxForm(false)} className="text-gray-600 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Valor (R$)" required type="number" step="0.01" min="0.01" placeholder="0,00" value={txForm.amount} onChange={e => changeTx('amount', e.target.value)} />
                  <Input label="Data" required type="date" value={txForm.transaction_date} onChange={e => changeTx('transaction_date', e.target.value)} />
                </div>
                <Input label="Observações" placeholder="Opcional" value={txForm.notes} onChange={e => changeTx('notes', e.target.value)} />
                {txError && <p className="text-rose-400 text-xs">{txError}</p>}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowTxForm(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" disabled={savingTx} className={`flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 ${txForm.type === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'} disabled:opacity-60`}>
                    {savingTx ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar'}
                  </button>
                </div>
              </form>
            )}

            {/* Lista de transações */}
            <div>
              <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">Histórico</p>
              {histInvestment.transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-700 text-sm">
                  Nenhuma transação ainda. Use os botões acima para registrar.
                </div>
              ) : (
                <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {histInvestment.transactions.map(tx => (
                    <li key={tx.id} className="flex items-center gap-3 bg-white/3 hover:bg-white/5 rounded-xl px-4 py-3 group transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'deposit' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                        {tx.type === 'deposit' ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {tx.type === 'deposit' ? 'Depósito' : 'Saque'}
                          </span>
                          <span className="text-gray-600 text-xs">{fmtDate(tx.transaction_date)}</span>
                        </div>
                        {tx.notes && <p className="text-gray-600 text-xs truncate mt-0.5">{tx.notes}</p>}
                      </div>
                      <span className={`font-bold text-sm shrink-0 ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}{fmt(Number(tx.amount))}
                      </span>
                      <button
                        onClick={() => handleTxDelete(tx.id)}
                        disabled={deletingTx === tx.id}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-700 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-50"
                      >
                        {deletingTx === tx.id
                          ? <div className="w-3 h-3 border border-rose-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={13} />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Confirmar exclusão de investimento ───────────────────────────── */}
      <ConfirmDialog
        open={deleteId !== null}
        message="O investimento e todo o histórico de transações serão excluídos permanentemente."
        loading={deletingInv}
        onConfirm={handleInvDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
