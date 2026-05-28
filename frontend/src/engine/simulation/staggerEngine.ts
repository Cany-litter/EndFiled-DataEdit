import type { Track, SystemConstants, TimelineEnemy } from '../types/timeline'
import { DEFAULT_SYSTEM_CONSTANTS } from './types'

export interface StaggerCurvePoint {
  time: number
  stagger: number
  broken: boolean
  brokenAt: number | null
}

export interface SpCurvePoint {
  time: number
  sp: number
}

export interface SegmentRange {
  start: number
  end: number
}

export interface StaggerSimResult {
  spCurve: SpCurvePoint[]
  enemyCurves: Record<string, StaggerCurvePoint[]>
  enemyNodeSegments: Record<string, SegmentRange[]>
  enemyLockSegments: Record<string, SegmentRange[]>
}

interface EnemyState {
  id: string
  stagger: number
  broken: boolean
  brokenAt: number | null
  breakTimer: number
}

function createEnemyStates(enemies: TimelineEnemy[]): EnemyState[] {
  return enemies.map(e => ({
    id: e.id,
    stagger: 0,
    broken: false,
    brokenAt: null,
    breakTimer: 0,
  }))
}

export function runStaggerSimulation(
  tracks: Track[],
  enemies: TimelineEnemy[],
  systemConstants: SystemConstants = DEFAULT_SYSTEM_CONSTANTS,
): StaggerSimResult {
  if (enemies.length === 0) {
    return { spCurve: [], enemyCurves: {}, enemyNodeSegments: {}, enemyLockSegments: {} }
  }

  const states = createEnemyStates(enemies)
  const spCurve: SpCurvePoint[] = []
  const enemyCurves: Record<string, StaggerCurvePoint[]> = {}
  const enemyNodeSegments: Record<string, SegmentRange[]> = {}
  const enemyLockSegments: Record<string, SegmentRange[]> = {}
  for (const e of enemies) {
    enemyCurves[e.id] = []
    enemyNodeSegments[e.id] = []
    enemyLockSegments[e.id] = []
  }

  // Collect all events: action starts + damage ticks
  interface Event {
    time: number
    type: 'sp_change' | 'stagger_change'
    enemyId?: string
    value: number
  }
  const events: Event[] = []

  // SP state
  let sp = systemConstants.initialSp
  const spMax = systemConstants.maxSp
  let lastEventTime = 0

  function recordCurves(t: number) {
    spCurve.push({ time: Math.round(t * 10) / 10, sp: Math.round(sp * 10) / 10 })
    for (const st of states) {
      enemyCurves[st.id].push({
        time: Math.round(t * 10) / 10,
        stagger: Math.round(st.stagger * 10) / 10,
        broken: st.broken,
        brokenAt: st.brokenAt ? Math.round(st.brokenAt * 10) / 10 : null,
      })
    }
  }

  function advanceTime(now: number) {
    if (now <= lastEventTime) return
    const dt = now - lastEventTime
    sp = Math.min(spMax, sp + systemConstants.spRegenRate * dt)
    for (const st of states) {
      if (st.broken) {
        st.breakTimer -= dt
        if (st.breakTimer <= 0) {
          st.broken = false
          st.stagger = 0
          st.brokenAt = null
        }
      }
    }
    lastEventTime = now
  }

  // Build event queue from tracks
  for (const track of tracks) {
    if (track.kind === 'state') continue
    for (const action of track.actions) {
      const targets = action.targetEnemyIds || []
      if (targets.length === 0) continue

      // SP cost at action start
      if (action.spCost) {
        events.push({ time: action.startTime, type: 'sp_change', value: -action.spCost })
      }

      // Damage ticks
      for (const dt of action.damageTicks || []) {
        const t = action.startTime + dt.offset
        if (dt.sp > 0) events.push({ time: t, type: 'sp_change', value: dt.sp })
        for (const eid of targets) {
          if (dt.stagger > 0) events.push({ time: t, type: 'stagger_change', enemyId: eid, value: dt.stagger })
        }
      }
    }
  }

  events.sort((a, b) => a.time - b.time)

  // Process events
  recordCurves(0)
  for (const ev of events) {
    advanceTime(ev.time)

    if (ev.type === 'sp_change') {
      sp = Math.max(0, Math.min(spMax, sp + ev.value))
    }

    if (ev.type === 'stagger_change' && ev.enemyId) {
      const st = states.find(s => s.id === ev.enemyId)
      if (!st || st.broken) continue
      st.stagger += ev.value
      const enemy = enemies.find(e => e.id === ev.enemyId)
      if (enemy && st.stagger >= enemy.maxStagger) {
        st.broken = true
        st.stagger = enemy.maxStagger
        st.brokenAt = ev.time
        st.breakTimer = enemy.staggerBreakDuration
        // Lock segment starts at break
        enemyLockSegments[st.id].push({ start: ev.time, end: ev.time + enemy.staggerBreakDuration })
      }
      // Track node zones: when stagger is close to max, show node windows
      if (enemy && enemy.staggerNodeCount > 0 && !st.broken && st.stagger > 0) {
        const thresholdPerNode = enemy.maxStagger / (enemy.staggerNodeCount + 1)
        const currentNode = Math.floor(st.stagger / thresholdPerNode)
        if (currentNode < enemy.staggerNodeCount) {
          const nodeStart = (currentNode + 1) * thresholdPerNode - enemy.staggerNodeDuration
          const nodeEnd = (currentNode + 1) * thresholdPerNode
          enemyNodeSegments[st.id].push({ start: Math.max(0, nodeStart), end: nodeEnd })
        }
      }
    }

    if (Math.abs(ev.time - Math.round(ev.time / 0.5) * 0.5) < 0.01) {
      recordCurves(ev.time)
    }
  }

  // Final tick
  const finalTime = events.length > 0 ? events[events.length - 1].time + 1 : 30
  advanceTime(finalTime)
  recordCurves(finalTime)

  return { spCurve, enemyCurves, enemyNodeSegments, enemyLockSegments }
}
