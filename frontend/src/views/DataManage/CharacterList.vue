<template>
  <div>
    <el-card>
      <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 16px;">
        <el-button type="primary" @click="openCreate">新建角色</el-button>
        <span style="font-size:13px;color:#909399">等级</span>
        <el-slider v-model="currentLevel" :min="1" :max="90" style="width:200px" @change="updateDisplayStats" />
        <el-tag type="info">Lv.{{ currentLevel }}</el-tag>
      </div>
      <el-table :data="list" border stripe v-loading="loading" style="width:100%" :max-height="'calc(100vh - 220px)'">
        <el-table-column type="index" label="#" width="50" fixed="left" />
        <el-table-column prop="name" label="名称" min-width="100" show-overflow-tooltip fixed="left" />
        <el-table-column prop="rarity" label="稀有度" width="70" />
        <el-table-column label="职业" width="80">
          <template #default="{ row }">{{ mapProfession(row.profession) }}</template>
        </el-table-column>
        <el-table-column label="属性" width="70">
          <template #default="{ row }">{{ mapElement(row.element) }}</template>
        </el-table-column>
        <el-table-column label="武器类型" min-width="90">
          <template #default="{ row }">{{ mapWeapon(row.weaponType) }}</template>
        </el-table-column>
        <el-table-column label="主能力" width="70">
          <template #default="{ row }">{{ mapAttrType(row.mainAttr) }}</template>
        </el-table-column>
        <el-table-column label="副能力" width="70">
          <template #default="{ row }">{{ mapAttrType(row.subAttr) }}</template>
        </el-table-column>
        <el-table-column label="基础攻击" width="80">
          <template #default="{ row }">{{ statVal(row, 'atk') }}</template>
        </el-table-column>
        <el-table-column label="基础生命" width="80">
          <template #default="{ row }">{{ statVal(row, 'hp') }}</template>
        </el-table-column>
        <el-table-column label="力量" width="70">
          <template #default="{ row }">{{ statVal(row, 'str') }}</template>
        </el-table-column>
        <el-table-column label="敏捷" width="70">
          <template #default="{ row }">{{ statVal(row, 'agi') }}</template>
        </el-table-column>
        <el-table-column label="智识" width="70">
          <template #default="{ row }">{{ statVal(row, 'int') }}</template>
        </el-table-column>
        <el-table-column label="意志" width="70">
          <template #default="{ row }">{{ statVal(row, 'wil') }}</template>
        </el-table-column>
        <el-table-column prop="potential" label="潜能" width="60" />
        <el-table-column label="操作" width="140" fixed="right" class-name="col-ops">
          <template #default="{ row }">
            <el-button size="small" type="info" @click="edit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑角色' : '新建角色'" width="720px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础信息" name="basic">
          <el-form :model="form" label-width="110px">
            <el-form-item label="ID"><el-input v-model="form.id" :disabled="!!editing" /></el-form-item>
            <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <el-form-item label="稀有度"><el-input-number v-model="form.rarity" :min="4" :max="6" style="width:100%" /></el-form-item>
              <el-form-item label="等级"><el-input-number v-model="form.level" :min="1" :max="90" style="width:100%" /></el-form-item>
              <el-form-item label="职业">
                <el-select v-model="form.profession" style="width:100%">
                  <el-option v-for="[v,l] in professionOpts" :key="v" :label="l" :value="v" />
                </el-select>
              </el-form-item>
              <el-form-item label="属性">
                <el-select v-model="form.element" style="width:100%">
                  <el-option v-for="[v,l] in elementOpts" :key="v" :label="l" :value="v" />
                </el-select>
              </el-form-item>
              <el-form-item label="武器类型">
                <el-select v-model="form.weaponType" style="width:100%">
                  <el-option v-for="[v,l] in weaponOpts" :key="v" :label="l" :value="v" />
                </el-select>
              </el-form-item>
              <el-form-item label="潜能">
                <el-input-number v-model="form.potential" :min="0" :max="5" style="width:100%" />
              </el-form-item>
            </div>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="属性" name="attrs">
          <el-form :model="form" label-width="110px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <el-form-item label="基础攻击力"><el-input-number v-model="form.baseAtk" :min="0" style="width:100%" /></el-form-item>
              <el-form-item label="基础生命值"><el-input-number v-model="form.baseHp" :min="0" style="width:100%" /></el-form-item>
              <el-form-item label="力量"><el-input-number v-model="form.baseStr" :min="0" :step="0.01" style="width:100%" /></el-form-item>
              <el-form-item label="敏捷"><el-input-number v-model="form.baseAgi" :min="0" :step="0.01" style="width:100%" /></el-form-item>
              <el-form-item label="智识"><el-input-number v-model="form.baseInt" :min="0" :step="0.01" style="width:100%" /></el-form-item>
              <el-form-item label="意志"><el-input-number v-model="form.baseWil" :min="0" :step="0.01" style="width:100%" /></el-form-item>
              <el-form-item label="主能力">
                <el-select v-model="form.mainAttr" style="width:100%">
                  <el-option v-for="[v,l] in attrTypeOpts" :key="v" :label="l" :value="v" />
                </el-select>
              </el-form-item>
              <el-form-item label="副能力">
                <el-select v-model="form.subAttr" style="width:100%">
                  <el-option v-for="[v,l] in attrTypeOpts" :key="v" :label="l" :value="v" />
                </el-select>
              </el-form-item>
            </div>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="普攻分段" name="segments">
          <div style="margin-bottom:8px;font-size:13px;color:#909399">编辑普攻 5 段动画参数</div>
          <el-collapse v-model="activeSegmentIdx" accordion>
            <el-collapse-item v-for="(seg, si) in formSegments" :key="si" :name="si" :title="`段[${si}]  持续 ${seg.duration.toFixed(3)}s  量表 ${seg.gaugeGain}`">
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
                <el-form-item label="持续(秒)" label-width="65px">
                  <el-input-number v-model="seg.duration" :min="0" :step="0.1" size="small" style="width:110px" controls-position="right" />
                </el-form-item>
                <el-form-item label="量表获取" label-width="65px">
                  <el-input-number v-model="seg.gaugeGain" :min="0" :step="0.5" size="small" style="width:110px" controls-position="right" />
                </el-form-item>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span style="font-weight:600;font-size:12px;color:#606266">伤害帧</span>
                <el-button size="small" type="primary" @click="addSegTick(si)">+ 添加帧</el-button>
              </div>
              <div v-for="(tick, ti) in seg.ticks" :key="ti" style="border:1px solid #e4e7ed;border-radius:4px;padding:4px 6px;margin-bottom:4px">
                <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">
                  <span style="font-weight:600;font-size:12px;color:#409eff">#{{ ti }}</span>
                  <el-input-number v-model="tick.offset" :min="0" :step="0.1" size="small" style="width:90px" controls-position="right" placeholder="偏移" />
                  <el-input-number v-model="tick.stagger" :min="0" :step="5" size="small" style="width:90px" controls-position="right" placeholder="失衡" />
                  <el-input-number v-model="tick.sp" :min="-50" :max="50" size="small" style="width:80px" controls-position="right" placeholder="SP" />
                  <el-button size="small" type="danger" text @click="removeSegTick(si, ti)">✕</el-button>
                </div>
              </div>
              <div v-if="!seg.ticks.length" style="color:#c0c4cc;font-size:12px;padding:8px">暂无伤害帧</div>
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
import api, { CharacterApi, CharacterStatApi, AttackSegmentApi, AttackSegmentTickApi } from '../../api'
import { mapElement, mapWeapon, mapProfession, mapAttrType, elementOpts, weaponOpts, professionOpts, attrTypeOpts } from '../../utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editing = ref<any>(null)
const activeTab = ref('basic')
const form = ref<any>({ rarity: 5, level: 90, potential: 0 })
const currentLevel = ref(90)
const statMap = ref<Record<string, any>>({})
const formSegments = ref<any[]>([])
const activeSegmentIdx = ref(0)

