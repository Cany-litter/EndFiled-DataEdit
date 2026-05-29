<!--
 * TimelineCanvas.vue — 排轴模拟的时间轴画布
 *
 * 功能：
 * 1. 渲染时间轴轨道（干员动作/增益/状态轨道）
 * 2. 接受从技能库拖拽的技能/增益，放置到对应轨道
 * 3. 支持动作块的选择、拖拽重定位、右键菜单编辑
 * 4. 显示每个干员的终结技能量阶梯折线图
 * 5. 橡胶框选、撤销/重做、快捷键复制粘贴
 * 6. 时间标尺、循环标记、缩放、吸附网格
 *
 * 通信：所有数据修改通过 emit 上报给父组件 TimelineEditor.vue
-->
<template>
  <!-- 最外层容器：键盘快捷键、滚轮缩放 -->
  <div class="timeline-canvas-wrap"
    @keydown.delete="onDeleteKey"
    @keydown.backspace="onDeleteKey"
    @keydown.ctrl.z.prevent="emit('undo')"
    @keydown.ctrl.shift.z.prevent="emit('redo')"
    @keydown.ctrl.c.prevent="onCopy"
    @keydown.ctrl.v.prevent="onPaste"
    @wheel.prevent="onWheel"
    tabindex="0"
    ref="wrapRef">

    <!-- ======= 顶部工具栏 ======= -->
    <div class="timeline-toolbar">
      <el-button-group size="small">
        <el-button :disabled="!canUndo" @click="emit('undo')">↩ 撤销</el-button>
        <el-button :disabled="!canRedo" @click="emit('redo')">↪ 重做</el-button>
      </el-button-group>
      <div class="toolbar-divider"></div>
      <span style="font-size:12px;color:#606266;white-space:nowrap">吸附</span>
      <!-- 吸附粒度：0.1s / 0.5s / 1帧 -->
      <el-select :model-value="snapGranularity" @update:model-value="v => emit('update:snapGranularity', v)" size="small" style="width:88px">
        <el-option label="0.1s" :value="0.1" />
        <el-option label="0.5s" :value="0.5" />
        <el-option label="1帧" :value="1/60" />
      </el-select>
      <div class="toolbar-divider"></div>
      <el-button-group size="small">
        <el-button @click="zoomOut">缩小</el-button>
        <el-button disabled>{{ scaleLabel }}</el-button>
        <el-button @click="zoomIn">放大</el-button>
      </el-button-group>
      <el-button size="small" @click="resetView">重置</el-button>
      <el-button size="small" @click="clearSelection" :disabled="selectedIds.length === 0">取消选择</el-button>
      <el-button size="small" type="danger" @click="deleteSelected" :disabled="selectedIds.length === 0">删除({{ selectedIds.length }})</el-button>
      <el-button size="small" text @click="emit('toggle-properties')">属性</el-button>
      <!-- 总时长和拖拽落点时间 -->
      <span style="margin-left:auto;font-size:12px;color:#909399">{{ totalDuration.toFixed(1) }}s</span>
      <span v-if="dropTime !== null" style="margin-left:8px;font-size:12px;color:#67c23a">{{ dropTime.toFixed(2) }}s</span>
    </div>

    <!-- ======= 主体：左侧标签列 + 右侧时间轴视口 ======= -->
    <div class="timeline-body">

      <!-- === 左侧轨道标签列（固定 90px，与视口同步滚动） === -->
      <div class="track-labels-col">
        <div class="labels-inner"
          :style="{ height: (totalContentHeight + RULER_HEIGHT) + 'px', transform: 'translateY(' + labelsOffset + 'px)' }">

          <!-- 干员轨道标签 -->
          <div v-for="(track, ti) in tracks" :key="track.id" class="track-label"
            :class="{
              'track-label-buff': track.kind === 'buff',
              'track-label-state': track.kind === 'state',
            }"
            :style="{ top: RULER_HEIGHT + trackLayouts[ti].top + 'px', height: trackLayouts[ti].height + 'px' }">
            <div class="track-label-content">
              <template v-if="track.kind === 'state'">
                <div class="label-name">状态</div>
              </template>
              <template v-else>
                <div class="label-slot"
                  :class="{ 'label-slot-buff': track.kind === 'buff', 'label-slot-state': track.kind === 'state' }">
                  {{ track.kind === 'buff' ? '╌' : (charSlotMap?.[track.id] ?? '') }}
                </div>
                <div class="label-name">{{ track.kind === 'buff' ? '增益' : (charNameMap?.[track.id] ?? track.id.substring(0, 6)) }}</div>
              </template>
            </div>
            <div v-if="track.kind !== 'buff' && track.kind !== 'state'" class="label-element-bar"
              :style="{ background: elementColor(charElementMap?.[track.id] ?? 'physical') }"></div>
          </div>

          <!-- 敌人轨道标签 -->
          <template v-for="(enemy, ei) in (enemies || [])" :key="'el'+ei">
            <div class="track-label" :style="{ top: RULER_HEIGHT + enemyStateTrackTop(ei) + 'px', height: ENEMY_STATE_HEIGHT + 'px' }">
              <div class="track-label-content">
                <div class="label-name">{{ enemy.name }}</div>
                <div class="label-sub">状态</div>
              </div>
            </div>
            <div class="track-label" :style="{ top: RULER_HEIGHT + enemyBuffTrackTop(ei) + 'px', height: ENEMY_BUFF_HEIGHT + 'px' }">
              <div class="track-label-content">
                <div class="label-name">{{ enemy.name }}</div>
                <div class="label-sub">增益</div>
              </div>
            </div>
            <div class="track-label" :style="{ top: RULER_HEIGHT + enemyStaggerTop(ei) + 'px', height: ENEMY_STAGGER_HEIGHT + 'px' }">
              <div class="track-label-content">
                <div class="label-name">{{ enemy.name }}</div>
                <div class="label-sub">失衡</div>
              </div>
            </div>
          </template>

          <!-- 技力区域标签 -->
          <div v-if="enemies && enemies.length > 0" class="track-label"
            :style="{ top: RULER_HEIGHT + enemyStaggerTop(enemies.length - 1) + ENEMY_STAGGER_HEIGHT + ENEMY_GAP + 2 + 'px', height: 60 + 'px' }">
            <div class="track-label-content">
              <div class="label-name">技力</div>
            </div>
          </div>
        </div>
      </div>

      <!-- === 右侧可滚动时间轴视口 === -->
      <div class="timeline-viewport" ref="viewportRef"
        @scroll="onScroll"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop">

        <div class="timeline-content" :style="{ width: contentWidth + 'px' }">

          <!-- ====== 顶部吸附标尺 ====== -->
          <div class="timeline-ruler" :style="{ width: contentWidth + 'px' }">
            <!-- 刻度线 -->
            <div v-for="t in rulerTicks" :key="t" class="ruler-tick" :style="{ left: t * pxPerSecond + 'px' }">
              <span class="ruler-label">{{ t.toFixed(t % 1 === 0 ? 0 : 1) }}s</span>
              <div class="ruler-line"></div>
            </div>
            <!-- 按键标记（技能/连携/终结对应的快捷键提示） -->
            <div v-for="kc in keyCaps" :key="kc.id" class="keycap" :style="{ left: kc.time * pxPerSecond + 'px' }" :title="kc.label">
              <span class="keycap-label" :style="{ background: kc.color }">{{ kc.key }}</span>
            </div>
            <!-- 循环边界标记（可拖拽） -->
            <div v-for="(cb, ci) in cycleBoundaries" :key="ci" class="cycle-marker"
              :style="{ left: cb.time * pxPerSecond + 'px' }"
              :title="'循环边界 ' + (ci + 1) + ' @ ' + cb.time.toFixed(1) + 's'">
              <div class="cycle-marker-handle" @mousedown.prevent="onCycleMarkerDown($event, ci)">⤾</div>
            </div>
          </div>

          <!-- ====== 轨道渲染区 ====== -->
          <div class="timeline-tracks" :style="{ height: trackAreaHeight + 'px' }"
            @mousedown.self="onTrackMouseDown"
            @mousemove="onTrackMouseMove"
            @mouseup="onTrackMouseUp">

            <!-- 竖网格线 -->
            <div class="track-grid-lines" :style="{ height: trackAreaHeight + 'px' }">
              <div v-for="t in rulerTicks" :key="'g'+t" class="track-grid-line" :style="{ left: t * pxPerSecond + 'px' }"></div>
            </div>

            <!-- 逐轨道循环渲染 -->
            <div v-for="(track, ti) in tracks" :key="track.id" class="track-row"
            :class="{
              'track-row-buff': track.kind === 'buff',
              'track-row-state': track.kind === 'state',
              'drag-hover-target': dragHoverTrackIndex === ti,
            }"
              :style="{ width: contentWidth + 'px', top: trackLayouts[ti].top + 'px', height: trackLayouts[ti].height + 'px' }"
              @contextmenu.prevent="track.kind === 'buff' ? onBuffTrackContextMenu($event, ti) : track.kind === 'state' ? onStateTrackContextMenu($event, ti) : null">

              <div class="track-bg"></div>

              <!-- ---- 动作轨道（干员技能块） ---- -->
              <template v-if="track.kind !== 'buff' && track.kind !== 'state'">
                <div v-for="action in track.actions" :key="action.instanceId"
                  class="action-block"
                  :class="{ 'action-selected': selectedIds.includes(action.instanceId) }"
                  :style="actionStyle(action)"
                  @mousedown.prevent="onActionMouseDown($event, action, ti)"
                  @contextmenu.prevent="onContextMenu($event, action, ti)"
                  :title="actionTooltip(action)">
                  <!-- 块内颜色条 -->
                  <div class="action-block-inner" :style="{ background: actionColor(action.type) }">
                    <span class="action-label">{{ action.name }}</span>
                    <!-- 伤害判定帧标记 -->
                    <div v-for="(dt, di) in action.damageTicks" :key="di" class="tick-marker"
                      :style="{ left: (dt.offset * pxPerSecond) + 'px' }"></div>
                  </div>
                  <!-- 冷却条 -->
                  <div v-if="action.cooldown" class="action-cooldown-bar"
                    :style="{ width: (action.duration > 0 ? Math.min(action.cooldown / action.duration, 99) * 100 : 0) + '%' }"></div>
                  <!-- 连击数徽标 -->
                  <div v-if="action.damageTicks && action.damageTicks.length > 0" class="combo-badge"
                    :title="'伤害帧: ' + action.damageTicks.length">{{ action.damageTicks.length }}</div>
                  <!-- 元素异常点 -->
                  <div v-if="action.physicalAnomaly && action.physicalAnomaly.length" class="anomaly-dots">
                    <span v-for="(ano, ai) in action.physicalAnomaly.slice(0, 5)" :key="ai" class="anomaly-dot"
                      :style="{ background: anomalyColor(ano.type || ano) }" :title="'异常: ' + (ano.type || ano)"></span>
                  </div>
                  <!-- 命中敌人标记 -->
                  <div v-if="action.targetAllEnemies" class="enemy-target-icons">
                    <span class="enemy-target-all" title="命中所有敌人">ALL</span>
                  </div>
                  <div v-else-if="action.targetEnemyIds && action.targetEnemyIds.length" class="enemy-target-icons">
                    <span v-for="(eid, ei) in action.targetEnemyIds" :key="ei" class="enemy-target-dot"
                      :style="{ background: enemyColors[ei % enemyColors.length] }" :title="enemyName(eid)"></span>
                  </div>
                </div>
                <!-- 干员终结技能量阶梯折线图（底部 14px） -->
                <svg class="track-resource-bar" :width="contentWidth" height="14" :data-track-id="track.id">
                  <text x="2" y="11" font-size="11" fill="#409eff" font-weight="600">终</text>
                  <polyline v-if="gaugePolyline(track.id)" :points="gaugePolyline(track.id)"
                    fill="none" stroke="#409eff" stroke-width="1.5" stroke-linejoin="miter" />
                </svg>
              </template>

              <!-- ---- 增益轨道 ---- -->
              <template v-else-if="track.kind === 'buff'">
                <div v-for="buff in track.actions" :key="buff.instanceId"
                  class="buff-bar"
                  :class="{ 'buff-overflow': (buffLayerInfo.get(track.id)?.get(buff.instanceId) ?? 0) < 0 }"
                  :style="buffBarStyle(buff, buffLayerInfo.get(track.id)?.get(buff.instanceId) ?? 0)"
                  @click.stop="onActionMouseDown($event, buff, ti)"
                  @contextmenu.prevent="onContextMenu($event, buff, ti)"
                  :title="buff.name + ' (' + buff.duration.toFixed(1) + 's)'">
                  <span class="buff-bar-label">{{ buff.name }}</span>
                </div>
              </template>

              <!-- ---- 状态轨道 ---- -->
              <template v-else-if="track.kind === 'state'">
                <div v-for="state in track.actions" :key="state.instanceId"
                  class="state-bar"
                  :class="{ 'state-overflow': (stateLayerInfo.get(track.id)?.get(state.instanceId) ?? 0) < 0 }"
                  :style="stateBarStyle(state, stateLayerInfo.get(track.id)?.get(state.instanceId) ?? 0)"
                  @contextmenu.prevent="onContextMenu($event, state, ti)"
                  :title="state.name + ' (' + state.duration.toFixed(1) + 's)'">
                  <span class="state-bar-label">{{ state.name }}</span>
                </div>
              </template>
            </div>

            <!-- 干员组边框（4人分别以红/橙/黄/绿区分） -->
            <div v-for="(g, gi) in trackGroups" :key="gi" class="track-group-border"
              :style="{ top: g.top + 'px', height: g.height + 'px', width: contentWidth + 'px', borderColor: g.color }"></div>

            <!-- 橡胶框选矩形 -->
            <div v-if="isSelecting" class="selection-rect" :style="selectionStyle"></div>
            <!-- 拖拽落点指示线 -->
            <div v-if="dropIndicatorVisible" class="drop-indicator" :style="{ left: dropIndicatorX + 'px' }"></div>
            <!-- 无动作时的空态提示 -->
            <div v-if="totalActions === 0" class="empty-hint">从左侧干员卡片拖拽技能到此处</div>
          </div>

          <!-- 折线图面板：SP曲线 + 敌人失衡曲线 + 敌人增益轨道 -->
          <CurvePanel
            :tracks="props.tracks"
            :enemies="props.enemies"
            :system-constants="props.systemConstants"
            :px-per-second="pxPerSecond"
            :scroll-left="viewportRef?.scrollLeft ?? 0"
            :enemy-buffs="props.enemyBuffs"
            @update-enemy-buffs="onUpdateEnemyBuffs"
            @edit-action="a => emit('selectAction', a)"
          />
        </div>
      </div>
    </div>

    <!-- ======= Teleport 到 body 的右键菜单 ======= -->
    <Teleport to="body">
      <div v-if="contextMenu.visible" class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
        <!-- 右键在空白增益/状态轨道上 -->
        <template v-if="(contextMenu.isBuffTrack || contextMenu.isStateTrack) && !contextMenu.action">
          <div v-if="contextMenu.isBuffTrack" class="context-item" @click="onAddBuff">添加增益</div>
          <div v-if="contextMenu.isStateTrack" class="context-item" @click="onAddState">添加状态</div>
        </template>
        <!-- 右键在动作块/增益条/状态条上 -->
        <template v-else-if="contextMenu.action">
          <div class="context-item" @click="onCtxEdit">编辑属性</div>
          <div class="context-item" @click="onCtxDelete">删除</div>
          <div class="context-item" @click="onCtxDuplicate">复制</div>
          <div class="context-divider"></div>
          <div class="context-item" @click="onCtxInsertTick">插入伤害点</div>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Track, TimelineAction, SystemConstants, TimelineEnemy } from '../../engine/types/timeline'
