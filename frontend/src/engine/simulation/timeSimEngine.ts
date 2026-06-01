import type { Track, TimelineAction, SystemConstants, ResourceCurvePoint } from '../types/timeline'
import { DEFAULT_SYSTEM_CONSTANTS, type SkillType } from './types'
import { calcDamageByCategories, DAMAGE_CATEGORIES } from '../formulas/damageCategories'
import { collectCrit, piecewiseLinear, ARTS_INTENSITY_CURVE } from '../formulas/effectResolver'
import type { Buff } from '../types/buff'
import { calcSpellAnomalyDamage, calcPhysicalAnomalyDamage, spellAnomalyMultiplierMap, physicalAnomalyMultiplierMap, calcAnomalyLevel } from '../formulas/anomaly'
import { getComboMultiplier, updateCombo, COMBO_WINDOW } from './comboSystem'

export interface SimEvent {
  time: number
  charId: string
  type: 'action_start' | 'action_end' | 'damage_tick' | 'sp_change' | 'gauge_change' | 'stagger_change' | 'stagger_break' | 'stagger_recover'
  actionName?: string
  actionType?: string
  value?: number
}

export interface AnomalyEvent {
  time: number
  charId: string
  type: string
  anomalyType: string
  anomalyLevel: number
  damage: number
}

export interface DamageEvent {
  time: number
  charId: string
  actionName: string
  skillType: string
  element: string
  baseDamage: number
  finalDamage: number
  critMultiplier: number
  defenseMultiplier: number
  staggerMultiplier: number
  comboMultiplier: number
  artsMultiplier: number
  comboLevel: number
  isStaggered: boolean
  categoryBreakdown: Record<string, { multiplier: number; rawTotal: number }>
  anomalyDamage?: number
}

export interface SimResult {
  curves: ResourceCurvePoint[]
  events: SimEvent[]
  totalStaggerDamage: number
  totalSpUsed: number
  totalGaugeGained: number
  damageEvents?: DamageEvent[]
  totalDamage?: number
  damageCurve?: { time: number; damage: number }[]
  memberDamage?: Record<string, { total: number; skillBreakdown: Record<string, { count: number; total: number }> }>
  anomalyEvents?: AnomalyEvent[]
  totalAnomalyDamage?: number
}

export interface SimConfig {
  enemyMaxStagger: number
  prepDuration: number
  staggerNodeCount: number
  staggerNodeDuration: number
  staggerBreakDuration: number
}

export interface DamageSimConfig extends SimConfig {
  charSnapshots: Record<string, CharSimSnapshot>
  buffSchedule?: BuffManager
  enemyDef: number
  enemyResistance: number
}

export interface CharSimSnapshot {
  charId: string
  attack: number
  critRate: number
  critDamage: number
  artsPower: number
  str: number
  agi: number
  int: number
  wil: number
  charLevel: number
}

export interface BuffManager {
  getBuffsAt(charId: string, time: number): Buff[]
}

const DEFAULT_SIM_CONFIG: SimConfig = {
  enemyMaxStagger: 100,
  prepDuration: 5,
  staggerNodeCount: 1,
  staggerNodeDuration: 2,
  staggerBreakDuration: 11,
}

interface AnomalyAccum {
  conductive: number
  corrode: number
  burn: number
  freeze: number
  shatterReady: boolean
}

interface SimState {
  sp: number
  gauge: number
  stagger: number
  staggered: boolean
  staggerBreakTimer: number
  staggerNodesRemaining: number
  staggerNodeTimer: number
  totalStaggerDamage: number
  totalSpUsed: number
  totalGaugeGained: number
  lastEventTime: number
  comboCount: number
  lastComboTime: number
  anomalyAccum: Record<string, AnomalyAccum>
}

function createState(sc: SystemConstants, cfg: SimConfig): SimState {
  return {
    sp: sc.initialSp,
    gauge: 0,
    stagger: 0,
    staggered: false,
    staggerBreakTimer: 0,
    staggerNodesRemaining: cfg.staggerNodeCount,
    staggerNodeTimer: 0,
    totalStaggerDamage: 0,
    totalSpUsed: 0,
    totalGaugeGained: 0,
    lastEventTime: 0,
    comboCount: 0,
    lastComboTime: -10,
    anomalyAccum: {},
  }
}

