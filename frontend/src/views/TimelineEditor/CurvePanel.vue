<template>
  <div class="curve-panel" @dragover.prevent @drop.prevent="onPanelDrop">
    <div class="curve-scroll-wrapper">
      <div class="curve-scroll" :style="{ transform: 'translateX(-' + scrollLeft + 'px)' }">
        <div class="curve-buff-tracks" :style="{ width: contentWidth + 'px', height: (enemySectionEnd) + 'px' }">
          <template v-for="(enemy, ei) in enemies" :key="enemy.id">
            <div class="enemy-state-track"
                 :style="{ top: stateTrackTop(ei) + 'px', width: contentWidth + 'px' }"
                 @dragover.prevent @drop.prevent="onEnemyStateDrop($event, enemy.id)"
                 @contextmenu.prevent="onTrackContextMenu($event, enemy.id, 'state')">
              <div v-for="item in stateList(enemy.id)" :key="item.instanceId"
                   class="enemy-state-bar"
                   :data-instance-id="item.instanceId"
                   :style="itemBarStyle(item, stateLayerMap[enemy.id]?.get(item.instanceId) ?? 0)"
                   :title="item.name + ' (' + item.duration.toFixed(1) + 's)'">
                <span class="bar-label">{{ item.name }}</span>
                <span class="bar-delete" @click.stop="deleteItem(enemy.id, item.instanceId)">✕</span>
              </div>
              <div v-if="stateList(enemy.id).length === 0" class="track-hint">拖入状态到此处</div>
            </div>

            <div class="enemy-buff-track"
                 :style="{ top: buffTrackTop(ei) + 'px', width: contentWidth + 'px' }"
                 @dragover.prevent @drop.prevent="onEnemyBuffDrop($event, enemy.id)"
                 @contextmenu.prevent="onTrackContextMenu($event, enemy.id, 'buff')">
              <div v-for="item in buffList(enemy.id)" :key="item.instanceId"
                   class="enemy-item-bar"
                   :data-instance-id="item.instanceId"
                   :style="itemBarStyle(item, buffLayerMap[enemy.id]?.get(item.instanceId) ?? 0)"
                   :title="item.name + ' (' + item.duration.toFixed(1) + 's)'">
                <span class="bar-label">{{ item.name }}</span>
                <span class="bar-delete" @click.stop="deleteItem(enemy.id, item.instanceId)">✕</span>
              </div>
              <div v-if="buffList(enemy.id).length === 0" class="track-hint">拖入增益到此处</div>
            </div>
          </template>
        </div>

        <svg :width="contentWidth" :height="totalHeight" class="curve-svg">
          <defs>
            <linearGradient id="sp-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffd700" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#ffd700" stop-opacity="0.05" />
            </linearGradient>
            <pattern id="node-stripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="8" height="8" fill="#fa8c16" fill-opacity="0.05" />
              <rect width="2" height="8" fill="#fa8c16" fill-opacity="0.5" />
            </pattern>
            <pattern id="stun-pattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="10" height="10" fill="#ff9c6e" fill-opacity="0.1" />
              <rect width="2" height="10" fill="#ffd591" fill-opacity="0.6" />
            </pattern>
            <linearGradient v-for="(enemy, ei) in enemies" :key="'sg'+ei" :id="'stagger-grad-'+ei" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="colors[ei % colors.length]" stop-opacity="0.5" />
              <stop offset="100%" :stop-color="colors[ei % colors.length]" stop-opacity="0.1" />
            </linearGradient>
          </defs>
          <line v-for="t in gridTicks" :key="'g'+t" :x1="t * pxPerSecond" y1="0" :x2="t * pxPerSecond" :y2="totalHeight" stroke="#f0f0f0" stroke-width="0.5" />
          <g v-for="(enemy, ei) in enemies" :key="'e'+ei">
            <rect v-for="(seg, si) in enemyNodeSegments[enemy.id]" :key="'n'+si"
              :x="seg.start * pxPerSecond" :y="staggerTop(ei)"
              :width="(seg.end - seg.start) * pxPerSecond" :height="staggerSectionHeight"
              fill="url(#node-stripe)" />
            <g v-for="(seg, si) in enemyLockSegments[enemy.id]" :key="'l'+si">
              <rect :x="seg.start * pxPerSecond" :y="staggerTop(ei)"
                :width="(seg.end - seg.start) * pxPerSecond" :height="staggerSectionHeight"
                fill="url(#stun-pattern)" />
              <text :x="(seg.start + (seg.end - seg.start)/2) * pxPerSecond" :y="staggerLabelY(ei) - 5"
                fill="#f56c6c" font-size="9" font-weight="700" text-anchor="middle">WEAK</text>
            </g>
            <line x1="0" :y1="staggerValueY(enemy.id, enemy.maxStagger)" :x2="contentWidth"
              :y2="staggerValueY(enemy.id, enemy.maxStagger)" stroke="#f56c6c" stroke-width="0.5" stroke-dasharray="4,2" opacity="0.6" />
            <polygon v-if="staggerPolyline(enemy.id)" :points="staggerArea(enemy.id)" :fill="'url(#stagger-grad-'+ei+')'" />
            <polyline v-if="staggerPolyline(enemy.id)" :points="staggerPolyline(enemy.id)" fill="none" :stroke="colors[ei % colors.length]" stroke-width="1.5" stroke-linejoin="round" />
          </g>
          
          <line x1="0" :y1="spY(300)" :x2="contentWidth" :y2="spY(300)" stroke="#e8e8e8" stroke-width="0.5" stroke-dasharray="3,2" />
          <line x1="0" :y1="spY(200)" :x2="contentWidth" :y2="spY(200)" stroke="#e8e8e8" stroke-width="0.5" stroke-dasharray="3,2" />
          <line x1="0" :y1="spY(100)" :x2="contentWidth" :y2="spY(100)" stroke="#e8e8e8" stroke-width="0.5" stroke-dasharray="3,2" />
          <text x="5" :y="spY(300)+11" font-size="8" fill="#bbb">300</text>
          <text x="5" :y="spY(200)+11" font-size="8" fill="#bbb">200</text>
          <text x="5" :y="spY(100)+11" font-size="8" fill="#bbb">100</text>
          <text x="5" :y="spY(0)+11" font-size="8" fill="#bbb">0</text>
          <polygon v-if="spPoints.length" :points="spArea" fill="url(#sp-grad)" />
          <polyline v-if="spPoints.length" :points="spPoints" fill="none" stroke="#ffd700" stroke-width="1.5" stroke-linejoin="round" />
          <circle v-for="(p, i) in spData" :key="'sp'+i" :cx="p.x" :cy="p.y" r="1.5" fill="#ffd700" />
          <line x1="0" :y1="spSectionTop" :x2="contentWidth" :y2="spSectionTop" stroke="#e4e7ed" stroke-width="1" />
        </svg>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="ctxMenu.visible" class="context-menu" :style="{ left: ctxMenu.x + 'px', top: ctxMenu.y + 'px' }">
        <div class="context-item" @click="onCtxAddBuff">添加增益</div>
        <div class="context-item" @click="onCtxAddState">添加状态</div>
        <div v-if="ctxMenu.item" class="context-item" @click="onCtxDelete">删除</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Track, TimelineEnemy, SystemConstants, TimelineAction } from '../../engine/types/timeline'
