const TARGET_ZONE_SIZE = 4;

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(m) {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function combinations(arr) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      out.push([arr[i], arr[j]]);
    }
  }
  return out;
}

function scheduleMatchesForZone(pairsInZone, windowStart, windowEnd, courtsNum = 2, matchMinutes, slotInterval, matchesList) {
  const matchesInfo = matchesList ?? combinations(pairsInZone.map((p) => p.id)).map(([a, b]) => ({ a, b }));
  const totalMatches = matchesInfo.length;
  const maxSlots = Math.floor((windowEnd - windowStart - matchMinutes) / slotInterval) + 1;
  if (maxSlots <= 0) return null;

  const slots = [];
  for (let i = 0; i < maxSlots; i++) {
    const s = windowStart + i * slotInterval;
    if (s + matchMinutes > windowEnd) break;
    slots.push({ start: s, capacity: courtsNum, assignments: [] });
  }
  if (!slots.length) return null;

  const teamFrequency = {};
  for (const m of matchesInfo) {
    teamFrequency[m.a] = (teamFrequency[m.a] || 0) + 1;
    teamFrequency[m.b] = (teamFrequency[m.b] || 0) + 1;
  }

  const orderedMatches = [...matchesInfo].sort((x, y) => {
    const fx = (teamFrequency[x.a] || 0) + (teamFrequency[x.b] || 0);
    const fy = (teamFrequency[y.a] || 0) + (teamFrequency[y.b] || 0);
    return fy - fx;
  });

  const assignments = [];
  const slotAssignments = slots.map(() => []);

  function assignMatch(index) {
    if (index >= orderedMatches.length) return true;
    const match = orderedMatches[index];

    for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
      const slot = slots[slotIndex];
      if (slotAssignments[slotIndex].length >= slot.capacity) continue;
      const inThisSlot = slotAssignments[slotIndex].some((a) => a.a === match.a || a.b === match.a || a.a === match.b || a.b === match.b);
      if (inThisSlot) continue;

      const usedCourts = new Set(slotAssignments[slotIndex].map((a) => a.court));
      let court = 1;
      while (usedCourts.has(court)) court++;

      slotAssignments[slotIndex].push({ a: match.a, b: match.b, time: slot.start, court });
      assignments.push({ a: match.a, b: match.b, time: slot.start, court });

      if (assignMatch(index + 1)) return true;

      slotAssignments[slotIndex].pop();
      assignments.pop();
    }

    return false;
  }

  if (!assignMatch(0)) return null;
  return assignments.map((a) => ({ a: a.a, b: a.b, time: minutesToTime(a.time), court: a.court }));
}