function advanceTime(state: SimState, now: number, sc: SystemConstants, events: SimEvent[]) {
  if (now <= state.lastEventTime) return
  const dt = now - state.lastEventTime
  state.sp = Math.min(sc.maxSp, state.sp + sc.spRegenRate * dt)
  if (state.staggered) {
    state.staggerBreakTimer -= dt
    if (state.staggerBreakTimer <= 0) {
      state.staggered = false
      state.stagger = 0
      state.staggerNodesRemaining = 0
      events.push({ time: now, charId: '', type: 'stagger_recover' })
    }
  } else if (state.stagger > 0 && state.staggerNodesRemaining > 0) {
    state.staggerNodeTimer -= dt
    if (state.staggerNodeTimer <= 0 && state.stagger > 0) {
      state.staggerNodesRemaining--
      if (state.staggerNodesRemaining > 0) state.staggerNodeTimer = 0.5
    }
  }
  state.lastEventTime = now
}

function recordCurve(state: SimState, t: number, curves: ResourceCurvePoint[]) {
  if (Math.abs(t - Math.round(t / 0.5) * 0.5) < 0.01) {
    curves.push({
      time: Math.round(t * 10) / 10,
      sp: Math.round(state.sp * 10) / 10,
      gauge: Math.round(state.gauge * 10) / 10,
      stagger: Math.round(state.stagger * 10) / 10,
    })
  }
}

interface SimAction extends TimelineAction {
  charId: string
  trackKind: string
}

function collectActions(tracks: Track[]): SimAction[] {
  const actions: SimAction[] = []
  for (const track of tracks) {
    for (const a of track.actions) {
      actions.push({ ...a, charId: track.id, trackKind: track.kind ?? 'action' })
    }
  }
  return actions
}

interface ScheduledEvent {
  time: number
  type: 'action_start' | 'action_end' | 'damage_tick'
  action: SimAction
  tickIndex?: number
}

function buildSimQueue(actions: SimAction[]): ScheduledEvent[] {
  const queue: ScheduledEvent[] = []
  for (const a of actions) {
    queue.push({ time: a.startTime, type: 'action_start', action: a })
    const endTime = a.startTime + (a.duration || 0)
    queue.push({ time: endTime, type: 'action_end', action: a })
    for (let ti = 0; ti < (a.damageTicks || []).length; ti++) {
      const dt = a.damageTicks![ti]
      queue.push({ time: a.startTime + dt.offset, type: 'damage_tick', action: a, tickIndex: ti })
    }
  }
  queue.sort((a, b) => a.time - b.time || (a.type === 'action_end' && b.type !== 'action_end' ? -1 : 1))
  return queue
}

