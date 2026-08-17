import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('Fetching tournament with id:', id)
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('torneos')
      .select('id, fecha, fecha_fin, nombre')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('Tournament data found:', data)
    return NextResponse.json({ tournament: data })
  } catch (error: any) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { error: error.message || 'Error fetching tournament' },
      { status: 500 }
    )
  }
}
