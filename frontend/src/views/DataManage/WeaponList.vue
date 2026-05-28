<template>
  <div>
    <el-card>
      <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
        <el-button type="primary" @click="openCreate">新建武器</el-button>
        <span style="font-size:13px;color:#909399">等级</span>
        <el-slider v-model="currentLevel" :min="1" :max="90" style="width:160px" @change="updateDisplayStats" />
        <el-tag type="info">Lv.{{ currentLevel }}</el-tag>
        <span style="font-size:13px;color:#909399;margin-left:8px">潜能</span>
        <el-slider v-model="currentPotential" :min="0" :max="8" style="width:140px" @change="updateDisplayStats" />
        <el-tag type="warning">潜能{{ currentPotential }}</el-tag>
      </div>
      <el-table :data="list" border stripe v-loading="loading" style="width:100%" :max-height="'calc(100vh - 220px)'">
        <el-table-column type="index" label="#" width="50" fixed="left" />
        <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip fixed="left" />
        <el-table-column prop="rarity" label="稀有度" width="70" />
        <el-table-column label="类型" min-width="80">
          <template #default="{ row }">{{ mapWeapon(row.type) }}</template>
        </el-table-column>
        <el-table-column label="等级" width="60">
          <template #default>{{ currentLevel }}</template>
        </el-table-column>
        <el-table-column label="潜能" width="60">
          <template #default>{{ currentPotential }}</template>
        </el-table-column>
        <el-table-column label="基础攻击" width="80">
          <template #default="{ row }">{{ weaponAtk(row) }}</template>
        </el-table-column>
        <el-table-column label="词条1" min-width="120">
          <template #default="{ row }">{{ affixDisplay(row, 1) }}</template>
        </el-table-column>
        <el-table-column label="词条2" min-width="120">
          <template #default="{ row }">{{ affixDisplay(row, 2) }}</template>
        </el-table-column>
        <el-table-column label="词条3" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ affixDisplay(row, 3) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right" class-name="col-ops">
          <template #default="{ row }">
            <el-button size="small" type="info" @click="edit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑武器' : '新建武器'" width="640px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础信息" name="basic">
          <el-form :model="form" label-width="110px">
            <el-form-item label="ID"><el-input v-model="form.id" :disabled="!!editing" /></el-form-item>
            <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <el-form-item label="稀有度"><el-input-number v-model="form.rarity" :min="3" :max="6" style="width:100%" /></el-form-item>
              <el-form-item label="类型">
                <el-select v-model="form.type" style="width:100%">
                  <el-option v-for="[v,l] in weaponOpts" :key="v" :label="l" :value="v" />
                </el-select>
              </el-form-item>
              <el-form-item label="等级"><el-input-number v-model="form.level" :min="1" :max="90" style="width:100%" @change="onLevelChange" /></el-form-item>
              <el-form-item label="潜能"><el-input-number v-model="form.potential" :min="0" :max="5" style="width:100%" @change="onPotentialChange" /></el-form-item>
              <el-form-item label="基础攻击力"><el-input-number v-model="form.baseAtk" :min="0" style="width:100%" /></el-form-item>
            </div>
          </el-form>
          <el-alert v-if="levelHint" :title="levelHint" type="info" :closable="false" style="margin-top:8px" />
        </el-tab-pane>
        <el-tab-pane label="词条1" name="affix1">
          <el-form :model="form" label-width="110px">
            <el-form-item label="名称"><el-input v-model="form.affix1Name" /></el-form-item>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <el-form-item label="类型">
                <el-select v-model="form.affix1Type" style="width:100%">
                  <el-option v-for="[v,l] in attrTypeOpts" :key="v" :label="l" :value="v" />
                </el-select>
              </el-form-item>
              <el-form-item label="规格">
                <el-select v-model="form.affix1Size" style="width:100%">
                  <el-option v-for="[v,l] in affixSizeOpts" :key="v" :label="l" :value="v" />
                </el-select>
              </el-form-item>
              <el-form-item label="等级"><el-input-number v-model="form.affix1Level" :min="0" :max="9" style="width:100%" /></el-form-item>
              <el-form-item label="数值"><el-input-number v-model="form.affix1Value" :step="0.01" style="width:100%" /></el-form-item>
            </div>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="词条2" name="affix2">
          <el-form :model="form" label-width="110px">
            <el-form-item label="名称"><el-input v-model="form.affix2Name" /></el-form-item>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <el-form-item label="类型">
                  <el-select v-model="form.affix2Type" style="width:100%">
                    <el-option v-for="[v,l] in attrTypeOpts" :key="v" :label="l" :value="v" />
                  </el-select>
                </el-form-item>
              <el-form-item label="规格">
                <el-select v-model="form.affix2Size" style="width:100%">
                  <el-option v-for="[v,l] in affixSizeOpts" :key="v" :label="l" :value="v" />
                </el-select>
              </el-form-item>
              <el-form-item label="等级"><el-input-number v-model="form.affix2Level" :min="0" :max="9" style="width:100%" /></el-form-item>
              <el-form-item label="数值"><el-input-number v-model="form.affix2Value" :step="0.01" style="width:100%" /></el-form-item>
            </div>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="词条3(特殊效果)" name="affix3">
          <el-form :model="form" label-width="110px">
            <el-form-item label="名称"><el-input v-model="form.affix3Name" /></el-form-item>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <el-form-item label="类型"><el-input v-model="form.affix3Type" style="width:100%" /></el-form-item>
              <el-form-item label="等级">
                <el-input-number v-model="form.affix3Level" :min="0" :max="9" style="width:100%" />
                <div style="font-size:12px;color:#909399">潜能{{ form.potential }} → 等级{{ form.potential + 4 }}</div>
              </el-form-item>
              <el-form-item label="效果1"><el-input v-model="form.affix3Effect1" style="width:100%" /></el-form-item>
              <el-form-item label="效果2"><el-input v-model="form.affix3Effect2" style="width:100%" /></el-form-item>
              <el-form-item label="效果3"><el-input v-model="form.affix3Effect3" style="width:100%" /></el-form-item>
            </div>
            <el-form-item label="描述"><el-input v-model="form.affix3Desc" type="textarea" :rows="2" /></el-form-item>
          </el-form>
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
import api, { WeaponApi, WeaponStatApi, WeaponAffixApi } from '../../api'
import { mapWeapon, weaponOpts, attrTypeOpts, affixSizeOpts, formatPct } from '../../utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editing = ref<any>(null)
const activeTab = ref('basic')
const form = ref<any>({ rarity: 5, level: 90, potential: 0 })
const currentLevel = ref(90)
const currentPotential = ref(0)
const weaponStatMap = ref<Record<string, number>>({})
const weaponAffixMap = ref<Record<string, any>>({})