import CurvePanel from './CurvePanel.vue'

// ============================================================
// Props & Emits
// ============================================================

/** 父组件传入的属性 */
const props = defineProps<{
  tracks: Track[]                          // 全部轨道数据
  systemConstants: SystemConstants         // 战斗常量
  snapFn?: (t: number) => number          // 时间吸附函数
  canUndo?: boolean                        // 是否可以撤销
  canRedo?: boolean                        // 是否可以重做
  snapGranularity?: number                 // 吸附粒度
  enemies?: TimelineEnemy[]                // 敌人列表
  charNameMap?: Record<string, string>    // 干员ID→名称
  charElementMap?: Record<string, string>  // 干员ID→元素
  charSlotMap?: Record<string, string>    // 干员ID→槽位
  enemyBuffs?: Record<string, TimelineAction[]>      // 敌人增益
}>()

/** 向父组件发射的事件 */
const emit = defineEmits<{
  selectAction: [action: TimelineAction]                           // 选中一个动作
  'drop-skill': [charId: string, actionData: Partial<TimelineAction>, time: number]  // 拖放技能
  'drop-buff': [trackId: string, buffData: Partial<TimelineAction>, time: number]    // 拖放增益
  'delete-actions': [instanceIds: string[]]                       // 删除动作
  'update-action': [trackId: string, instanceId: string, patch: Partial<TimelineAction>]  // 更新动作
  'add-buff': [trackId: string, buff: TimelineAction]             // 添加增益
  'add-state': [trackId: string, state: TimelineAction]           // 添加状态
  'move-action': []                                                // 移动动作(触发历史)
  undo: []                                                         // 撤销
  redo: []                                                         // 重做
  deselectAction: []                                               // 取消选择
  'update:snapGranularity': [value: number]                       // 更新吸附粒度
  'toggle-properties': []                                          // 切换属性面板显示
  'update-enemy-buffs': [buffs: Record<string, TimelineAction[]>]  // 更新敌人增益
}>()

