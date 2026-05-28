<template>
  <div>
    <div v-if="!result" style="color:#909399;font-size:13px;text-align:center;padding:20px 0">点击"运行模拟"查看曲线</div>
    <div v-if="result" style="display:flex;flex-direction:column;gap:6px">
      <div ref="chartRef" style="width:100%;height:180px"></div>
      <div style="display:flex;gap:8px;font-size:12px;flex-wrap:wrap">
        <el-tag size="small">失衡伤害: {{ result.totalStaggerDamage.toFixed(1) }}</el-tag>
        <el-tag size="small" type="warning">技力消耗: {{ result.totalSpUsed.toFixed(1) }}</el-tag>
        <el-tag size="small" type="success">技力获取: {{ result.totalGaugeGained.toFixed(1) }}</el-tag>
        <el-tag size="small" type="info">事件: {{ result.events.length }}</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { Track, SystemConstants } from '../../engine/types/timeline'
import { runTimelineSimulation, type SimResult } from '../../engine/simulation/timeSimEngine'

const props = defineProps<{ tracks: Track[]; systemConstants: SystemConstants }>()
const chartRef = ref<HTMLDivElement | null>(null)
const result = ref<SimResult | null>(null)
let chart: echarts.ECharts | null = null
let resizeObs: ResizeObserver | null = null

defineExpose({ runSim: () => { const r = runTimelineSimulation(props.tracks, props.systemConstants); result.value = r; nextTick(() => renderChart(r)) } })

function renderChart(r: SimResult) {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  const times = r.curves.map(c => c.time.toFixed(1))
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['技力', '终结技能量', '失衡值'], top: 0, textStyle: { fontSize: 11 } },
    grid: { left: 36, right: 36, top: 26, bottom: 16 },
    xAxis: { type: 'category', data: times, axisLabel: { fontSize: 10 } },
    yAxis: [
      { type: 'value', name: '技力/终结技能量', nameTextStyle: { fontSize: 10 }, splitLine: { lineStyle: { type: 'dashed' } } },
      { type: 'value', name: '失衡', nameTextStyle: { fontSize: 10 }, splitLine: { show: false } },
    ],
    series: [
      { name: '技力', type: 'line', data: r.curves.map(c => c.sp), smooth: true, lineStyle: { width: 2, color: '#ffd700' }, itemStyle: { color: '#ffd700' }, areaStyle: { color: 'rgba(255,215,0,0.1)' } },
      { name: '终结技能量', type: 'line', data: r.curves.map(c => c.gauge), smooth: true, lineStyle: { width: 2, color: '#409eff' }, itemStyle: { color: '#409eff' }, areaStyle: { color: 'rgba(64,158,255,0.1)' } },
      { name: '失衡值', type: 'line', yAxisIndex: 1, data: r.curves.map(c => c.stagger), smooth: true, lineStyle: { width: 2, color: '#f56c6c' }, itemStyle: { color: '#f56c6c' }, areaStyle: { color: 'rgba(245,108,108,0.1)' } },
    ],
  })
}

onMounted(() => {
  if (chartRef.value) {
    resizeObs = new ResizeObserver(() => chart?.resize())
    resizeObs.observe(chartRef.value)
  }
})

onUnmounted(() => {
  resizeObs?.disconnect()
  chart?.dispose()
})
</script>