import { runStaggerSimulation } from '../../engine/simulation/staggerEngine'

const props = withDefaults(defineProps<{
  tracks: Track[]
  enemies: TimelineEnemy[]
  systemConstants: SystemConstants
  pxPerSecond: number
  scrollLeft: number
  enemyBuffs?: Record<string, TimelineAction[]>
}>(), {
  enemies: () => [],
  enemyBuffs: () => ({}),
})

const emit = defineEmits<{
  'update-enemy-buffs': [buffs: Record<string, TimelineAction[]>]
  'edit-action': [action: TimelineAction]
}>()

const STATE_HEIGHT = 24
const BUFF_HEIGHT = 24
const colors = ['#ff7875', '#67c23a', '#409eff', '#e6a23c', '#9b59b6', '#1abc9c', '#e74c3c', '#2ecc71']
const SP_HEIGHT = 60
const STAGGER_HEIGHT = 30
const GAP = 2

function stateTrackTop(ei: number) { return GAP + ei * (STATE_HEIGHT + GAP + BUFF_HEIGHT + GAP + STAGGER_HEIGHT + GAP) }
function buffTrackTop(ei: number) { return stateTrackTop(ei) + STATE_HEIGHT + GAP }
function staggerTop(ei: number) { return buffTrackTop(ei) + BUFF_HEIGHT + GAP }

