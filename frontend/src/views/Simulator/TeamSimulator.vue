<template>
  <div style="display:flex;gap:16px;height:calc(100vh - 80px)">
    <el-card style="flex:0 0 400px;overflow-y:auto">
      <template #header><span>配队排轴模拟</span></template>
      <el-form label-position="top" size="small">
        <el-form-item label="选择配队">
          <el-select v-model="selectedTeam" filterable placeholder="选择配队" style="width:100%" @change="onTeamChange">
            <el-option v-for="t in teams" :key="t.id" :label="t.name || t.id" :value="t" />
          </el-select>
        </el-form-item>

        <template v-if="memberConfigs.length">
          <el-divider content-position="left">成员循环</el-divider>
          <el-card v-for="(mc, mi) in memberConfigs" :key="mi" :body-style="{padding:'10px'}" style="margin-bottom:8px">
            <template #header>
              <span style="font-weight:600;font-size:13px">{{ mc.name }}</span>
              <el-tag size="small" style="float:right">攻击 {{ mc.attack }}</el-tag>
            </template>
            <div v-for="s in mc.availableSkills" :key="s.id" class="skill-row">
              <span style="flex:1;font-size:12px">{{ s.name || s.id }} ({{ skillTypeLabel(s.type) }})</span>
              <el-button size="small" type="primary" link @click="addStep(mi, s)">+</el-button>
            </div>
            <div style="margin-top:6px">
              <div v-for="(step, si) in mc.rotation" :key="si" class="step-row">
                <span style="font-size:12px">{{ si+1 }}. {{ step.label }}</span>
                <el-button size="small" type="danger" link @click="mc.rotation.splice(si,1)">✕</el-button>
              </div>
              <div v-if="!mc.rotation.length" style="color:#909399;font-size:12px">空循环</div>
            </div>
          </el-card>

          <el-divider content-position="left">模拟参数</el-divider>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <el-form-item label="时长(s)">
              <el-input-number v-model="duration" :min="10" :max="300" :step="10" size="small" style="width:100%" />
            </el-form-item>
            <el-form-item label="目标数">
              <el-input-number v-model="targetCount" :min="1" :max="10" size="small" style="width:100%" />
            </el-form-item>
            <el-form-item label="防御">
              <el-input-number v-model="targetDef" :min="0" :max="500" size="small" style="width:100%" />
            </el-form-item>
            <el-form-item label="抗性">
              <el-input-number v-model="targetResistance" :min="0" :max="100" size="small" style="width:100%" />
            </el-form-item>
            <el-form-item label="暴击率">
              <el-input-number v-model="critRate" :min="0" :max="1" :step="0.01" size="small" style="width:100%" />
            </el-form-item>
            <el-form-item label="爆伤">
              <el-input-number v-model="critDamage" :min="0" :max="5" :step="0.01" size="small" style="width:100%" />
            </el-form-item>
            <el-form-item label="增伤">
              <el-input-number v-model="damageBonus" :min="0" :max="5" :step="0.01" size="small" style="width:100%" />
            </el-form-item>
          </div>

          <el-button type="primary" style="width:100%;margin-top:12px" @click="runSim">开始模拟</el-button>
        </template>
      </el-form>
    </el-card>

    <el-card style="flex:1;overflow-y:auto" v-if="result">
      <template #header>
        <span>模拟结果</span>
        <el-tag type="success" style="margin-left:12px">团队 DPS: {{ result.teamDps.toFixed(1) }}</el-tag>
        <el-tag style="margin-left:8px">总伤害: {{ result.teamTotalDamage.toFixed(0) }}</el-tag>
      </template>

      <el-table :data="teamRows" border stripe size="small">
        <el-table-column prop="name" label="成员" width="100" />
        <el-table-column prop="totalDamage" label="总伤害" width="140">
          <template #default="{ row }">{{ row.totalDamage.toFixed(0) }}</template>
        </el-table-column>
        <el-table-column prop="dps" label="DPS" width="100">
          <template #default="{ row }">{{ row.dps.toFixed(1) }}</template>
        </el-table-column>
        <el-table-column prop="pct" label="占比" width="80">
          <template #default="{ row }">{{ (row.pct * 100).toFixed(1) }}%</template>
        </el-table-column>
        <el-table-column prop="casts" label="施放" width="60" />
      </el-table>

      <el-divider content-position="left">技能详情</el-divider>
      <el-card v-for="(mr, mi) in result.members" :key="mi" :body-style="{padding:'10px'}" style="margin-bottom:8px">
        <template #header><span style="font-size:13px">{{ mr.name }} 技能伤害</span></template>
        <el-table :data="skillRows(mr)" border stripe size="small">
          <el-table-column prop="skill" label="技能" />
          <el-table-column prop="count" label="次数" width="60" />
          <el-table-column prop="damage" label="总伤害" width="140">
            <template #default="{ row }">{{ row.damage.toFixed(0) }}</template>
          </el-table-column>
          <el-table-column prop="pct" label="占比" width="80">
            <template #default="{ row }">{{ (row.pct * 100).toFixed(1) }}%</template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-card>

    <el-card v-else style="flex:1;display:flex;align-items:center;justify-content:center;color:#909399">
      选择配队后设置循环序列开始模拟
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { TeamApi, CharacterApi, BuildApi, SkillApi, SkillLevelApi } from '../../api'
import type { Team, Character, Build, Skill, SkillLevel } from '../../api'
import { calcFinalStats } from '../../engine/formulas/stats'
import { runTeamSimulation } from '../../engine/simulation/teamEngine'
import { DEFAULT_SKILL_CONFIGS } from '../../engine/simulation/types'
import type { SimulationConfig, RotationStep, TeamSimulationResult, SkillConfig } from '../../engine/simulation/types'

