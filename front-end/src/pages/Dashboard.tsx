import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { TrendingUp, TrendingDown, CreditCard, FileText, Home, Settings, BarChart2, LogOut, ChevronRight, PiggyBank } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { path: '/inicio',        label: 'Início',       icon: Home },
  { path: '/ganhos',        label: 'Ganhos',        icon: TrendingUp },
  { path: '/gastos',        label: 'Gastos',        icon: TrendingDown },
  { path: '/boletos',       label: 'Boletos',       icon: FileText },
  { path: '/cartoes',       label: 'Cartões',       icon: CreditCard },
  { path: '/investimentos', label: 'Investimentos', icon: PiggyBank },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeLabel = NAV.find(n => location.pathname === n.path)?.label ?? 'Dashboard'

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center glow-sm shrink-0">
            <span className="text-white font-bold">E</span>
          </div>
          <span className="text-white font-semibold text-lg">Economiza</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => { navigate(path); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${active ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
              >
                <Icon size={18} className={active ? 'text-primary-400' : 'text-gray-600 group-hover:text-gray-400'} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-primary-500" />}
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-600 text-xs truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="text-gray-600 hover:text-rose-400 transition-colors" title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-900/50 border-b border-white/5 px-6 py-4 flex items-center gap-4 backdrop-blur-sm sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white transition-colors">
            <BarChart2 size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-semibold">{activeLabel}</h1>
            {user?.income_day && (
              <p className="text-gray-600 text-xs">Ciclo financeiro: todo dia {user.income_day}</p>
            )}
          </div>
          <button className="text-gray-500 hover:text-gray-300 transition-colors">
            <Settings size={18} />
          </button>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