// ============================================================
// 轨道布局常量
// ============================================================

/** 动作轨道高度(含底部14px的终结技能量阶梯) */
const ACTION_TRACK_HEIGHT = 62
/** 增益轨道高度 */
const BUFF_TRACK_HEIGHT = 32
/** 状态轨道高度 */
const STATE_TRACK_HEIGHT = 18
/** 轨道间距 */
const TRACK_GAP = 4
/** 标尺高度 */
const RULER_HEIGHT = 28

/**
 * 计算每个轨道的 top(偏移) 和 height(高度)
 * 遍历 tracks 按顺序堆叠，不同类型取不同高度
 */
const trackLayouts = computed(() => {
  const layouts: { top: number; height: number }[] = []
  let top = 0
  for (const track of props.tracks) {
    const h = track.kind === 'state' ? STATE_TRACK_HEIGHT
           : track.kind === 'buff' ? BUFF_TRACK_HEIGHT
           : ACTION_TRACK_HEIGHT
    layouts.push({ top, height: h })
    top += h + TRACK_GAP
  }
  return layouts
})

/** 轨道区总高度 */
const trackAreaHeight = computed(() => {
  const last = trackLayouts.value[trackLayouts.value.length - 1]
  return last ? last.top + last.height : 150
})

/** 敌人轨道布局常量 */
const ENEMY_STATE_HEIGHT = 24
const ENEMY_BUFF_HEIGHT = 24
const ENEMY_STAGGER_HEIGHT = 30
const ENEMY_GAP = 2

function enemyStateTrackTop(ei: number) {
  return trackAreaHeight.value + ENEMY_GAP + ei * (ENEMY_STATE_HEIGHT + ENEMY_GAP + ENEMY_BUFF_HEIGHT + ENEMY_GAP + ENEMY_STAGGER_HEIGHT + ENEMY_GAP)
}
function enemyBuffTrackTop(ei: number) { return enemyStateTrackTop(ei) + ENEMY_STATE_HEIGHT + ENEMY_GAP }
function enemyStaggerTop(ei: number) { return enemyBuffTrackTop(ei) + ENEMY_BUFF_HEIGHT + ENEMY_GAP }

const enemyAreaHeight = computed(() => {
  if (!props.enemies || props.enemies.length === 0) return 0
  const last = props.enemies.length - 1
  return enemyStaggerTop(last) + ENEMY_STAGGER_HEIGHT + ENEMY_GAP - trackAreaHeight.value
})

const totalContentHeight = computed(() => trackAreaHeight.value + enemyAreaHeight.value)

/** 槽位显示标签 */
const slotLabels = ['1', '2', '3', '4']

// ============================================================
// 缩放与滚动状态
// ============================================================

/** 每秒钟对应的像素数（缩放级别） */
const pxPerSecond = ref(60)
const viewportRef = ref<HTMLDivElement | null>(null)
/** 标签列偏移（与视口滚动同步） */
const labelsOffset = ref(0)
const wrapRef = ref<HTMLDivElement | null>(null)

const MIN_PPS = 15
const MAX_PPS = 300

// ============================================================
// 增益/状态分层算法
// ============================================================

/**
 * 计算增益/状态的分层布局
 * 使用简单的首次适配算法：将每个条分配到第一层空闲轨道，
 * 最多 3 层，超出标记为 -1（溢出红色）
 */
