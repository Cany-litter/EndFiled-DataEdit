<template>
  <div class="buff-library">
    <div class="lib-header">
      <span class="lib-title">增益库</span>
      <el-tag v-if="limitedBuffs.length" size="small">{{ limitedBuffs.length }} 个限时增益</el-tag>
      <el-button size="small" text @click="load">↻</el-button>
    </div>

    <div v-if="!limitedBuffs.length" class="lib-empty">
      <div v-if="loading">加载中...</div>
      <div v-else>暂无限时增益数据</div>
      <div class="lib-hint">请先在数据管理→增益管理中创建限时增益</div>
    </div>

    <div v-else class="lib-buff-list">
      <div
        v-for="buff in limitedBuffs"
        :key="buff.id"
        class="lib-buff-chip"
        draggable="true"
        @dragstart="onDragStart($event, buff)"
      >
        <span class="lib-buff-icon">益</span>
        <div class="lib-buff-info">
          <span class="lib-buff-name">{{ buff.name }}</span>
          <span class="lib-buff-meta">{{ buffMeta(buff) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GainApi } from '../../api'
import type { TimelineAction } from '../../engine/types/timeline'

const emit = defineEmits<{
  'drop-buff': [buffData: Partial<TimelineAction>, buff: any]
}>()

const loading = ref(false)
const allBuffs = ref<any[]>([])

const limitedBuffs = computed(() =>
  allBuffs.value.filter(b => b.gainType === 'limited')
)

onMounted(() => load())

async function load() {
  loading.value = true
  try {
    allBuffs.value = await GainApi.listAll()
  } catch {
    allBuffs.value = []
  }
  loading.value = false
}

function buffMeta(buff: any): string {
  const parts: string[] = []
  if (buff.effectCategory) parts.push(buff.effectCategory)
  if (buff.effectType) parts.push(buff.effectType)
  if (buff.effectValue != null) {
    parts.push(buff.valueType === 'percentage' ? (buff.effectValue * 100).toFixed(1) + '%' : String(buff.effectValue))
  }
  if (buff.duration) parts.push(buff.duration + 's')
  return parts.join(' | ') || ''
}

function onDragStart(e: DragEvent, buff: any) {
  if (!e.dataTransfer) return
  const actionData: Partial<TimelineAction> = {
    id: 'gain_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type: 'skill',
    name: buff.name,
    librarySource: 'buff',
    element: 'physical',
    icon: '',
    duration: buff.duration ?? 5,
    cooldown: 0,
    damageTicks: [],
    allowedTypes: [],
    physicalAnomaly: [],
  }
  e.dataTransfer.setData('application/json', JSON.stringify({ buffData: actionData, sourceBuff: buff }))
  e.dataTransfer.effectAllowed = 'copy'
}
</script>

<style scoped>
.buff-library { padding: 8px; height: 100%; display: flex; flex-direction: column; }
.lib-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-shrink: 0; }
.lib-title { font-weight: 600; font-size: 13px; color: #303133; }
.lib-empty { padding: 20px 8px; text-align: center; color: #c0c4cc; font-size: 12px; }
.lib-hint { margin-top: 4px; font-size: 11px; color: #e0e0e0; }
.lib-buff-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 3px; }
.lib-buff-chip {
  display: flex; align-items: center; gap: 5px; padding: 4px 6px; border-radius: 4px;
  cursor: grab; transition: background 0.15s; border: 1px solid transparent;
  background-color: #f0f9eb;
}
.lib-buff-chip:active { cursor: grabbing; }
.lib-buff-chip:hover { background: #e1f3d8; border-color: #b7eb8f; }
.lib-buff-icon {
  width: 20px; height: 20px; border-radius: 3px; display: flex; align-items: center;
  justify-content: center; font-size: 9px; color: #fff; font-weight: 600; flex-shrink: 0;
  background: #67c23a;
}
.lib-buff-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.lib-buff-name { font-size: 11px; color: #303133; }
.lib-buff-meta { font-size: 9px; color: #909399; }
</style>
