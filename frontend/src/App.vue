<template>
  <div id="app">
    <el-container style="height: 100vh; overflow: hidden">
      <el-aside width="220px" class="fixed-sidebar">
        <div class="sidebar-header">终末地数据编辑器</div>
        <el-menu
          router
          :default-active="$route.path"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          style="border: none"
        >
          <el-menu-item index="/"><span style="margin-right:6px">📊</span>仪表盘</el-menu-item>
          <el-menu-item index="/characters"><span style="margin-right:6px">👤</span>角色管理</el-menu-item>
          <el-menu-item index="/weapons"><span style="margin-right:6px">⚔️</span>武器管理</el-menu-item>
          <el-menu-item index="/equipment"><span style="margin-right:6px">🛡️</span>装备管理</el-menu-item>
          <el-menu-item index="/gains"><span style="margin-right:6px">✨</span>增益管理</el-menu-item>
          <el-menu-item index="/skills"><span style="margin-right:6px">📖</span>技能管理</el-menu-item>
          <el-menu-item index="/enemies"><span style="margin-right:6px">👾</span>敌人管理</el-menu-item>
          <el-menu-item index="/builds"><span style="margin-right:6px">📋</span>配装方案</el-menu-item>
          <el-menu-item index="/teams"><span style="margin-right:6px">👥</span>配队管理</el-menu-item>
          <el-menu-item index="/timeline"><span style="margin-right:6px">⏱️</span>排轴模拟</el-menu-item>
          <el-menu-item index="/damage"><span style="margin-right:6px">📊</span>排轴伤害</el-menu-item>
        </el-menu>
      </el-aside>
      <el-container style="margin-left:220px;overflow:hidden">
        <el-main style="background: #f5f7fa; padding-top: 0; overflow-y: auto">
          <div class="page-header">{{ pageTitle }}</div>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const pageTitle = computed(() => route.meta?.title || route.name || '')
</script>

<style>
html, body { height:100%; margin:0; overflow:hidden; }
.fixed-sidebar { position: fixed; left: 0; top: 0; height: 100vh; z-index: 100; overflow-y: auto; display: flex; flex-direction: column; }
.sidebar-header { color: #fff; font-size: 15px; font-weight: 700; padding: 18px 16px 12px; text-align: center; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.1); background: #263445; }
.fixed-sidebar .el-menu { flex: 1; overflow-y: auto; }
.page-header { font-size: 17px; font-weight: 600; padding: 16px 0 12px; color: #303133; border-bottom: 1px solid #e4e7ed; margin-bottom: 16px; }
</style>