function computeBuffLayers(actions: TimelineAction[]): Map<string, number> {
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

/** 所有增益轨道的分层信息 */
const buffLayerInfo = computed(() => {
  const map = new Map<string, Map<string, number>>()
  for (const track of props.tracks) {
    if (track.kind === 'buff') {
      map.set(track.id, computeBuffLayers(track.actions))
    }
  }
  return map
})

/** 所有状态轨道的分层信息 */
const stateLayerInfo = computed(() => {
  const map = new Map<string, Map<string, number>>()
  for (const track of props.tracks) {
    if (track.kind === 'state') {
      map.set(track.id, computeBuffLayers(track.actions))
    }
  }
  return map
})

/** CurvePanel 转发敌人增益更新事件 */
function onUpdateEnemyBuffs(buffs: Record<string, TimelineAction[]>) {
  emit('update-enemy-buffs', buffs)
}

// ============================================================
// 终结技能量阶梯折线图
// ============================================================

/** 干员轨道底部的资源条高度 */
const RESOURCE_BAR_HEIGHT = 14

/**
 * 将终结技能量值(0~100)映射到SVG Y坐标
 * 顶部留2px边距，底部留4px边距
 */
function gaugeToY(g: number): number {
  return RESOURCE_BAR_HEIGHT - 2 - (g / 100) * (RESOURCE_BAR_HEIGHT - 6)
}

/**
 * 生成终结技能量的阶梯折线图SVG path points
 * 阶梯样式：水平到事件时间 → 垂直跳变到新值 → 继续水平
 * 这模拟了 ECharts step='end' 的样式
 */
function gaugePolyline(trackId: string): string {
  const pts = gaugeCurves.value[trackId]
  if (!pts || !pts.length) return ''
  const coords: string[] = []
  let prevY = gaugeToY(pts[0].gauge)
  coords.push(`0,${prevY}`)
  for (let i = 1; i < pts.length; i++) {
    const x = pts[i].time * pxPerSecond.value
    const y = gaugeToY(pts[i].gauge)
    if (y !== prevY) {
      // 先水平到新时间，再垂直跳变
      coords.push(`${x},${prevY}`)
      coords.push(`${x},${y}`)
      prevY = y
    }
  }
  const lastX = pts[pts.length - 1].time * pxPerSecond.value
  coords.push(`${lastX},${prevY}`)
  return coords.join(' ')
}

/**
 * 按干员计算终结技能量曲线
 * 基于每个动作的 gaugeGain + teamGaugeGain 累计
 * 在每个 action.startTime 处产生阶梯跳变
 */
const gaugeCurves = computed(() => {
  const curves: Record<string, { time: number; gauge: number }[]> = {}
  for (const track of props.tracks) {
    // 只处理动作轨道
    if (track.kind !== 'action' && track.kind !== undefined) continue
    const id = track.id
    const pts: { time: number; gauge: number }[] = []
    let gauge = 0
    const totalGauge = 100
    const actions = [...track.actions].sort((a, b) => a.startTime - b.startTime)
    let lastTime = 0
    for (const a of actions) {
      // 如果动作之间有间隔，插入水平段保持当前值
      if (a.startTime > lastTime) {
        pts.push({ time: lastTime, gauge })
        pts.push({ time: a.startTime, gauge })
      }
      const g = (a.gaugeGain || 0) + (a.teamGaugeGain || 0)
      if (g > 0) {
        gauge = Math.min(totalGauge, gauge + g)
        // 插入跳变前和跳变后的两个点形成阶梯
        pts.push({ time: a.startTime, gauge: gauge - g })
        pts.push({ time: a.startTime, gauge })
      }
      lastTime = a.startTime
    }
    // 末尾填充到场景结束时间
    const maxEnd = props.tracks.reduce((mx, t) => Math.max(mx, ...t.actions.map(a => a.startTime + a.duration)), 30)
    if (lastTime < maxEnd + 5) {
      pts.push({ time: lastTime, gauge })
      pts.push({ time: maxEnd + 5, gauge })
    }
    curves[id] = pts
  }
  return curves
})

// ============================================================
// 剪贴板 & 循环标记
// ============================================================

/** 复制的动作缓冲区 */
const clipBoard = ref<TimelineAction[]>([])
/** 循环边界标记列表 */
const cycleBoundaries = ref<{ time: number }[]>([])
let draggingCycle: { index: number; startX: number; origTime: number } | null = null

/**
 * 按键标记：在标尺上显示技能/连携/终结的快捷键提示
 * skill → 1(橙色), chain/E → E(绿色), ultimate → U(红色)
 */
const keyCaps = computed(() => {
  const caps: { id: string; time: number; key: string; label: string; color: string }[] = []
  const keyMap: Record<string, { key: string; color: string }> = {
    skill: { key: '1', color: '#e6a23c' },
    chain: { key: 'E', color: '#67c23a' },
    ultimate: { key: 'U', color: '#f56c6c' },
  }
  for (const track of props.tracks) {
    if (track.kind !== 'action') continue
    for (const a of track.actions) {
      const km = keyMap[a.type]
      if (km) {
        caps.push({ id: a.instanceId, time: a.startTime, key: km.key, label: a.name, color: km.color })
      }
    }
  }
  return caps
})

// ============================================================
// 选择状态
// ============================================================

/** 当前选中的动作实例ID列表 */
const selectedIds = ref<string[]>([])
/** 右键菜单状态 */
const contextMenu = ref<{
  visible: boolean; x: number; y: number;
  action: TimelineAction | null; trackIndex: number;
  isBuffTrack?: boolean; isStateTrack?: boolean; dropTime?: number
}>({ visible: false, x: 0, y: 0, action: null, trackIndex: -1 })

/** 橡胶框选状态 */
const isSelecting = ref(false)
const selectionStart = ref({ x: 0, y: 0 })
const selectionEnd = ref({ x: 0, y: 0 })
const selectionTrackOffset = ref(0)

/** 拖拽落点指示 */
const dropTime = ref<number | null>(null)
const dropIndicatorVisible = ref(false)
const dropIndicatorX = ref(0)
/** 拖拽悬浮的目标轨道索引（用于高亮显示） */
const dragHoverTrackIndex = ref(-1)

// ============================================================
// 计算属性：时长、宽度、标尺刻度、缩放标签、框选样式
// ============================================================

/** 总时长：所有动作的最大结束时间 + 10秒缓冲 */
const totalDuration = computed(() => {
  let max = 30
  for (const track of props.tracks) {
    for (const a of track.actions) {
      const end = a.startTime + a.duration
      if (end > max) max = end
    }
  }
  return max + 10
})

/** 内容总宽度 (px) */
const contentWidth = computed(() => totalDuration.value * pxPerSecond.value)

/** 缩放比例标签 */
const scaleLabel = computed(() => {
  const s = pxPerSecond.value
  if (s >= 120) return '1px/帧'
  if (s >= 60) return '1s=' + (s / 60).toFixed(0) + 'px'
  return '1s=' + s.toFixed(0) + 'px'
})

/** 标尺刻度列表（根据缩放级别动态调整步长） */
const rulerTicks = computed(() => {
  const ticks: number[] = []
  const step = pxPerSecond.value >= 120 ? 0.5 : pxPerSecond.value >= 60 ? 1 : 5
  const total = Math.ceil(totalDuration.value / step)
  for (let i = 0; i <= total; i++) ticks.push(i * step)
  return ticks
})

/** 框选矩形样式 */
const selectionStyle = computed(() => {
  const left = Math.min(selectionStart.value.x, selectionEnd.value.x)
  const top = Math.min(selectionStart.value.y, selectionEnd.value.y)
  const w = Math.abs(selectionEnd.value.x - selectionStart.value.x)
  const h = Math.abs(selectionEnd.value.y - selectionStart.value.y)
  return { left: left + 'px', top: top + 'px', width: w + 'px', height: h + 'px' }
})

// ============================================================
// 颜色与样式辅助函数
// ============================================================

/** 敌人标记颜色（循环使用） */
const enemyColors = ['#e6a23c', '#67c23a', '#f56c6c', '#9b59b6', '#1abc9c', '#3498db', '#e74c3c', '#2ecc71']

/** 根据敌人ID获取显示名 */
function enemyName(id: string): string {
  return (props.enemies || []).find(e => e.id === id)?.name || id
}

/** 异常类型的颜色映射 */
const ANOMALY_COLORS: Record<string, string> = {
  stagger: '#e6a23c', break: '#409eff', armor_break: '#f56c6c', knockdown: '#9b59b6',
  knockup: '#1abc9c', ice_shatter: '#00bcd4', burning: '#ff5722', conductive: '#7c4dff',
  frozen: '#448aff', corrosion: '#8bc34a',
}

/** 动作类型→颜色 */
function actionColor(type: string) {
  return ({ normal: '#409eff', attack: '#409eff', skill: '#e6a23c', chain: '#67c23a', link: '#67c23a', ultimate: '#f56c6c', talent1: '#9b59b6', talent2: '#1abc9c', execution: '#909399' })[type] ?? '#909399'
}

/** 异常类型→颜色 */
function anomalyColor(type: string) {
  return ANOMALY_COLORS[type] || '#909399'
}

/** 元素→颜色 */
const ELEMENT_COLORS: Record<string, string> = {
  physical: '#909399', blaze: '#f56c6c', emag: '#e6a23c', cold: '#409eff', nature: '#67c23a',
}
function elementColor(element: string): string {
  return ELEMENT_COLORS[element] ?? '#909399'
}

/** 动作块的 left/width 样式 */
function actionStyle(action: TimelineAction) {
  return {
    left: (action.startTime * pxPerSecond.value) + 'px',
    width: Math.max(action.duration * pxPerSecond.value, 8) + 'px',
  }
}

/** 动作块的 tooltip（名称/类型/持续/伤害判定） */
function actionTooltip(action: TimelineAction) {
  const ticks = action.damageTicks.map(dt => `${dt.offset}s (stagger:${dt.stagger}, sp:${dt.sp})`).join('\n')
  return `${action.name}\n类型: ${action.type}\n持续: ${action.duration}s\n开始: ${action.startTime}s\n伤害判定:\n${ticks}`
}

/** 增益条的 top/left/width/height 样式（分层堆叠） */
function buffBarStyle(buff: TimelineAction, layer: number) {
  const left = buff.startTime * pxPerSecond.value
  const width = Math.max(buff.duration * pxPerSecond.value, 4)
  const trackH = BUFF_TRACK_HEIGHT - 4
  const layerH = Math.max(trackH / 3, 8)
  const top = 2 + layer * layerH
  return { left: left + 'px', width: width + 'px', top: top + 'px', height: layerH + 'px' }
}

/** 状态条的 top/left/width/height 样式（分层堆叠） */
function stateBarStyle(state: TimelineAction, layer: number) {
  const left = state.startTime * pxPerSecond.value
  const width = Math.max(state.duration * pxPerSecond.value, 4)
  const trackH = STATE_TRACK_HEIGHT - 4
  const layerH = Math.max(trackH / 3, 8)
  const top = 2 + layer * layerH
  return { left: left + 'px', width: width + 'px', top: top + 'px', height: layerH + 'px' }
}

/**
 * 干员组边框：每3个连续轨道(动作+增益+状态)为一组
 * 用红/橙/黄/绿色边框包裹，对应4个干员槽位
 */
const trackGroups = computed(() => {
  const groups: { top: number; height: number; color: string }[] = []
  const colors = ['#e74c3c', '#e67e22', '#d4ac0d', '#1abc9c']
  for (let i = 0; i < props.tracks.length; i += 3) {
    if (i + 2 >= props.tracks.length) break
    const t1 = trackLayouts.value[i]
    const t3 = trackLayouts.value[i + 2]
    const slotIdx = Math.floor(i / 3)
    groups.push({ top: t1.top, height: t3.top + t3.height - t1.top, color: colors[slotIdx] ?? '#909399' })
  }
  return groups
})

// ============================================================
// 坐标转换工具
// ============================================================

/** 右键菜单：增益轨道上的右键 → 显示「添加增益」选项 */
function onBuffTrackContextMenu(e: MouseEvent, ti: number) {
  const time = snap(clientXToTime(e.clientX))
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, action: null, trackIndex: ti, isBuffTrack: true, dropTime: time }
  document.addEventListener('click', hideContextMenu, { once: true })
}

