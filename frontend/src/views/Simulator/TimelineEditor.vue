<template>
  <div style="display:flex;gap:16px;height:calc(100vh - 80px)">
    <el-card style="flex:0 0 380px;overflow-y:auto">
      <template #header><span>排轴模拟器</span></template>
      <el-form label-position="top" size="small">
        <el-form-item label="选择配装方案（攻击力基准）">
          <el-select v-model="selectedBuild" filterable placeholder="选择方案" style="width:100%" @change="onBuildChange">
            <el-option v-for="b in builds" :key="b.id" :label="`[${b.characterId}] ${b.name || b.id}`" :value="b" />
          </el-select>
        </el-form-item>

        <template v-if="selectedBuild && charSkills.length">
          <el-divider content-position="left">技能配置</el-divider>
          <div v-for="s in charSkills" :key="s.id" class="skill-config-row">
            <span style="flex:1">{{ s.name || s.id }} ({{ skillTypeLabel(s.type) }})</span>
            <div style="display:flex;gap:4px;align-items:center">
              <el-button size="small" type="primary" link @click="addRotationStep(s)">+ 加入</el-button>
            </div>
          </div>

          <el-divider content-position="left">循环序列</el-divider>
          <div v-if="rotation.length">
            <div v-for="(step, i) in rotation" :key="i" class="rotation-step">
              <span>{{ i + 1 }}. {{ step.label }}</span>
              <el-button size="small" type="danger" link @click="rotation.splice(i, 1)">✕</el-button>
            </div>
            <el-button size="small" style="margin-top:8px" @click="rotation = []">清空</el-button>
          </div>
          <div v-else style="color:#909399;font-size:13px">请从上方添加技能到循环序列</div>

          <el-divider content-position="left">模拟参数</el-divider>
          <el-form-item label="模拟时长 (秒)">
            <el-slider v-model="simDuration" :min="10" :max="300" :step="10" show-input />
          </el-form-item>
          <el-form-item label="目标数量">
            <el-input-number v-model="targetCount" :min="1" :max="10" size="small" />
          </el-form-item>
          <el-form-item label="目标防御">
            <el-input-number v-model="targetDef" :min="0" :max="500" size="small" />
          </el-form-item>
          <el-form-item label="目标抗性">
            <el-input-number v-model="targetResistance" :min="0" :max="100" size="small" />
          </el-form-item>
          <el-form-item label="抗性穿透">
            <el-input-number v-model="targetResistanceIgnore" :min="0" :max="100" size="small" />
          </el-form-item>
          <el-form-item label="暴击率">
            <el-input-number v-model="critRate" :min="0" :max="1" :step="0.01" size="small" />
          </el-form-item>
          <el-form-item label="暴击伤害">
            <el-input-number v-model="critDamage" :min="0" :max="5" :step="0.01" size="small" />
          </el-form-item>
          <el-form-item label="增伤加成">
            <el-input-number v-model="damageBonus" :min="0" :max="5" :step="0.01" size="small" />
          </el-form-item>

          <el-button type="primary" style="width:100%" :disabled="!rotation.length" @click="runSim">开始模拟</el-button>
        </template>
      </el-form>
    </el-card>

    <el-card style="flex:1;overflow-y:auto" v-if="result">
      <template #header>
        <span>模拟结果</span>
        <el-tag style="margin-left:12px" type="success">DPS: {{ result.dps.toFixed(1) }}</el-tag>
        <el-tag style="margin-left:8px">总伤害: {{ result.totalDamage.toFixed(0) }}</el-tag>
        <el-tag style="margin-left:8px">总施放: {{ result.totalCasts }}</el-tag>
      </template>

      <el-divider content-position="left">技能伤害占比</el-divider>
      <el-table :data="skillBreakdownRows" border stripe size="small">
        <el-table-column prop="skill" label="技能" />
        <el-table-column prop="count" label="施放次数" width="100" />
        <el-table-column prop="totalDamage" label="总伤害" width="140">
          <template #default="{ row }">{{ row.totalDamage.toFixed(0) }}</template>
        </el-table-column>
        <el-table-column prop="pct" label="占比" width="100">
          <template #default="{ row }">{{ (row.pct * 100).toFixed(1) }}%</template>
        </el-table-column>
      </el-table>

      <el-divider content-position="left">时间线（前 30 秒）</el-divider>
      <div style="max-height:300px;overflow-y:auto">
        <div v-for="(ev, i) in visibleEvents" :key="i" class="timeline-event">
          <span class="timeline-time">{{ ev.time.toFixed(1) }}s</span>
          <el-tag :type="eventTagType(ev)" size="small" style="margin:0 4px">{{ eventLabel(ev) }}</el-tag>
          <span v-if="ev.damage" style="color:#e6a23c">伤害: {{ ev.damage.toFixed(0) }}</span>
          <span v-if="ev.energy !== undefined" style="color:#409eff">能量: {{ ev.energy }}</span>
        </div>
      </div>
    </el-card>

    <el-card v-else style="flex:1;display:flex;align-items:center;justify-content:center;color:#909399">
      选择配装方案并设置循环序列后开始模拟
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { BuildApi, CharacterApi, SkillApi, SkillLevelApi } from '../../api'
import type { Build, Character, Skill, SkillLevel } from '../../api'
import { calcFinalStats } from '../../engine/formulas/stats'
import { runSimulation } from '../../engine/simulation/engine'
import { DEFAULT_SKILL_CONFIGS } from '../../engine/simulation/types'
import type { SimulationResult, SkillConfig, RotationStep } from '../../engine/simulation/types'

