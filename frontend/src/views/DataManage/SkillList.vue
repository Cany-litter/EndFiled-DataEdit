<template>
  <div>
    <el-card>
      <div style="margin-bottom: 15px">
        <el-button type="primary" @click="openCreate">新建技能</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading" style="width:100%" :max-height="'calc(100vh - 220px)'">
        <el-table-column type="index" label="#" width="50" fixed="left" />
        <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip fixed="left" />
        <el-table-column label="角色" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">{{ charName(row.characterId) }}</template>
        </el-table-column>
        <el-table-column label="技能类型" width="90">
          <template #default="{ row }">{{ mapSkillType(row.type) }}</template>
        </el-table-column>
        <el-table-column label="伤害类型" width="90">
          <template #default="{ row }">{{ mapDamageType(row.damageType) }}</template>
        </el-table-column>
        <el-table-column label="描述" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">{{ cleanSkillDesc(row.description) || '-' }}</template>
        </el-table-column>
        <el-table-column label="Lv.12倍率" width="100">
          <template #default="{ row }">{{ level12Mult(row) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right" class-name="col-ops">
          <template #default="{ row }">
            <el-button size="small" type="info" @click="edit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑技能' : '新建技能'" width="700px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础信息" name="basic">
          <el-form :model="form" label-width="100px">
            <el-form-item label="ID"><el-input v-model="form.id" :disabled="!!editing" /></el-form-item>
            <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <el-form-item label="角色">
                <el-select v-model="form.characterId" filterable style="width:100%">
                  <el-option v-for="c in characters" :key="c.id" :label="`${c.name} (${c.id})`" :value="c.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="类型">
                <el-select v-model="form.type" style="width:100%">
                  <el-option v-for="[v,l] in skillTypeOpts" :key="v" :label="l" :value="v" />
                </el-select>
              </el-form-item>
              <el-form-item label="伤害类型">
                <el-select v-model="form.damageType" style="width:100%">
                  <el-option v-for="[v,l] in damageTypeOpts" :key="v" :label="l" :value="v" />
                </el-select>
              </el-form-item>
            </div>
            <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="4" /></el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="等级倍率与消耗" name="levels">
          <div style="margin-bottom:8px;font-size:13px;color:#909399">编辑 1~12 级的倍率与消耗参数</div>
          <el-table :data="formLevels" border stripe size="small" max-height="480" style="width:100%">
            <el-table-column prop="level" label="等级" width="55" />
            <el-table-column label="倍率%">
              <template #default="{ row }">
                <el-input-number v-model="row.multiplier" :min="0" :max="99999" :step="0.01" :precision="2" size="small" style="width:100px" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column label="技力">
              <template #default="{ row }">
                <el-input-number v-model="row.costValue" :min="0" :max="9999" size="small" style="width:80px" controls-position="right" :value-on-clear="null" />
              </template>
            </el-table-column>
            <el-table-column label="冷却(秒)">
              <template #default="{ row }">
                <el-input-number v-model="row.coolDown" :min="0" :max="999" :step="0.1" :precision="2" size="small" style="width:90px" controls-position="right" :value-on-clear="null" />
              </template>
            </el-table-column>
            <el-table-column label="终技能量">
              <template #default="{ row }">
                <el-input-number v-model="row.usp" :min="0" :max="9999" size="small" style="width:80px" controls-position="right" :value-on-clear="null" />
              </template>
            </el-table-column>
            <el-table-column label="削韧">
              <template #default="{ row }">
                <el-input-number v-model="row.poise" :min="0" :max="999" :step="0.01" :precision="2" size="small" style="width:80px" controls-position="right" :value-on-clear="null" />
              </template>
            </el-table-column>
            <el-table-column label="击飞">
              <template #default="{ row }">
                <el-input-number v-model="row.airborneScale" :min="0" :max="999" :step="0.01" :precision="2" size="small" style="width:80px" controls-position="right" :value-on-clear="null" />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="动作参数" name="action">
          <div style="margin-bottom:8px;font-size:13px;color:#909399">排轴模拟基础参数</div>
          <el-form label-width="100px" size="small">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <el-form-item label="持续时长">
                <el-input-number v-model="formAction.duration" :min="0" :step="0.1" style="width:100%" :value-on-clear="null" />
              </el-form-item>
              <el-form-item label="冷却时间">
                <el-input-number v-model="formAction.cooldown" :min="0" :step="0.5" style="width:100%" :value-on-clear="null" />
              </el-form-item>
              <el-form-item label="技力消耗">
                <el-input-number v-model="formAction.spCost" :min="0" style="width:100%" :value-on-clear="null" />
              </el-form-item>
              <el-form-item label="技能获取">
                <el-input-number v-model="formAction.techReturn" :min="0" style="width:100%" :value-on-clear="null" />
              </el-form-item>
              <el-form-item label="自身充能">
                <el-input-number v-model="formAction.gaugeGain" :min="0" :step="0.5" style="width:100%" :value-on-clear="null" />
              </el-form-item>
              <el-form-item label="队友充能">
                <el-input-number v-model="formAction.teamGaugeGain" :min="0" :step="0.5" style="width:100%" :value-on-clear="null" />
              </el-form-item>
            </div>
          </el-form>
          <el-divider />
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-weight:600;font-size:13px;color:#606266">伤害判定帧</span>
            <el-button size="small" type="primary" @click="addTick">+ 添加</el-button>
          </div>
          <div v-for="(tick, ti) in formTicks" :key="ti" class="tick-item" style="border:1px solid #e4e7ed;border-radius:4px;padding:6px;margin-bottom:4px">
            <div style="display:flex;gap:6px;align-items:center">
              <span style="font-weight:600;font-size:12px;color:#409eff">#{{ ti }}</span>
              <el-input-number v-model="tick.offset" :min="0" :step="0.1" size="small" style="width:90px" controls-position="right" placeholder="偏移" />
              <el-input-number v-model="tick.stagger" :min="0" :step="5" size="small" style="width:90px" controls-position="right" placeholder="失衡" />
              <el-input-number v-model="tick.sp" :min="-50" :max="50" size="small" style="width:80px" controls-position="right" placeholder="SP" />
              <el-button size="small" type="danger" text @click="removeTick(ti)">✕</el-button>
            </div>
          </div>
          <div v-if="!formTicks.length" style="color:#c0c4cc;font-size:12px;text-align:center;padding:12px">暂无伤害判定帧，点击"+ 添加"新增</div>
        </el-tab-pane>
        <el-tab-pane label="异常附着" name="anomaly">
          <div style="margin-bottom:8px;font-size:13px;color:#909399">技能异常附着参数</div>
          <div v-for="(group, gi) in formAnomalies" :key="gi" style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-weight:600;font-size:12px;color:#909399">第{{ gi + 1 }}组</span>
              <el-button size="small" type="danger" text @click="removeAnomalyGroup(gi)">移除组</el-button>
            </div>
            <div v-for="(a, ai) in group" :key="ai" style="border:1px solid #e4e7ed;border-radius:4px;padding:6px;margin-bottom:4px">
              <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">
                <el-select v-model="a.type" size="small" style="width:130px" placeholder="类型" filterable>
                  <el-option v-for="[v,l] in anomalyTypeOpts" :key="v" :label="l" :value="v" />
                </el-select>
                <el-input-number v-model="a.stacks" :min="1" :max="99" size="small" style="width:70px" controls-position="right" placeholder="层数" />
                <el-input-number v-model="a.duration" :min="0" :step="0.1" size="small" style="width:90px" controls-position="right" placeholder="持续" />
                <el-input-number v-model="a.offset" :min="0" :step="0.1" size="small" style="width:90px" controls-position="right" placeholder="偏移" />
                <el-input-number v-model="a.delay" :min="0" :step="0.1" size="small" style="width:90px" controls-position="right" placeholder="延迟" />
                <el-button size="small" type="danger" text @click="removeAnomaly(gi, ai)">✕</el-button>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:6px">
            <el-button size="small" type="primary" @click="addAnomaly">+ 添加异常</el-button>
            <el-button size="small" @click="addAnomalyGroup">+ 添加组</el-button>
          </div>
          <div v-if="!formAnomalies.length" style="color:#c0c4cc;font-size:12px;text-align:center;padding:12px">暂无异常附着</div>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../api'
