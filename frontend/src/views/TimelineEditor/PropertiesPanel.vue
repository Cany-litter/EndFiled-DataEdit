<template>
  <div class="properties-panel">
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="panel-mode-badge" :class="isLibraryMode ? 'mode-lib' : 'mode-inst'">
          {{ isLibraryMode ? '全局' : '实例' }}
        </span>
        <span class="panel-title">{{ displayName || '未选择' }}</span>
      </div>
      <el-button size="small" text @click="$emit('close')">✕</el-button>
    </div>

    <div v-if="!editingData" class="panel-empty">
      从左侧技能库选择技能，或点击时间轴上的技能
    </div>

    <div v-else class="panel-body">
      <!-- 基础信息 -->
      <div class="prop-section">
        <div class="section-title">基础信息</div>
        <div class="prop-row">
          <span class="prop-label">名称</span>
          <el-input v-model="local.name" size="small" @input="emitUpdate" />
        </div>
        <div class="prop-row">
          <span class="prop-label">类型</span>
          <el-select v-model="local.type" size="small" style="flex:1" @change="emitUpdate">
            <el-option v-for="[v,l] in typeOpts" :key="v" :label="l" :value="v" />
          </el-select>
        </div>
        <div class="prop-row">
          <span class="prop-label">元素</span>
          <el-select v-model="local.element" size="small" style="flex:1" @change="emitUpdate">
            <el-option v-for="[v,l] in elementOpts" :key="v" :label="l" :value="v" />
          </el-select>
        </div>
        <div v-if="!isLibraryMode" class="prop-row enemy-select-row">
          <span class="prop-label">命中敌人</span>
          <div class="enemy-select-group">
            <el-checkbox-group v-model="local.targetEnemyIds" size="small" @change="onEnemyCheckChange">
              <el-checkbox-button v-for="e in enemyList" :key="e.id" :value="e.id">{{ e.name }}</el-checkbox-button>
            </el-checkbox-group>
            <el-checkbox :model-value="allSelected" @change="onToggleAll" size="small" border>全部</el-checkbox>
          </div>
        </div>
      </div>

      <!-- 时间参数 -->
      <div class="prop-section">
        <div class="section-title">时间参数</div>
        <div class="prop-row">
          <span class="prop-label">持续时长</span>
          <el-input-number v-model="local.duration" :min="0" :step="0.1" size="small" style="flex:1" @change="emitUpdate" />
        </div>
        <div class="prop-row" v-if="local.cooldown != null">
          <span class="prop-label">冷却时间</span>
          <el-input-number v-model="local.cooldown" :min="0" :step="0.5" size="small" style="flex:1" @change="emitUpdate" />
        </div>
        <div v-if="!isLibraryMode" class="prop-row">
          <span class="prop-label">开始时间</span>
          <el-input-number v-model="local.startTime" :min="0" :step="0.1" size="small" style="flex:1" @change="emitUpdate" />
        </div>
      </div>

      <!-- 资源 -->
      <div class="prop-section">
        <div class="section-title">资源消耗</div>
        <div class="prop-row">
          <span class="prop-label">技力消耗</span>
          <el-input-number v-model="local.spCost" :min="0" size="small" style="flex:1" @change="emitUpdate" />
        </div>
        <div class="prop-row">
          <span class="prop-label">技能获取</span>
          <el-input-number v-model="local.spGain" :min="0" :step="0.5" size="small" style="flex:1" @change="emitUpdate" />
        </div>
        <div class="prop-row">
          <span class="prop-label">自身充能</span>
          <el-input-number v-model="local.gaugeGain" :step="0.5" size="small" style="flex:1" @change="emitUpdate" />
        </div>
        <div class="prop-row">
          <span class="prop-label">队友充能</span>
          <el-input-number v-model="local.teamGaugeGain" :min="0" :step="0.5" size="small" style="flex:1" @change="emitUpdate" />
        </div>
      </div>

      <!-- 伤害帧 -->
      <div class="prop-section">
        <div class="section-title">
          伤害判定帧 ({{ (local.damageTicks || []).length }})
          <el-button size="small" text @click="addTick">+</el-button>
        </div>
        <div v-if="local.damageTicks && local.damageTicks.length" class="tick-list">
          <div v-for="(tick, ti) in local.damageTicks" :key="ti" class="tick-item">
            <div class="tick-header" @click="expandedTick = expandedTick === ti ? null : ti">
              <span class="tick-idx">#{{ ti }}</span>
              <span class="tick-info">{{ tick.offset }}s / 失衡{{ tick.stagger }} / SP{{ tick.sp }}</span>
              <el-button size="small" text type="danger" @click.stop="removeTick(ti)">✕</el-button>
            </div>
            <div v-if="expandedTick === ti" class="tick-detail">
              <div class="prop-row">
                <span class="prop-label">偏移</span>
                <el-input-number v-model="tick.offset" :min="0" :step="0.01" size="small" style="flex:1" @change="emitUpdate" />
              </div>
              <div class="prop-row">
                <span class="prop-label">失衡值</span>
                <el-input-number v-model="tick.stagger" size="small" style="flex:1" @change="emitUpdate" />
              </div>
              <div class="prop-row">
                <span class="prop-label">SP获取</span>
                <el-input-number v-model="tick.sp" size="small" style="flex:1" @change="emitUpdate" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { TimelineAction, TimelineEnemy } from '../../engine/types/timeline'

