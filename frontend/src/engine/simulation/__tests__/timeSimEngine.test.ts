import { describe, it, expect } from 'vitest'
import { runTimelineSimulation, runTimelineSimulationWithDamage, type SimConfig, type DamageSimConfig } from '../timeSimEngine'
import type { Track, SystemConstants, TimelineAction } from '../../types/timeline'

let actionCounter = 0
function makeAction(overrides: Partial<TimelineAction> = {}): TimelineAction {
  const id = `a${++actionCounter}`
  return {
    id, name: 'action', type: 'skill', startTime: 1, duration: 1.5,
    spCost: 50, gaugeGain: 10, element: 'physical',
    librarySource: 'character', icon: '', cooldown: 0,
    damageTicks: [{ offset: 0.8, stagger: 15, sp: 0 }],
    allowedTypes: [], physicalAnomaly: [],
    instanceId: `inst_${id}`, logicalStartTime: 1,
    ...overrides,
  }
}

const defaultSC: SystemConstants = {
  maxSp: 200, initialSp: 100, spRegenRate: 5,
  skillSpCostDefault: 100, linkCdReduction: 0,
  maxStagger: 100, staggerNodeCount: 2,
  staggerNodeDuration: 2, staggerBreakDuration: 11,
  executionRecovery: 0,
}

const defaultCfg: SimConfig = {
  enemyMaxStagger: 100, prepDuration: 5,
  staggerNodeCount: 2, staggerNodeDuration: 2, staggerBreakDuration: 11,
}

function track(overrides: Partial<Track> = {}): Track {
  return {
    id: 'chr_test',
    kind: 'action',
    actions: [makeAction()],
    ...overrides,
  }
}

// ──── Basic Simulation ────

describe('runTimelineSimulation', () => {
  it('无动作返回空', () => {
    const r = runTimelineSimulation([], defaultSC, defaultCfg)
    expect(r.curves).toEqual([])
    expect(r.events).toEqual([])
    expect(r.totalStaggerDamage).toBe(0)
  })

  it('单个动作消耗SP产生事件', () => {
    const r = runTimelineSimulation([track()], defaultSC, defaultCfg)
    expect(r.events.length).toBeGreaterThanOrEqual(2)
    expect(r.events.some(e => e.type === 'action_start')).toBe(true)
    expect(r.events.some(e => e.type === 'damage_tick')).toBe(true)
  })

  it('SP消耗后减少', () => {
    const r = runTimelineSimulation([track()], defaultSC, defaultCfg)
    const spEvents = r.events.filter(e => e.type === 'sp_change')
    expect(spEvents.length).toBeGreaterThanOrEqual(1)
  })

  it('失衡积累', () => {
    const t = track()
    const r = runTimelineSimulation([t], defaultSC, defaultCfg)
    expect(r.totalStaggerDamage).toBeGreaterThanOrEqual(15)
  })

  it('失衡击破', () => {
    const t = track()
    t.actions[0].damageTicks![0].stagger = 150
    const r = runTimelineSimulation([t], defaultSC, defaultCfg)
    expect(r.events.some(e => e.type === 'stagger_break')).toBe(true)
    expect(r.totalStaggerDamage).toBeGreaterThanOrEqual(150)
  })

  it('连击计数在窗口内递增', () => {
    const t: Track = {
      id: 'chr_test', kind: 'action',
      actions: [
        makeAction({ id: 'a1', name: '攻击1', startTime: 0, duration: 0.5, spCost: 10, gaugeGain: 5, damageTicks: [{ offset: 0.3, stagger: 5, sp: 0 }] }),
        makeAction({ id: 'a2', name: '攻击2', startTime: 1, duration: 0.5, spCost: 10, gaugeGain: 5, damageTicks: [{ offset: 0.3, stagger: 5, sp: 0 }] }),
        makeAction({ id: 'a3', name: '攻击3', startTime: 2, duration: 0.5, spCost: 10, gaugeGain: 5, damageTicks: [{ offset: 0.3, stagger: 5, sp: 0 }] }),
      ],
    }
    const r = runTimelineSimulation([t], defaultSC, defaultCfg)
    expect(r.events.filter(e => e.type === 'action_start').length).toBe(3)
  })

  it('SP随时间自然恢复', () => {
    const t: Track = {
      id: 'chr_test', kind: 'action',
      actions: [
        makeAction({ id: 'a1', name: '攻击', startTime: 0, duration: 1, spCost: 200, gaugeGain: 0, damageTicks: [{ offset: 0.5, stagger: 0, sp: 0 }] }),
        makeAction({ id: 'a2', name: '攻击', startTime: 10, duration: 1, spCost: 0, gaugeGain: 0, damageTicks: [{ offset: 0.5, stagger: 0, sp: 0 }] }),
      ],
    }
    const r = runTimelineSimulation([t], defaultSC, defaultCfg)
    const spAt10 = r.curves.find(c => Math.abs(c.time - 10) < 0.5)
    expect(spAt10).toBeDefined()
    expect(spAt10!.sp).toBeGreaterThanOrEqual(40)
  })
})


