<template>
  <div>
    <el-row :gutter="12">
      <el-col :span="4" v-for="card in cards" :key="card.label">
        <el-card :body-style="{textAlign:'center', padding:'16px'}" shadow="hover">
          <div style="font-size:28px;font-weight:700;color:#409eff">{{ card.count }}</div>
          <div style="margin-top:6px;color:#909399;font-size:13px">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card>
          <template #header><span>项目快速入口</span></template>
          <el-row :gutter="8">
            <el-col :span="6" v-for="item in quickLinks" :key="item.path">
              <el-card :body-style="{padding:'12px',cursor:'pointer',textAlign:'center'}" shadow="hover" @click="$router.push(item.path)">
                <div style="font-size:22px;margin-bottom:4px">{{ item.icon }}</div>
                <div style="font-weight:600;font-size:13px">{{ item.label }}</div>
                <div style="font-size:11px;color:#909399;margin-top:2px">{{ item.desc }}</div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>数据概览</span></template>
          <div v-for="(d, i) in distributions" :key="i" style="margin-bottom:12px">
            <div style="font-size:13px;font-weight:600;margin-bottom:4px">{{ d.label }}</div>
            <div v-for="item in d.items" :key="item.name" style="display:flex;align-items:center;margin:2px 0;font-size:12px">
              <span style="width:50px;flex-shrink:0;color:#606266">{{ item.name }}</span>
              <div style="flex:1;height:16px;background:#f0f0f0;border-radius:8px;overflow:hidden;margin:0 6px">
                <div :style="{width: item.pct*100+'%', height:'100%', background: item.color, borderRadius:'8px', transition:'width 0.6s'}"></div>
              </div>
              <span style="width:30px;text-align:right;color:#909399">{{ item.count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="8">
        <el-card>
          <template #header><span>最近方案</span></template>
          <div v-if="recentBuilds.length" v-for="b in recentBuilds" :key="b.id" class="recent-item" @click="$router.push('/loadout/'+b.id)">
            <div style="font-weight:600;font-size:13px">{{ b.name || b.id }}</div>
            <div style="font-size:12px;color:#909399">{{ charMap[b.characterId] || b.characterId }}</div>
          </div>
          <div v-else style="color:#909399;font-size:13px">暂无方案</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header><span>最近配队</span></template>
          <div v-if="recentTeams.length" v-for="t in recentTeams" :key="t.id" class="recent-item" @click="$router.push('/team/'+t.id)">
            <div style="font-weight:600;font-size:13px">{{ t.name || t.id }}</div>
            <div style="font-size:12px;color:#909399">{{ teamChars(t) }}</div>
          </div>
          <div v-else style="color:#909399;font-size:13px">暂无配队</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header><span>系统状态</span></template>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
            <div>后端状态</div>
            <div><el-tag :type="backendOnline ? 'success' : 'danger'" size="small">{{ backendOnline ? '在线' : '离线' }}</el-tag></div>
            <div>数据版本</div>
            <div>CN_WIN_REL_1.2.4</div>
            <div>角色</div>
            <div>{{ cardValue('角色') }} 名</div>
            <div>武器</div>
            <div>{{ cardValue('武器') }} 把</div>
            <div>装备</div>
            <div>{{ cardValue('装备') }} 件 ({{ equipSetCount }} 套)</div>
            <div>技能等级倍率</div>
            <div>{{ skillLevelCount }} 条</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top:16px">
      <template #header><span>项目状态</span></template>
      <el-table :data="statusRows" border stripe size="small">
        <el-table-column prop="phase" label="阶段" width="80" />
        <el-table-column prop="feature" label="功能" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '✅' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api, { CharacterApi, WeaponApi, EquipmentApi, SkillApi, SkillLevelApi, GainApi, BuildApi, TeamApi } from '../api'
import type { Character, Weapon, Equipment } from '../api'
import { mapProfession, mapSlot } from '../utils/constants'

const cards = ref([
  { label: '角色', count: 0 },
  { label: '武器', count: 0 },
  { label: '装备', count: 0 },
  { label: '技能', count: 0 },
  { label: '增益', count: 0 },
  { label: '配装方案', count: 0 },
  { label: '配队', count: 0 },
])

const skillLevelCount = ref(0)
const equipSetCount = ref(0)
const backendOnline = ref(false)
const charMap = ref<Record<string, string>>({})
const recentBuilds = ref<any[]>([])
const recentTeams = ref<any[]>([])

const distributionColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#b37feb', '#36cfc9']

const distributions = ref<{ label: string; items: { name: string; count: number; pct: number; color: string }[] }[]>([])

function cardValue(label: string) {
  return cards.value.find(c => c.label === label)?.count ?? 0
}

const quickLinks = [
  { path: '/characters', icon: '👤', label: '角色管理', desc: '角色数据' },
  { path: '/weapons', icon: '⚔️', label: '武器管理', desc: '武器数据' },
  { path: '/equipment', icon: '🛡️', label: '装备管理', desc: '装备数据' },
  { path: '/skills', icon: '✨', label: '技能管理', desc: '技能倍率' },
  { path: '/builds', icon: '📋', label: '配装方案', desc: '方案列表' },
  { path: '/loadout', icon: '🔧', label: '配装编辑器', desc: '创建方案' },
  { path: '/teams', icon: '👥', label: '配队管理', desc: '四人配队' },
  { path: '/timeline', icon: '⏱️', label: '排轴模拟', desc: '时间线编辑' },
  { path: '/damage', icon: '📊', label: '排轴伤害', desc: '配队DPS模拟' },
]

const statusRows = [
  { phase: 'P0', feature: '前后端脚手架 + 数据库 + CRUD API + 基础页面', status: '✅' },
  { phase: 'P1', feature: '数据CRUD增强 + 配装编辑器 + 公式引擎(15乘区)', status: '✅' },
  { phase: 'P2', feature: '配队管理 + 配装列表 + 配队排轴模拟', status: '✅' },
  { phase: 'P3', feature: '模拟引擎完善 + SkillAction集成 + 分类驱动计算 + Buff映射', status: '✅' },
  { phase: 'P4', feature: '三联动：时间线伤害 / 循环排轴 / 配队数据贯通', status: '✅' },
  { phase: '测试', feature: '95 条单元测试覆盖公式引擎 + 效果解析 + 分类计算', status: '✅' },
]

function teamChars(t: any) {
  const names: string[] = []
  for (const field of ['charAId', 'charBId', 'charCId', 'charDId']) {
    const id = (t as any)[field]
    if (id) names.push(charMap.value[id] || id)
  }
  return names.join(', ') || '空'
}

onMounted(async () => {
  try {
    const [chars, weapons, equipment, skills, gains, builds, teams, skillLevels] = await Promise.all([
      CharacterApi.listAll(),
      WeaponApi.listAll(),
      EquipmentApi.listAll(),
      SkillApi.listAll(),
      GainApi.listAll(),
      BuildApi.listAll(),
      TeamApi.listAll(),
      SkillLevelApi.listAll(),
    ])

    backendOnline.value = true

    for (const c of chars) charMap.value[c.id] = c.name

    cards.value = [
      { label: '角色', count: chars.length },
      { label: '武器', count: weapons.length },
      { label: '装备', count: equipment.length },
      { label: '技能', count: skills.length },
      { label: '增益', count: (gains as any[]).length },
      { label: '配装方案', count: builds.length },
      { label: '配队', count: teams.length },
    ]

    skillLevelCount.value = skillLevels.length

    const setNames = new Set(equipment.filter((e: Equipment) => e.setName).map((e: Equipment) => e.setName))
    equipSetCount.value = setNames.size

    const profMap = new Map<string, number>()
    for (const c of chars) {
      const prof = mapProfession(c.profession) || c.profession || '其他'
      profMap.set(prof, (profMap.get(prof) || 0) + 1)
    }
    const profItems = Array.from(profMap.entries()).sort((a, b) => b[1] - a[1])
    const profTotal = Math.max(profItems.reduce((s, [,c]) => s + c, 0), 1)

    const rarityMap = new Map<string, number>()
    for (const w of weapons) rarityMap.set(String(w.rarity) + '★', (rarityMap.get(String(w.rarity) + '★') || 0) + 1)
    const rarityItems = Array.from(rarityMap.entries()).sort((a, b) => Number(b[0]) - Number(a[0]))
    const rarityTotal = Math.max(rarityItems.reduce((s, [,c]) => s + c, 0), 1)

    const slotMap = new Map<string, number>()
    for (const e of equipment) slotMap.set(e.slot || '其他', (slotMap.get(e.slot || '其他') || 0) + 1)
    const slotItems = Array.from(slotMap.entries()).sort((a, b) => b[1] - a[1]).map(([k, c]) => [mapSlot(k), c] as [string, number])
    const slotTotal = Math.max(slotItems.reduce((s, [,c]) => s + c, 0), 1)

    distributions.value = [
      {
        label: '角色职业分布',
        items: profItems.map(([n, c], i) => ({ name: n, count: c, pct: c / profTotal, color: distributionColors[i % distributionColors.length] })),
      },
      {
        label: '武器稀有度分布',
        items: rarityItems.map(([n, c], i) => ({ name: n, count: c, pct: c / rarityTotal, color: distributionColors[i % distributionColors.length] })),
      },
      {
        label: '装备部位分布',
        items: slotItems.map(([n, c], i) => ({ name: n, count: c, pct: c / slotTotal, color: distributionColors[i % distributionColors.length] })),
      },
    ]

    recentBuilds.value = builds.slice(0, 5)
    recentTeams.value = teams.slice(0, 5)
  } catch {
    backendOnline.value = false
  }
})
</script>

<style scoped>
.recent-item {
  padding: 8px 4px; border-bottom: 1px solid #f0f0f0; cursor: pointer;
  transition: background 0.2s;
}
.recent-item:hover { background: #f5f7fa; }
</style>