const enemySectionEnd = computed(() => {
  if (props.enemies.length === 0) return 0
  const last = props.enemies.length - 1
  return staggerTop(last) + STAGGER_HEIGHT + GAP
})

const totalHeight = computed(() => {
  const trackCount = props.enemies.length
  return trackCount > 0 ? enemySectionEnd.value + SP_HEIGHT + 4 : SP_HEIGHT + 4
})
const contentWidth = computed(() => Math.max(800, props.tracks.reduce((s, t) => {
  return Math.max(s, ...t.actions.map(a => (a.startTime + a.duration) * props.pxPerSecond + 200))
}, 800)))
const result = computed(() => {
  if (!props.enemies.length) return { spCurve: [], enemyCurves: {}, enemyNodeSegments: {}, enemyLockSegments: {} }
  return runStaggerSimulation(props.tracks, props.enemies, props.systemConstants)
})
const spSectionTop = computed(() => {
  if (props.enemies.length === 0) return 0
  return enemySectionEnd.value + 2
})

const spLabelY = computed(() => spSectionTop.value + 14)

function spY(val: number) {
  const max = Math.max(300, props.systemConstants.maxSp || 200)
  return spSectionTop.value + SP_HEIGHT - 4 - (val / max) * (SP_HEIGHT - 12)
}

const spData = computed(() => {
  const max = Math.max(300, props.systemConstants.maxSp || 200)
  const top = spSectionTop.value
  return result.value.spCurve.map(p => ({
    x: p.time * props.pxPerSecond,
    y: top + SP_HEIGHT - 4 - (p.sp / max) * (SP_HEIGHT - 12),
  }))
})
const spPoints = computed(() => spData.value.map(p => `${p.x},${p.y}`).join(' '))
const spArea = computed(() => {
  if (!spData.value.length) return ''
  const top = spSectionTop.value
  const line = spData.value.map(p => `${p.x},${p.y}`).join(' ')
  return `${spData.value[0].x},${top + SP_HEIGHT} ${line} ${spData.value[spData.value.length - 1].x},${top + SP_HEIGHT}`
})

const staggerSectionHeight = computed(() => STAGGER_HEIGHT - 4)
function staggerLabelY(ei: number) { return staggerTop(ei) + 12 }
function staggerY(val: number, max: number) { return (staggerSectionHeight.value) - (val / max) * (staggerSectionHeight.value - 8) }

function staggerPolyline(enemyId: string) {
  const pts = result.value.enemyCurves[enemyId]
  const enemy = props.enemies.find(e => e.id === enemyId)
  if (!pts || !enemy) return ''
  const top = staggerTop(props.enemies.indexOf(enemy))
  return pts.map(p => {
    const x = p.time * props.pxPerSecond
    const y = top + staggerY(p.stagger, enemy.maxStagger)
    return `${x},${y}`
  }).join(' ')
}

function staggerArea(enemyId: string) {
  const pts = result.value.enemyCurves[enemyId]
  const enemy = props.enemies.find(e => e.id === enemyId)
  if (!pts || !enemy) return ''
  const top = staggerTop(props.enemies.indexOf(enemy))
  const line = pts.map(p => {
    const x = p.time * props.pxPerSecond
    const y = top + staggerY(p.stagger, enemy.maxStagger)
    return `${x},${y}`
  }).join(' ')
  const lastX = pts.length > 0 ? pts[pts.length - 1].time * props.pxPerSecond : 0
  const bottom = top + staggerSectionHeight.value
  return `${line} ${lastX},${bottom} 0,${bottom}`
}

