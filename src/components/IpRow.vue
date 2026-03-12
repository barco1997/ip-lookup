<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import type { IpRow } from '@/types'
import { lookupIp } from '@/services/ipService'
import { getValidationError } from '@/utils/validation'
import { getTimeInTimezone } from '@/utils/time'

const props = defineProps<{
  row: IpRow
  label: string
}>()

const emit = defineEmits<{
  update: [row: IpRow]
  remove: [id: number]
}>()

const inputValue = ref(props.row.ip)
const validationError = ref<string | null>(null)
const localTime = ref('')

let timerHandle: ReturnType<typeof setInterval> | null = null
let abortController: AbortController | null = null

const isSearching = computed(() => props.row.status === 'searching')
const hasResult = computed(
  () => props.row.status === 'success' && props.row.result,
)
const hasError = computed(() => props.row.status === 'error')

const locationText = computed(() => {
  if (!props.row.result) return ''
  return props.row.result.country
})

const flagClass = computed(() => {
  const code = props.row.result?.countryCode
  if (!code || code.length !== 2) return ''
  return `fi fi-${code.toLowerCase()}`
})

const startClock = (timezone: string) => {
  stopClock()
  localTime.value = getTimeInTimezone(timezone)
  timerHandle = setInterval(() => {
    localTime.value = getTimeInTimezone(timezone)
  }, 1000)
}

const stopClock = () => {
  if (timerHandle) {
    clearInterval(timerHandle)
    timerHandle = null
  }
}

watch(
  () => props.row.result?.timezone,
  (tz) => {
    if (tz) startClock(tz)
    else stopClock()
  },
  { immediate: true },
)

const handleSearch = async () => {
  const error = getValidationError(inputValue.value)
  if (error) {
    validationError.value = error
    return
  }
  validationError.value = null

  if (abortController) abortController.abort()
  abortController = new AbortController()

  emit('update', {
    ...props.row,
    ip: inputValue.value.trim(),
    status: 'searching',
    result: null,
    error: null,
  })

  try {
    const result = await lookupIp(inputValue.value, abortController.signal)
    emit('update', {
      ...props.row,
      ip: inputValue.value.trim(),
      status: 'success',
      result,
      error: null,
    })
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') return
    const message = err instanceof Error ? err.message : 'Unknown error'
    emit('update', {
      ...props.row,
      ip: inputValue.value.trim(),
      status: 'error',
      result: null,
      error: message,
    })
  }
}

const handleBlur = () => {
  if (
    inputValue.value.trim() &&
    inputValue.value.trim() !== props.row.result?.query
  ) {
    handleSearch()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    ;(e.target as HTMLInputElement).blur()
  }
}

onUnmounted(() => {
  stopClock()
  if (abortController) abortController.abort()
})
</script>

<template>
  <div class="ip-row" :class="{ 'ip-row--error': hasError }">
    <div class="ip-row__header">
      <span class="ip-row__label">{{ label }}</span>
      <button
        class="ip-row__remove"
        @click="emit('remove', row.id)"
        title="Remove"
        aria-label="Remove row"
      >
        &times;
      </button>
    </div>

    <div class="ip-row__body">
      <div class="ip-row__input-group">
        <input
          v-model="inputValue"
          type="text"
          class="ip-row__input"
          :class="{ 'ip-row__input--invalid': validationError }"
          placeholder="e.g. 8.8.8.8"
          :disabled="isSearching"
          @blur="handleBlur"
          @keydown="handleKeydown"
          @input="validationError = null"
        />
        <div v-if="isSearching" class="ip-row__spinner" aria-label="Searching">
          <span class="spinner"></span>
        </div>
      </div>

      <Transition name="fade">
        <p v-if="validationError" class="ip-row__validation" role="alert">
          {{ validationError }}
        </p>
      </Transition>

      <Transition name="fade">
        <div v-if="hasResult" class="ip-row__result">
          <span class="ip-row__location-group">
            <span v-if="flagClass" :class="flagClass" class="ip-row__flag"></span>
            <span class="ip-row__location">{{ locationText }}</span>
          </span>
          <span class="ip-row__time">{{ localTime }}</span>
        </div>
      </Transition>

      <Transition name="fade">
        <p v-if="hasError" class="ip-row__error" role="alert">
          {{ row.error }}
        </p>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.ip-row {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.ip-row:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.ip-row--error {
  border-color: #feb2b2;
}

.ip-row__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.ip-row__label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ip-row__remove {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #a0aec0;
  cursor: pointer;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 4px;
  transition:
    background 0.15s,
    color 0.15s;
}

.ip-row__remove:hover {
  background: #fed7d7;
  color: #e53e3e;
}

.ip-row__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ip-row__input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.ip-row__input {
  width: 100%;
  padding: 10px 14px;
  padding-right: 40px;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    opacity 0.2s;
  background: #fff;
  color: #1a202c;
}

.ip-row__input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.ip-row__input:disabled {
  opacity: 0.6;
  background: #f7fafc;
  cursor: not-allowed;
}

.ip-row__input--invalid {
  border-color: #fc8181;
}

.ip-row__spinner {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2.5px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.ip-row__validation {
  margin: 0;
  font-size: 0.82rem;
  color: #e53e3e;
}

.ip-row__result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f0fff4;
  border-radius: 8px;
  border: 1px solid #c6f6d5;
}

.ip-row__location-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ip-row__flag {
  font-size: 1rem;
  line-height: 1;
  flex-shrink: 0;
}

.ip-row__location {
  font-weight: 600;
  color: #276749;
  font-size: 0.92rem;
}

.ip-row__time {
  font-family: 'Courier New', monospace;
  font-size: 0.88rem;
  color: #2f855a;
  background: #c6f6d5;
  padding: 2px 8px;
  border-radius: 4px;
}

.ip-row__error {
  margin: 0;
  font-size: 0.85rem;
  color: #e53e3e;
  padding: 8px 12px;
  background: #fff5f5;
  border-radius: 8px;
  border: 1px solid #fed7d7;
}

.fade-enter-active {
  transition:
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.4, 0, 1, 1),
    transform 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