import { CharacterApi, SkillApi, SkillLevelApi, SkillCostApi, SkillActionApi, SkillDamageTickApi, SkillAnomalyApi } from '../../api'
import type { Character, SkillAction } from '../../api'
import { mapSkillType, mapDamageType, skillTypeOpts, damageTypeOpts, cleanSkillDesc, anomalyTypeOpts } from '../../utils/constants'

const list = ref<any[]>([])
const characters = ref<Character[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editing = ref<any>(null)
const activeTab = ref('basic')
const form = ref<any>({})
const formLevels = ref<any[]>([])
const formAction = ref<Partial<SkillAction>>({})
const formTicks = ref<{ offset: number; stagger: number; sp: number }[]>([])
const formAnomalies = ref<{ type: string; stacks: number; duration: number; offset: number; delay: number }[][]>([])

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function charName(id: string) {
  if (!id) return '-'
  return characters.value.find(c => c.id === id)?.name || id
}

function level12Mult(row: any) {
  if (!row._levels || !row._levels.length) return '-'
  const lv12 = row._levels.find((l: any) => l.level === 12)
  return lv12 ? lv12.multiplier + '%' : '-'
}

async function load() {
  loading.value = true
  characters.value = await CharacterApi.listAll()
  const skills = await SkillApi.listAll()

  const [allLevels, allCosts] = await Promise.all([
    SkillLevelApi.listAll(),
    SkillCostApi.listAll(),
  ])

  const levelsBySkill: Record<string, any[]> = {}
  for (const lv of allLevels) {
    if (!levelsBySkill[lv.skillId]) levelsBySkill[lv.skillId] = []
    levelsBySkill[lv.skillId].push(lv)
  }

  const costsBySkill: Record<string, any[]> = {}
  for (const c of allCosts) {
    if (!costsBySkill[c.skillId]) costsBySkill[c.skillId] = []
    costsBySkill[c.skillId].push(c)
  }

  for (const sk of skills) {
    sk._levels = levelsBySkill[sk.id] || []
    sk._costs = costsBySkill[sk.id] || []
  }
  list.value = skills
  loading.value = false
}

function initFormLevels(skillId: string, existingLevels: any[], existingCosts: any[]) {
  const costMap: Record<number, any> = {}
  for (const c of existingCosts) costMap[c.level] = c

  const levelMap: Record<number, any> = {}
  for (const l of existingLevels) levelMap[l.level] = l

  return LEVELS.map(lv => ({
    skillId,
    level: lv,
    multiplier: levelMap[lv]?.multiplier ?? 0,
    costValue: costMap[lv]?.costValue ?? null,
    coolDown: costMap[lv]?.coolDown ?? null,
    usp: costMap[lv]?.usp ?? null,
    poise: costMap[lv]?.poise ?? null,
  }))
}

function openCreate() {
  editing.value = null
  form.value = { damageType: 'physical' }
  formLevels.value = initFormLevels('', [], [])
  formAction.value = {}
  formTicks.value = []
  formAnomalies.value = []
  activeTab.value = 'basic'
  dialogVisible.value = true
}

function edit(row: any) {
  editing.value = row
  form.value = { ...row }
  formLevels.value = initFormLevels(row.id, row._levels || [], row._costs || [])
  Promise.all([
    SkillActionApi.get(row.id).catch(() => ({ skillId: row.id })),
    SkillDamageTickApi.list(row.id).catch(() => []),
    SkillAnomalyApi.list(row.id).catch(() => []),
  ]).then(([action, ticks, anomalies]) => {
    formAction.value = { ...action }
    formTicks.value = ticks.map((t: any) => ({ offset: t.offset, stagger: t.stagger ?? 0, sp: t.sp ?? 0 }))
    // Group anomalies by group_index
    const groups: Record<number, any[]> = {}
    for (const a of anomalies) {
      const gi = a.groupIndex ?? 0
      if (!groups[gi]) groups[gi] = []
      groups[gi].push({ type: a.type, stacks: a.stacks ?? 1, duration: a.duration ?? 0, offset: a.offset ?? 0, delay: a.delay ?? 0 })
    }
    formAnomalies.value = Object.values(groups)
  })
  activeTab.value = 'basic'
  dialogVisible.value = true
}

function del(row: any) {
  ElMessageBox.confirm(`确定删除技能「${row.name}」吗？`, '确认删除', {
    confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning',
  }).then(() => {
    api.delete(`/skills/${row.id}`).then(() => { ElMessage.success('已删除'); load() })
  }).catch(() => {})
}

async function save() {
  const data = { ...form.value }
  const isNew = !editing.value

  if (isNew) {
    await api.post('/skills', data)
  } else {
    await api.put(`/skills/${data.id}`, data)
  }

  const sid = data.id
  const existingLevelIds = new Set((editing.value?._levels || []).map((l: any) => l.level))
  const existingCostIds = new Set((editing.value?._costs || []).map((c: any) => c.level))

  const saves = formLevels.value.map(lv => {
    const levelExists = existingLevelIds.has(lv.level)
    const levelReq = levelExists
      ? api.put('/skill-levels', { skillId: sid, level: lv.level, multiplier: lv.multiplier })
      : api.post('/skill-levels', { skillId: sid, level: lv.level, multiplier: lv.multiplier })

    const hasCost = lv.costValue != null || lv.coolDown != null || lv.usp != null || lv.poise != null
    if (!hasCost) return levelReq

    const costExists = existingCostIds.has(lv.level)
    const costBody = { skillId: sid, level: lv.level, costValue: lv.costValue, coolDown: lv.coolDown, usp: lv.usp, poise: lv.poise }
    const costReq = costExists
      ? api.put('/skill-costs', costBody)
      : api.post('/skill-costs', costBody)

    return levelReq.then(() => costReq)
  })
  await Promise.all(saves)

  // 保存 SkillAction
  if (formAction.value.skillId || editing.value) {
    const actionPayload: any = {
      skillId: sid,
      duration: formAction.value.duration ?? null,
      cooldown: formAction.value.cooldown ?? null,
      spCost: formAction.value.spCost ?? null,
      techReturn: formAction.value.techReturn ?? null,
      gaugeGain: formAction.value.gaugeGain ?? null,
      teamGaugeGain: formAction.value.teamGaugeGain ?? null,
    }
    if (editing.value) {
      await SkillActionApi.update(actionPayload).catch(() => {})
    } else {
      await SkillActionApi.save(actionPayload).catch(() => {})
    }
  }

  // 保存 SkillDamageTicks (规范化)
  await SkillDamageTickApi.list(sid).then(async existing => {
    const existingSet = new Set(existing.map((t: any) => t.tickIndex))
    for (let i = 0; i < formTicks.value.length; i++) {
      const t = formTicks.value[i]
      const payload = { skillId: sid, tickIndex: i, offset: t.offset, stagger: t.stagger, sp: t.sp }
      if (existingSet.has(i)) {
        await SkillDamageTickApi.update(payload).catch(() => {})
      } else {
        await SkillDamageTickApi.save(payload).catch(() => {})
      }
    }
    // Delete removed ticks
    for (const e of existing) {
      if (e.tickIndex >= formTicks.value.length) {
        await SkillDamageTickApi.delete(sid, e.tickIndex).catch(() => {})
      }
    }
  }).catch(() => {})

  // 保存 SkillAnomalies (规范化)
  await SkillAnomalyApi.list(sid).then(async existing => {
    // Delete all existing, then re-insert
    for (const e of existing) {
      await SkillAnomalyApi.delete(sid, e.anomalyIndex).catch(() => {})
    }
    let ai = 0
    for (let gi = 0; gi < formAnomalies.value.length; gi++) {
      for (const a of formAnomalies.value[gi]) {
        await SkillAnomalyApi.save({
          skillId: sid, anomalyIndex: ai++, groupIndex: gi,
          type: a.type, stacks: a.stacks, duration: a.duration, offset: a.offset, delay: a.delay,
        }).catch(() => {})
      }
    }
  }).catch(() => {})

  dialogVisible.value = false; editing.value = null; form.value = {}; formAction.value = {}; formTicks.value = []; formAnomalies.value = []; load()
}

function addAnomaly() {
  if (formAnomalies.value.length === 0) formAnomalies.value.push([])
  formAnomalies.value[formAnomalies.value.length - 1].push({ type: 'stagger', stacks: 1, duration: 0, offset: 0, delay: 0 })
}

function addAnomalyGroup() {
  formAnomalies.value.push([{ type: 'stagger', stacks: 1, duration: 0, offset: 0, delay: 0 }])
}

function removeAnomaly(gi: number, ai: number) {
  formAnomalies.value[gi].splice(ai, 1)
  if (formAnomalies.value[gi].length === 0) formAnomalies.value.splice(gi, 1)
}

function removeAnomalyGroup(gi: number) {
  formAnomalies.value.splice(gi, 1)
}

function addTick() {
  formTicks.value.push({ offset: 0, stagger: 0, sp: 0 })
}

function removeTick(ti: number) {
  formTicks.value.splice(ti, 1)
}

onMounted(load)
</script>

<style>
.col-ops .el-button { white-space: nowrap; }
.col-ops { text-align: right; }
</style>