function staggerValueY(enemyId: string, val: number) {
  const enemy = props.enemies.find(e => e.id === enemyId)
  if (!enemy) return 0
  const top = staggerTop(props.enemies.indexOf(enemy))
  return top + staggerY(val, enemy.maxStagger)
}

function lastStagger(enemyId: string) {
  const pts = result.value.enemyCurves[enemyId]
  return pts && pts.length ? pts[pts.length - 1].stagger : 0
}

const enemyNodeSegments = computed(() => result.value.enemyNodeSegments)
const enemyLockSegments = computed(() => result.value.enemyLockSegments)

const gridTicks = computed(() => {
  const ticks: number[] = []
  const step = props.pxPerSecond >= 120 ? 0.5 : props.pxPerSecond >= 60 ? 1 : 5
  const total = Math.ceil((contentWidth.value / props.pxPerSecond) / step)
  for (let i = 0; i <= total; i++) ticks.push(i * step)
  return ticks
})

function buffList(enemyId: string) {
  return (props.enemyBuffs[enemyId] || []).filter(a => !a.kind || a.kind === 'buff')
}
function stateList(enemyId: string) {
  return (props.enemyBuffs[enemyId] || []).filter(a => a.kind === 'state')
}

function computeLayers(actions: TimelineAction[]): Map<string, number> {
  const sorted = [...actions].sort((a, b) => a.startTime - b.startTime)
  const layerEnds = [0, 0, 0]
  const result = new Map<string, number>()
  for (const a of sorted) {
    const aEnd = a.startTime + a.duration
    let placed = false
    for (let l = 0; l < 3; l++) {
      if (layerEnds[l] <= a.startTime) {
        layerEnds[l] = aEnd
        result.set(a.instanceId, l)
        placed = true
        break
      }
    }
    if (!placed) result.set(a.instanceId, -1)
  }
  return result
}

const buffLayerMap = computed(() => {
  const map: Record<string, Map<string, number>> = {}
  for (const enemy of props.enemies) {
    map[enemy.id] = computeLayers(buffList(enemy.id))
  }
  return map
})
const stateLayerMap = computed(() => {
  const map: Record<string, Map<string, number>> = {}
  for (const enemy of props.enemies) {
    map[enemy.id] = computeLayers(stateList(enemy.id))
  }
  return map
})

function itemBarStyle(item: TimelineAction, layer: number) {
  const left = item.startTime * props.pxPerSecond
  const width = Math.max(item.duration * props.pxPerSecond, 4)
  const trackH = 20
  const layerH = Math.max(trackH / 3, 7)
  const top = 2 + layer * layerH
  return { left: left + 'px', width: width + 'px', top: top + 'px', height: layerH + 'px' }
}

function addBuffToEnemy(enemyId: string, buffData: Partial<TimelineAction>, clientX: number, kind: 'buff' | 'state') {
  const rect = (document.querySelector('.timeline-viewport') as HTMLElement)
  if (!rect) return
  const vr = rect.getBoundingClientRect()
  const scrollLeft = rect.scrollLeft
  const x = clientX - vr.left + scrollLeft
  const time = Math.round((x / props.pxPerSecond) * 10) / 10
  const instanceId = 'eitem_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const item: TimelineAction = {
    id: buffData.id || instanceId, instanceId, kind,
    type: 'skill', name: buffData.name || (kind === 'state' ? '新状态' : '新增益'),
    librarySource: 'enemy-buff', element: 'physical', icon: '',
    duration: buffData.duration ?? 5, cooldown: 0,
    startTime: time, logicalStartTime: time,
    damageTicks: [], allowedTypes: [], physicalAnomaly: [],
  }
  const current = { ...props.enemyBuffs }
  if (!current[enemyId]) current[enemyId] = []
  current[enemyId] = [...current[enemyId], item]
  current[enemyId].sort((a, b) => a.startTime - b.startTime)
  emit('update-enemy-buffs', current)
}

