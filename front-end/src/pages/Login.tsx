import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, TrendingUp, Shield, Zap, AlertCircle } from 'lucide-react'

type Mode = 'login' | 'register'

export default function Login() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    income_day: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(
          form.name,
          form.email,
          form.password,
          form.income_day ? parseInt(form.income_day) : undefined
        )
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail
      setError(typeof msg === 'string' ? msg : 'Erro ao autenticar. Verifique seus dados.')
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setError('')
    setForm({ name: '', email: '', password: '', income_day: '' })
  }

  return (
    <div className="min-h-screen bg-gray-950 flex overflow-hidden relative">

      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl animate-float-delay" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,58,237,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Painel esquerdo — hero */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center glow-sm">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">Economiza</span>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-primary-300 text-xs font-medium">
              <Zap size={12} className="fill-primary-400 text-primary-400" />
              Controle financeiro inteligente
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Suas finanças,{' '}
              <span className="text-gradient">sob controle.</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Chega de planilhas. Gerencie ganhos, gastos, cartões e investimentos em um único lugar — com o seu ritmo financeiro.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: TrendingUp, label: 'Ciclo financeiro personalizado', desc: 'Defina quando começa seu mês financeiro' },
              { icon: Shield,     label: 'Seus dados, só seus',            desc: 'Isolamento total por usuário' },
              { icon: Zap,        label: 'Visão em tempo real',            desc: 'Dashboard com resumo instantâneo' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 glass rounded-2xl p-4">
                <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-700 text-sm">© 2025 Economiza. Todos os direitos reservados.</p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md animate-slide-up">

          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center glow-sm">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-white font-semibold text-xl">Economiza</span>
          </div>

          <div className="glass rounded-3xl p-8 glow">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {mode === 'login'
                  ? 'Entre na sua conta para continuar'
                  : 'Comece a controlar suas finanças hoje'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-sm font-medium">Nome completo</label>
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Miguel Albuquerque"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary-500 focus:bg-white/8 transition-all"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-gray-400 text-sm font-medium">E-mail</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="voce@email.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 text-sm font-medium">Senha</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-sm font-medium">
                    Dia de recebimento{' '}
                    <span className="text-gray-600 font-normal">(opcional)</span>
                  </label>
                  <input
                    name="income_day"
                    type="number"
                    value={form.income_day}
                    onChange={handleChange}
                    placeholder="Ex: 15 (define seu mês financeiro)"
                    min={1}
                    max={31}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 mt-2 flex items-center justify-center gap-2 glow-sm hover:glow"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === 'login' ? (
                  'Entrar'
                ) : (
                  'Criar conta'
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}
