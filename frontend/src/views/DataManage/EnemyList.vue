<template>
  <div>
    <el-card>
      <div style="margin-bottom: 15px">
        <el-button type="primary" @click="openCreate">新建敌人</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading" style="width:100%" :max-height="'calc(100vh - 220px)'">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="name" label="名称" min-width="100" />
        <el-table-column prop="tier" label="等级" width="70">
          <template #default="{ row }">
            <el-tag :type="row.tier === 'boss' ? 'danger' : row.tier === 'elite' ? 'warning' : 'info'" size="small">{{ { normal: '普通', elite: '精英', boss: 'Boss' }[row.tier] || row.tier || '--' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="类型" width="80" />
        <el-table-column prop="maxStagger" label="失衡上限" width="80" />
        <el-table-column prop="staggerNodeCount" label="失衡节点" width="80" />
        <el-table-column prop="staggerNodeDuration" label="节点时长" width="80">
          <template #default="{ row }">{{ row.staggerNodeDuration ?? '-' }}s</template>
        </el-table-column>
        <el-table-column prop="staggerBreakDuration" label="击破时长" width="80">
          <template #default="{ row }">{{ row.staggerBreakDuration ?? '-' }}s</template>
        </el-table-column>
        <el-table-column prop="executionRecovery" label="处决回复" width="80">
          <template #default="{ row }">{{ row.executionRecovery ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="edit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑敌人' : '新建敌人'" width="520px">
      <el-form :model="form" label-width="110px">
        <el-form-item label="ID"><el-input v-model="form.id" :disabled="!!editing" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <el-form-item label="等级">
            <el-select v-model="form.tier" style="width:100%">
              <el-option label="普通" value="normal" />
              <el-option label="精英" value="elite" />
              <el-option label="Boss" value="boss" />
            </el-select>
          </el-form-item>
          <el-form-item label="类型"><el-input v-model="form.category" /></el-form-item>
          <el-form-item label="失衡上限"><el-input-number v-model="form.maxStagger" :min="10" :step="10" style="width:100%" /></el-form-item>
          <el-form-item label="失衡节点"><el-input-number v-model="form.staggerNodeCount" :min="0" :max="10" style="width:100%" /></el-form-item>
          <el-form-item label="节点时长(秒)"><el-input-number v-model="form.staggerNodeDuration" :min="0" :step="0.5" style="width:100%" /></el-form-item>
          <el-form-item label="击破时长(秒)"><el-input-number v-model="form.staggerBreakDuration" :min="0" :step="0.5" style="width:100%" /></el-form-item>
          <el-form-item label="处决回复"><el-input-number v-model="form.executionRecovery" :min="0" style="width:100%" /></el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { EnemyApi } from '../../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editing = ref<any>(null)
const form = ref<any>({ maxStagger: 100, staggerNodeCount: 1 })

async function load() { loading.value = true; list.value = await EnemyApi.listAll(); loading.value = false }

function openCreate() { editing.value = null; form.value = { maxStagger: 100, staggerNodeCount: 1 }; dialogVisible.value = true }
function edit(row: any) { editing.value = row; form.value = { ...row }; dialogVisible.value = true }

async function del(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除敌人「${row.name}」？`, '删除确认')
    await EnemyApi.delete(row.id); ElMessage.success('已删除'); load()
  } catch { /* cancelled */ }
}

async function save() {
  if (editing.value) await EnemyApi.save(form.value)
  else await EnemyApi.save(form.value)
  dialogVisible.value = false; editing.value = null; load()
}

onMounted(load)
</script>
