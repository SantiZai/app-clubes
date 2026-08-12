"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Availability = { day: string; start: string; end: string };

type Pair = {
  id: string;
  playerA: string;
  playerB: string;
  time?: string;
  availability?: Availability[];
  createdUsers?: Array<{ fullName: string; email: string | null; password: string | null; created: boolean }>;
};

type Match = { a: string; b: string; time: string; court: number }

type Zone = {
  id: string;
  day: string;
  start: string;
  end: string;
  pairs: Pair[];
  matches: Match[];
}

type PlayerProfile = {
  id: string;
  full_name: string;
  email: string | null;
};

export default function ManageTorneoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [routeId, setRouteId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [playerA, setPlayerA] = useState("");
  const [playerB, setPlayerB] = useState("");
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [existingPlayers, setExistingPlayers] = useState<PlayerProfile[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingZones, setSavingZones] = useState(false);
  const [zonesSaved, setZonesSaved] = useState(false);

  const assignedPairsCount = zones.reduce((sum, zone) => sum + zone.pairs.length, 0);
  const totalMatchesCount = zones.reduce((sum, zone) => sum + zone.matches.length, 0);

  type MatchForSave = {
    aId: string;
    bId: string;
    aLabel: string;
    bLabel: string;
    time: string;
    court: number;
  };

  type ZoneForSave = {
    name: string;
    day: string;
    start: string;
    end: string;
    pairIds: string[];
    matches: MatchForSave[];
  };

  function buildZoneSavePayload(zones: Zone[]): ZoneForSave[] {
    return zones.map((zone, index) => {
      const labelToId = new Map(zone.pairs.map((p) => [`${p.playerA} / ${p.playerB}`, p.id]));
      return {
        name: `Zona ${index + 1}`,
        day: zone.day,
        start: zone.start,
        end: zone.end,
        pairIds: zone.pairs.map((p) => p.id),
        matches: zone.matches.map((m) => ({
          aId: labelToId.get(m.a) ?? "",
          bId: labelToId.get(m.b) ?? "",
          aLabel: m.a,
          bLabel: m.b,
          time: m.time,
          court: m.court,
        })),
      };
    });
  }

  // availability UI state for manual add
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("fri");
  const [startTime, setStartTime] = useState<string>("17:00");
  const [endTime, setEndTime] = useState<string>("21:00");
  const [editingAvailabilityIndex, setEditingAvailabilityIndex] = useState<number | null>(null);

  useEffect(() => {
    // params can be a server promise in App Router; resolve it when needed
    if (params && typeof (params as any).then === "function") {
      (params as Promise<{ id: string }>).then((p) => setRouteId(p.id)).catch(() => null)
    } else {
      setRouteId((params as any).id)
    }
  }, [params])

  useEffect(() => {
    if (!routeId) return
    fetchSavedPairs();
    fetchExistingPlayers();
  }, [routeId]);

  async function fetchSavedPairs() {
    try {
      if (!routeId) return
      const res = await fetch(`/api/admin/torneos/${routeId}/participants`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.pairs)) {
        setPairs(
          data.pairs.map((p: any, index: number) => ({
            id: String(p.id ?? `${Date.now()}-${index}`),
            playerA: p.playerA ?? p.players?.[0]?.full_name ?? p.teamName ?? p.nombre_equipo ?? "",
            playerB: p.playerB ?? p.players?.[1]?.full_name ?? "",
            time: p.time ?? p.scheduled_time ?? "",
            availability: p.availability ?? p.disponibilidades ?? [],
            createdUsers: p.createdUsers ?? [],
          }))
        );
      }
    } catch (error) {
      console.error("Error cargando parejas:", error);
    }
  }

  async function fetchExistingPlayers() {
    try {
      const res = await fetch(`/api/admin/players`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.players)) setExistingPlayers(data.players);
    } catch (error) {
      console.error("Error cargando jugadores existentes:", error);
    }
  }

  const days = useMemo(
    () => [
      { key: "mon", label: "Lun" },
      { key: "tue", label: "Mar" },
      { key: "wed", label: "Mié" },
      { key: "thu", label: "Jue" },
      { key: "fri", label: "Vie" },
      { key: "sat", label: "Sáb" },
      { key: "sun", label: "Dom" },
    ],
    []
  );

  const timeOptions = useMemo(() => {
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
      out.push(`${String(h).padStart(2, "0")}:00`);
      out.push(`${String(h).padStart(2, "0")}:30`);
    }
    return out;
  }, []);

  function availabilityToLabel(a: Availability) {
    const label = days.find((d) => d.key === a.day)?.label ?? a.day;
    return `${label} ${a.start} — ${a.end}`;
  }

  function validateAvailability(a: Availability) {
    if (!a.day || !a.start || !a.end) return "Completar día, desde y hasta";
    if (a.start === a.end) return "La franja debe tener duración mayor a 0";
    const [sh, sm] = a.start.split(":").map(Number);
    const [eh, em] = a.end.split(":").map(Number);
    const sMinutes = sh * 60 + sm;
    const eMinutes = eh * 60 + em;
    if (eMinutes <= sMinutes) return "El horario 'Hasta' debe ser posterior a 'Desde'";
    return null;
  }

  function addOrUpdateAvailability() {
    const candidate: Availability = { day: selectedDay, start: startTime, end: endTime };
    const err = validateAvailability(candidate);
    if (err) {
      setStatus(err);
      return;
    }

    const existsIndex = availabilities.findIndex(
      (x) => x.day === candidate.day && x.start === candidate.start && x.end === candidate.end
    );
    if (existsIndex !== -1 && editingAvailabilityIndex === null) {
      setStatus("Esa franja ya fue agregada");
      return;
    }

    setAvailabilities((cur) => {
      const next = [...cur];
      if (editingAvailabilityIndex !== null) next[editingAvailabilityIndex] = candidate;
      else next.push(candidate);
      return next;
    });
    setEditingAvailabilityIndex(null);
    setStatus(null);
  }

  async function handleAddPair() {
    if (!playerA.trim() || !playerB.trim()) {
      setStatus("Completa ambos jugadores antes de agregar la pareja.");
      return;
    }
    if (availabilities.length === 0) {
      setStatus("Agrega al menos una disponibilidad antes de guardar la pareja.");
      return;
    }

    const newPair: Pair = {
      id: `manual-${Date.now()}`,
      playerA: playerA.trim(),
      playerB: playerB.trim(),
      availability: availabilities,
    };

    await savePairs([newPair]);
  }

  function editAvailability(i: number) {
    const a = availabilities[i];
    setSelectedDay(a.day);
    setStartTime(a.start);
    setEndTime(a.end);
    setEditingAvailabilityIndex(i);
  }

  function removeAvailability(i: number) {
    setAvailabilities((cur) => cur.filter((_, idx) => idx !== i));
  }

  async function savePairs(newPairs: Pair[]) {
    setLoading(true);
    setStatus(null);

    try {
      // enrich pairs: if pair already has availability use it, otherwise attach current availabilities
      const enriched = newPairs.map((np) => ({ ...np, availability: (np as any).availability ?? availabilities }));

      if (!routeId) {
        setStatus('Falta el id del torneo')
        return
      }

      const res = await fetch(`/api/admin/torneos/${routeId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pairs: enriched }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "No se pudo guardar las parejas. Revisa la consola.");
        return;
      }

      const saved = (Array.isArray(data.pairs) ? data.pairs : newPairs).map((pair: any, index: number) => ({
        id: String(pair.id ?? `${Date.now()}-${index}`),
        playerA: pair.playerA ?? pair.players?.[0]?.full_name ?? pair.teamName ?? pair.nombre_equipo ?? "",
        playerB: pair.playerB ?? pair.players?.[1]?.full_name ?? "",
        time: pair.time ?? pair.scheduled_time ?? "",
        createdUsers: pair.createdUsers ?? [],
        availability: pair.availability ?? pair.disponibilidades ?? [],
      }));

      setPairs((current) => [...current, ...saved]);
      setStatus("Parejas guardadas correctamente.");
      setText("");
      setPlayerA("");
      setPlayerB("");
      setAvailabilities([]);
      setStartTime("17:00");
      setEndTime("21:00");
    } catch (error) {
      console.error(error);
      setStatus("Error guardando parejas. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  }

  async function handleParse() {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setStatus("No se detectaron líneas para procesar.");
      return;
    }

    const results: { ok: boolean; pair?: Pair; error?: string; raw: string }[] = [];

    for (const line of lines) {
      const parts = line.split("|").map((p) => p.trim()).filter(Boolean);
      const names = parts.shift();
      if (!names) { results.push({ ok: false, raw: line, error: 'Falta nombre' }); continue }
      const nameParts = names.split(",").map((p) => p.trim());
      if (nameParts.length < 2) { results.push({ ok: false, raw: line, error: 'Formato de nombres inválido' }); continue }
      const playerAName = nameParts[0];
      const playerBName = nameParts[1];

      const availability: Availability[] = [];
      let lineError: string | null = null;
      for (const token of parts) {
        const m = token.match(/^(\D+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/i);
        if (!m) { lineError = `Franja inválida: ${token}`; break }
        const dayText = m[1].trim();
        const start = m[2];
        const end = m[3];
        const map: Record<string, string> = { lun: 'mon', mar: 'tue', mie: 'wed', mié: 'wed', jue: 'thu', vie: 'fri', sab: 'sat', dom: 'sun' };
        const key = dayText.slice(0,3).toLowerCase();
        const day = map[key] ?? key;
        const avail = { day, start, end };
        const vErr = validateAvailability(avail);
        if (vErr) { lineError = vErr; break }
        availability.push(avail);
      }

      if (lineError) { results.push({ ok: false, raw: line, error: lineError }); continue }

      const pair: Pair = { id: String(Date.now()), playerA: playerAName, playerB: playerBName, availability };
      results.push({ ok: true, pair, raw: line });
    }

    const valid = results.filter((r) => r.ok).map((r) => (r.pair as Pair));
    const invalid = results.filter((r) => !r.ok);

    if (valid.length === 0) {
      setStatus(`No se encontraron pares válidos. Errores: ${invalid.map(i=>i.error).join('; ')}`);
      return;
    }

    if (invalid.length > 0) {
      const proceed = confirm(`${valid.length} líneas válidas y ${invalid.length} inválidas. Guardar las válidas? Errores: ${invalid.map(i=>i.error).slice(0,3).join('; ')}`);
      if (!proceed) return;
    }

    await savePairs(valid as Pair[]);
  }

  // Scheduler configuration defaults (can be exposed to admin later)
  // Default match duration baseline (used for estimations). Actual per-match
  // duration is derived from `tournamentType`: normal=60, americano=30.
  const DEFAULT_MATCH_MINUTES = 60
  const DEFAULT_CHANGEOVER_MINUTES = 0
  const DEFAULT_COURTS = 2
  const TARGET_ZONE_SIZE = 4
  const [tournamentType, setTournamentType] = useState<'normal'|'americano'>('normal')
  const [courts, setCourts] = useState<number>(DEFAULT_COURTS)

  function timeToMinutes(t: string) {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  function minutesToTime(m: number) {
    const hh = Math.floor(m/60)
    const mm = m % 60
    return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`
  }

  function intersectRanges(ranges: [number, number][]) {
    if (!ranges.length) return null
    let start = -Infinity, end = Infinity
    for (const [s,e] of ranges) {
      start = Math.max(start, s)
      end = Math.min(end, e)
    }
    if (start >= end) return null
    return [start, end]
  }

  function combinations<T>(arr: T[]) {
    const out: [T,T][] = []
    for (let i=0;i<arr.length;i++) for (let j=i+1;j<arr.length;j++) out.push([arr[i], arr[j]])
    return out
  }

  function scheduleMatchesForZone(pairsInZone: Pair[], windowStart: number, windowEnd: number, courtsNum = courts, matchMinutes: number, slotInterval: number, matchesList?: {a:string,b:string}[]) {
    const matchesInfo = matchesList ?? combinations(pairsInZone.map(p=>p.id)).map(([a,b])=>({ a, b }))
    const totalMatches = matchesInfo.length
    const maxSlots = Math.floor((windowEnd - windowStart - matchMinutes) / slotInterval) + 1
    if (maxSlots <= 0) return null

    const slots: { start: number; capacity: number; assignments: {a:string,b:string,court:number,time:number}[] }[] = []
    for (let i=0;i<maxSlots;i++) {
      const s = windowStart + i * slotInterval
      if (s + matchMinutes > windowEnd) break
      slots.push({ start: s, capacity: courtsNum, assignments: [] })
    }
    if (!slots.length) return null

    const teamFrequency: Record<string, number> = {}
    for (const m of matchesInfo) {
      teamFrequency[m.a] = (teamFrequency[m.a] ?? 0) + 1
      teamFrequency[m.b] = (teamFrequency[m.b] ?? 0) + 1
    }

    const orderedMatches = [...matchesInfo].sort((x,y)=> {
      const fx = (teamFrequency[x.a] ?? 0) + (teamFrequency[x.b] ?? 0)
      const fy = (teamFrequency[y.a] ?? 0) + (teamFrequency[y.b] ?? 0)
      return fy - fx
    })

    const assigned: {a:string,b:string,time:number,court:number}[] = []
    const slotAssignments: {a:string,b:string,court:number,time:number}[][] = slots.map(()=>[])

    function assignMatch(index: number): boolean {
      if (index >= orderedMatches.length) return true
      const match = orderedMatches[index]

      for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
        const slot = slots[slotIndex]
        if (slotAssignments[slotIndex].length >= slot.capacity) continue
        const inThisSlot = slotAssignments[slotIndex].some((a) => a.a === match.a || a.b === match.a || a.a === match.b || a.b === match.b)
        if (inThisSlot) continue

        const usedCourts = new Set(slotAssignments[slotIndex].map((a) => a.court))
        let court = 1
        while (usedCourts.has(court)) court++

        slotAssignments[slotIndex].push({ a: match.a, b: match.b, time: slot.start, court })
        assigned.push({ a: match.a, b: match.b, time: slot.start, court })

        if (assignMatch(index + 1)) return true

        slotAssignments[slotIndex].pop()
        assigned.pop()
      }

      return false
    }

    if (!assignMatch(0)) return null

    const resultMatches: Match[] = assigned.map((a)=>{
      function labelFor(id: string) {
        if (id.startsWith('winner-')) return `Ganador S${id.split('-')[1]}`
        if (id.startsWith('loser-')) return `Perdedor S${id.split('-')[1]}`
        const p = pairsInZone.find(p=>p.id===id)
        if (p) return `${p.playerA} / ${p.playerB}`
        return id
      }
      return { a: labelFor(a.a), b: labelFor(a.b), time: minutesToTime(a.time), court: a.court }
    })
    return resultMatches
  }

  function generateZones(pairs: Pair[]) : { zones: Zone[]; unassigned: { pair: Pair; reason: string }[] } {
    if (!pairs.length) return { zones: [], unassigned: [] }

    // Build availability map: pairId -> day -> [[start,end], ...]
    const pairAvail: Record<string, Record<string, [number,number][]>> = {}
    const allDays = new Set<string>()
    for (const p of pairs) {
      pairAvail[p.id] = {}
      const av = p.availability ?? []
      for (const a of av) {
        const s = timeToMinutes(a.start)
        const e = timeToMinutes(a.end)
        if (!pairAvail[p.id][a.day]) pairAvail[p.id][a.day] = []
        pairAvail[p.id][a.day].push([s,e])
        allDays.add(a.day)
      }
    }

    const pool = [...pairs].sort((x,y)=> (Object.keys(pairAvail[x.id]||{}).length) - (Object.keys(pairAvail[y.id]||{}).length))
    const MIN_ZONE_SIZE = 3
    if (pool.length < MIN_ZONE_SIZE) {
      return {
        zones: [],
        unassigned: pool.map((pair)=>({ pair, reason: `No se puede formar ninguna zona válida con menos de ${MIN_ZONE_SIZE} parejas.` }))
      }
    }

    const slotInterval = tournamentType === 'normal' ? 60 : 30
    const matchMinutes = slotInterval
    const maxZoneSize = Math.min(pool.length, TARGET_ZONE_SIZE + 2)
    const dayList = Array.from(allDays)

    function intersectTwoRanges(a: [number,number][], b: [number,number][]) {
      const result: [number,number][] = []
      for (const [aStart, aEnd] of a) {
        for (const [bStart, bEnd] of b) {
          const start = Math.max(aStart, bStart)
          const end = Math.min(aEnd, bEnd)
          if (start < end) result.push([start,end])
        }
      }
      return result
    }

    function intersectAllRanges(rangeSets: [number,number][][]): [number,number][] {
      if (!rangeSets.length) return []
      let result = rangeSets[0]
      for (let i = 1; i < rangeSets.length && result.length > 0; i++) {
        result = intersectTwoRanges(result, rangeSets[i])
      }
      return result
    }

    function roundUpToHalfHour(minutes: number) {
      return Math.ceil(minutes / 30) * 30
    }

    function computeCandidateScore(group: Pair[], day: string, window: [number,number], requiredLength: number) {
      const size = group.length
      let score = size * 100
      if (size === TARGET_ZONE_SIZE) score += 200
      else if (size < TARGET_ZONE_SIZE) score -= 80 * (TARGET_ZONE_SIZE - size)
      else score += 40 * (size - TARGET_ZONE_SIZE)

      const dayFlexBonus = group.reduce((sum, p) => {
        const days = Object.keys(pairAvail[p.id]||{}).length
        return sum + Math.max(0, 10 - days) * 10
      }, 0)
      score += dayFlexBonus

      const rangeLength = window[1] - window[0]
      const slack = rangeLength - requiredLength
      score += Math.min(40, Math.max(0, rangeLength / 10))
      score += Math.max(0, 20 - Math.floor(slack / 10))

      const matchesCount = size * (size - 1) / 2
      const slotsNeeded = Math.ceil(matchesCount / courts)
      const courtUseRatio = matchesCount / (slotsNeeded * courts)
      score += Math.floor(courtUseRatio * 20)
      if (size > TARGET_ZONE_SIZE) score -= 80 * (size - TARGET_ZONE_SIZE)
      return score
    }

    function scheduleGroup(group: Pair[], windowStart: number, windowEnd: number) {
      return scheduleMatchesForZone(group, windowStart, windowEnd, courts, matchMinutes, slotInterval)
    }

    function* combinationsOf<T>(arr: T[], k: number) {
      const n = arr.length
      if (k > n) return
      const idx = Array.from({length:k}, (_,i) => i)
      while (true) {
        yield idx.map(i => arr[i])
        let i = k - 1
        while (i >= 0 && idx[i] === i + n - k) i--
        if (i < 0) break
        idx[i]++
        for (let j = i + 1; j < k; j++) idx[j] = idx[j-1] + 1
      }
    }

    type Candidate = {
      pairs: Pair[]
      pairIds: string[]
      day: string
      window: [number,number]
      schedule: Match[]
      score: number
      size: number
      isTargetSize: boolean
    }

    const candidates: Candidate[] = []
    const MAX_COMBINATIONS = 20000

    for (const day of dayList) {
      const available = pool.filter((p) => pairAvail[p.id] && pairAvail[p.id][day])
      if (available.length < MIN_ZONE_SIZE) continue
      available.sort((a,b)=> (Object.keys(pairAvail[a.id]||{}).length) - (Object.keys(pairAvail[b.id]||{}).length))

      const sizeOrder: number[] = []
      for (let s = TARGET_ZONE_SIZE; s <= Math.min(maxZoneSize, available.length); s++) sizeOrder.push(s)
      for (let s = TARGET_ZONE_SIZE - 1; s >= MIN_ZONE_SIZE; s--) if (s <= available.length) sizeOrder.push(s)

      for (const size of sizeOrder) {
        let tried = 0
        for (const group of combinationsOf(available, size)) {
          tried++
          if (tried > MAX_COMBINATIONS) break
          const dayRanges = group.map((p) => pairAvail[p.id][day])
          const commonRanges = intersectAllRanges(dayRanges)
          if (!commonRanges.length) continue

          for (const range of commonRanges) {
            const start = roundUpToHalfHour(range[0])
            const matchesCount = size * (size - 1) / 2
            const slotsNeeded = Math.ceil(matchesCount / courts)
            const requiredLength = (slotsNeeded - 1) * slotInterval + matchMinutes
            if (start + requiredLength > range[1]) continue
            const schedule = scheduleGroup(group, start, range[1])
            if (!schedule) continue
            const score = computeCandidateScore(group, day, range, requiredLength)
            candidates.push({
              pairs: group,
              pairIds: group.map((p)=>p.id),
              day,
              window: [start, range[1]],
              schedule,
              score,
              size,
              isTargetSize: size === TARGET_ZONE_SIZE,
            })
            break
          }
        }
      }
    }

    if (!candidates.length) {
      return {
        zones: [],
        unassigned: pool.map((pair)=>({ pair, reason: `No se encontró ninguna zona válida con la disponibilidad actual.` }))
      }
    }

    candidates.sort((a,b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.size !== a.size) return b.size - a.size
      return a.pairIds.length - b.pairIds.length
    })

    type CandidateSolution = {
      selected: Candidate[]
      assigned: number
      targetZones: number
      totalDeviation: number
      sizeSum: number
      sizeSquaredSum: number
      score: number
      totalDuration: number
      zoneCount: number
    }

    function balanceVariance(solution: CandidateSolution) {
      if (solution.zoneCount === 0) return 0
      const avg = solution.sizeSum / solution.zoneCount
      return solution.sizeSquaredSum / solution.zoneCount - avg * avg
    }

    function betterSolution(a: CandidateSolution, b: CandidateSolution) {
      if (a.assigned !== b.assigned) return a.assigned > b.assigned
      if (a.totalDeviation !== b.totalDeviation) return a.totalDeviation < b.totalDeviation
      if (a.targetZones !== b.targetZones) return a.targetZones > b.targetZones
      const aBalance = balanceVariance(a)
      const bBalance = balanceVariance(b)
      if (aBalance !== bBalance) return aBalance < bBalance
      if (a.score !== b.score) return a.score > b.score
      if (a.totalDuration !== b.totalDuration) return a.totalDuration < b.totalDuration
      return a.zoneCount < b.zoneCount
    }

    const pairIndex = new Map<string, number>()
    pool.forEach((pair, index) => pairIndex.set(pair.id, index))

    const dp = new Map<bigint, CandidateSolution>()
    dp.set(0n, {
      selected: [],
      assigned: 0,
      targetZones: 0,
      totalDeviation: 0,
      sizeSum: 0,
      sizeSquaredSum: 0,
      score: 0,
      totalDuration: 0,
      zoneCount: 0,
    })

    for (const candidate of candidates) {
      const candidateMask = candidate.pairIds.reduce((mask, id) => mask | (1n << BigInt(pairIndex.get(id)!)), 0n)
      const currentEntries = Array.from(dp.entries())
      for (const [mask, solution] of currentEntries) {
        if (mask & candidateMask) continue
        const newMask = mask | candidateMask
        const newSolution: CandidateSolution = {
          selected: [...solution.selected, candidate],
          assigned: solution.assigned + candidate.size,
          targetZones: solution.targetZones + (candidate.isTargetSize ? 1 : 0),
          totalDeviation: solution.totalDeviation + Math.abs(candidate.size - TARGET_ZONE_SIZE),
          sizeSum: solution.sizeSum + candidate.size,
          sizeSquaredSum: solution.sizeSquaredSum + candidate.size * candidate.size,
          score: solution.score + candidate.score,
          totalDuration: solution.totalDuration + (candidate.window[1] - candidate.window[0]),
          zoneCount: solution.zoneCount + 1,
        }
        const existing = dp.get(newMask)
        if (!existing || betterSolution(newSolution, existing)) {
          dp.set(newMask, newSolution)
        }
      }
    }

    let bestSolution = dp.get(0n)!
    for (const solution of dp.values()) {
      if (betterSolution(solution, bestSolution)) bestSolution = solution
    }

    const zones = bestSolution.selected.map((candidate, index) => ({
      id: `zone-${index+1}`,
      day: candidate.day,
      start: minutesToTime(candidate.window[0]),
      end: minutesToTime(candidate.window[1]),
      pairs: candidate.pairs,
      matches: candidate.schedule,
    }))

    const assignedIds = new Set(bestSolution.selected.flatMap((candidate) => candidate.pairIds))
    const unassignedPairs = pool.filter((p) => !assignedIds.has(p.id))
    const unassigned = unassignedPairs.map((p) => {
      const compatibles = pool.filter((other) => other.id !== p.id && Object.keys(pairAvail[other.id]||{}).some((d) => pairAvail[p.id] && pairAvail[p.id][d]))
      let reason = `No fue posible incluir esta pareja en ninguna zona válida sin romper las restricciones de disponibilidad.`
      if (compatibles.length === 1) {
        reason = `Se encontraron 2 parejas compatibles, pero no alcanzan el mínimo de ${MIN_ZONE_SIZE} parejas requerido para una zona.`
      } else if (compatibles.length >= 2) {
        reason = `Hay otras parejas con día en común, pero no existe una franja horaria suficiente para completar todos los partidos con esta pareja.`
      }
      return { pair: p, reason }
    })

    return { zones, unassigned }
  }

  const [unassignedList, setUnassignedList] = useState<{ pair: Pair; reason: string }[]>([])

  function handleGenerate() {
    const res = generateZones(pairs)
    setZones(res.zones)
    setUnassignedList(res.unassigned)
    setZonesSaved(false)
    setStatus(res.zones.length > 0 ? 'Vista previa generada. Revisa los horarios y confirma para guardar.' : 'No se pudo generar ninguna zona con la disponibilidad actual.')
  }

  async function handleSaveZones() {
    if (!routeId) {
      setStatus('Falta el id del torneo.');
      return;
    }
    if (!zones.length) {
      setStatus('No hay zonas para guardar. Genera una vista previa primero.');
      return;
    }
    const unsavedPair = zones
      .flatMap((zone) => zone.pairs)
      .find((pair) => pair.id.startsWith('seed-') || pair.id.startsWith('manual-'));
    if (unsavedPair) {
      setStatus('Guarda primero todas las parejas antes de confirmar las zonas.');
      return;
    }

    const payload = buildZoneSavePayload(zones);
    setSavingZones(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/admin/torneos/${routeId}/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zones: payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setStatus(data.error || 'Ya existe una planificación para este torneo.');
          return;
        }
        setStatus(data.error || 'No se pudo guardar las zonas.');
        return;
      }

      setZonesSaved(true);
      setStatus(`✓ Planificación confirmada: ${zones.length} zonas · ${assignedPairsCount} parejas asignadas · ${totalMatchesCount} partidos.`);
    } catch (error) {
      console.error(error);
      setStatus('Error guardando las zonas. Revisa la consola.');
    } finally {
      setSavingZones(false);
    }
  }

  // --- Seeding helpers for testing ---
  const [seedCount, setSeedCount] = useState<number>(8)

  function randomName() {
    const first = ['Juan','Carlos','Ana','María','Lucía','Pedro','Luciano','Sofía','Diego','Paula']
    const last = ['Pérez','Gómez','Rodríguez','López','Martínez','García','Fernández','Sánchez']
    const a = first[Math.floor(Math.random()*first.length)]
    const b = last[Math.floor(Math.random()*last.length)]
    return `${a} ${b}`
  }

  function randomAvailability(perMatchMinutes: number): Availability[] {
    const daysKeys = ['mon','tue','wed','thu','fri','sat','sun']
    const count = 1 + Math.floor(Math.random()*2) // 1-2 slots
    const out: Availability[] = []
    for (let i=0;i<count;i++) {
      const day = daysKeys[Math.floor(Math.random()*daysKeys.length)]
      // pick a start between 15:00 and 20:00
      const startHour = 15 + Math.floor(Math.random()*6)
      const startMin = Math.random() < 0.5 ? '00' : '30'
      const start = `${String(startHour).padStart(2,'0')}:${startMin}`
      // end at least perMatchMinutes after start, add 60-180min random buffer
      const sMin = timeToMinutes(start)
      const endMin = sMin + perMatchMinutes + 60 + Math.floor(Math.random()*121)
      const end = minutesToTime(Math.min(endMin, 23*60 + 59))
      out.push({ day, start, end })
    }
    return out
  }

  function generateRandomPairs(n: number, persist = false) {
    const perMatch = tournamentType === 'normal' ? 60 : 30
    const newPairs: Pair[] = []
    for (let i=0;i<n;i++) {
      const p: Pair = {
        id: `seed-${Date.now()}-${i}-${Math.floor(Math.random()*10000)}`,
        playerA: randomName(),
        playerB: randomName(),
        availability: randomAvailability(perMatch),
      }
      newPairs.push(p)
    }
    if (persist) savePairs(newPairs)
    else setPairs((cur)=>[...cur, ...newPairs])
  }

  function handleRemovePair(id: string) { setPairs((c)=>c.filter(p=>p.id!==id)); }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <style jsx>{`
        input, textarea, select {
          color: #F5F5F5 !important;
          -webkit-text-fill-color: #F5F5F5 !important;
        }
        /* Ensure placeholders remain grey */
        ::placeholder { color: #71717A !important; }
        /* Attempt to style native option dropdowns (may be ignored by some browsers) */
        select {
          background: #1F1F22 !important;
          border-color: #333338 !important;
          -webkit-appearance: none !important;
          appearance: none !important;
        }
        option {
          background: #1F1F22 !important;
          color: #F5F5F5 !important;
        }
        select::-ms-expand { display: none; }
      `}</style>
      <button onClick={() => router.back()} className="mb-6 text-sm text-[#A1A1AA] transition-colors hover:text-white">← Volver</button>

      <h1 className="mb-4 text-2xl font-bold text-white">Gestionar torneo</h1>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] items-start min-h-0">
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#2A2A2F] bg-[#18181B] p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Agregar pareja manualmente</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-[#D4D4D8]">Jugador A
                <input value={playerA} onChange={(e)=>setPlayerA(e.target.value)} placeholder="Ej: Juan Pérez" className="mt-2 w-full rounded-xl border bg-[#1F1F22] px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#71717A] border-[#333338] focus:border-[#00C389] focus:ring-2 focus:ring-[#00C389]/20 outline-none" />
              </label>

              <label className="block text-sm text-[#D4D4D8]">Jugador B
                <input value={playerB} onChange={(e)=>setPlayerB(e.target.value)} placeholder="Ej: María Gómez" className="mt-2 w-full rounded-xl border bg-[#1F1F22] px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#71717A] border-[#333338] focus:border-[#00C389] focus:ring-2 focus:ring-[#00C389]/20 outline-none" />
              </label>

              <div className="sm:col-span-2">
                <label className="block text-sm text-[#D4D4D8]">Disponibilidad de la pareja</label>
                <p className="mt-1 text-xs text-[#A1A1AA]">Seleccioná los días y horarios en los que esta pareja puede jugar. Podés agregar varias franjas.</p>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-2 text-xs text-[#D4D4D8]">Día</div>
                    <div className="flex flex-wrap gap-2">
                      {days.map(d=> (
                        <button key={d.key} type="button" onClick={()=>setSelectedDay(d.key)} className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm min-w-[44px] ${selectedDay===d.key? 'bg-[#00C389] text-black border-2 border-[#00C389]':'bg-[#2A2A2F] text-[#F5F5F5] border border-[#2A2A2F]'} hover:brightness-105`}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-end">
                    <div>
                      <div className="mb-1 text-xs text-[#D4D4D8]">Desde</div>
                      <select value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="w-full rounded-lg bg-[#1F1F22] px-3 py-3 text-sm text-[#F5F5F5] border border-[#333338] focus:border-[#00C389] focus:ring-2 focus:ring-[#00C389]/20 outline-none">{timeOptions.map(t=>(<option key={t} value={t}>{t}</option>))}</select>
                    </div>

                    <div>
                      <div className="mb-1 text-xs text-[#D4D4D8]">Hasta</div>
                      <select value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="w-full rounded-lg bg-[#1F1F22] px-3 py-3 text-sm text-[#F5F5F5] border border-[#333338] focus:border-[#00C389] focus:ring-2 focus:ring-[#00C389]/20 outline-none">{timeOptions.map(t=>(<option key={t} value={t}>{t}</option>))}</select>
                    </div>

                    <div className="flex items-end">
                      <button onClick={addOrUpdateAvailability} className="w-full rounded-lg bg-[#00C389] px-4 py-3 text-sm font-semibold text-black hover:bg-[#05b97a] disabled:opacity-60">{editingAvailabilityIndex===null? 'Agregar disponibilidad':'Actualizar'}</button>
                    </div>
                  </div>

                  {availabilities.length>0 && (
                    <div className="mt-2 space-y-2">
                      <div className="mb-2 text-sm text-[#D4D4D8]">Disponibilidades agregadas</div>
                      <div className="space-y-2">
                        {availabilities.map((a,i)=>(
                          <div key={`${a.day}-${a.start}-${a.end}-${i}`} className="flex items-center justify-between gap-3 rounded-lg border border-[#2A2A2F] bg-[#18181B] px-3 py-2">
                            <div className="flex items-center gap-3">
                              <span className="h-2 w-2 rounded-full bg-[#00C389] block" />
                              <div>
                                <div className="text-sm text-[#F5F5F5] font-medium">{days.find(d=>d.key===a.day)?.label ?? a.day}</div>
                                <div className="text-xs text-[#A1A1AA]">{a.start} — {a.end}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={()=>editAvailability(i)} className="text-xs text-[#00C389]">Editar</button>
                              <button onClick={()=>removeAvailability(i)} className="text-xs text-[#FB7185]">Eliminar</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button disabled={loading} onClick={handleAddPair} className="rounded-lg bg-[#00C389] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#05b97a] disabled:opacity-50">Añadir pareja</button>
              <button disabled={loading} onClick={handleParse} className="rounded-lg bg-[#06B6D4] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#0aa8bf] disabled:opacity-50">Cargar desde texto</button>
            </div>
            {status? (<p className="mt-4 text-sm text-[#F5F5F5]">{status}</p>):null}
          </section>

          {existingPlayers.length>0? (
            <section className="rounded-3xl border border-[#2A2A2F] bg-[#18181B] p-6">
              <h2 className="mb-2 text-lg font-semibold text-white">Jugadores creados</h2>
              <p className="mb-4 text-sm text-[#A1A1AA]">Usa estos jugadores para rellenar los campos al formar una nueva pareja.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {existingPlayers.map(p=> (
                  <button key={p.id} type="button" onClick={()=>setPlayerA(p.full_name)} className="rounded-2xl border border-[#333338] bg-[#0F1113] px-4 py-3 text-left text-sm text-[#F5F5F5] transition hover:border-[#00C389]">
                    <p className="font-medium text-[#F5F5F5]">{p.full_name}</p>
                    <p className="mt-1 text-xs text-[#A1A1AA]">{p.email||'sin email'}</p>
                  </button>
                ))}
              </div>
            </section>
          ):null}

          <section className="rounded-3xl border border-[#2A2A2F] bg-[#18181B] p-6">
            <h2 className="mb-2 text-lg font-semibold text-white">Carga masiva por texto</h2>
            <p className="mb-3 text-sm text-[#A1A1AA]">Formato: <strong className="text-[#F5F5F5]">Juan Perez, Maria Gomez | Vie 17:00-21:00 | Sab 18:00-21:00</strong></p>
            <textarea value={text} onChange={(e)=>setText(e.target.value)} rows={5} className="w-full rounded-2xl border border-[#333338] bg-[#1F1F22] px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#71717A] resize-y" placeholder={`Ejemplo:\nJuan Perez, Maria Gomez | Vie 17:00-21:00 | Sab 18:00-21:00\nCarlos Ruiz, Ana Lopez | Vie 19:00-23:00`} />
            <p className="mt-2 text-xs text-[#A1A1AA]">Ayuda: Cada línea debe contener los nombres separados por coma y opcionalmente franjas con el formato <em>Vie 17:00-21:00</em>.</p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-[#2A2A2F] bg-[#18181B] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Parejas guardadas</h2>
                <p className="text-sm text-[#A1A1AA]">{pairs.length} parejas registradas</p>
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-xs text-[#D4D4D8]">Tipo de torneo</label>
                  <select value={tournamentType} onChange={(e)=>setTournamentType(e.target.value as any)} className="rounded-md bg-[#1F1F22] px-3 py-2 text-sm text-[#F5F5F5] border border-[#333338]">
                    <option value="normal">Normal</option>
                    <option value="americano">Americano</option>
                  </select>
                </div>
                <p className="mt-2 text-xs text-[#A1A1AA]">{tournamentType==='normal' ? 'Torneo normal — intervalos de inicio entre partidos: 60 minutos.' : 'Torneo americano — intervalos de inicio entre partidos: 30 minutos.'}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2 items-center">
                  <label className="text-xs text-[#D4D4D8]">Canchas</label>
                  <input type="number" value={courts} onChange={(e)=>setCourts(Math.max(1,Number(e.target.value)))} className="w-20 rounded-md bg-[#1F1F22] px-2 py-1 text-sm text-[#F5F5F5] border border-[#333338]" />
                  <div className="ml-2 text-xs text-[#A1A1AA]">Duración por partido: {tournamentType==='normal' ? '60' : '30'} min (fija)</div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button onClick={handleGenerate} className="rounded-lg bg-[#FB923C] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f77a2b]">Generar zonas</button>
                  <button disabled={savingZones || !zones.length || zonesSaved} onClick={handleSaveZones} className="rounded-lg bg-[#10B981] px-4 py-2 text-sm font-semibold text-black hover:bg-[#0ea86a] disabled:cursor-not-allowed disabled:opacity-50">Confirmar y guardar zonas</button>
                </div>
                {zonesSaved ? (<p className="mt-2 text-sm text-[#8EE7B0]">Zonas guardadas en el torneo.</p>) : zones.length > 0 ? (<p className="mt-2 text-sm text-[#A1A1AA]">Esta es una vista previa. Confirma para guardar las zonas en el torneo.</p>) : null}
                <div className="mt-3 flex items-center gap-2">
                  <input type="number" min={1} value={seedCount} onChange={(e)=>setSeedCount(Math.max(1,Number(e.target.value||1)))} className="w-20 rounded-md bg-[#1F1F22] px-2 py-1 text-sm text-[#F5F5F5] border border-[#333338]" />
                  <button onClick={()=>generateRandomPairs(seedCount,false)} className="rounded-lg bg-[#06B6D4] px-3 py-2 text-sm font-semibold text-black hover:bg-[#0aa8bf]">Sembrar (preview)</button>
                  <button onClick={()=>generateRandomPairs(seedCount,true)} className="rounded-lg bg-[#10B981] px-3 py-2 text-sm font-semibold text-black hover:bg-[#0ea86a]">Sembrar y guardar</button>
                </div>
              </div>
            </div>

            {pairs.length===0? (
              <div className="mt-6 text-sm text-[#A1A1AA]">Todavía no hay parejas guardadas.</div>
            ): (
              <div className="mt-6 space-y-3">
                {pairs.map((pair)=> (
                  <div key={pair.id} className="flex flex-col gap-3 rounded-2xl border border-[#2A2A2F] bg-[#0F1113] px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#F5F5F5] truncate">{pair.playerA} &ndash; {pair.playerB}</p>
                        {pair.time? <p className="text-xs text-[#A1A1AA]">Horario: {pair.time}</p>:null}
                      </div>
                      <div className="flex items-start gap-2">
                        <button onClick={()=>handleRemovePair(pair.id)} className="rounded-lg px-3 py-2 text-xs text-[#FB7185] border border-transparent hover:bg-[#1b0b10]">Eliminar</button>
                      </div>
                    </div>

                    {pair.createdUsers && pair.createdUsers.length>0? (
                      <div className="rounded-2xl border border-[#153f2f] bg-[#08221a] p-3 text-xs text-[#A1A1AA]">
                        <p className="font-medium text-[#C6F7E6]">Usuarios creados</p>
                        {pair.createdUsers.map((user,index)=> (
                          <div key={index} className="mt-2 space-y-1">
                            <p className="text-sm text-[#F5F5F5]">{user.fullName}</p>
                            <p className="text-xs text-[#A1A1AA]">Email: {user.email || 'n/a'}</p>
                            {user.password? <p className="text-xs text-[#A1A1AA]">Contraseña: {user.password}</p>: <p className="text-xs text-[#71717A]">Ya existía</p>}
                          </div>
                        ))}
                      </div>
                    ):null}

                    {pair.availability && pair.availability.length>0? (
                      <div className="mt-2 text-sm">
                        <p className="text-xs font-medium text-[#D4D4D8]">Disponibilidad:</p>
                        <div className="mt-1 flex flex-col gap-2">
                          {pair.availability.map((a,idx)=> (
                            <div key={idx} className="flex items-center justify-between rounded-md bg-[#18181B] border border-[#2A2A2F] px-3 py-2">
                              <div className="flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-[#00C389] block" />
                                <div className="text-sm text-[#F5F5F5]">{availabilityToLabel(a)}</div>
                              </div>
                              <div className="text-xs text-[#A1A1AA]">&nbsp;</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ):null}

                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-[#2A2A2F] bg-[#18181B] p-6">
            <h2 className="mb-3 text-lg font-semibold text-white">Zonas generadas</h2>
            {zones.length===0? (<p className="text-sm text-[#A1A1AA]">Todavía no se generaron zonas.</p>): (
              <div className="space-y-4">
                {zones.map((zone, index)=>(
                  <div key={zone.id} className="rounded-2xl border border-[#2A2A2F] bg-[#0F1113] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="mb-1 text-sm font-semibold text-white">Zona {index+1}</p>
                        <p className="text-xs text-[#A1A1AA]">{zone.day} · {zone.start} - {zone.end}</p>
                        <p className="text-xs text-[#A1A1AA]">{zone.pairs.length} parejas · {zone.matches.length} partidos · {DEFAULT_COURTS} canchas</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-[#A1A1AA]">
                      <div className="mb-2">
                        <p className="text-xs text-[#D4D4D8]">Parejas en la zona:</p>
                        <ul className="mt-1 text-sm text-[#F5F5F5]">
                          {zone.pairs.map((p,pi)=>(<li key={pi}>{p.playerA} – {p.playerB}</li>))}
                        </ul>
                      </div>
                      <ul className="space-y-2">
                        {zone.matches.map((m,mi)=>(
                          <li key={mi} className="flex items-center justify-between">
                            <div>{m.time} · {m.a} vs {m.b}</div>
                            <div className="text-xs text-[#A1A1AA]">Cancha {m.court}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {unassignedList.length>0 && (
              <div className="mt-4 rounded-2xl border border-[#2A2A2F] bg-[#0F1113] p-4">
                <p className="mb-2 text-sm font-semibold text-[#FB923C]">Parejas sin zona</p>
                <ul className="text-sm text-[#F5F5F5] space-y-2">
                  {unassignedList.map((u,ui)=>(
                    <li key={ui} className="flex flex-col">
                      <div className="font-medium">{u.pair.playerA} – {u.pair.playerB}</div>
                      <div className="text-xs text-[#A1A1AA]">Motivo: {u.reason}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