// ──── Damage Simulation ────

describe('runTimelineSimulationWithDamage', () => {
  const snapshot = {
    charId: 'chr_test',
    attack: 1000, critRate: 20, critDamage: 150,
    artsPower: 100, str: 50, agi: 50, int: 50, wil: 50, charLevel: 90,
  }

  function dmgConfig(overrides: Partial<DamageSimConfig> = {}): DamageSimConfig {
    return {
      enemyMaxStagger: 100, prepDuration: 5,
      staggerNodeCount: 2, staggerNodeDuration: 2, staggerBreakDuration: 11,
      charSnapshots: { chr_test: snapshot },
      enemyDef: 50, enemyResistance: 20,
      ...overrides,
    }
  }

  it('产生伤害事件', () => {
    const r = runTimelineSimulationWithDamage([track()], defaultSC, dmgConfig())
    expect(r.damageEvents).toBeDefined()
    expect(r.damageEvents!.length).toBeGreaterThanOrEqual(1)
    expect(r.totalDamage).toBeGreaterThan(0)
  })

  it('伤害事件包含所有乘区', () => {
    const r = runTimelineSimulationWithDamage([track()], defaultSC, dmgConfig())
    const de = r.damageEvents![0]
    expect(de.baseDamage).toBeGreaterThan(0)
    expect(de.finalDamage).toBeGreaterThan(0)
    expect(de.critMultiplier).toBeGreaterThanOrEqual(1)
    expect(de.defenseMultiplier).toBeGreaterThan(0)
    expect(de.staggerMultiplier).toBeGreaterThanOrEqual(1)
    expect(de.categoryBreakdown).toBeDefined()
    expect(Object.keys(de.categoryBreakdown).length).toBeGreaterThan(0)
  })

  it('多个伤害事件', () => {
    const t = track()
    t.actions.push(makeAction({ id: 'a2', name: '追击', startTime: 3, duration: 1, spCost: 0, gaugeGain: 0, damageTicks: [{ offset: 0.5, stagger: 0, sp: 0 }] }))
    const r = runTimelineSimulationWithDamage([t], defaultSC, dmgConfig())
    expect(r.damageEvents!.length).toBeGreaterThanOrEqual(2)
  })

  it('更高攻击力产生更高伤害', () => {
    const low = runTimelineSimulationWithDamage([track()], defaultSC, dmgConfig())
    const high = runTimelineSimulationWithDamage([track()], defaultSC, dmgConfig({
      charSnapshots: { chr_test: { ...snapshot, attack: 2000 } },
    }))
    expect(high.totalDamage!).toBeGreaterThan(low.totalDamage!)
  })

  it('返回成员伤害明细', () => {
    const r = runTimelineSimulationWithDamage([track()], defaultSC, dmgConfig())
    expect(r.memberDamage).toBeDefined()
    expect(r.memberDamage!['chr_test']).toBeDefined()
    expect(r.memberDamage!['chr_test'].total).toBeGreaterThan(0)
    expect(Object.keys(r.memberDamage!['chr_test'].skillBreakdown).length).toBeGreaterThan(0)
  })

  it('多个角色各自统计伤害', () => {
    const t1: Track = {
      id: 'chr_a', kind: 'action',
      actions: [makeAction({ id: 'a1', name: '打', startTime: 0, duration: 1, spCost: 0, gaugeGain: 0, stagger: 10, damageTicks: [{ offset: 0.5, stagger: 10, sp: 0 }] })],
    }
    const t2: Track = {
      id: 'chr_b', kind: 'action',
      actions: [makeAction({ id: 'b1', name: '打', startTime: 0, duration: 1, spCost: 0, gaugeGain: 0, stagger: 5, damageTicks: [{ offset: 0.5, stagger: 5, sp: 0 }] })],
    }
    const snapshots = {
      chr_a: { ...snapshot, charId: 'chr_a', attack: 1000 },
      chr_b: { ...snapshot, charId: 'chr_b', attack: 500 },
    }
    const r = runTimelineSimulationWithDamage([t1, t2], defaultSC, dmgConfig({ charSnapshots: snapshots }))
    expect(r.memberDamage!['chr_a'].total).toBeGreaterThan(r.memberDamage!['chr_b'].total)
  })
})