const teams = ref<Team[]>([])
const selectedTeam = ref<Team | null>(null)

interface MemberConfig {
  name: string
  attack: number
  availableSkills: (Skill & { skillLevels?: SkillLevel[] })[]
  rotation: RotationStep[]
}

const memberConfigs = reactive<MemberConfig[]>([])

const duration = ref(120)
const targetCount = ref(1)
const targetDef = ref(50)
const targetResistance = ref(20)
const critRate = ref(0.05)
const critDamage = ref(1.3)
const damageBonus = ref(0.2)
const result = ref<TeamSimulationResult | null>(null)

function skillTypeLabel(t: string) {
  const m: Record<string, string> = { normal: '普攻', skill: '战技', chain: '连携', ultimate: '终结技', other: '其他' }
  return m[t] || t
}

async function loadTeams() {
  teams.value = await TeamApi.list()
}

async function onTeamChange(team: Team) {
  memberConfigs.length = 0

  const slots = [
    { charId: team.charAId, buildField: 'buildAId' as const },
    { charId: team.charBId, buildField: 'buildBId' as const },
    { charId: team.charCId, buildField: 'buildCId' as const },
    { charId: team.charDId, buildField: 'buildDId' as const },
  ]

  const chars = await CharacterApi.list()
  const allBuilds = await BuildApi.list()

  for (const slot of slots) {
    if (!slot.charId) continue
    const c = chars.find(ch => ch.id === slot.charId)
    if (!c) continue

    const build = allBuilds.find(b => b.characterId === c.id)
    const skills = await SkillApi.list(c.id)
    for (const sk of skills) {
      (sk as any).skillLevels = await SkillLevelApi.list(sk.id)
    }

    const lv12 = (sk: Skill & { skillLevels?: SkillLevel[] }) =>
      sk.skillLevels?.find(l => l.level === 12)

    const stats = calcFinalStats(
      { baseAtk: c.baseAtk, baseHp: c.baseHp, baseStr: c.baseStr, baseAgi: c.baseAgi,
        baseInt: c.baseInt, baseWil: c.baseWil, mainAttr: c.mainAttr, subAttr: c.subAttr,
        trustLevel: c.trustTalent ?? 1 },
      { baseAtk: 0, affix1Value: 0 },
      { str: 0, agi: 0, int: 0, wil: 0, atkPercent: 0, hpPercent: 0,
        defPercent: 0, critRate: 0, critDamage: 0, damageBonus: 0 },
    )

    memberConfigs.push({
      name: c.name,
      attack: stats.attack,
      availableSkills: skills as any,
      rotation: [],
    })
  }
}

function addStep(mi: number, skill: Skill & { skillLevels?: SkillLevel[] }) {
  memberConfigs[mi].rotation.push({
    skillId: skill.id,
    skillType: skill.type as any,
    label: `${skillTypeLabel(skill.type)}${skill.name ? '-' + skill.name : ''}`,
    charIndex: mi,
  })
}

function skillRows(mr: TeamSimulationResult['members'][0]) {
  const total = mr.totalDamage
  return Object.entries(mr.skillBreakdown).map(([id, data]) => ({
    skill: id,
    count: data.count,
    damage: data.totalDamage,
    pct: data.totalDamage / total,
  }))
}

function runSim() {
  const teams = memberConfigs.map(mc => ({
    name: mc.name,
    attack: mc.attack,
    skills: mc.availableSkills.map(sk => {
      const lv12 = (sk as any).skillLevels?.find((l: SkillLevel) => l.level === 12)
      const cfg = DEFAULT_SKILL_CONFIGS[sk.type as keyof typeof DEFAULT_SKILL_CONFIGS]
      return {
        id: sk.id, name: sk.name, type: sk.type as any,
        damageType: sk.damageType,
        multiplier: (lv12?.multiplier ?? 100) / 100,
        cooldown: cfg.cooldown, energyCost: cfg.energyCost, castTime: cfg.castTime,
      } as SkillConfig
    }),
    rotation: mc.rotation.map(r => ({ ...r })),
  }))

  const config: SimulationConfig = {
    duration: duration.value, targetCount: targetCount.value,
    targetDef: targetDef.value, targetResistance: targetResistance.value,
    targetResistanceIgnore: 0,
    critRate: critRate.value, critDamage: critDamage.value, damageBonus: damageBonus.value,
  }

  result.value = runTeamSimulation(teams, config)
}

const teamRows = computed(() => {
  if (!result.value) return []
  const total = result.value.teamTotalDamage
  return result.value.members.map(m => ({
    name: m.name,
    totalDamage: m.totalDamage,
    dps: m.dps,
    pct: m.totalDamage / total,
    casts: m.totalCasts,
  }))
})

onMounted(loadTeams)
</script>

<style scoped>
.skill-row { display: flex; align-items: center; padding: 3px 0; border-bottom: 1px solid #f0f0f0; }
.step-row { display: flex; align-items: center; justify-content: space-between; padding: 2px 6px; margin: 1px 0; background: #f9f9f9; border-radius: 4px; }
</style>