function generateZones(pairs, tournamentType = 'normal', courts = 2) {
  if (!pairs.length) return { zones: [], unassigned: [] };
  const pairAvail = {};
  const allDays = new Set();

  for (const p of pairs) {
    pairAvail[p.id] = {};
    const av = p.availability ?? [];
    for (const a of av) {
      const s = timeToMinutes(a.start);
      const e = timeToMinutes(a.end);
      if (!pairAvail[p.id][a.day]) pairAvail[p.id][a.day] = [];
      pairAvail[p.id][a.day].push([s, e]);
      allDays.add(a.day);
    }
  }

  const pool = [...pairs].sort((x, y) => Object.keys(pairAvail[x.id] || {}).length - Object.keys(pairAvail[y.id] || {}).length);
  const MIN_ZONE_SIZE = 3;
  if (pool.length < MIN_ZONE_SIZE) {
    return {
      zones: [],
      unassigned: pool.map((pair) => ({ pair, reason: `No se puede formar ninguna zona v�lida con menos de ${MIN_ZONE_SIZE} parejas.` })),
    };
  }

  const slotInterval = tournamentType === 'normal' ? 60 : 30;
  const matchMinutes = slotInterval;
  const maxZoneSize = Math.min(pool.length, TARGET_ZONE_SIZE + 2);
  const dayList = Array.from(allDays);

  function intersectTwoRanges(a, b) {
    const result = [];
    for (const [aStart, aEnd] of a) {
      for (const [bStart, bEnd] of b) {
        const start = Math.max(aStart, bStart);
        const end = Math.min(aEnd, bEnd);
        if (start < end) result.push([start, end]);
      }
    }
    return result;
  }

  function intersectAllRanges(rangeSets) {
    if (!rangeSets.length) return [];
    let result = rangeSets[0];
    for (let i = 1; i < rangeSets.length && result.length > 0; i++) {
      result = intersectTwoRanges(result, rangeSets[i]);
    }
    return result;
  }

  function roundUpToHalfHour(minutes) {
    return Math.ceil(minutes / 30) * 30;
  }

  function computeCandidateScore(group, day, window, requiredLength) {
    const size = group.length;
    let score = size * 100;
    if (size === TARGET_ZONE_SIZE) score += 200;
    else if (size < TARGET_ZONE_SIZE) score -= 80 * (TARGET_ZONE_SIZE - size);
    else score += 40 * (size - TARGET_ZONE_SIZE);

    const dayFlexBonus = group.reduce((sum, p) => {
      const days = Object.keys(pairAvail[p.id] || {}).length;
      return sum + Math.max(0, 10 - days) * 10;
    }, 0);

    score += dayFlexBonus;
    const rangeLength = window[1] - window[0];
    const slack = rangeLength - requiredLength;
    score += Math.min(40, Math.max(0, rangeLength / 10));
    score += Math.max(0, 20 - Math.floor(slack / 10));

    const matchesCount = (size * (size - 1)) / 2;
    const slotsNeeded = Math.ceil(matchesCount / courts);
    const courtUseRatio = matchesCount / (slotsNeeded * courts);
    score += Math.floor(courtUseRatio * 20);
    score -= Math.max(0, size > TARGET_ZONE_SIZE ? (size - TARGET_ZONE_SIZE) * 10 : 0);
    return score;
  }

  function scheduleGroup(group, windowStart, windowEnd) {
    return scheduleMatchesForZone(group, windowStart, windowEnd, courts, matchMinutes, slotInterval);
  }

  function* combinationsOf(arr, k) {
    const n = arr.length;
    if (k > n) return;
    const idx = Array.from({ length: k }, (_, i) => i);
    while (true) {
      yield idx.map((i) => arr[i]);
      let i = k - 1;
      while (i >= 0 && idx[i] === i + n - k) i--;
      if (i < 0) break;
      idx[i]++;
      for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
    }
  }

  const candidates = [];
  const MAX_COMBINATIONS = 20000;
  for (const day of dayList) {
    const available = pool.filter((p) => pairAvail[p.id] && pairAvail[p.id][day]);
    if (available.length < MIN_ZONE_SIZE) continue;
    available.sort((a, b) => Object.keys(pairAvail[a.id] || {}).length - Object.keys(pairAvail[b.id] || {}).length);

    const sizeOrder = [];
    for (let s = TARGET_ZONE_SIZE; s <= Math.min(maxZoneSize, available.length); s++) sizeOrder.push(s);
    for (let s = TARGET_ZONE_SIZE - 1; s >= MIN_ZONE_SIZE; s--) if (s <= available.length) sizeOrder.push(s);

    for (const size of sizeOrder) {
      let tried = 0;
      for (const group of combinationsOf(available, size)) {
        tried++;
        if (tried > MAX_COMBINATIONS) break;
        const dayRanges = group.map((p) => pairAvail[p.id][day]);
        const commonRanges = intersectAllRanges(dayRanges);
        if (!commonRanges.length) continue;

        for (const range of commonRanges) {
          const start = roundUpToHalfHour(range[0]);
          const matchesCount = (size * (size - 1)) / 2;
          const slotsNeeded = Math.ceil(matchesCount / courts);
          const requiredLength = (slotsNeeded - 1) * slotInterval + matchMinutes;
          if (start + requiredLength > range[1]) continue;
          const schedule = scheduleGroup(group, start, range[1]);
          if (!schedule) continue;
          const score = computeCandidateScore(group, day, range, requiredLength);
          candidates.push({
            pairs: group,
            pairIds: group.map((p) => p.id),
            day,
            window: [start, range[1]],
            schedule,
            score,
            size,
            isTargetSize: size === TARGET_ZONE_SIZE,
          });
          break;
        }
      }
    }
  }

  if (!candidates.length) {
    return {
      zones: [],
      unassigned: pool.map((pair) => ({ pair, reason: `No se encontr� ninguna zona v�lida con la disponibilidad actual.` })),
    };
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.size !== a.size) return b.size - a.size;
    return a.pairIds.length - b.pairIds.length;
  });

  function balanceVariance(solution) {
    if (solution.zoneCount === 0) return 0;
    const avg = solution.sizeSum / solution.zoneCount;
    return solution.sizeSquaredSum / solution.zoneCount - avg * avg;
  }

  function betterSolution(a, b) {
    if (a.assigned !== b.assigned) return a.assigned > b.assigned;
    if (a.totalDeviation !== b.totalDeviation) return a.totalDeviation < b.totalDeviation;
    if (a.targetZones !== b.targetZones) return a.targetZones > b.targetZones;
    const aBalance = balanceVariance(a);
    const bBalance = balanceVariance(b);
    if (aBalance !== bBalance) return aBalance < bBalance;
    if (a.score !== b.score) return a.score > b.score;
    if (a.totalDuration !== b.totalDuration) return a.totalDuration < b.totalDuration;
    return a.zoneCount < b.zoneCount;
  }

  const pairIndex = new Map();
  pool.forEach((pair, index) => pairIndex.set(pair.id, index));

  const dp = new Map();
  dp.set(0, {
    selected: [],
    assigned: 0,
    targetZones: 0,
    totalDeviation: 0,
    sizeSum: 0,
    sizeSquaredSum: 0,
    score: 0,
    totalDuration: 0,
    zoneCount: 0,
  });

  for (const candidate of candidates) {
    const candidateMask = candidate.pairIds.reduce((mask, id) => mask | (1 << pairIndex.get(id)), 0);
    const currentEntries = Array.from(dp.entries());
    for (const [mask, solution] of currentEntries) {
      if (mask & candidateMask) continue;
      const newMask = mask | candidateMask;
      const newSolution = {
        selected: [...solution.selected, candidate],
        assigned: solution.assigned + candidate.size,
        targetZones: solution.targetZones + (candidate.isTargetSize ? 1 : 0),
        totalDeviation: solution.totalDeviation + Math.abs(candidate.size - TARGET_ZONE_SIZE),
        sizeSum: solution.sizeSum + candidate.size,
        sizeSquaredSum: solution.sizeSquaredSum + candidate.size * candidate.size,
        score: solution.score + candidate.score,
        totalDuration: solution.totalDuration + (candidate.window[1] - candidate.window[0]),
        zoneCount: solution.zoneCount + 1,
      };
      const existing = dp.get(newMask);
      if (!existing || betterSolution(newSolution, existing)) {
        dp.set(newMask, newSolution);
      }
    }
  }

  let bestSolution = dp.get(0);
  for (const solution of dp.values()) {
    if (betterSolution(solution, bestSolution)) bestSolution = solution;
  }

  const zones = bestSolution.selected.map((candidate, index) => ({
    id: `zone-${index + 1}`,
    day: candidate.day,
    start: minutesToTime(candidate.window[0]),
    end: minutesToTime(candidate.window[1]),
    pairs: candidate.pairs,
    matches: candidate.schedule,
  }));
  const assignedIds = new Set(bestSolution.selected.flatMap((candidate) => candidate.pairIds));
  const unassignedPairs = pool.filter((p) => !assignedIds.has(p.id));
  const unassigned = unassignedPairs.map((p) => {
    const compatibles = pool.filter(
      (other) =>
        other.id !== p.id &&
        Object.keys(pairAvail[other.id] || {}).some((d) => pairAvail[p.id] && pairAvail[p.id][d])
    );
    let reason = `No fue posible incluir esta pareja en ninguna zona v�lida sin romper las restricciones de disponibilidad.`;
    if (compatibles.length === 1) {
      reason = `Se encontraron 2 parejas compatibles, pero no alcanzan el m�nimo de ${MIN_ZONE_SIZE} parejas requerido para una zona.`;
    } else if (compatibles.length >= 2) {
      reason = `Hay otras parejas con d�a en com�n, pero no existe una franja horaria suficiente para completar todos los partidos con esta pareja.`;
    }
    return { pair: p, reason };
  });
  return { zones, unassigned };
}

