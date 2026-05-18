<template>
  <div>
    <el-card>
      <div style="margin-bottom: 15px">
        <el-button type="primary" @click="dialogVisible = true">新建装备</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="150" />
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="slot" label="部位" width="80" />
        <el-table-column prop="level" label="等级" width="60" />
        <el-table-column prop="setName" label="套装" width="120" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="edit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑装备' : '新建装备'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="ID"><el-input v-model="form.id" :disabled="!!editing" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="部位"><el-input v-model="form.slot" /></el-form-item>
        <el-form-item label="套装"><el-input v-model="form.setName" /></el-form-item>
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
import api from '../../api'

const list = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editing = ref<any>(null)
const form = ref<any>({})

async function load() { loading.value = true; list.value = (await api.get('/equipment')).data; loading.value = false }
function edit(row: any) { editing.value = row; form.value = { ...row }; dialogVisible.value = true }
function del(row: any) { api.delete(`/equipment/${row.id}`).then(load) }
async function save() {
  if (editing.value) await api.put(`/equipment/${form.value.id}`, form.value)
  else await api.post('/equipment', form.value)
  dialogVisible.value = false; editing.value = null; form.value = {}; load()
}
onMounted(load)
</script>
