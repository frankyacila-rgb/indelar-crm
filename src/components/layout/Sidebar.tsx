'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  CalendarDays,
} from 'lucide-react'
import { logout } from '@/lib/supabase/actions'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/tareas', label: 'Tareas', icon: CheckSquare },
  { href: '/calendario', label: 'Calendario', icon: CalendarDays },
  { href: '/cotizaciones', label: 'Cotizaciones', icon: FileText },
  { href: '/metricas', label: 'Métricas', icon: BarChart2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col" style={{ background: 'linear-gradient(160deg, #1c1410 0%, #1a1a1a 60%, #111 100%)' }}>

      {/* Logo */}
      <div className="flex flex-col items-center pt-5 pb-4 px-4 border-b border-white/5">
        <div className="relative w-16 h-16 mb-1.5">
          <Image
            src="/logo-indelar.png"
            alt="Indelar"
            width={64}
            height={64}
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-black text-white tracking-wider uppercase">Indelar</p>
          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(249,115,22,0.2)', color: '#F97316' }}>
            CRM
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'text-white shadow-lg'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              )}
              style={active ? {
                background: 'linear-gradient(90deg, #F97316 0%, #EA580C 100%)',
              } : {}}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Divider decorativo */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      {/* Footer */}
      <div className="px-3 py-3 space-y-0.5">
        <Link
          href="/configuracion"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
        >
          <Settings className="w-3.5 h-3.5" />
          Configuración
        </Link>
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-xs text-white/30 hover:text-white/60 hover:bg-white/5 font-medium h-8"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  )
}
