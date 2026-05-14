'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
  id: string
  full_name: string
  whatsapp_number?: string
  role: string
}

interface ProfileFormProps {
  profile: Profile | null
  userEmail: string
}

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    whatsapp_number: profile?.whatsapp_number ?? '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, whatsapp_number: form.whatsapp_number || null })
      .eq('id', profile?.id)
    setLoading(false)
    if (error) {
      toast.error('Error: ' + error.message)
      return
    }
    toast.success('Perfil actualizado')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Nombre completo</Label>
          <Input
            value={form.full_name}
            onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
            placeholder="Tu nombre"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Correo electrónico</Label>
          <Input value={userEmail} disabled className="bg-gray-50 text-gray-400" />
        </div>
        <div className="space-y-1.5">
          <Label>WhatsApp</Label>
          <Input
            value={form.whatsapp_number}
            onChange={e => setForm(p => ({ ...p, whatsapp_number: e.target.value }))}
            placeholder="51987654321"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
