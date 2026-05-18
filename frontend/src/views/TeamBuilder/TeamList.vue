<template>
  <div>
    <el-card>
      <div style="margin-bottom:15px">
        <el-button type="primary" @click="$router.push('/team/new')">新建配队</el-button>
        <el-button @click="exportAll">导出所有配队</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="180" />
        <el-table-column prop="name" label="配队名称" width="150" />
        <el-table-column label="角色A" width="120">
          <template #default="{ row }">{{ charName(row.charAId) }}</template>
        </el-table-column>
        <el-table-column label="角色B" width="120">
          <template #default="{ row }">{{ charName(row.charBId) }}</template>
        </el-table-column>
        <el-table-column label="角色C" width="120">
          <template #default="{ row }">{{ charName(row.charCId) }}</template>
        </el-table-column>
        <el-table-column label="角色D" width="120">
          <template #default="{ row }">{{ charName(row.charDId) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push('/team/'+row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { TeamApi, CharacterApi } from '../../api'
import type { Character } from '../../api'
import { exportTeams } from '../../utils/exportExcel'

const list = ref<any[]>([])
const chars = ref<Character[]>([])
const loading = ref(false)

function charName(id: string | undefined) {
  if (!id) return '-'
  const c = chars.value.find(ch => ch.id === id)
  return c ? c.name : id
}

function exportAll() {
  const charMap: Record<string, string> = {}
  for (const c of chars.value) charMap[c.id] = c.name
  exportTeams(list.value, charMap)
  ElMessage.success('已导出')
}

async function load() {
  loading.value = true
  chars.value = await CharacterApi.list()
  list.value = await TeamApi.list()
  loading.value = false
}
function del(row: any) { TeamApi.delete(row.id).then(load).then(() => ElMessage.success('已删除')) }
onMounted(load)
</script>
