<template>
  <div class="enemy-bar">
    <div class="enemy-bar-toolbar">
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:12px;font-weight:600;color:#303133">敌人配置</span>
        <el-button size="small" @click="addCustomEnemy" style="margin-left:4px">+ 自定义</el-button>
        <el-button size="small" text @click="loadDbEnemies">↻</el-button>
      </div>
      <div style="margin-top:6px">
        <el-select v-model="selectedDbEnemy" filterable clearable placeholder="从数据库添加..." style="width:100%" @change="onDbEnemySelect">
          <el-option v-for="e in dbEnemyList" :key="e.id" :label="`${e.name} (${e.tier || '--'})`" :value="e.id" />
        </el-select>
      </div>
    </div>
    <div class="enemy-tags">
      <div v-for="(enemy, ei) in enemies" :key="enemy.id" class="enemy-tag" :style="{ borderLeftColor: colors[ei % colors.length] }">
        <div class="enemy-tag-header">
          <span class="enemy-tag-name">{{ enemy.name }}</span>
          <el-button size="small" text type="danger" @click="removeEnemy(ei)">✕</el-button>
        </div>
        <div class="enemy-tag-params">
          <div class="param-item">
            <span class="param-label">失衡上限</span>
            <el-input type="number" v-model="enemy.maxStagger" :min="10" :step="10" size="small" style="width:60px" @change="emitUpdate" />
          </div>
          <div class="param-item">
            <span class="param-label">失衡节点</span>
            <el-input type="number" v-model="enemy.staggerNodeCount" :min="0" :max="20" size="small" style="width:60px" @change="emitUpdate" />
          </div>
          <div class="param-item">
            <span class="param-label">节点时长</span>
            <el-input type="number" v-model="enemy.staggerNodeDuration" :min="0" :step="0.5" size="small" style="width:60px" @change="emitUpdate" />
          </div>
          <div class="param-item">
            <span class="param-label">失衡时长</span>
            <el-input type="number" v-model="enemy.staggerBreakDuration" :min="0" :step="0.5" size="small" style="width:60px" @change="emitUpdate" />
          </div>
          <div class="param-item">
            <span class="param-label">处决恢复</span>
            <el-input type="number" v-model="enemy.executionRecovery" :min="0" :step="5" size="small" style="width:60px" @change="emitUpdate" />
          </div>
        </div>
      </div>
      <div v-if="!enemies.length" class="enemy-empty">请从数据库添加敌人或创建自定义敌人</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { EnemyApi } from '../../api'
import type { Enemy, TimelineEnemy } from '../../api'

const props = defineProps<{ enemies: TimelineEnemy[] }>()
const emit = defineEmits<{ update: [enemies: TimelineEnemy[]] }>()

const colors = ['#ff7875', '#67c23a', '#409eff', '#e6a23c', '#9b59b6', '#1abc9c', '#e74c3c', '#2ecc71']
const dbEnemyList = ref<Enemy[]>([])
const selectedDbEnemy = ref('')

function uid() { return 'enemy_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }
function emitUpdate() { emit('update', [...props.enemies]) }

async function loadDbEnemies() {
  try { dbEnemyList.value = await EnemyApi.listAll() } catch { /* ignore */ }
}

function onDbEnemySelect(id: string) {
  if (!id) return
  const db = dbEnemyList.value.find(e => e.id === id)
  if (!db) return
  const sameCount = props.enemies.filter(e => e.enemyId === id).length
  const suffix = sameCount > 0 ? String(sameCount + 1) : ''
  const ne: TimelineEnemy = {
    id: uid(), name: db.name + suffix, enemyId: db.id,
    maxStagger: db.maxStagger ?? 100,
    staggerNodeCount: db.staggerNodeCount ?? 1,
    staggerNodeDuration: db.staggerNodeDuration ?? 2,
    staggerBreakDuration: db.staggerBreakDuration ?? 11,
    executionRecovery: db.executionRecovery ?? 100,
  }
  emit('update', [...props.enemies, ne])
  selectedDbEnemy.value = ''
}

function addCustomEnemy() {
  const i = props.enemies.length + 1
  emit('update', [...props.enemies, {
    id: uid(), name: '敌人' + i, enemyId: 'custom',
    maxStagger: 100, staggerNodeCount: 1, staggerNodeDuration: 2,
    staggerBreakDuration: 11, executionRecovery: 100,
  }])
}

function removeEnemy(index: number) {
  const list = [...props.enemies]; list.splice(index, 1); emit('update', list)
}

onMounted(loadDbEnemies)
</script>

<style scoped>
.enemy-bar { background: #fafafa; }
.enemy-bar-toolbar { padding: 4px 8px; border-bottom: 1px solid #e4e7ed; user-select: none; }

.enemy-tags { display: flex; gap: 4px; padding: 4px 8px; overflow-x: auto; flex-wrap: wrap; }
.enemy-tag { border: 1px solid #e4e7ed; border-left: 3px solid; border-radius: 4px; padding: 4px 6px; background: #fff; min-width: 200px; }
.enemy-tag-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.enemy-tag-name { font-size: 11px; font-weight: 600; color: #303133; }
.enemy-tag-params { display: flex; gap: 6px; flex-wrap: wrap; }
.param-item { display: flex; align-items: center; gap: 3px; }
.param-label { font-size: 10px; color: #909399; white-space: nowrap; }
.enemy-empty { padding: 8px; color: #c0c4cc; font-size: 12px; }
</style>