function printResult(title, result) {
  console.log('==================================================');
  console.log(title);
  console.log('Zonas generadas:', result.zones.length);
  result.zones.forEach((zone, idx) => {
    console.log(`Zona ${idx + 1}: ${zone.pairs.map((p) => p.id).join(', ')} (${zone.day} ${zone.start}-${zone.end})`);
    console.log('  Partidos:', zone.matches.length);
    zone.matches.forEach((m) => console.log(`   ${m.time} cancha ${m.court}: ${m.a} vs ${m.b}`));
  });
  console.log('Parejas sin zona:', result.unassigned.length);
  result.unassigned.forEach((u) => console.log(`   ${u.pair.id}: ${u.reason}`));
  console.log('');
}

function makePair(id, avail) {
  return { id, playerA: id, playerB: id, availability: avail };
}

const cases = [];
cases.push({ title: 'CASO 1 � 4 PAREJAS', pairs: ['A', 'B', 'C', 'D'].map((id) => makePair(id, [{ day: 'sat', start: '18:00', end: '22:00' }])), type: 'normal', courts: 2 });
cases.push({ title: 'CASO 2 � 8 PAREJAS', pairs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((id) => makePair(id, [{ day: 'sat', start: '18:00', end: '23:00' }])), type: 'normal', courts: 2 });
cases.push({ title: 'CASO 3 � 10 PAREJAS', pairs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((id) => makePair(id, [{ day: 'sat', start: '18:00', end: '23:00' }])), type: 'normal', courts: 2 });
cases.push({ title: 'CASO 4 � DOS PAREJAS', pairs: [makePair('A', [{ day: 'fri', start: '18:00', end: '22:00' }]), makePair('B', [{ day: 'fri', start: '18:00', end: '22:00' }])], type: 'normal', courts: 2 });
cases.push({ title: 'CASO 5 � TRES PAREJAS', pairs: ['A', 'B', 'C'].map((id) => makePair(id, [{ day: 'sat', start: '18:00', end: '22:00' }])), type: 'normal', courts: 2 });
cases.push({ title: 'CASO 6 � DISPONIBILIDADES INCOMPATIBLES', pairs: [makePair('A', [{ day: 'fri', start: '18:00', end: '22:00' }]), makePair('B', [{ day: 'fri', start: '18:00', end: '22:00' }]), makePair('C', [{ day: 'sat', start: '18:00', end: '22:00' }]), makePair('D', [{ day: 'sat', start: '18:00', end: '22:00' }])], type: 'normal', courts: 2 });
cases.push({ title: 'CASO 7 � PAREJA RESTRINGIDA', pairs: [makePair('A', [{ day: 'sat', start: '18:00', end: '22:00' }]), makePair('B', [{ day: 'fri', start: '18:00', end: '22:00' }, { day: 'sat', start: '18:00', end: '22:00' }]), makePair('C', [{ day: 'fri', start: '18:00', end: '22:00' }, { day: 'sat', start: '18:00', end: '22:00' }]), makePair('D', [{ day: 'fri', start: '18:00', end: '22:00' }, { day: 'sat', start: '18:00', end: '22:00' }]), makePair('E', [{ day: 'fri', start: '18:00', end: '22:00' }])], type: 'normal', courts: 2 });
cases.push({ title: 'CASO 8 � AMERICANO', pairs: ['A', 'B', 'C', 'D'].map((id) => makePair(id, [{ day: 'sat', start: '18:00', end: '20:00' }])), type: 'americano', courts: 2 });
cases.push({ title: 'CASO 9 � NORMAL', pairs: ['A', 'B', 'C', 'D'].map((id) => makePair(id, [{ day: 'sat', start: '18:00', end: '22:00' }])), type: 'normal', courts: 2 });
cases.push({ title: 'CASO 10 � VENTANA INSUFICIENTE', pairs: ['A', 'B', 'C'].map((id) => makePair(id, [{ day: 'fri', start: '18:00', end: '19:00' }])), type: 'normal', courts: 2 });
cases.push({ title: 'CASO 11 � CASO REAL', pairs: [
  { id: 'Ana', playerA: 'Ana P�rez', playerB: 'Juan S�nchez', availability: [{ day: 'fri', start: '18:00', end: '20:15' }, { day: 'fri', start: '20:30', end: '23:17' }] },
  { id: 'Luciano1', playerA: 'Luciano G�mez', playerB: 'Luciano Rodr�guez', availability: [{ day: 'fri', start: '18:30', end: '21:28' }] },
  { id: 'Pedro', playerA: 'Pedro P�rez', playerB: 'Juan Fern�ndez', availability: [{ day: 'thu', start: '16:00', end: '19:11' }, { day: 'fri', start: '20:30', end: '23:10' }] },
  { id: 'Ana2', playerA: 'Ana Garc�a', playerB: 'Ana S�nchez', availability: [{ day: 'tue', start: '18:30', end: '21:18' }] },
  { id: 'Paula', playerA: 'Paula Rodr�guez', playerB: 'Luciano L�pez', availability: [{ day: 'tue', start: '15:30', end: '17:42' }] },
  { id: 'Luciano2', playerA: 'Luciano Garc�a', playerB: 'Sof�a P�rez', availability: [{ day: 'sat', start: '20:00', end: '23:32' }, { day: 'mon', start: '17:00', end: '19:05' }] },
  { id: 'Luc�a1', playerA: 'Luc�a Rodr�guez', playerB: 'Carlos S�nchez', availability: [{ day: 'fri', start: '16:00', end: '19:36' }] },
  { id: 'Luc�a2', playerA: 'Luc�a Mart�nez', playerB: 'Juan S�nchez', availability: [{ day: 'sat', start: '15:00', end: '18:44' }, { day: 'fri', start: '16:00', end: '18:56' }] }
], type: 'normal', courts: 2 });

for (const c of cases) {
  const res = generateZones(c.pairs, c.type, c.courts);
  printResult(c.title, res);
}