/** 右键菜单：状态轨道上的右键 → 显示「添加状态」选项 */
function onStateTrackContextMenu(e: MouseEvent, ti: number) {
  const time = snap(clientXToTime(e.clientX))
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, action: null, trackIndex: ti, isStateTrack: true, dropTime: time }
  document.addEventListener('click', hideContextMenu, { once: true })
}

/** 时间吸附：使用传入的 snapFn 或默认四舍五入到 0.1s */
function snap(t: number): number {
  return props.snapFn ? props.snapFn(t) : Math.round(t * 10) / 10
}

/**
 * 根据 Y 坐标(viewport-relative)获取轨道索引
 * 正确步骤：减去视口 top 偏移 + 滚动偏移 - 标尺高度
 */
function getTrackIndexByY(y: number): number {
  const viewport = viewportRef.value
  if (!viewport) return 0
  const rect = viewport.getBoundingClientRect()
  const scrollTop = viewport.scrollTop
  const trackY = (y - rect.top) + scrollTop - RULER_HEIGHT
  const layouts = trackLayouts.value
  for (let i = layouts.length - 1; i >= 0; i--) {
    if (trackY >= layouts[i].top) return i
  }
  return 0
}

/** 将 viewport-relative X 坐标转换为时间(秒) */
function clientXToTime(clientX: number): number {
  const viewport = viewportRef.value
  if (!viewport) return 0
  const rect = viewport.getBoundingClientRect()
  const scrollLeft = viewport.scrollLeft
  const x = clientX - rect.left + scrollLeft
  return x / pxPerSecond.value
}

// ============================================================
// 拖拽放置（从技能库 / 增益库拖入）
// ============================================================

/** 拖拽悬浮：显示绿色落点指示线，高亮目标轨道 */
function onDragOver(e: DragEvent) {
  if (!e.dataTransfer) return
  dropTime.value = snap(clientXToTime(e.clientX))
  dropIndicatorX.value = dropTime.value * pxPerSecond.value
  dropIndicatorVisible.value = true
  e.dataTransfer.dropEffect = 'copy'
  const raw = e.dataTransfer.getData('application/json')
  if (raw) {
    try {
      const data = JSON.parse(raw)
      if (data.buffData || data.characterId) {
        const ti = getTrackIndexByY(e.clientY)
        dragHoverTrackIndex.value = ti
      }
    } catch { }
  }
}

/** 拖拽离开视口时清除高亮 */
function onDragLeave(e: DragEvent) {
  const viewport = viewportRef.value
  if (viewport && !viewport.contains(e.relatedTarget as Node)) {
    dragHoverTrackIndex.value = -1
  }
}

/**
 * 拖拽放置处理
 * 解析 dataTransfer 的 JSON 数据：
 * - { characterId, actionData } → 技能拖放
 * - { buffData } → 增益拖放
 */
function onDrop(e: DragEvent) {
  dropIndicatorVisible.value = false
  dragHoverTrackIndex.value = -1
  if (!e.dataTransfer) return
  const raw = e.dataTransfer.getData('application/json')
  if (!raw) return
  try {
    const data = JSON.parse(raw)
    if (data.characterId && data.actionData) {
      // 技能拖放：直接计算时间后发射 drop-skill
      const time = snap(clientXToTime(e.clientX))
      emit('drop-skill', data.characterId, data.actionData, time)
    } else if (data.buffData) {
      // 增益拖放：根据 Y 位置找到目标轨道
      const time = snap(clientXToTime(e.clientX))
      const ti = getTrackIndexByY(e.clientY)
      const targetTrack = props.tracks[ti]
      let buffTrackId = ''
      if (targetTrack?.kind === 'buff') {
        buffTrackId = targetTrack.id
      } else if (targetTrack?.id && !targetTrack.kind) {
        // 落在动作轨道上 → 指向其对应的 buff 轨道
        buffTrackId = targetTrack.id + '_buff'
      } else {
        const first = props.tracks.find(t => t.kind === 'buff')
        if (first) buffTrackId = first.id
      }
      if (buffTrackId) emit('drop-buff', buffTrackId, data.buffData, time)
    }
  } catch { }
}

