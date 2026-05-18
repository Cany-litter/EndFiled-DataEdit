<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in cards" :key="card.label">
        <el-card :body-style="{textAlign:'center', padding:'20px'}" shadow="hover">
          <div style="font-size:32px;font-weight:700;color:#409eff">{{ card.count }}</div>
          <div style="margin-top:8px;color:#909399;font-size:14px">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top:16px">
      <template #header><span>项目快速入口</span></template>
      <el-row :gutter="12">
        <el-col :span="6" v-for="item in quickLinks" :key="item.path">
          <el-card :body-style="{padding:'16px',cursor:'pointer'}" shadow="hover" @click="$router.push(item.path)">
            <div style="font-size:24px;margin-bottom:8px">{{ item.icon }}</div>
            <div style="font-weight:600">{{ item.label }}</div>
            <div style="font-size:12px;color:#909399;margin-top:4px">{{ item.desc }}</div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-card style="margin-top:16px">
      <template #header><span>项目状态</span></template>
      <el-table :data="statusRows" border stripe size="small">
        <el-table-column prop="phase" label="阶段" width="100" />
        <el-table-column prop="feature" label="功能" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '✅' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api'

const cards = ref([
  { label: '角色', count: 0 },
  { label: '武器', count: 0 },
  { label: '装备', count: 0 },
  { label: '配装方案', count: 0 },
])

const quickLinks = [
  { path: '/characters', icon: '👤', label: '角色管理', desc: '查看和管理所有角色数据' },
  { path: '/weapons', icon: '⚔️', label: '武器管理', desc: '查看和管理武器数据' },
  { path: '/equipment', icon: '🛡️', label: '装备管理', desc: '查看和管理装备数据' },
  { path: '/skills', icon: '✨', label: '技能管理', desc: '查看技能倍率数据' },
  { path: '/builds', icon: '📋', label: '配装方案', desc: '管理已保存的配装方案' },
  { path: '/loadout', icon: '🔧', label: '配装编辑器', desc: '创建新的配装方案' },
  { path: '/teams', icon: '👥', label: '配队管理', desc: '管理四人配队' },
  { path: '/simulator', icon: '📊', label: '排轴模拟', desc: '单角色DPS模拟' },
]

const statusRows = [
  { phase: 'P0', feature: '前后端脚手架 + 数据库 + CRUD API + 基础页面', status: '✅' },
  { phase: 'P1', feature: '数据管理 + 配装编辑器 + 公式引擎 + 配队 + Excel 导出', status: '✅' },
  { phase: 'P2', feature: '排轴模拟引擎 + 战斗参数配置 + 多目标 + 配队排轴', status: '✅' },
  { phase: '测试', feature: '63 条单元测试覆盖公式引擎', status: '✅' },
]

onMounted(async () => {
  try {
    const chars: any[] = await api.get('/characters').then(r => r.data)
    const weapons: any[] = await api.get('/weapons').then(r => r.data)
    const equip: any[] = await api.get('/equipment').then(r => r.data)
    const builds: any[] = await api.get('/builds').then(r => r.data)
    cards.value = [
      { label: '角色', count: chars.length },
      { label: '武器', count: weapons.length },
      { label: '装备', count: equip.length },
      { label: '配装方案', count: builds.length },
    ]
  } catch {}
})
</script>
