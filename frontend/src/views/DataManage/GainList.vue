<template>
  <div>
    <el-card>
      <div style="margin-bottom: 15px">
        <el-button type="primary" @click="openCreate">新建增益</el-button>
        <el-button :disabled="selectedRows.length !== 1" @click="batchCopy">批量复制</el-button>
      </div>
      <el-table ref="tableRef" :data="list" border stripe v-loading="loading" style="width:100%" :max-height="'calc(100vh - 220px)'" @selection-change="selectedRows = $event">
        <el-table-column type="selection" width="40" fixed="left" />
        <el-table-column type="index" label="#" width="50" fixed="left" />
        <el-table-column prop="name" label="增益名称" min-width="120" show-overflow-tooltip fixed="left" />
        <el-table-column label="来源类型" width="80">
          <template #default="{ row }">{{ mapSourceType(row.sourceType) }}</template>
        </el-table-column>
        <el-table-column prop="source" label="增益来源" min-width="120" show-overflow-tooltip />
        <el-table-column prop="effectCategory" label="增益大类" min-width="100" show-overflow-tooltip />
        <el-table-column prop="effectType" label="具体增益类型" min-width="130" show-overflow-tooltip />
        <el-table-column label="增益数值" width="100">
          <template #default="{ row }">{{ row.valueType === 'percentage' ? formatPct(row.effectValue) + '%' : row.effectValue }}</template>
        </el-table-column>
        <el-table-column label="数值类型" width="80">
          <template #default="{ row }">{{ row.valueType === 'percentage' ? '百分比' : '固定值' }}</template>
        </el-table-column>
        <el-table-column label="触发条件" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">{{ row.triggerCondition || '常驻' }}</template>
        </el-table-column>
        <el-table-column label="最大层数" width="80">
          <template #default="{ row }">{{ row.maxStacks ?? 1 }}</template>
        </el-table-column>
        <el-table-column label="持续时间" width="80">
          <template #default="{ row }">{{ row.gainType === 'limited' ? row.duration + 's' : '常驻' }}</template>
        </el-table-column>
        <el-table-column label="叠加规则" width="100">
          <template #default="{ row }">{{ mapStackRule(row.stackRule) }}</template>
        </el-table-column>
        <el-table-column label="目标范围" width="80">
          <template #default="{ row }">{{ mapTargetScope(row.targetScope) }}</template>
        </el-table-column>
        <el-table-column label="目标角色" width="100" show-overflow-tooltip>
          <template #default="{ row }">{{ row.targetScope === 'character' ? row.targetCharId : '—' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="190" fixed="right" class-name="col-ops">
          <template #default="{ row }">
            <el-button size="small" type="info" @click="edit(row)">编辑</el-button>
            <el-button size="small" type="primary" @click="copyRow(row)">复制</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑增益' : '新建增益'" width="620px">
      <el-form :model="form" label-width="110px">
        <el-form-item label="增益名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <el-form-item label="来源类型">
            <el-select v-model="form.sourceType" style="width:100%" @change="onSourceTypeChange">
              <el-option v-for="[v,l] in sourceTypeOpts" :key="v" :label="l" :value="v" />
            </el-select>
          </el-form-item>
          <el-form-item label="增益来源">
            <el-select v-model="form.sourceRef" filterable :disabled="!form.sourceType" style="width:100%">
              <el-option v-for="opt in sourceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <el-form-item label="增益大类">
            <el-select v-model="form.effectCategory" style="width:100%" @change="onCategoryChange">
              <el-option v-for="cat in categoryList" :key="cat" :label="cat" :value="cat" />
            </el-select>
          </el-form-item>
          <el-form-item label="具体增益类型">
            <el-select v-if="form.effectCategory !== '其他'" v-model="form.effectType" style="width:100%">
              <el-option v-for="t in currentEffectTypes" :key="t" :label="t" :value="t" />
            </el-select>
            <el-input v-else v-model="form.effectType" />
          </el-form-item>
        </div>
        <div style="display:grid;grid-template-columns:3fr 2fr;gap:12px">
          <el-form-item label="增益数值">
            <el-input-number v-model="form.effectValue" :step="0.0001" :min="-999999" :max="999999" style="width:100%" />
          </el-form-item>
          <el-form-item label="数值类型">
            <el-select v-model="form.valueType" style="width:100%">
              <el-option label="固定值" value="absolute" />
              <el-option label="百分比" value="percentage" />
            </el-select>
          </el-form-item>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <el-form-item label="触发条件">
            <div style="display:flex;gap:8px">
              <el-select v-model="form.triggerType" style="width:110px">
                <el-option label="常驻" value="permanent" />
                <el-option label="条件" value="conditional" />
              </el-select>
              <el-input v-if="form.triggerType === 'conditional'" v-model="form.triggerCondition" placeholder="触发条件待补充" />
              <span v-else style="line-height:32px;color:#909399;font-size:13px">—</span>
            </div>
          </el-form-item>
          <el-form-item label="最大层数">
            <el-input-number v-model="form.maxStacks" :min="1" :max="99" style="width:100%" />
          </el-form-item>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <el-form-item label="叠加规则">
            <el-select v-model="form.stackRule" style="width:100%">
              <el-option v-for="[v,l] in stackRuleOpts" :key="v" :label="l" :value="v" />
            </el-select>
          </el-form-item>
          <el-form-item label="目标范围">
            <el-select v-model="form.targetScope" style="width:100%" @change="onTargetScopeChange">
              <el-option v-for="[v,l] in targetScopeOpts" :key="v" :label="l" :value="v" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item v-if="form.targetScope === 'character'" label="目标角色">
          <el-select v-model="form.targetCharId" filterable style="width:100%">
            <el-option v-for="c in characters" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <el-form-item label="持续时间">
            <el-select v-model="form.gainType" style="width:100%">
              <el-option v-for="[v,l] in durationTypeOpts" :key="v" :label="l" :value="v" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.gainType === 'limited'" label="持续秒数">
            <el-input-number v-model="form.duration" :min="0.1" :step="0.5" style="width:100%" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../../api'