// ============================================================
// 动作块拖拽重定位
// ============================================================

/** 当前正在拖拽的动作 */
let dragging: { action: TimelineAction; trackIndex: number; startX: number; origStart: number } | null = null

/** 动作块 mousedown：开始拖拽或切换选中 */
function onActionMouseDown(e: MouseEvent, action: TimelineAction, ti: number) {
  if (contextMenu.value.visible) hideContextMenu()
  // Shift/Ctrl 多选切换
  if (e.shiftKey || e.ctrlKey) {
    const idx = selectedIds.value.indexOf(action.instanceId)
    if (idx >= 0) selectedIds.value.splice(idx, 1)
    else selectedIds.value.push(action.instanceId)
    return
  }
  // 单选
  if (!selectedIds.value.includes(action.instanceId)) {
    selectedIds.value = [action.instanceId]
  }
  emit('selectAction', action)
  dragging = { action, trackIndex: ti, startX: e.clientX, origStart: action.startTime }
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
}

/** 拖拽移动：更新 action.startTime（实时预览） */
function onDragMove(e: MouseEvent) {
  if (!dragging) return
  const dx = e.clientX - dragging.startX
  const delta = dx / pxPerSecond.value
  const newTime = snap(Math.max(0, dragging.origStart + delta))
  dragging.action.startTime = newTime
  dragging.action.logicalStartTime = newTime
}

/** 拖拽结束：检查冲突，冲突则回退 */
function onDragEnd() {
  if (dragging) {
    const track = props.tracks[dragging.trackIndex]
    if (track) {
      const conflict = track.actions.some(a =>
        a.instanceId !== dragging!.action.instanceId &&
        dragging!.action.startTime < a.startTime + a.duration &&
        dragging!.action.startTime + dragging!.action.duration > a.startTime
      )
      if (conflict) {
        dragging.action.startTime = dragging.origStart
        dragging.action.logicalStartTime = dragging.origStart
      } else {
        track.actions.sort((a, b) => a.startTime - b.startTime)
      }
    }
    emit('move-action')
  }
  dragging = null
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
}

// ============================================================
// 橡胶框选
// ============================================================

function onTrackMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  const viewport = viewportRef.value
  if (!viewport) return
  const rect = viewport.getBoundingClientRect()
  selectionStart.value = {
    x: e.clientX - rect.left + viewport.scrollLeft,
    y: e.clientY - rect.top + viewport.scrollTop
  }
  selectionEnd.value = { ...selectionStart.value }
  isSelecting.value = true
}

function onTrackMouseMove(e: MouseEvent) {
  if (!isSelecting.value) return
  const viewport = viewportRef.value
  if (!viewport) return
  const rect = viewport.getBoundingClientRect()
  selectionEnd.value = {
    x: e.clientX - rect.left + viewport.scrollLeft,
    y: e.clientY - rect.top + viewport.scrollTop
  }
}

/** 框选结束：根据动作中心点是否在选区范围内决定选中 */
function onTrackMouseUp() {
  if (!isSelecting.value) return
  isSelecting.value = false
  const minX = Math.min(selectionStart.value.x, selectionEnd.value.x)
  const maxX = Math.max(selectionStart.value.x, selectionEnd.value.x)
  const minY = Math.min(selectionStart.value.y, selectionEnd.value.y)
  const maxY = Math.max(selectionStart.value.y, selectionEnd.value.y)

  // 微小拖动(小于5px)视为取消选择
  if (maxX - minX < 5 && maxY - minY < 5) {
    selectedIds.value = []
    emit('deselectAction')
    return
  }

  const newSelected: string[] = []
  for (const [ti, track] of props.tracks.entries()) {
    const trackTop = trackLayouts.value[ti].top
    const trackBottom = trackTop + trackLayouts.value[ti].height
    if (minY > trackBottom || maxY < trackTop) continue
    for (const action of track.actions) {
      const ax1 = action.startTime * pxPerSecond.value
      const ax2 = (action.startTime + action.duration) * pxPerSecond.value
      const actionCenterX = (ax1 + ax2) / 2
      if (actionCenterX >= minX && actionCenterX <= maxX) {
        newSelected.push(action.instanceId)
      }
    }
  }
  if (newSelected.length > 0) selectedIds.value = newSelected
}

// ============================================================
// 复制/粘贴
// ============================================================

/** Ctrl+C：将选中动作深拷贝到剪贴板 */
function onCopy() {
  if (selectedIds.value.length === 0) return
  const copied: TimelineAction[] = []
  for (const track of props.tracks) {
    for (const a of track.actions) {
      if (selectedIds.value.includes(a.instanceId)) copied.push(JSON.parse(JSON.stringify(a)))
    }
  }
  clipBoard.value = copied
}

/** Ctrl+V：将剪贴板中的动作粘贴到当前场景（时间偏移+1s） */
function onPaste() {
  if (clipBoard.value.length === 0) return
  const pasted = clipBoard.value.map(a => {
    const copy: TimelineAction = JSON.parse(JSON.stringify(a))
    copy.instanceId = 'inst_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
    copy.startTime = snap(a.startTime + 1)
    copy.logicalStartTime = copy.startTime
    return copy
  })
  for (const track of props.tracks) {
    if (track.kind !== 'action') continue
    for (const p of pasted) track.actions.push({ ...p })
    track.actions.sort((a, b) => a.startTime - b.startTime)
  }
  selectedIds.value = pasted.map(a => a.instanceId)
  emit('move-action')
}

/** 清除选中 */
function clearSelection() {
  selectedIds.value = []
}

/** 删除选中动作 */
function deleteSelected() {
  if (selectedIds.value.length === 0) return
  const ids = [...selectedIds.value]
  selectedIds.value = []
  emit('delete-actions', ids)
}

// ============================================================
// 右键菜单操作
// ============================================================

/** 显示右键菜单 */
function onContextMenu(e: MouseEvent, action: TimelineAction, ti: number) {
  if (!selectedIds.value.includes(action.instanceId)) {
    selectedIds.value = [action.instanceId]
  }
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, action, trackIndex: ti }
  document.addEventListener('click', hideContextMenu, { once: true })
}

function hideContextMenu() {
  contextMenu.value.visible = false
}

/** 编辑属性：选中该动作并打开属性面板 */
function onCtxEdit() {
  if (contextMenu.value.action) emit('selectAction', contextMenu.value.action)
  hideContextMenu()
}

/** 删除 */
function onCtxDelete() {
  deleteSelected()
  hideContextMenu()
}

/** 复制：在选中动作之后+1s处创建副本 */
function onCtxDuplicate() {
  const action = contextMenu.value.action
  const ti = contextMenu.value.trackIndex
  if (!action || ti < 0) return
  const track = props.tracks[ti]
  if (!track) return
  const copy: TimelineAction = JSON.parse(JSON.stringify(action))
  copy.instanceId = 'inst_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
  copy.startTime = snap(action.startTime + action.duration + 1)
  copy.logicalStartTime = copy.startTime
  track.actions.push(copy)
  track.actions.sort((a, b) => a.startTime - b.startTime)
  selectedIds.value = [copy.instanceId]
  emit('move-action')
  hideContextMenu()
}

/** 插入伤害判定点 */
function onCtxInsertTick() {
  const action = contextMenu.value.action
  if (!action) return
  action.damageTicks.push({ offset: action.duration * 0.5, stagger: 10, sp: 0, boundEffects: [] })
  hideContextMenu()
}

