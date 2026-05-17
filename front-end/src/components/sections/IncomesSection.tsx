import { useState, FormEvent } from 'react'
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react'
import api from '../../services/api'
import { useData, type Income } from '../../context/DataContext'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import MonthPicker from '../ui/MonthPicker'
import { Input, Textarea, FormActions } from '../ui/FormField'
import { nowMonth, filterByMonth, MonthValue } from '../../utils/monthFilter'

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const empty  = { description: '', amount: '', received_at: '', notes: '' }
const fmt     = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

export default function IncomesSection() {
  const { incomes: items, loading: fetching, refresh } = useData()
  const [selectedMonth, setSelectedMonth] = useState<MonthValue>(nowMonth)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState<Income | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState('')

  const filtered = filterByMonth(items, 'received_at', selectedMonth)
  const total    = filtered.reduce((s, i) => s + Number(i.amount), 0)

  function openCreate() { setEditing(null); setForm(empty); setError(''); setModal(true) }
  function openEdit(item: Income) {
    setEditing(item)
    setForm({ description: item.description, amount: String(item.amount), received_at: item.received_at, notes: item.notes ?? '' })
    setError(''); setModal(true)
  }
  function closeModal() { setModal(false); setEditing(null); setForm(empty); setError('') }
  const change = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { description: form.description, amount: parseFloat(form.amount), received_at: form.received_at, notes: form.notes || null }
      editing ? await api.patch(`/incomes/${editing.id}`, payload) : await api.post('/incomes', payload)
      await refresh('incomes'); closeModal()
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Erro ao salvar.')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try { await api.delete(`/incomes/${deleteId}`); await refresh('incomes'); setDeleteId(null) }
    finally { setDeleting(false) }
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          {!fetching && (
            <span className="text-gray-600 text-sm">
              {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
              {filtered.length > 0 && <span className="text-emerald-400 font-medium ml-2">{fmt(total)}</span>}
            </span>
          )}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all glow-sm">
          <Plus size={16} /> Novo Ganho
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {fetching ? (
          <div className="py-16 flex justify-center"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <TrendingUp size={36} className="text-gray-700" />
            <p className="text-gray-600 text-sm">Nenhum ganho em {MONTH_NAMES[selectedMonth.month - 1]}.</p>
            <button onClick={openCreate} className="text-primary-400 hover:text-primary-300 text-sm transition-colors">Adicionar</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-600 text-xs font-medium px-5 py-3">Descrição</th>
                <th className="text-left text-gray-600 text-xs font-medium px-5 py-3 hidden sm:table-cell">Data</th>
                <th className="text-right text-gray-600 text-xs font-medium px-5 py-3">Valor</th>
                <th className="px-5 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white text-sm">{item.description}</p>
                    {item.notes && <p className="text-gray-600 text-xs mt-0.5 truncate max-w-xs">{item.notes}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-sm hidden sm:table-cell">{fmtDate(item.received_at)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-emerald-400 font-semibold text-sm">{fmt(Number(item.amount))}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-600 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td colSpan={2} className="px-5 py-3 text-gray-600 text-xs font-medium">Total do mês</td>
                <td className="px-5 py-3 text-right text-emerald-400 font-bold">{fmt(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <Modal open={modal} onClose={closeModal} title={editing ? 'Editar Ganho' : 'Novo Ganho'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Descrição" required placeholder="Ex: Salário, Freelance..." value={form.description} onChange={e => change('description', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor (R$)" required type="number" step="0.01" min="0.01" placeholder="0,00" value={form.amount} onChange={e => change('amount', e.target.value)} />
            <Input label="Data de recebimento" required type="date" value={form.received_at} onChange={e => change('received_at', e.target.value)} />
          </div>
          <Textarea label="Observações" placeholder="Informações adicionais..." value={form.notes} onChange={e => change('notes', e.target.value)} />
          {error && <p className="text-rose-400 text-xs">{error}</p>}
          <FormActions onCancel={closeModal} loading={saving} isEdit={!!editing} />
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} message="O ganho será excluído permanentemente." loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
