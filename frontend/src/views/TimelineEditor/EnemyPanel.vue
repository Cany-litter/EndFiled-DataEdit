<template>
  <div>
    <el-form label-position="top" size="small">
      <el-form-item label="从数据库选择敌人">
        <div style="display:flex;gap:6px;width:100%">
          <el-select v-model="selectedEnemyId" filterable clearable placeholder="搜索敌人..." style="flex:1" @change="onEnemySelect">
            <el-option v-for="e in enemyList" :key="e.id" :label="`${e.name} (${e.tier || '--'})`" :value="e.id" />
          </el-select>
          <el-button size="small" @click="loadEnemyList">↻</el-button>
        </div>
      </el-form-item>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        <el-form-item label="失衡上限">
          <el-input-number v-model="local.maxStagger" :min="10" :max="5000" :step="10" style="width:100%" />
        </el-form-item>
        <el-form-item label="失衡节点数">
          <el-input-number v-model="local.staggerNodeCount" :min="0" :max="20" style="width:100%" />
        </el-form-item>
        <el-form-item label="节点持续时间">
          <el-input-number v-model="local.staggerNodeDuration" :min="0" :step="0.5" style="width:100%" />
        </el-form-item>
        <el-form-item label="击破持续时间">
          <el-input-number v-model="local.staggerBreakDuration" :min="0" :step="0.5" style="width:100%" />
        </el-form-item>
        <el-form-item label="防御">
          <el-input-number v-model="local.def" :min="0" :max="500" style="width:100%" />
        </el-form-item>
        <el-form-item label="抗性%">
          <el-input-number v-model="local.resistance" :min="0" :max="100" style="width:100%" />
        </el-form-item>
      </div>
    </el-form>

    <el-divider style="margin:6px 0" />

    <el-form label-position="top" size="small">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        <el-form-item label="初始SP">
          <el-input-number v-model="local.initialSp" :min="0" :max="500" style="width:100%" />
        </el-form-item>
        <el-form-item label="SP回复率">
          <el-input-number v-model="local.spRegenRate" :min="0" :step="0.1" style="width:100%" />
        </el-form-item>
      </div>
    </el-form>

    <div style="display:flex;gap:6px;margin-top:4px">
      <el-button size="small" type="primary" style="flex:1" @click="applyConfig">应用</el-button>
      <el-button size="small" @click="resetToDefaults">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue'
import { EnemyApi } from '../../api'
import type { Enemy } from '../../api'

const props = withDefaults(defineProps<{ config?: EnemyLocalConfig }>(), {
  config: () => ({
    maxStagger: 100, staggerNodeCount: 1, staggerNodeDuration: 2,
    staggerBreakDuration: 11, def: 50, resistance: 20,
    initialSp: 100, spRegenRate: 5,
  }),
})

const emit = defineEmits<{ update: [config: EnemyLocalConfig] }>()

export interface EnemyLocalConfig {
  maxStagger: number
  staggerNodeCount: number
  staggerNodeDuration?: number
  staggerBreakDuration?: number
  def: number
  resistance: number
  initialSp?: number
  spRegenRate?: number
}

const enemyList = ref<Enemy[]>([])
const selectedEnemyId = ref('')

const local = reactive<EnemyLocalConfig>({ ...props.config })

watch(() => props.config, (c) => {
  if (c) Object.assign(local, c)
}, { deep: true })

async function loadEnemyList() {
  try { enemyList.value = await EnemyApi.listAll() } catch { /* ignored */ }
}

function onEnemySelect(id: string) {
  const e = enemyList.value.find(x => x.id === id)
  if (!e) return
  local.maxStagger = e.maxStagger ?? 100
  local.staggerNodeCount = e.staggerNodeCount ?? 1
  local.staggerNodeDuration = e.staggerNodeDuration ?? 2
  local.staggerBreakDuration = e.staggerBreakDuration ?? 11
}

function applyConfig() {
  emit('update', { ...local })
}

function resetToDefaults() {
  Object.assign(local, {
    maxStagger: 100, staggerNodeCount: 1, staggerNodeDuration: 2,
    staggerBreakDuration: 11, def: 50, resistance: 20,
    initialSp: 100, spRegenRate: 5,
  })
  selectedEnemyId.value = ''
}

onMounted(loadEnemyList)
</script>
