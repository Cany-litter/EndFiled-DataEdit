import type { Buff, EffectDef, MetaDef } from '../types/buff'
import type { Track, TimelineAction } from '../types/timeline'
import { applyBuffReplacements } from './buffReplacement'

export interface ActiveBuffSnapshot {
  buff: Buff
  timeStart: number
  timeEnd: number
  source: 'self' | 'teammate' | 'enemy' | 'field' | 'food'
  sourceCharId?: string
}

export interface BuffManagerConfig {
  tracks: Track[]
  permanentBuffs: Record<string, Buff[]>
  teamBuffs: Buff[]
  enemyBuffs: Record<string, TimelineAction[]>
  fieldBuffs: Buff[]
  foodBuffs: Record<string, Buff>
  duration: number
  gainLookup?: Record<string, { effectCategory?: string; effectType?: string; effectValue?: number }>
}

export class TimelineBuffManager {
  private schedule: Map<string, ActiveBuffSnapshot[]> = new Map()
  private allBuffIds: Set<string> = new Set()
  private gainLookup: Record<string, { effectCategory?: string; effectType?: string; effectValue?: number }> = {}

  build(config: BuffManagerConfig): void {
    this.gainLookup = config.gainLookup ?? {}
    this.schedule.clear()
    this.allBuffIds.clear()

    // 1. 永久 Buff：展开到整个时间线
    for (const [charId, buffs] of Object.entries(config.permanentBuffs)) {
      const filtered = applyBuffReplacements(buffs)
      for (const buff of filtered) {
        this.addBuff(charId, buff, 0, config.duration, 'self')
      }
    }

    // 2. 时间线动作轨道上的 Buff
    for (const track of config.tracks) {
      if (track.kind !== 'buff') continue
      const charId = track.id.replace('_buff', '')
      for (const action of track.actions) {
        const buff = this.actionToBuff(action)
        if (buff) {
          this.addBuff(charId, buff, action.startTime, action.startTime + action.duration, 'self')
        }
      }
    }

    // 3. 团队 Buff：从队友 scope:team 增益，展开到全队
    for (const buff of config.teamBuffs) {
      for (const charId of this.allTrackCharIds(config.tracks)) {
        this.addBuff(charId, buff, 0, config.duration, 'teammate')
      }
    }

    // 4. 敌人 Buff/Debuff
    for (const [enemyId, actions] of Object.entries(config.enemyBuffs)) {
      for (const action of actions) {
        const buff = this.actionToBuff(action)
        if (buff) {
          for (const charId of this.allTrackCharIds(config.tracks)) {
            this.addBuff(charId, buff, action.startTime, action.startTime + action.duration, 'enemy')
          }
        }
      }
    }

    // 5. 场地 Buff
    for (const buff of config.fieldBuffs) {
      for (const charId of this.allTrackCharIds(config.tracks)) {
        this.addBuff(charId, buff, 0, config.duration, 'field')
      }
    }

    // 6. 食物 Buff
    for (const [charId, buff] of Object.entries(config.foodBuffs)) {
      this.addBuff(charId, buff, 0, config.duration, 'food')
    }

    // 排序：每个角色的 Buff 按时间排序
    for (const [, snapshots] of this.schedule) {
      snapshots.sort((a, b) => a.timeStart - b.timeStart)
    }
  }

  getBuffsAt(charId: string, time: number): Buff[] {
    const snapshots = this.schedule.get(charId) ?? []
    const result: Buff[] = []
    for (const s of snapshots) {
      if (time >= s.timeStart && time < s.timeEnd) {
        result.push(s.buff)
      }
    }
    return result
  }

  getActiveSnapshotsAt(charId: string, time: number): ActiveBuffSnapshot[] {
    const snapshots = this.schedule.get(charId) ?? []
    return snapshots.filter(s => time >= s.timeStart && time < s.timeEnd)
  }

  getAllBuffIds(): string[] {
    return Array.from(this.allBuffIds)
  }

  private addBuff(
    charId: string,
    buff: Buff,
    timeStart: number,
    timeEnd: number,
    source: ActiveBuffSnapshot['source'],
    sourceCharId?: string,
  ): void {
    if (!this.schedule.has(charId)) {
      this.schedule.set(charId, [])
    }
    this.schedule.get(charId)!.push({
      buff,
      timeStart,
      timeEnd,
      source,
      sourceCharId,
    })
    this.allBuffIds.add(buff.id)
  }

  private actionToBuff(action: TimelineAction): Buff | null {
    if (!action.id) return null
    const gain = this.gainLookup[action.id]
    return {
      id: action.id,
      name: action.name,
      source: action.librarySource ?? 'timeline',
      buffType: 'limited',
      effectCategory: gain?.effectCategory ?? '',
      effectType: gain?.effectType ?? '',
      effectValue: gain?.effectValue ?? 0,
      stackRule: 'add_same',
      targetScope: 'self',
      duration: action.duration,
    }
  }

  private allTrackCharIds(tracks: Track[]): string[] {
    const ids = new Set<string>()
    for (const track of tracks) {
      if (track.kind === 'action') {
        ids.add(track.id)
      }
    }
    return Array.from(ids)
  }
}