function statVal(row: any, field: string) {
  const key = row.id + ':' + currentLevel.value
  const s = statMap.value[key]
  return s ? s[field] : '-'
}

async function load() {
  loading.value = true
  list.value = await CharacterApi.listAll()
  const stats: any[] = await CharacterStatApi.listAll()
  const map: Record<string, any> = {}
  for (const s of stats) map[s.characterId + ':' + s.level] = s
  statMap.value = map
  loading.value = false
}

function updateDisplayStats() {}

function openCreate() {
  editing.value = null
  form.value = { rarity: 5, level: 90, potential: 0 }
  initEmptySegments()
  activeTab.value = 'basic'
  dialogVisible.value = true
}

function initEmptySegments() {
  formSegments.value = Array.from({ length: 5 }, (_, i) => ({
    duration: 0, gaugeGain: 0, ticks: [] as { offset: number; stagger: number; sp: number }[],
  }))
}

function edit(row: any) {
  editing.value = row
  form.value = { ...row }
  initEmptySegments()
  Promise.all([
    AttackSegmentApi.list(row.id).catch(() => []),
    AttackSegmentTickApi.list(row.id).catch(() => []),
  ]).then(([segs, allTicks]) => {
    const tickMap: Record<number, any[]> = {}
    for (const t of allTicks) {
      if (!tickMap[t.segmentIndex]) tickMap[t.segmentIndex] = []
      tickMap[t.segmentIndex].push(t)
    }
    for (let si = 0; si < 5; si++) {
      const seg = segs.find((s: any) => s.segmentIndex === si)
      if (seg) {
        formSegments.value[si].duration = seg.duration
        formSegments.value[si].gaugeGain = seg.gaugeGain ?? 0
      }
      formSegments.value[si].ticks = (tickMap[si] || []).map((t: any) => ({
        offset: t.offset, stagger: t.stagger ?? 0, sp: t.sp ?? 0,
      }))
    }
  })
  activeTab.value = 'basic'
  dialogVisible.value = true
}

