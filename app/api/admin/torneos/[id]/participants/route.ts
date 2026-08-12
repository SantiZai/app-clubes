import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type PairInput = { playerA: string; playerB: string; time: string }

type InsertResult = {
  table: string
  data?: any
  error?: any
}

function isMissingRelation(error: any) {
  const msg = (error?.message || '').toString()
  // detect missing table or missing column errors from Postgres/PostgREST
  // also detect schema-cache messages like "Could not find the table 'public.foo' in the schema cache"
  return /does not exist|relation .* does not exist|column .* does not exist|could not find the '.*' column|could not find the table .* in the schema cache|not found in the schema cache/i.test(msg)
}

async function tryUpsert(supabase: any, tableCandidates: string[], payload: any, opts: any) {
  for (const table of tableCandidates) {
    const { data, error } = await supabase.from(table).upsert(payload, opts)
    if (!error) return { table, data }
    if (isMissingRelation(error)) continue
    return { error }
  }
  return { error: { message: 'No matching table found among candidates: ' + tableCandidates.join(', ') } }
}

async function tryInsert(supabase: any, tableCandidates: string[], payload: any) {
  for (const table of tableCandidates) {
    const { data, error } = await supabase.from(table).insert(payload).select().single()
    if (!error) return { table, data }
    if (isMissingRelation(error)) continue
    return { error }
  }
  return { error: { message: 'No matching table found among candidates: ' + tableCandidates.join(', ') } }
}

async function createPlayerUser(supabase: any, fullName: string) {
  const nameParts = fullName.split(' ').filter(Boolean)
  const lastName = nameParts.length > 1 ? nameParts.pop()! : ''
  const firstName = nameParts.join(' ')
  const emailSafe = `${firstName}${lastName}`.replace(/\s+/g, '.').toLowerCase() || 'jugador'
  const email = `${emailSafe}@clubes.local`
  const password = `${firstName}${lastName}2026!`.replace(/\s+/g, '') || 'Clubes123!'

  const userPayload = {
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: `${firstName} ${lastName}`.trim(),
      first_name: firstName || null,
      last_name: lastName || null,
    },
  }

  const { data, error } = await supabase.auth.admin.createUser(userPayload)
  if (error) {
    // Si ya existe el usuario por email, obtenemos la entrada de auth.users
    const { data: existingUser, error: existingError } = await supabase.auth.admin.listUsers({ email })
    if (!existingError && existingUser?.users?.length > 0) {
      const user = existingUser.users[0]
      await createPlayerProfile(supabase, user, fullName)
      return {
        ...user,
        generatedPassword: null,
        created: false,
      }
    }
    console.error('Error creando usuario auth:', error)
    return null
  }

  const user = data.user || data
  await createPlayerProfile(supabase, user, fullName)
  return {
    ...user,
    generatedPassword: password,
    created: true,
  }
}