function resolveEnemyId(clientY: number): string | null {
  const viewport = document.querySelector('.timeline-viewport') as HTMLElement
  if (!viewport) return null
  const vpRect = viewport.getBoundingClientRect()
  const scrollTop = viewport.scrollTop
  const relY = (clientY - vpRect.top) + scrollTop - 28
  for (const enemy of props.enemies) {
    const ei = props.enemies.indexOf(enemy)
    if (relY >= stateTrackTop(ei) && relY < staggerTop(ei) + STAGGER_HEIGHT) return enemy.id
  }
  return null
}

function resolveKind(clientY: number): 'buff' | 'state' {
  const viewport = document.querySelector('.timeline-viewport') as HTMLElement
  if (!viewport) return 'buff'
  const vpRect = viewport.getBoundingClientRect()
  const scrollTop = viewport.scrollTop
  const relY = (clientY - vpRect.top) + scrollTop - 28
  for (const enemy of props.enemies) {
    const ei = props.enemies.indexOf(enemy)
    const st = stateTrackTop(ei)
    if (relY >= st && relY < st + STATE_HEIGHT) return 'state'
    const bt = buffTrackTop(ei)
    if (relY >= bt && relY < bt + BUFF_HEIGHT) return 'buff'
  }
  return 'buff'
}

function onPanelDrop(e: DragEvent) {
  e.stopPropagation()
  if (!e.dataTransfer) return
  const raw = e.dataTransfer.getData('application/json')
  if (!raw) return
  try {
    const data = JSON.parse(raw)
    if (!data.buffData) return
    const enemyId = resolveEnemyId(e.clientY)
    if (enemyId) {
      const kind = resolveKind(e.clientY)
      addBuffToEnemy(enemyId, data.buffData, e.clientX, kind)
    }
  } catch { /* ignore */ }
}

function onEnemyBuffDrop(e: DragEvent, enemyId: string) {
  e.stopPropagation()
  if (!e.dataTransfer) return
  const raw = e.dataTransfer.getData('application/json')
  if (!raw) return
  try {
    const data = JSON.parse(raw)
    if (data.buffData) addBuffToEnemy(enemyId, data.buffData, e.clientX, 'buff')
  } catch { /* ignore */ }
}

function onEnemyStateDrop(e: DragEvent, enemyId: string) {
  e.stopPropagation()
  if (!e.dataTransfer) return
  const raw = e.dataTransfer.getData('application/json')
  if (!raw) return
  try {
    const data = JSON.parse(raw)
    if (data.buffData) addBuffToEnemy(enemyId, data.buffData, e.clientX, 'state')
  } catch { /* ignore */ }
}

function deleteItem(enemyId: string, instanceId: string) {
  const current = { ...props.enemyBuffs }
  if (current[enemyId]) {
    current[enemyId] = current[enemyId].filter(b => b.instanceId !== instanceId)
    if (current[enemyId].length === 0) delete current[enemyId]
    emit('update-enemy-buffs', current)
  }
}

const ctxMenu = ref<{ visible: boolean; x: number; y: number; enemyId: string; item: TimelineAction | null; kind: string }>({
  visible: false, x: 0, y: 0, enemyId: '', item: null, kind: 'buff',
})

function onTrackContextMenu(e: MouseEvent, enemyId: string, kind: string) {
  const barEl = (e.target as HTMLElement).closest('.enemy-item-bar, .enemy-state-bar')
  let item: TimelineAction | null = null
  if (barEl) {
    const instanceId = (barEl as any)?.dataset?.instanceId
    if (instanceId) {
      const list = props.enemyBuffs[enemyId] || []
      item = list.find(b => b.instanceId === instanceId) || null
    }
  }
  ctxMenu.value = { visible: true, x: e.clientX, y: e.clientY, enemyId, item, kind }
  document.addEventListener('click', hideCtxMenu, { once: true })
}

function hideCtxMenu() { ctxMenu.value.visible = false }