// ──── Anomaly Damage ────

describe('anomaly damage integration', () => {
  const snapshot = {
    charId: 'chr_test',
    attack: 1000, critRate: 20, critDamage: 150,
    artsPower: 100, str: 50, agi: 50, int: 50, wil: 50, charLevel: 90,
  }

  it('元素攻击积累异常层数并触发爆发', () => {
    const t: Track = {
      id: 'chr_test', kind: 'action',
      actions: [
        makeAction({ id: 'a1', name: '火1', startTime: 0, duration: 0.5, spCost: 0, gaugeGain: 0, element: 'pyro', damageTicks: [{ offset: 0.3, stagger: 0, sp: 0 }] }),
        makeAction({ id: 'a2', name: '火2', startTime: 1, duration: 0.5, spCost: 0, gaugeGain: 0, element: 'pyro', damageTicks: [{ offset: 0.3, stagger: 0, sp: 0 }] }),
        makeAction({ id: 'a3', name: '火3', startTime: 2, duration: 0.5, spCost: 0, gaugeGain: 0, element: 'pyro', damageTicks: [{ offset: 0.3, stagger: 0, sp: 0 }] }),
      ],
    }
    const cfg: DamageSimConfig = {
      enemyMaxStagger: 100, prepDuration: 5,
      staggerNodeCount: 2, staggerNodeDuration: 2, staggerBreakDuration: 11,
      charSnapshots: { chr_test: snapshot },
      enemyDef: 50, enemyResistance: 20,
    }
    const r = runTimelineSimulationWithDamage([t], defaultSC, cfg)
    expect(r.anomalyEvents).toBeDefined()
    expect(r.anomalyEvents!.length).toBeGreaterThanOrEqual(1)
    expect(r.totalAnomalyDamage).toBeGreaterThan(0)
    const ae = r.anomalyEvents![0]
    expect(ae.anomalyType).toBe('burn')
    expect(ae.anomalyLevel).toBeGreaterThanOrEqual(1)
    expect(ae.type).toBe('anomaly_burst')
  })

  it('不同元素各自独立积累', () => {
    const t: Track = {
      id: 'chr_test', kind: 'action',
      actions: [
        makeAction({ id: 'a1', name: '火', startTime: 0, duration: 0.5, spCost: 0, gaugeGain: 0, element: 'pyro', damageTicks: [{ offset: 0.3, stagger: 0, sp: 0 }] }),
        makeAction({ id: 'a2', name: '冰', startTime: 1, duration: 0.5, spCost: 0, gaugeGain: 0, element: 'cryo', damageTicks: [{ offset: 0.3, stagger: 0, sp: 0 }] }),
        makeAction({ id: 'a3', name: '火', startTime: 2, duration: 0.5, spCost: 0, gaugeGain: 0, element: 'pyro', damageTicks: [{ offset: 0.3, stagger: 0, sp: 0 }] }),
        makeAction({ id: 'a4', name: '火', startTime: 3, duration: 0.5, spCost: 0, gaugeGain: 0, element: 'pyro', damageTicks: [{ offset: 0.3, stagger: 0, sp: 0 }] }),
      ],
    }
    const cfg: DamageSimConfig = {
      enemyMaxStagger: 100, prepDuration: 5,
      staggerNodeCount: 2, staggerNodeDuration: 2, staggerBreakDuration: 11,
      charSnapshots: { chr_test: snapshot },
      enemyDef: 50, enemyResistance: 20,
    }
    const r = runTimelineSimulationWithDamage([t], defaultSC, cfg)
    expect(r.anomalyEvents).toBeDefined()
    expect(r.anomalyEvents!.length).toBe(1)
  })

  it('物理元素不触发异常', () => {
    const t = track()
    t.actions[0].element = 'physical'
    const cfg: DamageSimConfig = {
      enemyMaxStagger: 100, prepDuration: 5,
      staggerNodeCount: 2, staggerNodeDuration: 2, staggerBreakDuration: 11,
      charSnapshots: { chr_test: snapshot },
      enemyDef: 50, enemyResistance: 20,
    }
    const r = runTimelineSimulationWithDamage([t], defaultSC, cfg)
    expect(r.anomalyEvents).toBeUndefined()
    expect(r.totalAnomalyDamage).toBe(0)
  })
})
