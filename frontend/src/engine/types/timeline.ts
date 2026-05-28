export type TimelineActionType = 'attack' | 'skill' | 'link' | 'ultimate' | 'execution'
export type ElementType = 'physical' | 'blaze' | 'emag' | 'cold' | 'nature'
export type AnomalyType = 'blaze_attach' | 'emag_attach' | 'cold_attach' | 'nature_attach'
  | 'blaze_burst' | 'emag_burst' | 'cold_burst' | 'nature_burst'
  | 'burning' | 'conductive' | 'frozen' | 'ice_shatter'
  | 'break' | 'armor_break' | 'stagger' | 'knockdown' | 'knockup'

export interface BoundEffect {
  _id: string
  type: AnomalyType
  stacks: number
  duration: number
  offset: number
}

export interface DamageTick {
  offset: number
  stagger: number
  sp: number
  boundEffects: string[]
  hpDamage?: number
}

export interface TimelineAction {
  id: string
  type: TimelineActionType
  name: string
  librarySource: string
  element: ElementType
  icon: string
  duration: number
  cooldown: number
  spCost?: number
  gaugeCost?: number
  gaugeGain: number
  teamGaugeGain?: number
  enhancementTime?: number
  animationTime?: number
  damageTicks: DamageTick[]
  allowedTypes: string[]
  physicalAnomaly: BoundEffect[][]
  weaponId?: string | null
  dragOffsetX?: number
  dragOffsetY?: number
  instanceId: string
  sourceWeaponId?: string | null
  logicalStartTime: number
  startTime: number
  hiddenInLibraryGrid?: boolean
  kind?: string
  attackSegmentIndex?: number
  attackSequenceIndex?: number
  attackSequenceTotal?: number
  attackGroupName?: string
  attackGroupInstanceId?: string
  spGain?: number
  stagger?: number
  targetEnemyIds?: string[]
  targetAllEnemies?: boolean
}

export interface Track {
  id: string
  kind?: 'action' | 'buff' | 'state'
  actions: TimelineAction[]
  initialGauge?: number
  maxGaugeOverride?: number | null
  gaugeEfficiency?: number
  weaponId?: string | null
  stats?: Record<string, number>
}

export interface SystemConstants {
  maxSp: number
  initialSp: number
  spRegenRate: number
  skillSpCostDefault: number
  linkCdReduction: number
  maxStagger: number
  staggerNodeCount: number
  staggerNodeDuration: number
  staggerBreakDuration: number
  executionRecovery: number
}

export interface EnemyConfig {
  id: string
  name: string
  maxStagger: number
  staggerNodeCount: number
  def: number
  resistance: number
  staggerNodeDuration?: number
  staggerBreakDuration?: number
}

export interface TimelineEnemy {
  id: string
  name: string
  enemyId: string
  maxStagger: number
  staggerNodeCount: number
  staggerNodeDuration: number
  staggerBreakDuration: number
  executionRecovery: number
}

export interface TimelineScenario {
  id: string
  name: string
  data: ScenarioData
  scenarioConstants?: SystemConstants
  teamId?: string
}

export interface ScenarioData {
  tracks: Track[]
  activeEnemyId?: string
  customEnemyParams?: EnemyConfig
  enemies?: TimelineEnemy[]
  systemConstants?: SystemConstants
  prepDuration?: number
  enemyBuffs?: Record<string, TimelineAction[]>
}

export interface TimelineExport {
  timestamp: number
  version: string
  scenarioList: TimelineScenario[]
  systemConstants?: SystemConstants
  activeScenarioId?: string
}

export interface ResourceCurvePoint {
  time: number
  sp: number
  gauge: number
  stagger: number
}
