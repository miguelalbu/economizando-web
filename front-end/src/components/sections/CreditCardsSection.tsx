import { useState, FormEvent } from 'react'
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react'
import api from '../../services/api'
import { useData, type CreditCard as CardType } from '../../context/DataContext'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import { Input, FormActions } from '../ui/FormField'

const empty = { name: '', last_four_digits: '', credit_limit: '', closing_day: '', due_day: '' }
const fmt   = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function CreditCardsSection() {
  const { creditCards: items, loading: fetching, refresh } = useData()
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState<CardType | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState('')

  function openCreate() { setEditing(null); setForm(empty); setError(''); setModal(true) }
  function openEdit(item: CardType) {
    setEditing(item)
    setForm({ name: item.name, last_four_digits: item.last_four_digits ?? '', credit_limit: item.credit_limit ? String(item.credit_limit) : '', closing_day: String(item.closing_day), due_day: String(item.due_day) })
    setError(''); setModal(true)
  }
  function closeModal() { setModal(false); setEditing(null); setForm(empty); setError('') }
  const change = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { name: form.name, last_four_digits: form.last_four_digits || null, credit_limit: form.credit_limit ? parseFloat(form.credit_limit) : null, closing_day: parseInt(form.closing_day), due_day: parseInt(form.due_day) }
      editing ? await api.patch(`/credit-cards/${editing.id}`, payload) : await api.post('/credit-cards', payload)
      await refresh('cards'); closeModal()
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Erro ao salvar.')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try { await api.delete(`/credit-cards/${deleteId}`); await refresh('cards'); setDeleteId(null) }
    finally { setDeleting(false) }
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{items.length} {items.length === 1 ? 'cartão' : 'cartões'}</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all glow-sm">
          <Plus size={16} /> Novo Cartão
        </button>
      </div>

      {fetching ? (
        <div className="py-16 flex justify-center"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl py-16 flex flex-col items-center gap-3">
          <CreditCard size={36} className="text-gray-700" />
          <p className="text-gray-600 text-sm">Nenhum cartão cadastrado ainda.</p>
          <button onClick={openCreate} className="text-primary-400 hover:text-primary-300 text-sm transition-colors">Adicionar o primeiro</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(card => (
            <div key={card.id} className="glass rounded-2xl p-5 border border-white/5 hover:border-primary-500/30 transition-all group relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-600/10 rounded-full blur-xl" />

              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center">
                  <CreditCard size={18} className="text-primary-400" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(card)} className="p-1.5 text-gray-600 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(card.id)} className="p-1.5 text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                </div>
              </div>

              <p className="text-white font-semibold">{card.name}</p>
              {card.last_four_digits && <p className="text-gray-500 text-sm mt-0.5">•••• •••• •••• {card.last_four_digits}</p>}

              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-600 text-xs">Fechamento</p>
                  <p className="text-white text-sm font-medium">Dia {card.closing_day}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Vencimento</p>
                  <p className="text-white text-sm font-medium">Dia {card.due_day}</p>
                </div>
                {card.credit_limit && (
                  <div className="col-span-2">
                    <p className="text-gray-600 text-xs">Limite</p>
                    <p className="text-primary-400 text-sm font-semibold">{fmt(card.credit_limit)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={closeModal} title={editing ? 'Editar Cartão' : 'Novo Cartão'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome do cartão" required placeholder="Ex: Nubank, Inter..." value={form.name} onChange={e => change('name', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Últimos 4 dígitos" placeholder="0000" maxLength={4} pattern="\d{4}" value={form.last_four_digits} onChange={e => change('last_four_digits', e.target.value)} />
            <Input label="Limite (R$)" type="number" step="0.01" min="0" placeholder="Opcional" value={form.credit_limit} onChange={e => change('credit_limit', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Dia de fechamento" required type="number" min="1" max="31" placeholder="Ex: 5" value={form.closing_day} onChange={e => change('closing_day', e.target.value)} />
            <Input label="Dia de vencimento" required type="number" min="1" max="31" placeholder="Ex: 15" value={form.due_day} onChange={e => change('due_day', e.target.value)} />
          </div>
          {error && <p className="text-rose-400 text-xs">{error}</p>}
          <FormActions onCancel={closeModal} loading={saving} isEdit={!!editing} />
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} message="O cartão e todos os gastos vinculados serão excluídos." loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