function weaponAtk(row: any) {
  const v = weaponStatMap.value[row.id + ':' + currentLevel.value]
  return v != null ? v : '-'
}

function affixDisplay(row: any, idx: number) {
  const key = row.id + ':' + idx + ':' + currentPotential.value
  const a = weaponAffixMap.value[key]
  if (!a) return '-'
  const v = a.value != null ? ' +' + formatPct(a.value) : ''
  return (a.name || '') + v
}

const affixLevelLimits: Record<string, [number, number]> = {
  '1-20': [3, 3], '20-40': [5, 4], '40-60': [6, 6], '60-80': [8, 7], '80-90': [9, 9],
}

const levelHint = computed(() => {
  const lv = form.value.level
  if (!lv) return ''
  const range = Object.entries(affixLevelLimits).find(([key]) => {
    const [min, max] = key.split('-').map(Number)
    return lv >= min && lv <= max
  })
  if (range) {
    const [, [a1, a2]] = range
    return `当前等级${lv} → 词条1上限Lv.${a1}, 词条2上限Lv.${a2}`
  }
  return ''
})

function affixSummary(row: any, prefix: string) {
  const name = row[prefix + 'Name']
  const val = row[prefix + 'Value']
  const lv = row[prefix + 'Level']
  if (!name && val == null) return '-'
  const v = val != null ? ' +' + formatPct(val) : ''
  return `${name || ''}${v}${lv ? ' (Lv.' + lv + ')' : ''}`
}

function affix1Summary(row: any) { return affixSummary(row, 'affix1') }
function affix2Summary(row: any) { return affixSummary(row, 'affix2') }

function onLevelChange() {
  if (!editing.value && form.value.affix1Level == null) form.value.affix1Level = 0
  if (!editing.value && form.value.affix2Level == null) form.value.affix2Level = 0
}

function onPotentialChange() {
  form.value.affix3Level = form.value.potential + 4
}

async function load() {
  loading.value = true
  list.value = await WeaponApi.listAll()
  // Load weapon stats
  const wstats: any[] = await WeaponStatApi.listAll()
  const wsMap: Record<string, number> = {}
  for (const s of wstats) wsMap[s.weaponId + ':' + s.level] = s.baseAtk
  weaponStatMap.value = wsMap
  // Load weapon affixes
  const waffixes: any[] = await WeaponAffixApi.listAll()
  const waMap: Record<string, any> = {}
  for (const a of waffixes) waMap[a.weaponId + ':' + a.affixIndex + ':' + a.potential] = a
  weaponAffixMap.value = waMap
  loading.value = false
}

function updateDisplayStats() {}

function openCreate() {
  editing.value = null
  form.value = { rarity: 5, level: 90, potential: 0, affix1Level: 9, affix2Level: 9, affix3Level: 4 }
  activeTab.value = 'basic'
  dialogVisible.value = true
}

function edit(row: any) {
  editing.value = row
  form.value = { ...row }
  activeTab.value = 'basic'
  dialogVisible.value = true
}

async function del(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除武器「${row.name}」？`, '删除确认', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    await api.delete(`/weapons/${row.id}`)
    ElMessage.success('已删除'); load()
  } catch { /* cancelled or failed */ }
}

async function save() {
  if (editing.value) await api.put(`/weapons/${form.value.id}`, form.value)
  else await api.post('/weapons', form.value)
  dialogVisible.value = false; editing.value = null; form.value = { rarity: 5, level: 90, potential: 0, affix1Level: 9, affix2Level: 9, affix3Level: 4 }; load()
}

onMounted(load)
</script>

<style>
.col-ops .el-button { white-space: nowrap; }
.col-ops { text-align: right; }
</style>