function makeItem(name: string, kind: string): TimelineAction {
  const instanceId = 'eitem_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  return {
    id: instanceId, instanceId, kind,
    type: 'skill', name, librarySource: 'enemy-buff',
    element: 'physical', icon: '',
    duration: 5, cooldown: 0,
    startTime: 0, logicalStartTime: 0,
    damageTicks: [], allowedTypes: [], physicalAnomaly: [],
  }
}

function onCtxAddBuff() {
  const item = makeItem('新增益', 'buff')
  const current = { ...props.enemyBuffs }; const eid = ctxMenu.value.enemyId
  if (!current[eid]) current[eid] = []
  current[eid] = [...current[eid], item]; current[eid].sort((a, b) => a.startTime - b.startTime)
  emit('update-enemy-buffs', current); hideCtxMenu()
}

function onCtxAddState() {
  const item = makeItem('新状态', 'state')
  const current = { ...props.enemyBuffs }; const eid = ctxMenu.value.enemyId
  if (!current[eid]) current[eid] = []
  current[eid] = [...current[eid], item]; current[eid].sort((a, b) => a.startTime - b.startTime)
  emit('update-enemy-buffs', current); hideCtxMenu()
}

function onCtxDelete() {
  const eid = ctxMenu.value.enemyId; const item = ctxMenu.value.item
  if (!eid || !item) return
  const current = { ...props.enemyBuffs }
  if (current[eid]) {
    current[eid] = current[eid].filter(b => b.instanceId !== item.instanceId)
    emit('update-enemy-buffs', current)
  }
  hideCtxMenu()
}
</script>

<style scoped>
.curve-panel { width: 100%; overflow: hidden; background: #fff; position: relative; }

.curve-scroll-wrapper { position: relative; }
.curve-scroll { transition: none; position: relative; min-width: 100%; }
.curve-svg { display: block; }
.curve-buff-tracks { position: absolute; top: 0; left: 0; z-index: 5; pointer-events: none; }

/* Track containers */
.enemy-state-track, .enemy-buff-track {
  position: absolute; left: 0; height: 24px; pointer-events: auto;
  border-bottom: 1px dashed #e0e0e0; background: #f8f9fc;
  cursor: pointer; overflow: hidden;
}
.enemy-state-track:hover { background: rgba(155, 89, 182, 0.08); }
.enemy-buff-track:hover { background: rgba(103, 194, 58, 0.08); }

/* Bars */
.enemy-item-bar, .enemy-state-bar {
  position: absolute; z-index: 1; border-radius: 3px;
  cursor: pointer; overflow: hidden; display: flex; align-items: center; padding: 0 4px;
  transition: box-shadow 0.1s; min-width: 16px;
}
.enemy-item-bar {
  background: rgba(103, 194, 58, 0.25); border: 1px solid rgba(103, 194, 58, 0.5);
}
.enemy-item-bar:hover { box-shadow: 0 0 0 1px #67c23a; background: rgba(103, 194, 58, 0.35); }
.enemy-state-bar {
  background: rgba(155, 89, 182, 0.2); border: 1px solid rgba(155, 89, 182, 0.45);
}
.enemy-state-bar:hover { box-shadow: 0 0 0 1px #9b59b6; background: rgba(155, 89, 182, 0.3); }
.bar-label {
  font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  user-select: none; flex: 1; min-width: 0;
}
.enemy-item-bar .bar-label { color: #2d5e2d; }
.enemy-state-bar .bar-label { color: #6c3483; }
.bar-delete {
  font-size: 9px; color: rgba(0,0,0,0.35); flex-shrink: 0;
  padding: 0 1px; margin-left: 2px; line-height: 1;
}
.bar-delete:hover { color: #f56c6c; font-weight: 700; }
.track-hint {
  font-size: 10px; color: #c0c4cc; padding: 4px 8px; user-select: none;
  width: 100%; box-sizing: border-box;
}

/* Context menu */
.context-menu {
  position: fixed; z-index: 9999; background: #fff; border: 1px solid #e4e7ed; border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12); padding: 4px 0; min-width: 120px;
}
.context-item { padding: 7px 14px; font-size: 13px; cursor: pointer; transition: background 0.1s; }
.context-item:hover { background: #ecf5ff; }
</style>