import { CharacterApi, WeaponApi, EquipmentApi, GainApi } from '../../api'
import type { Character, Weapon } from '../../api'
import { mapGainType, formatPct, sourceTypeOpts, gainCategoryEffectTypes, durationTypeOpts, stackRuleOpts, targetScopeOpts, mapStackRule, mapTargetScope } from '../../utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref<any[]>([])
const characters = ref<Character[]>([])
const weapons = ref<Weapon[]>([])
const sets = ref<string[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editing = ref<any>(null)
const tableRef = ref<any>(null)
const selectedRows = ref<any[]>([])

const categoryList = Object.keys(gainCategoryEffectTypes)
const currentEffectTypes = computed(() => gainCategoryEffectTypes[form.value.effectCategory] || [])

const sourceOptions = computed(() => {
  const t = form.value.sourceType
  if (t === 'character') return characters.value.map(c => ({ label: c.name, value: c.id }))
  if (t === 'weapon') return weapons.value.map(w => ({ label: w.name, value: w.id }))
  if (t === 'set') return sets.value.map(s => ({ label: s, value: s }))
  return []
})

const defaultForm = () => ({
  name: '', sourceType: 'character', sourceRef: '',
  effectCategory: '基础属性', effectType: '',
  effectValue: 0, valueType: 'percentage',
  gainType: 'permanent', duration: 10,
  triggerType: 'permanent', triggerCondition: '', maxStacks: 1,
  stackRule: 'add_same', targetScope: 'self', targetCharId: '',
})
const form = ref<any>(defaultForm())

function mapSourceType(v: string | undefined) {
  const m: Record<string, string> = { character: '角色', weapon: '武器', set: '套装', other: '其他' }
  return m[v || ''] || v || ''
}

function onSourceTypeChange() {
  form.value.sourceRef = ''
}

function onCategoryChange() {
  form.value.effectType = ''
}

function onTargetScopeChange() {
  form.value.targetCharId = ''
}

onMounted(() => { load() })

async function load() {
  loading.value = true
  characters.value = await CharacterApi.listAll()
  weapons.value = await WeaponApi.listAll()
  const equipList = await EquipmentApi.listAll()
  sets.value = [...new Set(equipList.map(e => e.setName).filter(Boolean) as string[])].sort()
  list.value = await GainApi.listAll()
  loading.value = false
}

function openCreate() {
  editing.value = null
  form.value = defaultForm()
  dialogVisible.value = true
}

function edit(row: any) {
  editing.value = row
  form.value = {
    name: row.name,
    sourceType: row.sourceType || 'character',
    sourceRef: row.sourceRefId || row.source || '',

    effectCategory: row.effectCategory || '基础属性',
    effectType: row.effectType || '',
    effectValue: row.effectValue ?? 0,
    valueType: row.valueType || 'percentage',
    gainType: row.gainType || 'permanent',
    duration: row.duration ?? 10,
    triggerType: row.triggerCondition ? 'conditional' : 'permanent',
    triggerCondition: row.triggerCondition || '',
    maxStacks: row.maxStacks ?? 1,
    stackRule: row.stackRule || 'add_same',
    targetScope: row.targetScope || 'self',
    targetCharId: row.targetCharId || '',
  }
  dialogVisible.value = true
}

function copyRow(row: any) {
  editing.value = null
  form.value = {
    name: row.name + ' - 副本',
    sourceType: row.sourceType || 'character',
    sourceRef: row.sourceRefId || row.source || '',
    effectCategory: row.effectCategory || '基础属性',
    effectType: row.effectType || '',
    effectValue: row.effectValue ?? 0,
    valueType: row.valueType || 'percentage',
    gainType: row.gainType || 'permanent',
    duration: row.duration ?? 10,
    triggerType: row.triggerCondition ? 'conditional' : 'permanent',
    triggerCondition: row.triggerCondition || '',
    maxStacks: row.maxStacks ?? 1,
    stackRule: row.stackRule || 'add_same',
    targetScope: row.targetScope || 'self',
    targetCharId: row.targetCharId || '',
  }
  dialogVisible.value = true
}

async function batchCopy() {
  if (selectedRows.value.length !== 1) return
  const row = selectedRows.value[0]
  try {
    const { value: count } = await ElMessageBox.prompt('请输入复制份数', '批量复制', {
      inputValue: '2',
      inputValidator: (v: string) => /^\d+$/.test(v) && +v >= 1 ? true : '请输入正整数',
      inputErrorMessage: '请输入正整数',
    })
    const n = +count
    const sourceName = row.sourceType === 'character'
      ? (characters.value.find(c => c.id === row.sourceRefId)?.name || row.source)
      : row.sourceType === 'weapon'
        ? (weapons.value.find(w => w.id === row.sourceRefId)?.name || row.source)
        : row.source
    for (let i = 1; i <= n; i++) {
      await api.post('/gains', {
        name: row.name + `-副本${i}`,
        source: sourceName || row.source,
        gainType: row.gainType,
        effectCategory: row.effectCategory,
        effectType: row.effectType,
        effectValue: row.effectValue,
        valueType: row.valueType || 'percentage',
        duration: row.gainType === 'limited' ? row.duration : null,
        sourceType: row.sourceType,
        sourceRefId: row.sourceRefId,
        triggerCondition: row.triggerCondition || '',
        stackRule: row.stackRule || 'add_same',
        targetScope: row.targetScope || 'self',
        targetCharId: row.targetScope === 'character' ? (row.targetCharId || '') : '',
        maxStacks: row.maxStacks ?? 1,
      })
    }
    selectedRows.value = []
    ElMessage.success(`已复制 ${n} 条`)
    await load()
  } catch { /* cancelled or failed */ }
}

async function del(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除增益「${row.name}」？`, '删除确认', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    await api.delete(`/gains/${row.id}`)
    ElMessage.success('已删除')
    await load()
  } catch { /* cancelled or failed */ }
}

async function save() {
  const f = form.value
  const sourceLabel: Record<string, string> = { character: '角色', weapon: '武器', set: '套装' }
  const sourceName = f.sourceType === 'character'
    ? (characters.value.find(c => c.id === f.sourceRef)?.name || f.sourceRef)
    : f.sourceType === 'weapon'
      ? (weapons.value.find(w => w.id === f.sourceRef)?.name || f.sourceRef)
      : f.sourceRef
  const payload = {
    name: f.name,
    source: sourceName,
    gainType: f.gainType,
    effectCategory: f.effectCategory,
    effectType: f.effectType,
    effectValue: f.effectValue,
    valueType: f.valueType,
    duration: f.gainType === 'limited' ? f.duration : null,
    sourceType: f.sourceType,
    sourceRefId: f.sourceRef,
    stackRule: f.stackRule || 'add_same',
    targetScope: f.targetScope || 'self',
    targetCharId: f.targetScope === 'character' ? (f.targetCharId || '') : '',
    triggerCondition: f.triggerType === 'conditional' ? (f.triggerCondition || '触发条件待补充') : '',
    maxStacks: f.maxStacks ?? 1,
  }
  const isEdit = !!editing.value
  try {
    if (isEdit) await api.put(`/gains/${editing.value.id}`, payload)
    else await api.post('/gains', payload)
    dialogVisible.value = false; editing.value = null
    ElMessage.success(isEdit ? '已更新' : '已保存')
    await load()
  } catch { ElMessage.error('保存失败') }
}
</script>

<style>
.el-table .col-ops .cell { white-space: nowrap; overflow: visible; text-overflow: clip; }
.col-ops { text-align: right; }
</style>