const builds = ref<(Build & { characterObj?: Character })[]>([])
const selectedBuild = ref<(Build & { characterObj?: Character }) | null>(null)
const charSkills = ref<(Skill & { skillLevels?: SkillLevel[] })[]>([])
const rotation = reactive<RotationStep[]>([])
const result = ref<SimulationResult | null>(null)

const simDuration = ref(120)
const targetDef = ref(50)
const targetResistance = ref(20)
const targetResistanceIgnore = ref(0)
const targetCount = ref(1)
const critRate = ref(0.05)
const critDamage = ref(1.3)
const damageBonus = ref(0.2)

function skillTypeLabel(t: string) {
  const map: Record<string, string> = { normal: '普攻', skill: '战技', chain: '连携', ultimate: '终结技', other: '其他' }
  return map[t] || t
}

async function loadBuilds() {
  const all = await BuildApi.list()
  const chars = await CharacterApi.list()
  builds.value = all.map(b => ({
    ...b,
    characterObj: chars.find(c => c.id === b.characterId),
  }))
}

async function onBuildChange(b: Build & { characterObj?: Character }) {
  const c = b.characterObj
  if (!c) {
    charSkills.value = []
    rotation.length = 0
    return
  }
  // Load skills with levels
  const skills = await SkillApi.list(c.id)
  for (const sk of skills) {
    (sk as any).skillLevels = await SkillLevelApi.list(sk.id)
  }
  charSkills.value = skills as any
  rotation.length = 0
}

function addRotationStep(skill: Skill & { skillLevels?: SkillLevel[] }) {
  const lv = skill.skillLevels?.find(l => l.level === 12)
  const config = DEFAULT_SKILL_CONFIGS[skill.type as keyof typeof DEFAULT_SKILL_CONFIGS]
  rotation.push({
    skillId: skill.id,
    skillType: skill.type as any,
    label: `${skillTypeLabel(skill.type)}${skill.name ? '-' + skill.name : ''}`,
  })
}

function runSim() {
  if (!selectedBuild.value || !charSkills.value.length) return
  const c = selectedBuild.value.characterObj
  if (!c) return

  // Calculate attack stat from build
  const stats = calcFinalStats(
    { baseAtk: c.baseAtk, baseHp: c.baseHp, baseStr: c.baseStr, baseAgi: c.baseAgi, baseInt: c.baseInt, baseWil: c.baseWil,
      mainAttr: c.mainAttr, subAttr: c.subAttr, trustLevel: c.trustTalent ?? 1 },
    { baseAtk: 0, affix1Value: 0 },
    { str: 0, agi: 0, int: 0, wil: 0, atkPercent: 0, hpPercent: 0 },
  )

  const skillConfigs: SkillConfig[] = charSkills.value.map(sk => {
    const lv12 = (sk as any).skillLevels?.find((l: SkillLevel) => l.level === 12)
    const config = DEFAULT_SKILL_CONFIGS[sk.type as keyof typeof DEFAULT_SKILL_CONFIGS]
    return {
      id: sk.id, name: sk.name, type: sk.type as any,
      damageType: sk.damageType, multiplier: (lv12?.multiplier ?? 100) / 100,
      cooldown: config.cooldown, energyCost: config.energyCost, castTime: config.castTime,
    }
  })

  result.value = runSimulation(stats.attack, {
    targetDef: targetDef.value,
    targetResistance: targetResistance.value,
    targetResistanceIgnore: targetResistanceIgnore.value,
    duration: simDuration.value,
    critRate: critRate.value,
    critDamage: critDamage.value,
    damageBonus: damageBonus.value,
    targetCount: targetCount.value,
  }, skillConfigs, [...rotation])
}

const skillBreakdownRows = computed(() => {
  if (!result.value) return []
  const total = result.value.totalDamage
  return Object.entries(result.value.skillBreakdown).map(([id, data]) => ({
    id,
    skill: charSkills.value.find(s => s.id === id)?.name || id,
    count: data.count,
    totalDamage: data.totalDamage,
    pct: data.totalDamage / total,
  }))
})

const visibleEvents = computed(() => {
  return (result.value?.events || []).filter(e => e.time <= 30).slice(0, 200)
})

function eventLabel(ev: any) {
  switch (ev.type) {
    case 'cast_start': return `施放 ${ev.skillName || ''}`
    case 'cast_end': return '施放结束'
    case 'damage': return `${ev.skillName || ''}伤害`
    case 'auto_attack': return '自动攻击'
    case 'energy_change': return '能量变化'
    default: return ev.type
  }
}

function eventTagType(ev: any) {
  switch (ev.type) {
    case 'cast_start': return 'warning'
    case 'cast_end': return 'info'
    case 'damage': return 'danger'
    case 'auto_attack': return ''
    default: return 'primary'
  }
}

onMounted(loadBuilds)
</script>

<style scoped>
.skill-config-row {
  display:flex;align-items:center;padding:6px 0;border-bottom:1px solid #f0f0f0;
}
.rotation-step {
  display:flex;align-items:center;justify-content:space-between;
  padding:4px 8px;margin:2px 0;background:#f9f9f9;border-radius:4px;
}
.timeline-event {
  display:flex;align-items:center;padding:4px 0;border-bottom:1px solid #f0f0f0;font-size:13px;
}
.timeline-time {
  font-family:monospace;color:#999;width:50px;
}
</style>