async function del(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除角色「${row.name}」？`, '删除确认', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    await api.delete(`/characters/${row.id}`)
    ElMessage.success('已删除'); load()
  } catch { /* cancelled or failed */ }
}

async function save() {
  const cid = form.value.id
  if (editing.value) await api.put(`/characters/${cid}`, form.value)
  else await api.post('/characters', form.value)

  // Save attack segments
  await AttackSegmentApi.list(cid).then(async existing => {
    const existingIdx = new Set(existing.map((s: any) => s.segmentIndex))
    for (let si = 0; si < 5; si++) {
      const seg = formSegments.value[si]
      const payload = { characterId: cid, segmentIndex: si, duration: seg.duration, gaugeGain: seg.gaugeGain }
      if (existingIdx.has(si)) {
        await AttackSegmentApi.update(payload).catch(() => {})
      } else {
        await AttackSegmentApi.save(payload).catch(() => {})
      }
    }
  }).catch(() => {})

  // Save attack segment ticks
  await AttackSegmentTickApi.list(cid).then(async existing => {
    for (const e of existing) {
      await AttackSegmentTickApi.delete(cid, e.segmentIndex, e.tickIndex).catch(() => {})
    }
    for (let si = 0; si < 5; si++) {
      for (let ti = 0; ti < formSegments.value[si].ticks.length; ti++) {
        const t = formSegments.value[si].ticks[ti]
        await AttackSegmentTickApi.save({
          characterId: cid, segmentIndex: si, tickIndex: ti,
          offset: t.offset, stagger: t.stagger, sp: t.sp,
        }).catch(() => {})
      }
    }
  }).catch(() => {})

  dialogVisible.value = false; editing.value = null; form.value = { rarity: 5, level: 90, potential: 0 }; formSegments.value = []; load()
}

function addSegTick(si: number) {
  formSegments.value[si].ticks.push({ offset: 0, stagger: 0, sp: 0 })
}

function removeSegTick(si: number, ti: number) {
  formSegments.value[si].ticks.splice(ti, 1)
}

onMounted(load)
</script>

<style>
.col-ops .el-button { white-space: nowrap; }
.col-ops { text-align: right; }
</style>
