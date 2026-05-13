import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Building2, Shield, Receipt } from 'lucide-react'
import { ProfileForm } from '@/components/configuracion/ProfileForm'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Administra tu perfil y preferencias del sistema</p>
      </div>

      {/* Perfil */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <User className="w-4 h-4 text-orange-600" />
            </div>
            <CardTitle className="text-sm font-semibold text-gray-700">Mi Perfil</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} userEmail={user?.email ?? ''} />
        </CardContent>
      </Card>

      {/* Empresa */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <CardTitle className="text-sm font-semibold text-gray-700">Empresa</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs font-medium mb-1">Nombre</p>
              <p className="text-gray-800 font-medium">Indelar</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium mb-1">CRM Version</p>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">v1.0</Badge>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium mb-1">País</p>
              <p className="text-gray-800">Perú</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium mb-1">Moneda</p>
              <p className="text-gray-800">Soles (S/.)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IGV */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-emerald-600" />
            </div>
            <CardTitle className="text-sm font-semibold text-gray-700">Impuestos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="font-medium text-gray-800">IGV</p>
              <p className="text-gray-400 text-xs">Impuesto General a las Ventas — Perú</p>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3">18%</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-800">Aplicación</p>
              <p className="text-gray-400 text-xs">Se aplica automáticamente en cotizaciones</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">Activo</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Acceso */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-violet-600" />
            </div>
            <CardTitle className="text-sm font-semibold text-gray-700">Cuenta</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="font-medium text-gray-800">Correo electrónico</p>
              <p className="text-gray-400 text-xs">{user?.email}</p>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Verificado</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-800">Rol</p>
              <p className="text-gray-400 text-xs">Nivel de acceso en el sistema</p>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 capitalize">
              {profile?.role ?? 'admin'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
