'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('Credenciales incorrectas. Verifica tu email y contraseña.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a1a] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
        <div className="relative z-10 text-center flex flex-col items-center gap-1">
          <div className="w-48 h-48 mx-auto relative">
            <Image
              src="/logo-indelar.png"
              alt="Indelar"
              width={192}
              height={192}
              className="object-contain"
            />
          </div>
          <p className="text-white/50 text-sm max-w-xs leading-relaxed text-center">
            Gestiona tus leads, cotizaciones y equipo comercial desde un solo lugar.
          </p>
        </div>
        <div className="absolute bottom-6 z-10 text-center">
          <p className="text-xs text-white/25">
            Powered by{' '}
            <a href="https://www.frkstudio.pe" target="_blank" rel="noopener noreferrer" className="text-orange-400/70 hover:text-orange-400 transition-colors font-medium">
              FRK Studio
            </a>
          </p>
        </div>
        {/* Círculos decorativos */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-orange-500/5 border border-orange-500/10" />
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-orange-500/5 border border-orange-500/10" />
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo móvil */}
          <div className="lg:hidden text-center">
            <div className="w-14 h-14 mx-auto relative mb-3">
              <Image
                src="/logo-indelar.png"
                alt="Indelar"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Indelar CRM</h1>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bienvenido</h2>
            <p className="text-sm text-gray-400 mt-1">Ingresa a tu cuenta para continuar</p>
          </div>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    'Ingresar al CRM'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center space-y-1">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Indelar Decoraciones — Lima, Perú</p>
            <p className="text-xs text-gray-300">
              Powered by{' '}
              <a href="https://www.frkstudio.pe" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-500 font-medium transition-colors">
                FRK Studio
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
