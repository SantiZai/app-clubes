import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type MatchPayload = {
  aId: string
  bId: string
  aLabel: string
  bLabel: string
  time: string
  court: number
}

type ZonePayload = {
  name: string
  day: string
  start: string
  end: string
  pairIds: string[]
  matches: MatchPayload[]
}

type LinkTableCandidate = {
  table: string
  idKey: string
  pairKey: string
}

const linkTableCandidates: LinkTableCandidate[] = [
  { table: 'torneo_parejas', idKey: 'torneo_id', pairKey: 'pareja_id' },
  { table: 'torneo_parejas', idKey: 'tournament_id', pairKey: 'pair_id' },
  { table: 'tournament_pairs', idKey: 'tournament_id', pairKey: 'pair_id' },
  { table: 'tournament_pairs', idKey: 'torneo_id', pairKey: 'pareja_id' },
]

function isMissingRelation(error: any) {
  const msg = (error?.message || '').toString()
  return /does not exist|relation .* does not exist|column .* does not exist|could not find the '.*' column|could not find the table .* in the schema cache|not found in the schema cache/i.test(msg)
}

async function findLinkTable(supabase: any, torneoId: string) {
  for (const candidate of linkTableCandidates) {
    const { data, error } = await supabase
      .from(candidate.table)
      .select(`${candidate.idKey}, ${candidate.pairKey}`)
      .eq(candidate.idKey, torneoId)
      .limit(1)

    if (error) {
      if (isMissingRelation(error)) continue
      return { error }
    }

    return { candidate, data }
  }

  return { error: { message: 'No se encontró la tabla de vínculo de parejas con torneo.' } }
}

export async function POST(req: Request, { params }: { params: any }) {
  const { id: torneoId } = params
  if (!torneoId) {
    return NextResponse.json({ error: 'Falta el id del torneo' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const zones: ZonePayload[] = body.zones || []
    if (!Array.isArray(zones) || zones.length === 0) {
      return NextResponse.json({ error: 'No se recibieron zonas válidas para guardar.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const existingZones = await supabase.from('zonas').select('id').eq('torneo_id', torneoId).limit(1)
    if (existingZones.error) {
      if (isMissingRelation(existingZones.error)) {
        return NextResponse.json({ error: 'La tabla zonas no existe en la base de datos.' }, { status: 500 })
      }
      return NextResponse.json({ error: existingZones.error.message || existingZones.error }, { status: 500 })
    }

    if (Array.isArray(existingZones.data) && existingZones.data.length > 0) {
      return NextResponse.json({ error: 'Ya existen zonas guardadas para este torneo. Elimina las zonas previas antes de guardar una nueva configuración.' }, { status: 409 })
    }

    const found = await findLinkTable(supabase, torneoId)
    if (found.error) {
      return NextResponse.json({ error: found.error.message || found.error }, { status: 500 })
    }
    const candidate = found.candidate as LinkTableCandidate

    const { data, error } = await supabase.rpc('save_tournament_zones_and_matches', {
      p_torneo_id: torneoId,
      p_zones: zones,
      p_link_table: candidate.table,
      p_tournament_key: candidate.idKey,
      p_pair_key: candidate.pairKey,
    })

    if (error) {
      if (error.message?.toString().includes('Zonas ya existen')) {
        return NextResponse.json({ error: 'Ya existen zonas guardadas para este torneo. Elimina las zonas previas antes de guardar una nueva configuración.' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message || error }, { status: 500 })
    }

    return NextResponse.json({ success: true, result: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
