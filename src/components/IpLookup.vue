<script setup lang="ts">
import { ref } from 'vue'
import type { IpRow as IpRowType } from '@/types'
import IpRow from './IpRow.vue'

let nextId = 1

const createRow = (): IpRowType => ({
  id: nextId++,
  ip: '',
  status: 'idle',
  result: null,
  error: null,
})

const rows = ref<IpRowType[]>([createRow()])

const addRow = () => {
  rows.value.push(createRow())
}

const updateRow = (updated: IpRowType) => {
  const idx = rows.value.findIndex((r) => r.id === updated.id)
  if (idx !== -1) {
    rows.value[idx] = updated
  }
}

const removeRow = (id: number) => {
  if (rows.value.length <= 1) return
  rows.value = rows.value.filter((r) => r.id !== id)
}
</script>

<template>
  <div class="ip-lookup">
    <header class="ip-lookup__header">
      <div class="ip-lookup__title-group">
        <h1 class="ip-lookup__title">IP Lookup</h1>
        <p class="ip-lookup__subtitle">
          Enter one or more IP addresses to get their location
        </p>
      </div>
    </header>

    <TransitionGroup name="list" tag="div" class="ip-lookup__rows">
      <IpRow
        v-for="(row, index) in rows"
        :key="row.id"
        :row="row"
        :label="`IP #${index + 1}`"
        @update="updateRow"
        @remove="removeRow"
      />
    </TransitionGroup>

    <button class="ip-lookup__add" @click="addRow">
      <span class="ip-lookup__add-icon">+</span>
      Add IP Address
    </button>
  </div>
</template>

<style scoped>
.ip-lookup {
  max-width: 560px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

.ip-lookup__header {
  margin-bottom: 32px;
}

.ip-lookup__title-group {
  text-align: center;
}

.ip-lookup__title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 6px;
}

.ip-lookup__subtitle {
  padding-top: 10px;
  font-size: 0.95rem;
  color: #718096;
  margin: 0;
}

.ip-lookup__rows {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.ip-lookup__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  font-size: 0.92rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #667eea;
  background: #ebf4ff;
  border: 2px dashed #667eea;
  border-radius: 12px;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.1s;
}

.ip-lookup__add:hover {
  background: #d6e4ff;
}

.ip-lookup__add:active {
  transform: scale(0.98);
}

.ip-lookup__add-icon {
  font-size: 1.2rem;
  font-weight: 700;
}

.list-enter-active {
  transition:
    opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.list-leave-active {
  transition:
    opacity 0.25s cubic-bezier(0.4, 0, 1, 1),
    transform 0.25s cubic-bezier(0.4, 0, 1, 1);
  position: absolute;
  left: 0;
  right: 0;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.97);
}

.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.list-move {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
