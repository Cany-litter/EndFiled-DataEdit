<template>
  <div v-if="action" class="damage-detail">
    <div class="dd-header">
      <span class="dd-title">{{ action.name }}</span>
      <el-tag size="small">{{ typeLabel(action.type) }}</el-tag>
      <el-tag size="small" type="info" style="margin-left:4px">{{ action.element }}</el-tag>
    </div>
    <div class="info-grid">
      <div><label>开始</label><span>{{ action.startTime }}s</span></div>
      <div><label>持续</label><span>{{ action.duration }}s</span></div>
      <div><label>冷却</label><span>{{ action.cooldown }}s</span></div>
      <div v-if="action.spCost"><label>技力消耗</label><span>{{ action.spCost }}</span></div>
      <div><label>技力获得</label><span>{{ action.gaugeGain }}</span></div>
      <div v-if="action.teamGaugeGain"><label>队伍技力</label><span>{{ action.teamGaugeGain }}</span></div>
    </div>

    <div class="dd-section">
      <div class="dd-section-title">伤害判定 ({{ action.damageTicks.length }} tick)</div>
      <el-table :data="action.damageTicks" border stripe size="small" @row-click="onTickClick">
        <el-table-column label="偏移" prop="offset" width="65" />
        <el-table-column label="失衡" prop="stagger" width="60" />
        <el-table-column label="技力" prop="sp" width="60" />
        <el-table-column label="伤害" width="80">
          <template #default="{ row }">
            <span v-if="row.hpDamage" style="color:#f56c6c;font-weight:600">{{ Math.round(row.hpDamage) }}</span>
            <span v-else style="color:#909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="绑定效果" min-width="100">
          <template #default="{ row }">
            <span v-if="!row.boundEffects || row.boundEffects.length === 0" style="color:#909399">无</span>
            <el-tag v-for="be in row.boundEffects" :key="be" size="small" style="margin:1px">{{ be }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="focusedTick !== null" class="dd-section">
      <div class="dd-section-title">Tick#{{ focusedTick + 1 }} 伤害拆解</div>

      <div class="damage-calc">
        <div class="calc-row"><span>攻击力</span><span class="val">{{ atk }}</span></div>
        <div class="calc-row"><span>倍率</span><span class="val">{{ (multiplier * 100).toFixed(1) }}%</span></div>
        <div class="calc-row calc-subtotal"><span>基础伤害</span><span class="val">{{ breakdown.baseDamage.toFixed(1) }}</span></div>

        <div class="calc-section-label">乘区拆解</div>
        <div v-for="(entry, catKey) in categoryBreakdown" :key="catKey" class="calc-row">
          <span class="calc-cat-label">{{ entry.label }}</span>
          <span class="val">{{ entry.multiplier.toFixed(3) }}x</span>
        </div>

        <div v-if="Object.keys(categoryBreakdown).length > 0" class="calc-row calc-subtotal">
          <span>乘区合计</span>
          <span class="val">{{ totalMult.toFixed(3) }}x</span>
        </div>

        <div class="calc-row"><span>暴击乘区</span><span class="val">{{ breakdown.critMult.toFixed(3) }}x</span></div>
        <div class="calc-row"><span>防御乘区</span><span class="val">{{ breakdown.defenseMult.toFixed(3) }}x</span></div>

        <div class="calc-row dd-final">
          <span>最终伤害</span><span class="val" style="color:#f56c6c">{{ breakdown.finalDamage.toFixed(1) }}</span>
        </div>
      </div>

      <div v-if="buffContributions.length > 0" class="buff-contrib-section">
        <div class="dd-section-title">Buff 贡献</div>
        <div v-for="bc in buffContributions" :key="bc.buffName" class="contrib-row">
          <span class="contrib-buff">{{ bc.buffName }}</span>
          <span class="contrib-cat">{{ bc.category }}</span>
          <span class="contrib-val">{{ (bc.value * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty-state" style="padding:40px 0">请点击时间轴中的一个操作查看详情</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TimelineAction } from '../../engine/types/timeline'
import type { Buff } from '../../engine/types/buff'
import { calcDamage, type DamageBreakdown } from '../../engine/formulas/damage'
import { calcDamageByCategories, DAMAGE_CATEGORIES, type CategoryBreakdown } from '../../engine/formulas/damageCategories'

const props = defineProps<{
  action: TimelineAction | null
  atk?: number
  multiplier?: number
  enemyDef?: number
  enemyRes?: number
  activeBuffs?: Buff[]
  charStats?: { str?: number; agi?: number; int?: number; wil?: number }
}>()

const focusedTick = ref<number | null>(null)

function onTickClick(row: any) {
  const idx = props.action?.damageTicks.indexOf(row) ?? -1
  focusedTick.value = focusedTick.value === idx ? null : idx
}

const typeLabel = (t: string) => ({ attack: '攻击', skill: '战技', link: '连携', ultimate: '终结技', execution: '处决' })[t] ?? t

const breakdown = computed<DamageBreakdown>(() => {
  return calcDamage({
    attack: props.atk ?? 1000,
    skillMultiplier: props.multiplier ?? 1,
    baseDamageFlat: 0,
    critRate: 0.05, critDamage: 1.3,
    damageBonus: 0.2, damageReduction: [],
    amplifyBonus: 0, weakenReduction: [], shelterValue: 0,
    fragileBonus: 0, vulnerableBonus: 0,
    defense: props.enemyDef ?? 50, isTrueDamage: false,
    isStaggered: false, staggerMultiplier: 1.3,
    resistance: props.enemyRes ?? 20, resistanceIgnore: 0,
    nonControlledReduction: 0,
    comboBonus: 0, specialMultiplier: 1,
  })
})

const categoryBreakdown = computed<Record<string, { label: string; multiplier: number }>>(() => {
  if (!props.action) return {}
  const act = props.action
  const baseDamage = (props.atk ?? 1000) * (props.multiplier ?? 1)
  const context = {
    skillType: act.type,
    element: act.element,
    statTotals: {
      strength: props.charStats?.str ?? 0,
      agility: props.charStats?.agi ?? 0,
      intellect: props.charStats?.int ?? 0,
      will: props.charStats?.wil ?? 0,
    },
  }
  const result = calcDamageByCategories(baseDamage, props.activeBuffs ?? [], DAMAGE_CATEGORIES, context)
  const map: Record<string, { label: string; multiplier: number }> = {}
  for (const [key, entry] of Object.entries(result.breakdown)) {
    if (entry.multiplier !== 1) {
      map[key] = { label: entry.label, multiplier: entry.multiplier }
    }
  }
  return map
})

const totalMult = computed(() => {
  let m = 1
  for (const entry of Object.values(categoryBreakdown.value)) {
    m *= entry.multiplier
  }
  return m
})

const buffContributions = computed<{ buffName: string; category: string; value: number }[]>(() => {
  if (!props.action) return []
  const act = props.action
  const baseDamage = (props.atk ?? 1000) * (props.multiplier ?? 1)
  const result = calcDamageByCategories(baseDamage, props.activeBuffs ?? [], DAMAGE_CATEGORIES, {
    skillType: act.type,
    element: act.element,
  })
  const contribs: { buffName: string; category: string; value: number }[] = []
  for (const entry of Object.values(result.breakdown)) {
    for (const c of entry.contributions) {
      contribs.push({ buffName: c.buffName, category: entry.label, value: c.value })
    }
  }
  return contribs
})
</script>

<style scoped>
.damage-detail { padding: 4px 0; font-size: 12px; }
.dd-header { margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.dd-title { font-weight: 600; font-size: 14px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; margin-bottom: 8px; }
.info-grid div { display: flex; flex-direction: column; background: #f5f7fa; padding: 4px 6px; border-radius: 4px; }
.info-grid label { font-size: 10px; color: #909399; }
.info-grid span { font-size: 12px; font-weight: 600; }
.dd-section { margin-bottom: 8px; }
.dd-section-title { font-weight: 600; font-size: 12px; color: #303133; margin-bottom: 4px; }
.damage-calc { background: #f5f7fa; border-radius: 6px; padding: 6px 10px; }
.calc-row { display: flex; justify-content: space-between; padding: 1px 0; font-size: 12px; }
.calc-row .val { font-weight: 500; color: #303133; }
.calc-section-label { font-size: 11px; color: #909399; font-weight: 600; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #e4e7ed; }
.calc-cat-label { color: #606266; }
.calc-subtotal { border-top: 1px dashed #e4e7ed; padding-top: 2px; margin-top: 2px; font-weight: 500; }
.dd-final { font-weight: 700; border-top: 1px solid #e4e7ed; padding-top: 4px; margin-top: 4px; }
.buff-contrib-section { margin-top: 6px; }
.contrib-row { display: flex; align-items: center; gap: 8px; padding: 2px 8px; background: #f5f7fa; margin: 1px 0; border-radius: 4px; }
.contrib-buff { flex: 1; font-size: 12px; }
.contrib-cat { font-size: 11px; color: #909399; width: 40px; }
.contrib-val { font-size: 12px; font-weight: 600; width: 60px; text-align: right; }
.empty-state { color: #909399; font-size: 13px; text-align: center; }
</style>