/** 右键菜单：在增益轨道空白处添加增益 */
function onAddBuff() {
  const ti = contextMenu.value.trackIndex
  const time = contextMenu.value.dropTime ?? 0
  if (ti < 0 || ti >= props.tracks.length) return
  const track = props.tracks[ti]
  if (track.kind !== 'buff') return
  const instanceId = 'buff_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const buff: TimelineAction = {
    id: instanceId, instanceId, type: 'skill', name: '新增益', librarySource: 'manual',
    element: 'physical', icon: '', duration: 5, cooldown: 0,
    startTime: snap(time), logicalStartTime: snap(time),
    damageTicks: [], allowedTypes: [], physicalAnomaly: [],
  }
  emit('add-buff', track.id, buff)
  hideContextMenu()
}

/** 右键菜单：在状态轨道空白处添加状态 */
function onAddState() {
  const ti = contextMenu.value.trackIndex
  const time = contextMenu.value.dropTime ?? 0
  if (ti < 0 || ti >= props.tracks.length) return
  const track = props.tracks[ti]
  if (track.kind !== 'state') return
  const instanceId = 'state_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const state: TimelineAction = {
    id: instanceId, instanceId, type: 'skill', name: '新状态', librarySource: 'manual',
    element: 'physical', icon: '', duration: 5, cooldown: 0,
    startTime: snap(time), logicalStartTime: snap(time),
    damageTicks: [], allowedTypes: [], physicalAnomaly: [],
  }
  emit('add-state', track.id, state)
  hideContextMenu()
}

// ============================================================
// 键盘快捷键
// ============================================================

/** Delete / Backspace → 删除选中 */
function onDeleteKey() {
  deleteSelected()
}

// ============================================================
// 循环边界管理
// ============================================================

function addCycleBoundary(time?: number) {
  const t = time ?? (totalDuration.value / 2)
  cycleBoundaries.value.push({ time: snap(t) })
  cycleBoundaries.value.sort((a, b) => a.time - b.time)
}

function removeCycleBoundary(index: number) {
  cycleBoundaries.value.splice(index, 1)
}

/** 循环标记的拖拽手柄 mousedown */
function onCycleMarkerDown(e: MouseEvent, index: number) {
  draggingCycle = { index, startX: e.clientX, origTime: cycleBoundaries.value[index].time }
  document.addEventListener('mousemove', onCycleDragMove)
  document.addEventListener('mouseup', onCycleDragEnd)
}

function onCycleDragMove(e: MouseEvent) {
  if (!draggingCycle) return
  const dx = e.clientX - draggingCycle.startX
  const dt = dx / pxPerSecond.value
  cycleBoundaries.value[draggingCycle.index].time = snap(Math.max(0, draggingCycle.origTime + dt))
}

function onCycleDragEnd() {
  if (draggingCycle) cycleBoundaries.value.sort((a, b) => a.time - b.time)
  draggingCycle = null
  document.removeEventListener('mousemove', onCycleDragMove)
  document.removeEventListener('mouseup', onCycleDragEnd)
}

// ============================================================
// 缩放与视图控制
// ============================================================

function zoomIn() {
  pxPerSecond.value = Math.min(MAX_PPS, pxPerSecond.value * 1.5)
}

function zoomOut() {
  pxPerSecond.value = Math.max(MIN_PPS, pxPerSecond.value / 1.5)
}

function resetView() {
  pxPerSecond.value = 60
}

/** 视口滚动时同步标签列的偏移 */
function onScroll() {
  if (viewportRef.value) {
    labelsOffset.value = -viewportRef.value.scrollTop
  }
}

/** Ctrl+滚轮缩放 */
function onWheel(e: WheelEvent) {
  if (!e.ctrlKey) return
  if (e.deltaY < 0) zoomIn(); else zoomOut()
}

// ============================================================
// 生命周期
// ============================================================

onMounted(() => {
  if (viewportRef.value) viewportRef.value.scrollLeft = 0
  wrapRef.value?.focus()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('mousemove', onCycleDragMove)
  document.removeEventListener('mouseup', onCycleDragEnd)
})
</script>

<!-- ============================================================
     样式
     - 所有尺寸单位使用 px
     - z-index 层级：bg(0) → 动作块(1) → 组边框(2) → 资源条(3) → 框选(20)
     - 轨道通过 absolute 定位堆叠
     ============================================================ -->
