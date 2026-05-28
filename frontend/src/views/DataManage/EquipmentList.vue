<template>
  <div>
    <el-card>
      <div style="margin-bottom: 15px">
        <el-button type="primary" @click="openCreate">新建装备</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading" style="width:100%" :max-height="'calc(100vh - 220px)'">
        <el-table-column type="index" label="#" width="50" fixed="left" />
        <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip fixed="left" />
        <el-table-column label="部位" width="70">
          <template #default="{ row }">{{ mapSlot(row.slot) }}</template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="60" />
        <el-table-column prop="baseDef" label="基础防御" width="80" />
        <el-table-column prop="setName" label="套装" min-width="100" show-overflow-tooltip />
        <el-table-column label="属性1" min-width="220">
          <template #default="{ row }">
            <span v-if="attrTypeLabel(row,'attr1')" class="attr-label">{{ attrTypeLabel(row,'attr1') }}</span>
            <span v-if="row.attr1Value != null" class="refine-chip r0">{{ formatPct(row.attr1Value) }}</span>
            <span v-if="row.attr1V1 != null" class="refine-chip r1">{{ formatPct(row.attr1V1) }}</span>
            <span v-if="row.attr1V2 != null" class="refine-chip r2">{{ formatPct(row.attr1V2) }}</span>
            <span v-if="row.attr1V3 != null" class="refine-chip r3">{{ formatPct(row.attr1V3) }}</span>
            <span v-if="!row.attr1Type">-</span>
          </template>
        </el-table-column>
        <el-table-column label="属性2" min-width="220">
          <template #default="{ row }">
            <span v-if="attrTypeLabel(row,'attr2')" class="attr-label">{{ attrTypeLabel(row,'attr2') }}</span>
            <span v-if="row.attr2Value != null" class="refine-chip r0">{{ formatPct(row.attr2Value) }}</span>
            <span v-if="row.attr2V1 != null" class="refine-chip r1">{{ formatPct(row.attr2V1) }}</span>
            <span v-if="row.attr2V2 != null" class="refine-chip r2">{{ formatPct(row.attr2V2) }}</span>
            <span v-if="row.attr2V3 != null" class="refine-chip r3">{{ formatPct(row.attr2V3) }}</span>
            <span v-if="!row.attr2Type">-</span>
          </template>
        </el-table-column>
        <el-table-column label="属性3" min-width="220">
          <template #default="{ row }">
            <span v-if="attrTypeLabel(row,'attr3')" class="attr-label">{{ attrTypeLabel(row,'attr3') }}</span>
            <span v-if="row.attr3Value != null" class="refine-chip r0">{{ formatPct(row.attr3Value) }}</span>
            <span v-if="row.attr3V1 != null" class="refine-chip r1">{{ formatPct(row.attr3V1) }}</span>
            <span v-if="row.attr3V2 != null" class="refine-chip r2">{{ formatPct(row.attr3V2) }}</span>
            <span v-if="row.attr3V3 != null" class="refine-chip r3">{{ formatPct(row.attr3V3) }}</span>
            <span v-if="!row.attr3Type">-</span>
          </template>
        </el-table-column>
        <el-table-column label="套装效果" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.setEffect1Name" style="font-weight:500">{{ row.setEffect1Name }}</span>
            <span v-if="row.setEffect1Desc" style="display:block;color:#909399;font-size:12px;margin-top:2px">{{ cleanSkillDesc(row.setEffect1Desc) }}</span>
            <span v-if="!row.setEffect1Name">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right" class-name="col-ops">
          <template #default="{ row }">
            <el-button size="small" type="info" @click="edit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑装备' : '新建装备'" width="700px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础信息" name="basic">
          <el-form :model="form" label-width="110px">
            <el-form-item label="ID"><el-input v-model="form.id" :disabled="!!editing" /></el-form-item>
            <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <el-form-item label="部位">
                <el-select v-model="form.slot" style="width:100%">
                  <el-option v-for="[v,l] in slotOpts" :key="v" :label="l" :value="v" />
                </el-select>
              </el-form-item>
              <el-form-item label="等级">
                <el-select v-model="form.level" style="width:100%">
                  <el-option v-for="lv in [10,20,28,36,50,70]" :key="lv" :label="'Lv.'+lv" :value="lv" />
                </el-select>
              </el-form-item>
              <el-form-item label="基础防御力"><el-input-number v-model="form.baseDef" :min="0" style="width:100%" /></el-form-item>
              <el-form-item label="套装名称"><el-input v-model="form.setName" style="width:100%" /></el-form-item>
            </div>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="属性词条" name="attrs">
          <el-collapse v-model="activeAttrPanel" @change="(p) => activeAttrPanel = p as string[]">
            <el-collapse-item title="属性一（能力值）" name="attr1">
              <el-form :model="form" label-width="110px">
                <el-form-item label="类型">
                  <el-select v-model="form.attr1Type" style="width:100%">
                    <el-option v-for="[v,l] in attrTypeOpts" :key="v" :label="l" :value="v" />
                  </el-select>
                </el-form-item>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                  <el-form-item label="精锻0"><el-input-number v-model="form.attr1Value" :step="0.01" style="width:100%" /></el-form-item>
                  <el-form-item label="精锻1"><el-input-number v-model="form.attr1V1" :step="0.01" style="width:100%" /></el-form-item>
                  <el-form-item label="精锻2"><el-input-number v-model="form.attr1V2" :step="0.01" style="width:100%" /></el-form-item>
                  <el-form-item label="精锻3"><el-input-number v-model="form.attr1V3" :step="0.01" style="width:100%" /></el-form-item>
                </div>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="属性二（能力值）" name="attr2">
              <el-form :model="form" label-width="110px">
                <el-form-item label="类型">
                  <el-select v-model="form.attr2Type" style="width:100%">
                    <el-option v-for="[v,l] in attrTypeOpts" :key="v" :label="l" :value="v" />
                  </el-select>
                </el-form-item>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                  <el-form-item label="精锻0"><el-input-number v-model="form.attr2Value" :step="0.01" style="width:100%" /></el-form-item>
                  <el-form-item label="精锻1"><el-input-number v-model="form.attr2V1" :step="0.01" style="width:100%" /></el-form-item>
                  <el-form-item label="精锻2"><el-input-number v-model="form.attr2V2" :step="0.01" style="width:100%" /></el-form-item>
                  <el-form-item label="精锻3"><el-input-number v-model="form.attr2V3" :step="0.01" style="width:100%" /></el-form-item>
                </div>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="属性三（百分比/特殊）" name="attr3">
              <el-form :model="form" label-width="110px">
                <el-form-item label="类型">
                  <el-select v-model="form.attr3Type" style="width:100%">
                    <el-option v-for="[v,l] in attrTypeOpts" :key="v" :label="l" :value="v" />
                  </el-select>
                </el-form-item>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                  <el-form-item label="精锻0"><el-input-number v-model="form.attr3Value" :step="0.0001" style="width:100%" /></el-form-item>
                  <el-form-item label="精锻1"><el-input-number v-model="form.attr3V1" :step="0.0001" style="width:100%" /></el-form-item>
                  <el-form-item label="精锻2"><el-input-number v-model="form.attr3V2" :step="0.0001" style="width:100%" /></el-form-item>
                  <el-form-item label="精锻3"><el-input-number v-model="form.attr3V3" :step="0.0001" style="width:100%" /></el-form-item>
                </div>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>

        <el-tab-pane label="套装效果" name="effects">
          <el-collapse v-model="activeEffectPanel" @change="(p) => activeEffectPanel = p as string[]">
            <el-collapse-item title="套装效果一（常驻）" name="effect1">
              <el-form :model="form" label-width="120px">
                <el-form-item label="名称"><el-input v-model="form.setEffect1Name" /></el-form-item>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                  <el-form-item label="类型">
                    <el-select v-model="form.setEffect1Type" style="width:100%">
                      <el-option label="常驻" value="permanent" />
                      <el-option label="限定" value="limited" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="效果类型"><el-input v-model="form.setEffect1Etype" style="width:100%" /></el-form-item>
                  <el-form-item label="数值"><el-input-number v-model="form.setEffect1Value" :step="0.0001" style="width:100%" /></el-form-item>
                </div>
                <el-form-item label="描述"><el-input v-model="form.setEffect1Desc" type="textarea" :rows="2" /></el-form-item>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="套装效果二（限定）" name="effect2">
              <el-form :model="form" label-width="120px">
                <el-form-item label="名称"><el-input v-model="form.setEffect2Name" /></el-form-item>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                  <el-form-item label="类型">
                    <el-select v-model="form.setEffect2Type" style="width:100%">
                      <el-option label="常驻" value="permanent" />
                      <el-option label="限定" value="limited" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="效果类型"><el-input v-model="form.setEffect2Etype" style="width:100%" /></el-form-item>
                  <el-form-item label="数值"><el-input-number v-model="form.setEffect2Value" :step="0.0001" style="width:100%" /></el-form-item>
                  <el-form-item label="触发条件"><el-input v-model="form.setEffect2Condition" style="width:100%" /></el-form-item>
                  <el-form-item label="持续时间(秒)"><el-input-number v-model="form.setEffect2Duration" :min="0" :step="0.01" style="width:100%" /></el-form-item>
                </div>
                <el-form-item label="描述"><el-input v-model="form.setEffect2Desc" type="textarea" :rows="2" /></el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
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
import { ref, onMounted } from 'vue'
import api, { EquipmentApi } from '../../api'
import { mapSlot, mapAttrType, slotOpts, attrTypeOpts, formatPct, cleanSkillDesc } from '../../utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editing = ref<any>(null)
const activeTab = ref('basic')
const activeAttrPanel = ref(['attr1'])
const activeEffectPanel = ref(['effect1'])
const form = ref<any>({ level: 70, baseDef: 0 })

