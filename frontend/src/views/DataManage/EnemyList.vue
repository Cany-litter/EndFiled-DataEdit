<template>
  <div>
    <el-card>
      <div style="margin-bottom:15px;display:flex;align-items:center;gap:12px">
        <el-button type="primary" @click="openCreate">新建敌人</el-button>
        <span style="font-size:13px;color:var(--text-regular)">预览等级</span>
        <el-slider v-model="previewLevel" :min="1" :max="90" :step="1" show-stops style="width:200px" />
        <span style="font-weight:600;color:var(--text-primary);min-width:24px">{{ previewLevel }}</span>
      </div>
      <el-table :data="list" border stripe v-loading="loading" style="width:100%" :max-height="'calc(100vh - 220px)'">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="name" label="名称" min-width="100" />
        <el-table-column prop="tier" label="层级" width="70">
          <template #default="{ row }">
            <el-tag :type="row.tier === 'boss' ? 'danger' : row.tier === 'head' ? 'warning' : row.tier === 'champion' ? 'primary' : row.tier === 'elite' ? 'success' : 'info'" size="small">{{ { normal: '普通', elite: '进阶', champion: '精英', head: '头目', boss: '首领' }[row.tier] || row.tier || '--' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="55">
          <template #default="{ row }">{{ previewLevel }}</template>
        </el-table-column>
        <el-table-column label="生命" width="70">
          <template #default="{ row }">{{ statAtLevel(row.id)?.hp ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="攻击" width="70">
          <template #default="{ row }">{{ statAtLevel(row.id)?.atk ?? '-' }}</template>
        </el-table-column>
        <el-table-column prop="attackRange" label="攻击距离" width="90" />
        <el-table-column prop="weight" label="重量" width="55" />
        <el-table-column prop="category" label="类型" width="90" />
        <el-table-column prop="maxStagger" label="失衡上限" width="90" />
        <el-table-column prop="staggerNodeCount" label="失衡节点" width="90" />
        <el-table-column prop="staggerNodeDuration" label="节点时长" width="90">
          <template #default="{ row }">{{ row.staggerNodeDuration ?? '-' }}s</template>
        </el-table-column>
        <el-table-column prop="staggerBreakDuration" label="击破时长" width="90">
          <template #default="{ row }">{{ row.staggerBreakDuration ?? '-' }}s</template>
        </el-table-column>
        <el-table-column prop="executionRecovery" label="处决回复" width="90">
          <template #default="{ row }">{{ row.executionRecovery ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="防御" width="70">
          <template #default="{ row }">{{ row.def ?? statAtLevel(row.id)?.def ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="物理抗性" width="60">
          <template #default="{ row }">{{ row.physicalResist ?? 0 }}%</template>
        </el-table-column>
        <el-table-column label="灼热抗性" width="60">
          <template #default="{ row }">{{ row.burnResist ?? 0 }}%</template>
        </el-table-column>
        <el-table-column label="电磁抗性" width="60">
          <template #default="{ row }">{{ row.electroResist ?? 0 }}%</template>
        </el-table-column>
        <el-table-column label="寒冷抗性" width="60">
          <template #default="{ row }">{{ row.coldResist ?? 0 }}%</template>
        </el-table-column>
        <el-table-column label="自然抗性" width="60">
          <template #default="{ row }">{{ row.natureResist ?? 0 }}%</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="edit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑敌人' : '新建敌人'" width="980px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="form" label-width="110px">
            <el-form-item label="ID"><el-input v-model="form.id" :disabled="!!editing" /></el-form-item>
            <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <el-form-item label="层级">
                <el-select v-model="form.tier" style="width:100%">
                  <el-option label="普通" value="normal" />
                  <el-option label="进阶" value="elite" />
                  <el-option label="精英" value="champion" />
                  <el-option label="头目" value="head" />
                  <el-option label="首领" value="boss" />
                </el-select>
              </el-form-item>
              <el-form-item label="类型"><el-input v-model="form.category" /></el-form-item>
              <el-form-item label="失衡上限"><el-input-number v-model="form.maxStagger" :min="10" :step="10" style="width:100%" /></el-form-item>
              <el-form-item label="失衡节点"><el-input-number v-model="form.staggerNodeCount" :min="0" :max="10" style="width:100%" /></el-form-item>
              <el-form-item label="节点时长(秒)"><el-input-number v-model="form.staggerNodeDuration" :min="0" :step="0.5" style="width:100%" /></el-form-item>
              <el-form-item label="击破时长(秒)"><el-input-number v-model="form.staggerBreakDuration" :min="0" :step="0.5" style="width:100%" /></el-form-item>
              <el-form-item label="处决回复"><el-input-number v-model="form.executionRecovery" :min="0" style="width:100%" /></el-form-item>
              <el-form-item label="攻击距离"><el-input-number v-model="form.attackRange" :min="0" :step="0.5" style="width:100%" /></el-form-item>
              <el-form-item label="重量"><el-input-number v-model="form.weight" :min="0" :max="100" style="width:100%" /></el-form-item>
            </div>
            <el-divider content-position="left">防御</el-divider>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <el-form-item label="防御力"><el-input-number v-model="form.def" :min="0" :max="10000" style="width:100%" @change="onDefChange" /></el-form-item>
              <el-form-item label="减伤率">
                <el-input :model-value="calcDamageReduction(form.def)" disabled style="width:100%" />
              </el-form-item>
            </div>
            <el-divider content-position="left">抗性 <span style="font-size:12px;color:var(--text-secondary)">0=受100%伤害, 20=受80%伤害, 100=免疫, -100=受200%伤害</span></el-divider>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
              <el-form-item label="物理抗性"><el-input-number v-model="form.physicalResist" :min="-100" :max="100" style="width:100%" /></el-form-item>
              <el-form-item label="灼热抗性"><el-input-number v-model="form.burnResist" :min="-100" :max="100" style="width:100%" /></el-form-item>
              <el-form-item label="电磁抗性"><el-input-number v-model="form.electroResist" :min="-100" :max="100" style="width:100%" /></el-form-item>
              <el-form-item label="寒冷抗性"><el-input-number v-model="form.coldResist" :min="-100" :max="100" style="width:100%" /></el-form-item>
              <el-form-item label="自然抗性"><el-input-number v-model="form.natureResist" :min="-100" :max="100" style="width:100%" /></el-form-item>
            </div>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="等级属性" name="stats">
          <div style="margin-bottom:12px">
            <div style="font-weight:600;font-size:13px;color:var(--text-primary);margin-bottom:6px">简略</div>
            <el-table :data="briefRows" border stripe size="small" style="width:100%">
              <el-table-column label="等级" width="80">
                <template #default="{ row }">{{ row.level }}</template>
              </el-table-column>
              <el-table-column label="生命值" min-width="120">
                <template #default="{ row }">
                  <el-input-number v-model="row.hp" :min="0" size="small" style="width:100%" controls-position="right" />
                </template>
              </el-table-column>
              <el-table-column label="攻击力" min-width="120">
                <template #default="{ row }">
                  <el-input-number v-model="row.atk" :min="0" size="small" style="width:100%" controls-position="right" />
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div>
            <div style="font-weight:600;font-size:13px;color:var(--text-primary);margin-bottom:6px">详细</div>
            <el-table :data="detailRows" border stripe size="small" style="width:100%" max-height="360px">
              <el-table-column label="等级" width="60">
                <template #default="{ row }">{{ row.level }}</template>
              </el-table-column>
              <el-table-column label="生命值" min-width="140">
                <template #default="{ row }">
                  <el-input-number v-model="row.hp" :min="0" size="small" style="width:100%" controls-position="right" />
                </template>
              </el-table-column>
              <el-table-column label="攻击力" min-width="140">
                <template #default="{ row }">
                  <el-input-number v-model="row.atk" :min="0" size="small" style="width:100%" controls-position="right" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { EnemyApi, EnemyStatApi } from '../../api'
import type { EnemyStat } from '../../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editing = ref<any>(null)
const activeTab = ref('basic')
const previewLevel = ref(90)

const form = ref<any>({ maxStagger: 100, staggerNodeCount: 1 })

// enemyStatMap[enemyId][level] → {hp, atk, def}
// allStats[enemyId][level] → {hp, atk} (all levels loaded for editing)
const enemyStatMap = ref<Record<string, Record<number, { hp: number; atk: number; def: number }>>>({})
const editingStats = ref<Record<number, { hp: number; atk: number }>>({})

function statAtLevel(id: string) {
  return enemyStatMap.value[id]?.[previewLevel.value]
}

const BRIEF_LEVELS = [1, 20, 40, 60, 80, 90]
const briefRows = computed(() => BRIEF_LEVELS.map(lv => ({
  level: lv,
  hp: editingStats.value[lv]?.hp ?? 0,
  atk: editingStats.value[lv]?.atk ?? 0,
})))

const detailRows = computed(() => {
  const rows: { level: number; hp: number; atk: number }[] = []
  for (let lv = 1; lv <= 100; lv++) {
    const st = editingStats.value[lv]
    rows.push({ level: lv, hp: st?.hp ?? 0, atk: st?.atk ?? 0 })
  }
  return rows
})

function calcDamageReduction(def: number): string {
  if (!def || def <= 0) return '0%'
  return (100 / (def + 100) * 100).toFixed(1) + '%'
}
function onDefChange() {}

async function load() {
  loading.value = true
  list.value = await EnemyApi.listAll()
  const stats = await EnemyStatApi.listAll()
  const statMap: Record<string, Record<number, { hp: number; atk: number; def: number }>> = {}
  for (const s of stats) {
    if (!statMap[s.enemyId]) statMap[s.enemyId] = {}
    statMap[s.enemyId][s.level] = { hp: s.hp, atk: s.atk, def: s.def }
  }
  enemyStatMap.value = statMap
  loading.value = false
}

function openCreate() {
  editing.value = null
  activeTab.value = 'basic'
  form.value = { maxStagger: 100, staggerNodeCount: 1, physicalResist: 0, burnResist: 0, electroResist: 0, coldResist: 0, natureResist: 0, def: 0 }
  editingStats.value = {}
  dialogVisible.value = true
}

function edit(row: any) {
  editing.value = row
  activeTab.value = 'basic'
  form.value = { ...row }
  // Load all stat levels for this enemy
  const allStats: Record<number, { hp: number; atk: number }> = {}
  const es = enemyStatMap.value[row.id]
  if (es) {
    for (const [lv, st] of Object.entries(es)) {
      allStats[Number(lv)] = { hp: st.hp, atk: st.atk }
    }
  }
  editingStats.value = allStats
  dialogVisible.value = true
}

async function del(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除敌人「${row.name}」？`, '删除确认')
    await EnemyApi.delete(row.id); ElMessage.success('已删除'); load()
  } catch { /* cancelled */ }
}

async function save() {
  // Save Enemy basic info
  if (editing.value) await EnemyApi.save(form.value)
  else await EnemyApi.save(form.value)
  // Save all EnemyStat rows (hp/atk for each edited level)
  for (const [lv, st] of Object.entries(editingStats.value)) {
    await EnemyStatApi.save({ enemyId: form.value.id, level: Number(lv), hp: st.hp || 0, atk: st.atk || 0, def: 0 })
  }
  dialogVisible.value = false; editing.value = null; load()
}

onMounted(load)
</script>
