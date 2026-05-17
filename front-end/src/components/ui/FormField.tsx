import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary-500 focus:bg-white/8 transition-all'
const selectCls = 'w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 transition-all'
const labelCls = 'block text-gray-400 text-xs font-medium mb-1.5'

interface FieldProps { label: string; required?: boolean; children: ReactNode }

export function Field({ label, required, children }: FieldProps) {
  return (
    <div>
      <label className={labelCls}>{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

export function Input({ label, required, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <Field label={label} required={required}>
      <input required={required} className={inputCls} {...props} />
    </Field>
  )
}

export function Select({ label, required, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <Field label={label} required={required}>
      <select required={required} className={selectCls} {...props}>{children}</select>
    </Field>
  )
}

export function Textarea({ label, required, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <Field label={label} required={required}>
      <textarea required={required} rows={3} className={`${inputCls} resize-none`} {...props} />
    </Field>
  )
}

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" className="sr-only peer" {...props} />
        <div className="w-5 h-5 bg-white/5 border border-white/20 rounded-md peer-checked:bg-primary-600 peer-checked:border-primary-500 transition-all" />
        <svg className="absolute inset-0 m-auto w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 12 12">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="text-gray-300 text-sm">{label}</span>
    </label>
  )
}

export function FormActions({ onCancel, loading, isEdit }: { onCancel: () => void; loading: boolean; isEdit: boolean }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 transition-all">
        Cancelar
      </button>
      <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 glow-sm">
        {loading
          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : isEdit ? 'Salvar alterações' : 'Criar'}
      </button>
    </div>
  )
}

export { inputCls, selectCls }