const props = defineProps<{
  action: TimelineAction | null
  librarySkill: any | null
  isLibraryMode: boolean
  enemyList: TimelineEnemy[]
}>()
const emit = defineEmits<{ update: [data: any]; close: [] }>()

const typeOpts = [['attack','普攻'],['skill','战技'],['link','连携'],['ultimate','终结技'],['execution','处决'],['other','其他']]
const elementOpts = [['physical','物理'],['blaze','灼热'],['emag','电磁'],['cold','寒冷'],['nature','自然']]

const editingData = computed(() => props.isLibraryMode ? props.librarySkill : props.action)
const displayName = computed(() => editingData.value?.name || '')

const local = ref<any>({})
const expandedTick = ref<number | null>(null)

const allSelected = computed(() => {
  const ids = local.value?.targetEnemyIds
  return props.enemyList.length > 0 && ids?.length === props.enemyList.length
})

function onEnemyCheckChange(ids: string[]) {
  local.value.targetAllEnemies = ids.length === props.enemyList.length
  emitUpdate()
}

function onToggleAll(checked: boolean) {
  if (checked) {
    local.value.targetEnemyIds = props.enemyList.map(e => e.id)
    local.value.targetAllEnemies = true
  } else {
    local.value.targetEnemyIds = []
    local.value.targetAllEnemies = false
  }
  emitUpdate()
}

watch(editingData, (d) => {
  if (d) {
    local.value = JSON.parse(JSON.stringify(d))
    if (local.value.targetAllEnemies && props.enemyList.length > 0) {
      local.value.targetEnemyIds = props.enemyList.map(e => e.id)
    }
  }
}, { immediate: true })

function emitUpdate() {
  if (!editingData.value) return
  Object.assign(editingData.value, local.value)
  emit('update', local.value)
}

function addTick() {
  if (!local.value.damageTicks) local.value.damageTicks = []
  local.value.damageTicks.push({ offset: 0.5, stagger: 0, sp: 0, boundEffects: [] })
  emitUpdate()
}

function removeTick(ti: number) {
  local.value.damageTicks?.splice(ti, 1)
  emitUpdate()
}
</script>

<style scoped>
.properties-panel {
  width: 280px; height: 100%; display: flex; flex-direction: column;
  background: #fff; border-left: 1px solid #e4e7ed; overflow: hidden; flex-shrink: 0;
}
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 10px; border-bottom: 1px solid #e4e7ed; background: #fafafa; flex-shrink: 0;
}
.panel-header-left { display: flex; align-items: center; gap: 6px; min-width: 0; }
.panel-mode-badge { font-size: 9px; padding: 1px 4px; border-radius: 2px; font-weight: 600; }
.mode-lib { background: #ecf5ff; color: #409eff; }
.mode-inst { background: #f0f9eb; color: #67c23a; }
.panel-title { font-size: 13px; font-weight: 600; color: #303133; }
.panel-empty { padding: 24px 12px; text-align: center; color: #c0c4cc; font-size: 12px; }
.panel-body { flex: 1; overflow-y: auto; padding: 8px 10px; }
.prop-section { margin-bottom: 10px; }
.section-title { font-size: 12px; font-weight: 600; color: #606266; margin-bottom: 4px; padding-bottom: 3px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; }
.prop-row { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
.prop-label { font-size: 11px; color: #909399; white-space: nowrap; width: 60px; flex-shrink: 0; }
.enemy-select-row { align-items: flex-start; }
.enemy-select-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.tick-list { max-height: 200px; overflow-y: auto; }
.tick-item { border: 1px solid #e4e7ed; border-radius: 4px; margin-bottom: 3px; }
.tick-header { display: flex; align-items: center; gap: 4px; padding: 3px 6px; cursor: pointer; font-size: 11px; }
.tick-idx { color: #409eff; font-weight: 600; }
.tick-info { flex: 1; color: #606266; }
.tick-detail { border-top: 1px solid #f0f0f0; padding: 6px; }
</style>