<style scoped>
/* ---- 主容器 ---- */
.timeline-canvas-wrap {
  display: flex; flex-direction: column; flex-shrink: 0; overflow: hidden;
  border: 1px solid #e4e7ed; border-radius: 6px; background: #fff; outline: none; min-height: 200px;
}
/* ---- 顶部工具栏 ---- */
.timeline-toolbar {
  display: flex; align-items: center; padding: 6px 12px;
  border-bottom: 1px solid #e4e7ed; background: #fafafa;
  flex-shrink: 0; gap: 4px; flex-wrap: wrap;
}
/* ---- 主体容器(左右布局) ---- */
.timeline-body {
  display: flex; flex-shrink: 0; overflow: hidden; min-height: 0;
}
/* ---- 左侧轨道标签列(固定90px, 自动高度) ---- */
.track-labels-col {
  width: 90px; flex-shrink: 0; overflow: hidden; position: relative;
  background: #fff; border-right: 1px solid #e4e7ed; z-index: 10;
}
.labels-inner { position: relative; }
.track-label {
  position: absolute; left: 0; right: 0; display: flex; align-items: center;
  overflow: hidden; border-bottom: 1px solid #f0f0f0;
}
/* 标签内容行 */
.track-label-content {
  display: flex; align-items: center; gap: 5px; padding: 0 6px; width: 100%; min-width: 0;
}
/* 干员槽位标记(1/2/3/4) */
.label-slot {
  font-weight: 700; font-size: 11px; color: #409eff; background: #ecf5ff;
  width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
  border-radius: 3px; flex-shrink: 0;
}
/* 干员名称 */
.label-name {
  font-size: 11px; font-weight: 500; color: #303133;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
/* 元素色条(左侧3px竖条) */
.label-element-bar {
  position: absolute; left: 0; top: 2px; bottom: 2px; width: 3px; border-radius: 2px;
}
.track-label-buff .label-name { color: #606266; }
.track-label-state .label-name { color: #606266; }
.track-label-buff .label-slot { color: #67c23a; background: #f0f9eb; }
.label-sub { font-size: 11px; color: #606266; white-space: nowrap; flex-shrink: 0; }
/* 选中增益轨道时的标签高亮 */
.track-label-selected { background: #e1f3d8 !important; box-shadow: inset 3px 0 0 #67c23a; }

/* ---- 右侧时间轴视口(可滚动) ---- */
.timeline-viewport {
  overflow: auto; scrollbar-gutter: stable; min-height: 0;
}
.timeline-content {
  position: relative; min-height: 100%;
}
/* 顶部吸附标尺 */
.timeline-ruler {
  position: sticky; top: 0; z-index: 10; height: 28px;
  background: #fafafa; border-bottom: 1px solid #e4e7ed;
}
.ruler-tick { position: absolute; top: 0; height: 90%; pointer-events: none; }
.ruler-label {
  font-size: 10px; color: #909399; position: absolute; left: 3px; top: 1px; white-space: nowrap;
}
.ruler-line {
  position: absolute; top: 14px; left: 0; width: 1px; height: 14px; background: #dcdfe6;
}
/* 轨道容器 */
.timeline-tracks {
  position: relative; user-select: none;
}
/* 竖网格线层 */
.track-grid-lines {
  position: absolute; top: 0; left: 0; right: 0; pointer-events: none; z-index: 0;
}
.track-grid-line {
  position: absolute; top: 0; width: 1px; height: 100%; background: rgba(0,0,0,0.04);
}
/* 单轨道行 */
.track-row {
  position: absolute; left: 0; border-bottom: 1px solid #f0f0f0;
}
.track-row-buff { border-bottom: 1px dashed #e0e0e0; }
.track-row-buff .track-bg { background: #f8f9fc; }
.track-row-state { border-bottom: 1px dotted #d0d8f0; }
.track-row-state .track-bg { background: #f0f4ff; }
.track-row:nth-child(odd) .track-bg { background: #fafbfc; }
.track-row-buff:nth-child(odd) .track-bg { background: #f6f7fb; }
/* 选中增益轨道的行高亮 */
.track-row-selected { outline: 2px solid #67c23a; outline-offset: -1px; z-index: 3; }
.track-row-state:nth-child(odd) .track-bg { background: #eaeffb; }
/* 干员终结技能量阶梯折线图容器 */
.track-resource-bar {
  position: absolute; left: 0; bottom: 0; height: 14px; z-index: 3;
  background: rgba(250,250,250,0.6); border-top: 1px solid #f0f0f0;
  pointer-events: none;
}
/* 轨道背景 */
.track-bg { position: absolute; inset: 0; z-index: 0; }
/* 动作块 */
.action-block {
  position: absolute; top: 4px; height: 35px; z-index: 1;
  cursor: grab; border-radius: 4px; overflow: visible; transition: box-shadow 0.1s;
}
.action-block:active { cursor: grabbing; }
.action-block.action-selected {
  box-shadow: 0 0 0 2px #409eff, 0 2px 8px rgba(64,158,255,0.3);
}
.action-block-inner {
  width: 100%; height: 100%; border-radius: 4px 4px 0 0;
  display: flex; align-items: center; padding: 0 6px; position: relative; overflow: hidden;
}
/* 冷却条(底部) */
.action-cooldown-bar {
  position: absolute; bottom: -6px; left: 0; height: 2px;
  background: rgba(100,200,200,0.8); border-radius: 0 0 2px 2px; pointer-events: none;
}
/* 连击数圆形徽标 */
.combo-badge {
  position: absolute; top: -6px; right: -6px; width: 14px; height: 14px; border-radius: 50%;
  background: #409eff; color: #fff; font-size: 8px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; z-index: 5;
  pointer-events: none; line-height: 1;
}
/* 元素异常点（底部） */
.anomaly-dots {
  position: absolute; bottom: -6px; left: 2px; display: flex; gap: 2px; z-index: 5; pointer-events: none;
}
.anomaly-dot {
  width: 6px; height: 6px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.6);
}
/* 命中敌人标记 */
.enemy-target-icons { position: absolute; top: -6px; left: 20px; display: flex; gap: 2px; z-index: 5; pointer-events: none; }
.enemy-target-dot { width: 6px; height: 6px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.7); }
.enemy-target-all { font-size: 7px; font-weight: 700; color: #f56c6c; background: rgba(255,255,255,0.85); padding: 0 2px; border-radius: 2px; line-height: 12px; }
/* 按键标记(标尺上) */
.keycap { position: absolute; top: 1px; pointer-events: none; z-index: 11; }
.keycap-label {
  display: inline-block; padding: 0 3px; font-size: 8px; color: #fff;
  border-radius: 2px; line-height: 14px; font-weight: 700; white-space: nowrap;
}
/* 循环标记(紫色竖线+拖拽手柄) */
.cycle-marker {
  position: absolute; top: 0; width: 2px; height: 100%;
  background: rgba(155, 89, 182, 0.5); z-index: 9; pointer-events: none;
}
.cycle-marker-handle {
  position: absolute; top: -2px; left: -6px; width: 14px; height: 14px;
  background: #9b59b6; border-radius: 50%; color: #fff; font-size: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: ew-resize; pointer-events: auto; line-height: 1;
}
/* 动作块内的技能名称 */
.action-label {
  font-size: 11px; color: #fff; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; user-select: none; text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
/* 伤害判定帧标记(白色竖线) */
.tick-marker {
  position: absolute; top: 0; width: 1px; height: 30%; background: rgba(255,255,255,0.7);
}
/* 橡胶框选矩形 */
.selection-rect {
  position: absolute; z-index: 20; background: rgba(64,158,255,0.12);
  border: 1px solid #409eff; pointer-events: none;
}
/* 空态提示文字 */
.empty-hint {
  position: absolute; top: 50%; left: 100px; transform: translateY(-50%);
  color: #303133; font-size: 36px; pointer-events: none; white-space: nowrap;
  z-index: 5; user-select: none;
  background: linear-gradient(90deg, transparent, rgba(192,196,204,0.4), transparent);
}
/* 拖拽悬浮高亮 */
.drag-hover-target { outline: 2px solid #67c23a; outline-offset: -1px; background: rgba(103,194,58,0.08); }
/* 干员组边框(红/橙/黄/绿) */
.track-group-border {
  position: absolute; left: 0; z-index: 2; pointer-events: none;
  border: 2px solid; border-radius: 8px; opacity: 0.55;
}
/* 工具栏分隔线 */
.toolbar-divider { width: 1px; height: 20px; background: #dcdfe6; margin: 0 4px; flex-shrink: 0; }
/* 拖拽落点指示线(绿色) */
.drop-indicator {
  position: absolute; top: 0; width: 2px; height: 100%;
  background: #67c23a; z-index: 15; pointer-events: none;
}
/* ---- 增益条样式 ---- */
.buff-bar {
  position: absolute; z-index: 1; border-radius: 3px;
  background: rgba(103, 194, 58, 0.25); border: 1px solid rgba(103, 194, 58, 0.5);
  cursor: pointer; overflow: hidden; display: flex; align-items: center; padding: 0 4px;
  transition: box-shadow 0.1s; min-width: 12px;
}
.buff-bar:hover { box-shadow: 0 0 0 1px #67c23a; background: rgba(103, 194, 58, 0.35); }
.buff-bar.buff-overflow { background: rgba(245, 108, 108, 0.2); border-color: rgba(245, 108, 108, 0.4); }
.buff-bar-label {
  font-size: 10px; color: #2d5e2d; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; user-select: none;
}
.buff-overflow .buff-bar-label { color: #8a3a3a; }
/* ---- 状态条样式 ---- */
.state-bar {
  position: absolute; z-index: 1; border-radius: 3px;
  background: rgba(64, 158, 255, 0.2); border: 1px solid rgba(64, 158, 255, 0.5);
  cursor: pointer; overflow: hidden; display: flex; align-items: center; padding: 0 4px;
  transition: box-shadow 0.1s; min-width: 12px;
}
.state-bar:hover { box-shadow: 0 0 0 1px #409eff; background: rgba(64, 158, 255, 0.3); }
.state-bar.state-overflow { background: rgba(245, 108, 108, 0.2); border-color: rgba(245, 108, 108, 0.4); }
.state-bar-label {
  font-size: 10px; color: #2c3e6b; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; user-select: none;
}
.state-overflow .state-bar-label { color: #8a3a3a; }
/* ---- 右键菜单(Teleport到body) ---- */
.context-menu {
  position: fixed; z-index: 9999; background: #fff; border: 1px solid #e4e7ed;
  border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); padding: 4px 0; min-width: 120px;
}
.context-item { padding: 7px 14px; font-size: 13px; cursor: pointer; transition: background 0.1s; }
.context-item:hover { background: #ecf5ff; }
.context-divider { height: 1px; background: #e4e7ed; margin: 4px 0; }
</style>
