<template>
  <div>
    <div v-if="!result" style="color:#909399;font-size:13px;text-align:center;padding:20px 0">点击"计算 DPS"查看统计</div>
    <template v-if="result">
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <el-tag size="small" type="danger">团队 DPS: {{ result.teamDps.toFixed(1) }}</el-tag>
        <el-tag size="small">总伤害: {{ result.teamTotalDamage.toFixed(0) }}</el-tag>
        <el-tag size="small" type="warning">总施放: {{ totalCasts }}</el-tag>
        <el-tag size="small" type="success" v-if="result.totalDamage">演算伤害: {{ result.totalDamage.toFixed(0) }}</el-tag>
      </div>

      <div v-if="result.damageCurve && result.damageCurve.length > 0" style="margin-bottom:8px">
        <div style="font-size:12px;font-weight:600;color:#606266;margin-bottom:4px">伤害累计曲线</div>
        <div ref="chartRef" style="height:80px;width:100%"></div>
      </div>

      <el-table :data="memberRows" border stripe size="small" max-height="140">
        <el-table-column prop="name" label="成员" width="80" />
        <el-table-column prop="totalDamage" label="总伤害" width="110">
          <template #default="{ row }">{{ row.totalDamage.toFixed(0) }}</template>
        </el-table-column>
        <el-table-column prop="dps" label="DPS" width="80">
          <template #default="{ row }">{{ row.dps.toFixed(1) }}</template>
        </el-table-column>
        <el-table-column prop="pct" label="占比" width="60">
          <template #default="{ row }">{{ (row.pct * 100).toFixed(1) }}%</template>
        </el-table-column>
        <el-table-column prop="casts" label="施放" width="55" />
      </el-table>

      <div v-if="result.memberDamage" style="margin-top:8px">
        <div style="font-size:12px;font-weight:600;color:#606266;margin-bottom:4px">技能伤害明细</div>
        <div v-for="(md, charId) in result.memberDamage" :key="charId" style="margin-bottom:4px">
          <div style="font-size:11px;font-weight:500;color:#303133;margin-bottom:2px">{{ charNameMap?.[charId] || charId }}</div>
          <div v-for="(sd, skillName) in md.skillBreakdown" :key="skillName" style="display:flex;font-size:11px;padding:1px 8px;background:#f5f7fa;margin:1px 0;border-radius:3px">
            <span style="flex:1">{{ skillName }}</span>
            <span style="width:60px;text-align:right">{{ sd.count }} 次</span>
            <span style="width:100px;text-align:right;font-weight:500">{{ sd.total.toFixed(0) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { Track, SystemConstants } from '../../engine/types/timeline'
import { runTimelineSimulation, runTimelineSimulationWithDamage, type DamageSimConfig } from '../../engine/simulation/timeSimEngine'
import type { TeamSimulationResult } from '../../engine/simulation/types'
import * as echarts from 'echarts'

const props = defineProps<{
  tracks: Track[]
  systemConstants: SystemConstants
  charNameMap?: Record<string, string>
  damageConfig?: DamageSimConfig
}>()

const result = ref<any>(null)
const chartRef = ref<HTMLDivElement | null>(null)

let chart: echarts.ECharts | null = null

defineExpose({
  runCalc: () => {
    if (props.damageConfig) {
      const simResult = runTimelineSimulationWithDamage(
        props.tracks,
        props.systemConstants,
        props.damageConfig,
      )
      result.value = simResult
    } else {
      const simResult = runTimelineSimulation(props.tracks, props.systemConstants)
      const memberResults = props.tracks.map(track => {
        const charEvents = simResult.events.filter(e => e.charId === track.id)
        const totalDamage = charEvents.filter(e => e.type === 'damage_tick').reduce((s, e) => s + (e.value ?? 0), 0)
        const totalCasts = charEvents.filter(e => e.type === 'action_start').length
        const maxTime = simResult.curves.length > 0 ? simResult.curves[simResult.curves.length - 1].time : 30
        const skillBreakdown: Record<string, { count: number; totalDamage: number }> = {}
        for (const ev of charEvents) {
          if (ev.type === 'damage_tick' && ev.actionName) {
            if (!skillBreakdown[ev.actionName]) skillBreakdown[ev.actionName] = { count: 0, totalDamage: 0 }
            skillBreakdown[ev.actionName].count++
            skillBreakdown[ev.actionName].totalDamage += ev.value ?? 0
          }
        }
        const name = props.charNameMap?.[track.id] ?? track.id
        return { name, totalDamage, dps: totalDamage / maxTime, totalCasts, skillBreakdown }
      })
      const teamTotal = memberResults.reduce((s, m) => s + m.totalDamage, 0)
      const maxTime = simResult.curves.length > 0 ? simResult.curves[simResult.curves.length - 1].time : 30
      result.value = { members: memberResults, teamTotalDamage: teamTotal, teamDps: teamTotal / maxTime }
    }

    nextTick(() => renderChart())
  },
})

const totalCasts = computed(() => {
  if (!result.value) return 0
  if (result.value.members) {
    return result.value.members.reduce((s: number, m: any) => s + m.totalCasts, 0)
  }
  return 0
})

const memberRows = computed(() => {
  if (!result.value) return []
  if (result.value.members) {
    const total = result.value.teamTotalDamage
    return result.value.members.map((m: any) => ({
      name: m.name,
      totalDamage: m.totalDamage,
      dps: m.dps,
      pct: m.totalDamage / total,
      casts: m.totalCasts,
    }))
  }
  return []
})

function renderChart() {
  if (!chartRef.value || !result.value?.damageCurve) return
  if (!chart) chart = echarts.init(chartRef.value)
  const data = result.value.damageCurve
  chart.setOption({
    grid: { left: 40, right: 10, top: 8, bottom: 16 },
    xAxis: { type: 'value', axisLabel: { fontSize: 9 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 9 } },
    series: [{
      type: 'line',
      data: data.map((p: any) => [p.time, p.damage]),
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: '#f56c6c' },
      areaStyle: { color: 'rgba(245,108,108,0.15)' },
    }],
    tooltip: { trigger: 'axis' },
  })
}

// Resize on window resize
watch(() => result.value, () => {
  nextTick(() => renderChart())
})
</script>
