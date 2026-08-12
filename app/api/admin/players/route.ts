import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('usuarios').select('id, full_name, email')
    if (error) return NextResponse.json({ error: error.message || error }, { status: 500 })
    return NextResponse.json({ players: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
