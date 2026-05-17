import { useState, FormEvent } from 'react'
import { Plus, Pencil, Trash2, FileText, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import { useData, type Bill } from '../../context/DataContext'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import MonthPicker from '../ui/MonthPicker'
import { Input, Select, Textarea, Checkbox, FormActions } from '../ui/FormField'
import { nowMonth, filterByMonth, MonthValue } from '../../utils/monthFilter'

const RECURRENCE   = [{ value: 'once', label: 'Única' }, { value: 'monthly', label: 'Mensal' }, { value: 'yearly', label: 'Anual' }]
const STATUS_LABELS: Record<string, string> = { pending: 'Pendente', paid: 'Pago', overdue: 'Vencido' }
const STATUS_CLASS:  Record<string, string> = { pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20', paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', overdue: 'bg-rose-500/10 text-rose-400 border-rose-500/20' }
const MONTH_NAMES  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const empty   = { description: '', amount: '', due_date: '', recurrence: 'once', is_essential: false, notes: '', barcode: '' }
const fmt     = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

export default function BillsSection() {
  const { bills: items, loading: fetching, refresh } = useData()
  const [selectedMonth, setSelectedMonth] = useState<MonthValue>(nowMonth)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState<Bill | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [payingId, setPayingId] = useState<number | null>(null)
  const [form, setForm]         = useState<typeof empty>(empty)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [paying, setPaying]     = useState(false)
  const [error, setError]       = useState('')

  const filtered = filterByMonth(items, 'due_date', selectedMonth)
  const pending  = filtered.filter(b => b.status === 'pending').reduce((s, b) => s + Number(b.amount), 0)
  const paid     = filtered.filter(b => b.status === 'paid').reduce((s, b) => s + Number(b.amount), 0)

  function openCreate() { setEditing(null); setForm(empty); setError(''); setModal(true) }
  function openEdit(item: Bill) {
    setEditing(item)
    setForm({ description: item.description, amount: String(item.amount), due_date: item.due_date, recurrence: item.recurrence, is_essential: item.is_essential, notes: item.notes ?? '', barcode: item.barcode ?? '' })
    setError(''); setModal(true)
  }
  function closeModal() { setModal(false); setEditing(null); setForm(empty); setError('') }
  const change = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { description: form.description, amount: parseFloat(form.amount), due_date: form.due_date, recurrence: form.recurrence, is_essential: form.is_essential, notes: form.notes || null, barcode: form.barcode || null }
      editing ? await api.patch(`/bills/${editing.id}`, payload) : await api.post('/bills', payload)
      await refresh('bills'); closeModal()
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Erro ao salvar.')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try { await api.delete(`/bills/${deleteId}`); await refresh('bills'); setDeleteId(null) }
    finally { setDeleting(false) }
  }

  async function handlePay() {
    if (!payingId) return
    setPaying(true)
    try { await api.patch(`/bills/${payingId}/pay`); await refresh('bills'); setPayingId(null) }
    finally { setPaying(false) }
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          {!fetching && filtered.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              {pending > 0 && <span className="text-amber-400 font-medium">Pend: {fmt(pending)}</span>}
              {paid > 0    && <span className="text-emerald-400 font-medium">Pago: {fmt(paid)}</span>}
            </div>
          )}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all glow-sm">
          <Plus size={16} /> Novo Boleto
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {fetching ? (
          <div className="py-16 flex justify-center"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <FileText size={36} className="text-gray-700" />
            <p className="text-gray-600 text-sm">Nenhum boleto em {MONTH_NAMES[selectedMonth.month - 1]}.</p>
            <button onClick={openCreate} className="text-primary-400 hover:text-primary-300 text-sm transition-colors">Adicionar</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-600 text-xs font-medium px-5 py-3">Descrição</th>
                <th className="text-left text-gray-600 text-xs font-medium px-5 py-3 hidden sm:table-cell">Vencimento</th>
                <th className="text-left text-gray-600 text-xs font-medium px-5 py-3 hidden md:table-cell">Recorrência</th>
                <th className="text-left text-gray-600 text-xs font-medium px-5 py-3">Status</th>
                <th className="text-right text-gray-600 text-xs font-medium px-5 py-3">Valor</th>
                <th className="px-5 py-3 w-28" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white text-sm">{item.description}</p>
                    {item.is_essential && <span className="text-xs text-primary-400">Essencial</span>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-sm hidden sm:table-cell">{fmtDate(item.due_date)}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-sm hidden md:table-cell">{RECURRENCE.find(r => r.value === item.recurrence)?.label}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_CLASS[item.status]}`}>{STATUS_LABELS[item.status]}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`font-semibold text-sm ${item.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{fmt(Number(item.amount))}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      {item.status !== 'paid' && (
                        <button onClick={() => setPayingId(item.id)} className="p-1.5 text-gray-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all" title="Marcar como pago">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-600 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td colSpan={4} className="px-5 py-3 text-gray-600 text-xs font-medium">Total do mês</td>
                <td className="px-5 py-3 text-right text-amber-400 font-bold">{fmt(pending + paid)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <Modal open={modal} onClose={closeModal} title={editing ? 'Editar Boleto' : 'Novo Boleto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Descrição" required placeholder="Ex: Conta de luz, Internet..." value={form.description} onChange={e => change('description', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor (R$)" required type="number" step="0.01" min="0.01" placeholder="0,00" value={form.amount} onChange={e => change('amount', e.target.value)} />
            <Input label="Data de vencimento" required type="date" value={form.due_date} onChange={e => change('due_date', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Recorrência" value={form.recurrence} onChange={e => change('recurrence', e.target.value)}>
              {RECURRENCE.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
            <Input label="Código de barras" placeholder="Opcional" value={form.barcode} onChange={e => change('barcode', e.target.value)} />
          </div>
          <Checkbox label="Conta essencial (aluguel, energia, etc.)" checked={form.is_essential} onChange={e => change('is_essential', e.target.checked)} />
          <Textarea label="Observações" placeholder="Informações adicionais..." value={form.notes} onChange={e => change('notes', e.target.value)} />
          {error && <p className="text-rose-400 text-xs">{error}</p>}
          <FormActions onCancel={closeModal} loading={saving} isEdit={!!editing} />
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} message="O boleto será excluído permanentemente." loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      <ConfirmDialog open={payingId !== null} title="Marcar como pago" message="Confirma que este boleto foi pago?" loading={paying} onConfirm={handlePay} onCancel={() => setPayingId(null)} />
    </div>
  )
}