export function runTimelineSimulation(
  tracks: Track[],
  systemConstants: SystemConstants = DEFAULT_SYSTEM_CONSTANTS,
  simConfig: SimConfig = DEFAULT_SIM_CONFIG,
): SimResult {
  const curves: ResourceCurvePoint[] = []
  const events: SimEvent[] = []
  const state = createState(systemConstants, simConfig)
  const sc = systemConstants

  const actions = collectActions(tracks)
  if (actions.length === 0) {
    return { curves, events, totalStaggerDamage: 0, totalSpUsed: 0, totalGaugeGained: 0 }
  }

  const queue = buildSimQueue(actions)

  for (const ev of queue) {
    const t = ev.time
    advanceTime(state, t, sc, events)
    recordCurve(state, t, curves)

    if (ev.type === 'action_start') {
      const a = ev.action
      if (a.trackKind !== 'state') {
        const cost = Math.min(state.sp, a.spCost || 0)
        if (cost > 0) {
          state.sp -= cost
          state.totalSpUsed += cost
          events.push({ time: t, charId: a.charId, type: 'sp_change', actionName: a.name, value: state.sp })
        }
        state.gauge += (a.gaugeGain || 0) + (a.teamGaugeGain || 0)
        if (state.gauge > 100) state.gauge = 100
        if (a.teamGaugeGain) state.totalGaugeGained += a.teamGaugeGain
        events.push({
          time: t, charId: a.charId, type: 'action_start',
          actionName: a.name, actionType: a.type,
        })
      }
    }

    if (ev.type === 'damage_tick') {
      const a = ev.action
      const dt = a.damageTicks![ev.tickIndex!]
      if (!state.staggered) {
        state.stagger += dt.stagger
        state.totalStaggerDamage += dt.stagger
        events.push({
          time: t, charId: a.charId, type: 'stagger_change',
          actionName: a.name, value: state.stagger,
        })
      }
      if (dt.sp > 0) {
        state.sp = Math.min(sc.maxSp, state.sp + dt.sp)
        events.push({
          time: t, charId: a.charId, type: 'sp_change',
          actionName: a.name, value: state.sp,
        })
      }
      events.push({
        time: t, charId: a.charId, type: 'damage_tick',
        actionName: a.name, value: dt.hpDamage ?? dt.stagger,
      })
    }

    if (state.stagger >= simConfig.enemyMaxStagger && !state.staggered) {
      state.staggered = true
      state.stagger = simConfig.enemyMaxStagger
      state.staggerBreakTimer = simConfig.staggerBreakDuration
      state.staggerNodesRemaining = simConfig.staggerNodeCount
      events.push({ time: t, charId: '', type: 'stagger_break', value: state.stagger })
    }
  }

  const finalTime = Math.max(...queue.map(e => e.time)) + 1
  advanceTime(state, finalTime, sc, events)
  recordCurve(state, finalTime, curves)

  return { curves, events, totalStaggerDamage: state.totalStaggerDamage, totalSpUsed: state.totalSpUsed, totalGaugeGained: state.totalGaugeGained }
}

