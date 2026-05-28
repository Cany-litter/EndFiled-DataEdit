<template>
  <el-dialog v-model="visible" title="编辑动作" width="500px" @close="onClose">
    <el-form label-position="top" size="small" v-if="local">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <el-form-item label="名称">
          <el-input v-model="local.name" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="local.type">
            <el-option label="普攻" value="attack" />
            <el-option label="战技" value="skill" />
            <el-option label="连携" value="link" />
            <el-option label="终结" value="ultimate" />
            <el-option label="处决" value="execution" />
          </el-select>
        </el-form-item>
        <el-form-item label="持续(秒)">
          <el-input-number v-model="local.duration" :min="0.1" :step="0.1" style="width:100%" />
        </el-form-item>
        <el-form-item label="冷却(秒)">
          <el-input-number v-model="local.cooldown" :min="0" :step="0.5" style="width:100%" />
        </el-form-item>
        <el-form-item label="开始时间(秒)">
          <el-input-number v-model="local.startTime" :min="0" :step="0.1" style="width:100%" />
        </el-form-item>
        <el-form-item label="元素">
          <el-select v-model="local.element">
            <el-option label="物理" value="physical" />
            <el-option label="烈焰" value="blaze" />
            <el-option label="电磁" value="emag" />
            <el-option label="霜寒" value="cold" />
            <el-option label="自然" value="nature" />
          </el-select>
        </el-form-item>
        <el-form-item label="SP消耗">
          <el-input-number v-model="local.spCost" :min="0" :step="10" style="width:100%" />
        </el-form-item>
        <el-form-item label="技力消耗">
          <el-input-number v-model="local.gaugeCost" :min="0" :step="10" style="width:100%" />
        </el-form-item>
      </div>

      <el-divider />
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:600;font-size:13px">伤害判定点</span>
        <el-button size="small" type="primary" @click="addTick">+ 添加</el-button>
      </div>
      <div v-for="(tick, ti) in local.damageTicks" :key="ti" style="display:flex;gap:6px;align-items:center;margin-top:6px">
        <el-input-number v-model="tick.offset" :min="0" :step="0.1" size="small" style="width:100px" controls-position="right" />
        <el-input-number v-model="tick.stagger" :min="0" :step="5" size="small" style="width:100px" controls-position="right" />
        <el-input-number v-model="tick.sp" :min="-50" :max="50" size="small" style="width:90px" controls-position="right" />
        <el-button size="small" type="danger" @click="removeTick(ti)">×</el-button>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onSave">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { TimelineAction, DamageTick } from '../../engine/types/timeline'

const props = defineProps<{ action: TimelineAction | null }>()
const emit = defineEmits<{ save: [patch: Partial<TimelineAction>] }>()

const visible = ref(false)
const local = ref<Partial<TimelineAction> | null>(null)

watch(() => props.action, (a) => {
  if (a) {
    local.value = JSON.parse(JSON.stringify(a))
    visible.value = true
  } else {
    visible.value = false
  }
})

function addTick() {
  if (!local.value) return
  local.value.damageTicks.push({ offset: 0, stagger: 0, sp: 0, boundEffects: [] })
}

function removeTick(index: number) {
  if (!local.value) return
  local.value.damageTicks.splice(index, 1)
}

function onSave() {
  if (!local.value) return
  emit('save', local.value)
  visible.value = false
}

function onClose() {
  visible.value = false
}
</script>
