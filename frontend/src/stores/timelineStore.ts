import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TimelineScenario, ScenarioData, Track, TimelineAction,
  SystemConstants,
} from '../engine/types/timeline'
import { DEFAULT_SYSTEM_CONSTANTS } from '../engine/simulation/types'

export const useTimelineStore = defineStore('timeline', () => {
  const scenarios = ref<TimelineScenario[]>([])
  const activeScenarioId = ref<string>('')
  const loading = ref(false)

  const activeScenario = computed(() =>
    scenarios.value.find(s => s.id === activeScenarioId.value) ?? null
  )

  const activeData = computed<ScenarioData | null>(() =>
    activeScenario.value?.data ?? null
  )

  const tracks = computed<Track[]>(() =>
    activeData.value?.tracks ?? []
  )

  const systemConstants = computed<SystemConstants>(() =>
    activeData.value?.systemConstants ?? activeScenario.value?.scenarioConstants ?? DEFAULT_SYSTEM_CONSTANTS
  )

  function setScenarios(list: TimelineScenario[]) {
    scenarios.value = list
    if (list.length > 0 && !activeScenarioId.value) {
      activeScenarioId.value = list[0].id
    }
  }

  function setActiveScenario(id: string) {
    activeScenarioId.value = id
  }

  function addScenario(scenario: TimelineScenario) {
    scenarios.value.push(scenario)
    activeScenarioId.value = scenario.id
  }

  function removeScenario(id: string) {
    const idx = scenarios.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      scenarios.value.splice(idx, 1)
      if (activeScenarioId.value === id) {
        activeScenarioId.value = scenarios.value[0]?.id ?? ''
      }
    }
  }

  function importFromExport(exportData: { scenarioList: TimelineScenario[]; activeScenarioId?: string; systemConstants?: SystemConstants }) {
    for (const sc of exportData.scenarioList) {
      if (exportData.systemConstants) {
        sc.scenarioConstants = exportData.systemConstants
      }
    }
    scenarios.value = exportData.scenarioList
    activeScenarioId.value = exportData.activeScenarioId ?? exportData.scenarioList[0]?.id ?? ''
  }

  function toExport() {
    return {
      timestamp: Date.now(),
      version: '1.0.0',
      scenarioList: JSON.parse(JSON.stringify(scenarios.value)),
      activeScenarioId: activeScenarioId.value,
    }
  }

  function addActionToTrack(trackId: string, action: TimelineAction, snap: (t: number) => number) {
    const data = activeData.value
    if (!data) return false
    const track = data.tracks.find(t => t.id === trackId)
    if (!track) return false

    const snappedTime = snap(action.startTime)
    const conflict = track.actions.some(a => {
      return snappedTime < a.startTime + a.duration && snappedTime + action.duration > a.startTime
    })
    if (conflict) return false

    action.startTime = snappedTime
    action.logicalStartTime = snappedTime
    track.actions.push(action)
    track.actions.sort((a, b) => a.startTime - b.startTime)
    return true
  }

  function updateAction(trackId: string, instanceId: string, patch: Partial<TimelineAction>) {
    const data = activeData.value
    if (!data) return
    const track = data.tracks.find(t => t.id === trackId)
    if (!track) return
    const action = track.actions.find(a => a.instanceId === instanceId)
    if (!action) return
    Object.assign(action, patch)
    track.actions.sort((a, b) => a.startTime - b.startTime)
  }

  function ensureTrackExists(trackId: string) {
    const data = activeData.value
    if (!data) return
    if (!data.tracks.find(t => t.id === trackId && t.kind !== 'buff')) {
      data.tracks.push({ id: trackId, actions: [] })
    }
  }

  function ensureBuffTrackExists(trackId: string) {
    const data = activeData.value
    if (!data) return
    const buffId = trackId + '_buff'
    if (!data.tracks.find(t => t.id === buffId && t.kind === 'buff')) {
      data.tracks.push({ id: buffId, kind: 'buff', actions: [] })
    }
  }

  function ensureStateTrackExists(trackId: string) {
    const data = activeData.value
    if (!data) return
    const stateId = trackId + '_state'
    if (!data.tracks.find(t => t.id === stateId && t.kind === 'state')) {
      data.tracks.push({ id: stateId, kind: 'state', actions: [] })
    }
  }

  function addStateToTrack(trackId: string, state: TimelineAction) {
    const data = activeData.value
    if (!data) return false
    const track = data.tracks.find(t => t.id === trackId && t.kind === 'state')
    if (!track) return false
    track.actions.push(state)
    track.actions.sort((a, b) => a.startTime - b.startTime)
    return true
  }

  function countActiveBuffs(track: Track, start: number, end: number): number {
    let count = 0
    for (const a of track.actions) {
      const aEnd = a.startTime + a.duration
      if (start < aEnd && end > a.startTime) count++
    }
    return count
  }

  function addBuffToTrack(trackId: string, buff: TimelineAction) {
    const data = activeData.value
    if (!data) return false
    const track = data.tracks.find(t => t.id === trackId && t.kind === 'buff')
    if (!track) return false
    const concurrent = countActiveBuffs(track, buff.startTime, buff.startTime + buff.duration)
    if (concurrent >= 20) return false
    track.actions.push(buff)
    track.actions.sort((a, b) => a.startTime - b.startTime)
    return true
  }

  return {
    scenarios, activeScenarioId, loading,
    activeScenario, activeData, tracks, systemConstants,
    setScenarios, setActiveScenario, addScenario, removeScenario,
    importFromExport, toExport,
    addActionToTrack, updateAction, ensureTrackExists,
    ensureBuffTrackExists, addBuffToTrack,
    ensureStateTrackExists, addStateToTrack,
  }
})
