'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const ACTIVITY_TYPES = [
  { value: 'note', label: '📝 Nota' },
  { value: 'call', label: '📞 Llamada' },
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'email', label: '✉️ Email' },
  { value: 'visit', label: '🏠 Visita' },
]

export function AddActivityForm({ leadId }: { leadId: string }) {
  const [type, setType] = useState('note')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('activities').insert({
      lead_id: leadId,
      user_id: user?.id,
      type,
      content: content.trim(),
    })

    setLoading(false)

    if (error) {
      toast.error('Error al registrar la actividad')
      return
    }

    toast.success('Actividad registrada')
    setContent('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Select value={type} onValueChange={(v) => v && setType(v)}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ACTIVITY_TYPES.map(({ value, label }) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Describe la actividad..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        required
      />
      <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Registrar'}
      </Button>
    </form>
  )
}
