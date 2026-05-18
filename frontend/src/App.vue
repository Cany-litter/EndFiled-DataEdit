<template>
  <div id="app">
    <el-container style="min-height: 100vh">
      <el-aside width="220px" style="background: #304156">
        <el-menu
          router
          :default-active="$route.path"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          style="border: none"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/characters">角色管理</el-menu-item>
          <el-menu-item index="/weapons">武器管理</el-menu-item>
          <el-menu-item index="/equipment">装备管理</el-menu-item>
          <el-menu-item index="/gains">增益管理</el-menu-item>
          <el-menu-item index="/skills">技能管理</el-menu-item>
          <el-menu-item index="/builds">配装方案</el-menu-item>
          <el-menu-item index="/teams">配队管理</el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header style="background: #fff; border-bottom: 1px solid #eee; line-height: 60px">
          <h2 style="margin: 0; font-size: 18px">终末地数据编辑器</h2>
        </el-header>
        <el-main style="background: #f5f7fa">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