export function runTimelineSimulationWithDamage(
  tracks: Track[],
  systemConstants: SystemConstants = DEFAULT_SYSTEM_CONSTANTS,
  simConfig: DamageSimConfig,
): SimResult {
  const baseResult = runTimelineSimulation(tracks, systemConstants, simConfig)
  const charSnapshots = simConfig.charSnapshots
  const buffManager = simConfig.buffSchedule
  const damageEvents: DamageEvent[] = []
  const anomalyEvents: AnomalyEvent[] = []
  const memberDamage: Record<string, { total: number; skillBreakdown: Record<string, { count: number; total: number }> }> = {}
  const damageCurve: { time: number; damage: number }[] = []
  let cumulativeDamage = 0
  let totalAnomalyDamage = 0
  const state = createState(systemConstants, simConfig)

  const ELEMENT_TO_ANOMALY: Record<string, string> = {
    pyro: 'burn', cryo: 'freeze', electro: 'conductive', natural: 'corrode',
  }
  function getOrInitAnomaly(charId: string): AnomalyAccum {
    if (!state.anomalyAccum[charId]) {
      state.anomalyAccum[charId] = { conductive: 0, corrode: 0, burn: 0, freeze: 0, shatterReady: false }
    }
    return state.anomalyAccum[charId]
  }
  function processAnomaly(anomalyType: string, charStats: CharSimSnapshot, t: number, a: SimAction): number {
    const anomKey = anomalyType as keyof AnomalyAccum
    if (anomKey === 'shatterReady') return 0
    const baseMult = spellAnomalyMultiplierMap[anomalyType]
    if (!baseMult) return 0
    const accum = getOrInitAnomaly(a.charId)
    accum[anomKey] += 1
    if (accum[anomKey] >= 3) {
      const consumed = accum[anomKey]
      accum[anomKey] = 0
      const level = calcAnomalyLevel(consumed)
      const dmg = calcSpellAnomalyDamage({
        baseMultiplier: baseMult,
        anomalyLevel: level,
        casterLevel: charStats.charLevel,
        artsIntensity: charStats.artsPower,
      })
      anomalyEvents.push({ time: t, charId: a.charId, type: 'anomaly_burst', anomalyType, anomalyLevel: level, damage: dmg })
      return dmg
    }
    return 0
  }

  const actions = collectActions(tracks)
  if (actions.length === 0) return { ...baseResult, damageEvents, totalDamage: 0, damageCurve, memberDamage }

  const queue = buildSimQueue(actions)

  for (const ev of queue) {
    const t = ev.time
    advanceTime(state, t, systemConstants, [])

    if (ev.type === 'damage_tick') {
      const a = ev.action
      const charStats = charSnapshots[a.charId]
      if (!charStats) continue

      updateCombo(state, t)

      const buffs = buffManager ? buffManager.getBuffsAt(a.charId, t) : []

      const tickIndex = ev.tickIndex!
      const dt = a.damageTicks![tickIndex]
      const skillMultiplier = dt.hpDamage ? dt.hpDamage / 100 : (a.duration ? 1 : 0.5)
      const multiplier = Math.max(skillMultiplier, 0.01)

      const context = {
        skillType: a.type,
        element: a.element,
        statTotals: {
          strength: charStats.str,
          agility: charStats.agi,
          intellect: charStats.int,
          will: charStats.wil,
        },
      }

      const baseDamage = charStats.attack * multiplier
      const { finalDamage: catDamage, breakdown } = calcDamageByCategories(
        baseDamage,
        buffs,
        DAMAGE_CATEGORIES,
        context,
      )

      const crit = collectCrit(buffs, context, charStats.critRate, charStats.critDamage)

      const defMult = simConfig.enemyDef > 0 ? 100 / (simConfig.enemyDef + 100) : 0.5

      const staggerMult = state.staggered ? 1.3 : 1

      const comboMult = getComboMultiplier(state.comboCount, a.type)

      let artsMult = 1
      if (a.trackKind === 'state') {
        artsMult = piecewiseLinear(charStats.artsPower, ARTS_INTENSITY_CURVE)
      }

      const finalDamage = catDamage * defMult * crit.expectedMultiplier * staggerMult * comboMult * artsMult

      let anomalyDamage = 0
      if (a.element && ELEMENT_TO_ANOMALY[a.element]) {
        anomalyDamage = processAnomaly(ELEMENT_TO_ANOMALY[a.element], charStats, t, a)
      }

      if (!memberDamage[a.charId]) {
        memberDamage[a.charId] = { total: 0, skillBreakdown: {} }
      }
      memberDamage[a.charId].total += finalDamage
      if (!memberDamage[a.charId].skillBreakdown[a.name]) {
        memberDamage[a.charId].skillBreakdown[a.name] = { count: 0, total: 0 }
      }
      memberDamage[a.charId].skillBreakdown[a.name].count++
      memberDamage[a.charId].skillBreakdown[a.name].total += finalDamage

      cumulativeDamage += finalDamage + anomalyDamage
      totalAnomalyDamage += anomalyDamage
      if (Math.abs(t - Math.round(t / 0.5) * 0.5) < 0.3) {
        damageCurve.push({ time: Math.round(t * 10) / 10, damage: Math.round(cumulativeDamage * 10) / 10 })
      }

      const categoryBreakdown: Record<string, { multiplier: number; rawTotal: number }> = {}
      for (const [key, entry] of Object.entries(breakdown)) {
        categoryBreakdown[key] = { multiplier: entry.multiplier, rawTotal: entry.rawTotal }
      }

      damageEvents.push({
        time: t,
        charId: a.charId,
        actionName: a.name,
        skillType: a.type,
        element: a.element,
        baseDamage,
        finalDamage,
        critMultiplier: crit.expectedMultiplier,
        defenseMultiplier: defMult,
        staggerMultiplier: staggerMult,
        comboMultiplier: comboMult,
        artsMultiplier: artsMult,
        comboLevel: state.comboCount,
        isStaggered: state.staggered,
        categoryBreakdown,
        anomalyDamage: anomalyDamage || undefined,
      })
    }
  }

  return {
    ...baseResult,
    damageEvents,
    totalDamage: cumulativeDamage,
    damageCurve,
    memberDamage,
    anomalyEvents: anomalyEvents.length > 0 ? anomalyEvents : undefined,
    totalAnomalyDamage,
  }
}