async function createPlayerProfile(supabase: any, user: any, fullName: string) {
  if (!user?.id || !user?.email) return null
  const nameParts = fullName.split(' ').filter(Boolean)
  const lastName = nameParts.length > 1 ? nameParts.pop()! : ''
  const firstName = nameParts.join(' ')

  const payload = {
    id: user.id,
    email: user.email,
    full_name: `${firstName} ${lastName}`.trim(),
    first_name: firstName || null,
    last_name: lastName || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('usuarios').upsert(payload, { onConflict: 'id' })
  if (error && !isMissingRelation(error)) {
    console.error('Error guardando perfil de usuario:', error)
  }
  return null
}

async function getSavedPairs(supabase: any, torneoId: string) {
  const queryCandidates = [
    { table: 'torneo_parejas', relation: 'parejas', idField: 'pareja_id', tournamentField: 'torneo_id' },
    { table: 'tournament_pairs', relation: 'pairs', idField: 'pair_id', tournamentField: 'tournament_id' },
  ]

  for (const candidate of queryCandidates) {
    const { data, error } = await supabase
      .from(candidate.table)
      .select(`*, ${candidate.relation} (*)`)
      .eq(candidate.tournamentField, torneoId)

    if (error) {
      if (isMissingRelation(error)) continue
      return { error }
    }

    if (data?.length) {
      return { data, relation: candidate.relation }
    }
  }

  return { data: [] }
}

export async function GET(req: Request, { params }: { params: any }) {
  const { id: torneoId } = params
  const supabase = createAdminClient()

  const result = await getSavedPairs(supabase, torneoId)
  if (result.error) {
    return NextResponse.json({ error: result.error.message || result.error }, { status: 500 })
  }

  const pairs = (result.data || []).map((record: any) => {
    const pair = record[result.relation] || record[candidateRelation(record)] || {}
    return {
      id: record.id,
      playerA: pair?.player_a_id ? String(pair.player_a_id) : pair?.jugador1_id ? String(pair.jugador1_id) : pair?.nombre_equipo ?? null,
      playerB: pair?.player_b_id ? String(pair.player_b_id) : pair?.jugador2_id ? String(pair.jugador2_id) : null,
      teamName: pair?.nombre_equipo ?? pair?.team_name ?? null,
      scheduled_time: record.scheduled_time,
    }
  })

  return NextResponse.json({ pairs })
}

function candidateRelation(record: any) {
  if (record.pareja) return 'pareja'
  if (record.pairs) return 'pairs'
  return Object.keys(record).find((key) => key !== 'id' && key !== 'torneo_id' && key !== 'tournament_id' && key !== 'scheduled_time' && key !== 'pair_id' && key !== 'pareja_id')
}

export async function POST(req: Request, { params }: { params: any }) {
  const { id: torneoId } = params
  try {
    const body = await req.json()
    const pairs: PairInput[] = body.pairs || []
    const supabase = createAdminClient()

    const savedPairs: any[] = []

    for (const p of pairs) {
      const teamName = `${p.playerA} / ${p.playerB}`.trim()
      const pairPayload = {
        nombre_equipo: teamName,
        jugador1_id: null,
        jugador2_id: null,
      }

      const pairResult = await tryInsert(supabase, ['parejas', 'pairs'], pairPayload)
      if (pairResult.error) {
        // Try a simpler insertion if the table has different columns
        const fallback = await tryInsert(supabase, ['parejas', 'pairs'], { nombre_equipo: teamName, team_name: teamName })
        if (fallback.error) {
          return NextResponse.json({ error: fallback.error.message || fallback.error }, { status: 500 })
        }
        pairResult.data = fallback.data
      }

      const pair = pairResult.data
      let userA: any = null
      let userB: any = null
      if (pair?.id) {
        userA = await createPlayerUser(supabase, p.playerA)
        userB = await createPlayerUser(supabase, p.playerB)

        const updatePairPayload: any = {}
        if (userA?.id) updatePairPayload.jugador1_id = userA.id
        if (userB?.id) updatePairPayload.jugador2_id = userB.id
        if (p.availability) updatePairPayload.disponibilidades = p.availability

        if (Object.keys(updatePairPayload).length > 0) {
          try {
            await supabase.from('parejas').update(updatePairPayload).eq('id', pair.id)
          } catch (e) {
            // ignore and try other table
          }
          try {
            await supabase.from('pairs').update(updatePairPayload).eq('id', pair.id)
          } catch (e) {
            // ignore
          }
        }
        // Try inserting into tournament-pair linking table while tolerating different column names
        const candidateTables = [
          { table: 'torneo_parejas', idKey: 'torneo_id', pairKey: 'pareja_id' },
          { table: 'torneo_parejas', idKey: 'tournament_id', pairKey: 'pair_id' },
          { table: 'tournament_pairs', idKey: 'tournament_id', pairKey: 'pair_id' },
          { table: 'tournament_pairs', idKey: 'torneo_id', pairKey: 'pareja_id' },
        ]

        let inserted = false
        for (const cand of candidateTables) {
          const payload: any = {}
          payload[cand.idKey] = torneoId
          payload[cand.pairKey] = pair.id
          if (p.time) payload.scheduled_time = p.time
          try {
            const { error } = await supabase.from(cand.table).insert(payload)
            if (!error) {
              inserted = true
              break
            }
            if (!isMissingRelation(error)) {
              return NextResponse.json({ error: error.message || error }, { status: 500 })
            }
            // otherwise continue trying other candidates
          } catch (err: any) {
            return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
          }
        }
      }

      savedPairs.push({
        id: pair?.id ?? `${Date.now()}-${Math.random()}`,
        playerA: p.playerA,
        playerB: p.playerB,
        time: p.time,
        teamName,
        pair,
        createdUsers: [
          { fullName: p.playerA, email: userA?.email ?? null, password: userA?.generatedPassword ?? null, created: userA?.created ?? false },
          { fullName: p.playerB, email: userB?.email ?? null, password: userB?.generatedPassword ?? null, created: userB?.created ?? false },
        ],
        availability: p.availability ?? null,
      })
    }

    return NextResponse.json({ pairs: savedPairs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