function attrTypeLabel(row: any, prefix: string) {
  const type = row[prefix + 'Type']
  if (!type) return ''
  return (['attr1', 'attr2'].includes(prefix) ? (mapAttrType(type) || type) : type)
}

async function load() { loading.value = true; list.value = await EquipmentApi.listAll(); loading.value = false }

function calcRefine(row: any, prefix: string) {
  if (row[prefix + 'V3'] != null) return 3
  if (row[prefix + 'V2'] != null) return 2
  if (row[prefix + 'V1'] != null) return 1
  return 0
}

function openCreate() {
  editing.value = null
  form.value = { level: 70, baseDef: 0 }
  activeTab.value = 'basic'; activeAttrPanel.value = ['attr1']; activeEffectPanel.value = ['effect1']
  dialogVisible.value = true
}

function edit(row: any) {
  editing.value = row
  form.value = { ...row }
  activeTab.value = 'basic'; activeAttrPanel.value = ['attr1']; activeEffectPanel.value = ['effect1']
  dialogVisible.value = true
}

async function del(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除装备「${row.name}」？`, '删除确认', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    await api.delete(`/equipment/${row.id}`)
    ElMessage.success('已删除'); load()
  } catch { /* cancelled or failed */ }
}

async function save() {
  const data = { ...form.value }
  data.attr1Refine = calcRefine(data, 'attr1')
  data.attr2Refine = calcRefine(data, 'attr2')
  data.attr3Refine = calcRefine(data, 'attr3')
  if (editing.value) await api.put(`/equipment/${data.id}`, data)
  else await api.post('/equipment', data)
  dialogVisible.value = false; editing.value = null; form.value = { level: 70, baseDef: 0 }; load()
}

onMounted(load)
</script>

<style>
.col-ops .el-button { white-space: nowrap; }
.col-ops { text-align: right; }
.refine-chip { display:inline-block; padding:1px 6px; margin:0 2px 2px 0; border-radius:3px; font-size:12px; white-space:nowrap; }
.attr-label { font-weight:500; margin-right:4px; }
.r0 { background:#f0f0f0; color:#666; }
.r1 { background:#e8f5e9; color:#2e7d32; }
.r2 { background:#fff8e1; color:#f57f17; }
.r3 { background:#ffebee; color:#c62828; }
</style>
