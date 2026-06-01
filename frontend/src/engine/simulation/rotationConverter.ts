import type { TimelineAction, Track, TimelineActionType } from '../types/timeline'
import type { RotationStep, SkillType } from './types'

export interface CyclePattern {
  startIndex: number
  length: number
  count: number
}

export interface SkillActionMap {
  [skillId: string]: {
    castTime?: number
    cooldown?: number
    spCost?: number
    gaugeGain?: number
    damageTicks?: Array<{ offset: number; stagger: number; sp: number }>
  }
}

export function uid(prefix = 'inst'): string {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function detectCyclePattern(actions: TimelineAction[]): CyclePattern | null {
  if (actions.length < 4) return null

  const sigs = actions.map(a => `${a.id}:${a.type}`)

  for (let len = 1; len <= Math.floor(sigs.length / 2); len++) {
    const candidate = sigs.slice(0, len)
    let matchCount = 1
    for (let i = len; i + len <= sigs.length; i += len) {
      const chunk = sigs.slice(i, i + len)
      if (chunk.length === candidate.length && chunk.every((s, j) => s === candidate[j])) {
        matchCount++
      } else {
        break
      }
    }
    if (matchCount >= 2) {
      return { startIndex: 0, length: len, count: matchCount }
    }
  }
  return null
}

export function actionToRotationStep(
  action: TimelineAction,
  charIndex: number,
): RotationStep {
  return {
    skillId: action.id,
    skillType: mapActionTypeToSkillType(action.type),
    label: action.name,
    charIndex,
    timelineActionId: action.instanceId,
  }
}

export function actionsToRotation(
  actions: TimelineAction[],
  charIndex: number,
): { rotation: RotationStep[]; cyclePattern: CyclePattern | null } {
  const pattern = detectCyclePattern(actions)

  if (pattern && pattern.startIndex === 0) {
    const cycleActions = actions.slice(0, pattern.length)
    return {
      rotation: cycleActions.map(a => actionToRotationStep(a, charIndex)),
      cyclePattern: pattern,
    }
  }

  return {
    rotation: actions.map(a => actionToRotationStep(a, charIndex)),
    cyclePattern: null,
  }
}

export function rotationToActions(
  rotation: RotationStep[],
  charId: string,
  skillActionMap: SkillActionMap,
  cycles: number,
  cycleDuration: number,
): Partial<TimelineAction>[] {
  const result: Partial<TimelineAction>[] = []
  let currentTime = 0

  for (let cycle = 0; cycle < cycles; cycle++) {
    for (const step of rotation) {
      const sa = skillActionMap[step.skillId]
      const duration = sa?.castTime ?? 1
      const ticks = sa?.damageTicks ?? [{ offset: 0.5, stagger: 10, sp: 0 }]

      const action: Partial<TimelineAction> = {
        id: step.skillId,
        type: mapSkillTypeToActionType(step.skillType),
        name: step.label,
        librarySource: 'character',
        element: 'physical',
        icon: '',
        duration,
        cooldown: sa?.cooldown ?? 0,
        spCost: sa?.spCost,
        gaugeGain: sa?.gaugeGain ?? 0,
        damageTicks: ticks.map(t => ({ ...t })),
        allowedTypes: [],
        physicalAnomaly: [],
        instanceId: uid(),
        startTime: Math.round(currentTime * 10) / 10,
        logicalStartTime: Math.round(currentTime * 10) / 10,
      }
      result.push(action)
      currentTime += duration
    }

    if (cycleDuration > 0 && cycle < cycles - 1) {
      const cycleEnd = (cycle + 1) * cycleDuration
      if (currentTime < cycleEnd) {
        currentTime = cycleEnd
      }
    }
  }

  return result
}

export function buildTrackFromRotation(
  charId: string,
  rotation: RotationStep[],
  skillActionMap: SkillActionMap,
  cycles: number,
  cycleDuration: number,
): Track {
  const actions = rotationToActions(rotation, charId, skillActionMap, cycles, cycleDuration)
  return {
    id: charId,
    kind: 'action',
    actions: actions as TimelineAction[],
  }
}

function mapActionTypeToSkillType(type: string): SkillType {
  const map: Record<string, SkillType> = {
    attack: 'normal',
    skill: 'skill',
    link: 'chain',
    ultimate: 'ultimate',
    execution: 'other',
  }
  return map[type] ?? 'other'
}

function mapSkillTypeToActionType(type: string): TimelineActionType {
  const map: Record<string, TimelineActionType> = {
    normal: 'attack',
    skill: 'skill',
    chain: 'link',
    ultimate: 'ultimate',
    other: 'execution',
  }
  return map[type] ?? 'skill'
}
