<template>
  <div>
    <el-card>
      <div style="margin-bottom:15px">
        <el-button type="primary" @click="$router.push('/team/new')">新建配队</el-button>
        <el-button @click="exportAll">导出所有配队</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading" style="width:100%" :max-height="'calc(100vh - 220px)'">
        <el-table-column type="index" label="#" width="50" fixed="left" />
        <el-table-column prop="name" label="配队名称" min-width="130" show-overflow-tooltip fixed="left" />
        <el-table-column label="角色A" width="160">
          <template #default="{ row }">
            <span v-if="charInfo(row.charAId)">
              <el-tag size="small" style="margin-right:4px">{{ charInfo(row.charAId)!.rarity }}★</el-tag>
              {{ charInfo(row.charAId)!.name }}
              <el-tag size="small" type="info">{{ mapProfession(charInfo(row.charAId)!.profession) }}</el-tag>
            </span>
            <span v-else style="color:#909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="角色B" width="160">
          <template #default="{ row }">
            <span v-if="charInfo(row.charBId)">
              <el-tag size="small" style="margin-right:4px">{{ charInfo(row.charBId)!.rarity }}★</el-tag>
              {{ charInfo(row.charBId)!.name }}
              <el-tag size="small" type="info">{{ mapProfession(charInfo(row.charBId)!.profession) }}</el-tag>
            </span>
            <span v-else style="color:#909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="角色C" width="160">
          <template #default="{ row }">
            <span v-if="charInfo(row.charCId)">
              <el-tag size="small" style="margin-right:4px">{{ charInfo(row.charCId)!.rarity }}★</el-tag>
              {{ charInfo(row.charCId)!.name }}
              <el-tag size="small" type="info">{{ mapProfession(charInfo(row.charCId)!.profession) }}</el-tag>
            </span>
            <span v-else style="color:#909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="角色D" width="160">
          <template #default="{ row }">
            <span v-if="charInfo(row.charDId)">
              <el-tag size="small" style="margin-right:4px">{{ charInfo(row.charDId)!.rarity }}★</el-tag>
              {{ charInfo(row.charDId)!.name }}
              <el-tag size="small" type="info">{{ mapProfession(charInfo(row.charDId)!.profession) }}</el-tag>
            </span>
            <span v-else style="color:#909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="配装" width="70">
          <template #default="{ row }">
            <el-tag :type="buildStatus(row).type" size="small">{{ buildStatus(row).text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" class-name="col-ops">
          <template #default="{ row }">
            <el-button size="small" type="info" @click="$router.push('/team/'+row.id)">编辑</el-button>
            <el-button size="small" type="success" @click="goTimeline(row)">排轴</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { TeamApi, CharacterApi } from '../../api'
import type { Character } from '../../api'
import { mapProfession } from '../../utils/constants'
import { exportTeams } from '../../utils/exportExcel'

const router = useRouter()
const list = ref<any[]>([])
const chars = ref<Character[]>([])
const loading = ref(false)

function charInfo(id: string | undefined) {
  if (!id) return null
  return chars.value.find(ch => ch.id === id) || null
}

function buildStatus(row: any) {
  let n = 0
  if (row.buildAId) n++
  if (row.buildBId) n++
  if (row.buildCId) n++
  if (row.buildDId) n++
  if (n === 4) return { text: n + '/4', type: 'success' as const }
  if (n > 0) return { text: n + '/4', type: 'warning' as const }
  return { text: '0/4', type: 'info' as const }
}

function exportAll() {
  const charMap: Record<string, string> = {}
  for (const c of chars.value) charMap[c.id] = c.name
  exportTeams(list.value, charMap)
  ElMessage.success('已导出')
}

function goTimeline(row: any) {
  router.push(`/timeline?teamId=${row.id}`)
}

async function load() {
  loading.value = true
  chars.value = await CharacterApi.listAll()
  list.value = await TeamApi.list()
  loading.value = false
}

async function del(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除配队「${row.name}」？`, '删除确认', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    await TeamApi.delete(row.id)
    ElMessage.success('已删除'); load()
  } catch { /* cancelled or failed */ }
}
onMounted(load)
</script>

<style>
.el-table .col-ops .cell { white-space: nowrap; overflow: visible; text-overflow: clip; }
.col-ops { text-align: right; }
</style>
