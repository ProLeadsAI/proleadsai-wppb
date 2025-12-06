<script setup>
import { ref, inject, computed, onMounted } from 'vue'

const props = defineProps({
  index: { type: Number, required: true }
})

const inputRef = ref(null)
const otpValue = inject('otp-value')
const otpDisabled = inject('otp-disabled')
const otpInput = inject('otp-input')
const otpBackspace = inject('otp-backspace')
const otpPaste = inject('otp-paste')
const register = inject('otp-register')

const char = computed(() => otpValue.value?.[props.index] || '')

onMounted(() => {
  register(props.index, inputRef.value)
})

function handleInput(e) {
  const val = e.target.value.slice(-1)
  if (/^\d$/.test(val)) {
    otpInput(props.index, val)
  }
  e.target.value = char.value
}

function handleKeydown(e) {
  if (e.key === 'Backspace') {
    e.preventDefault()
    otpBackspace(props.index)
  }
}

function handlePaste(e) {
  e.preventDefault()
  const text = e.clipboardData?.getData('text') || ''
  otpPaste(text)
}
</script>

<template>
  <input
    ref="inputRef"
    type="text"
    inputmode="numeric"
    :value="char"
    :disabled="otpDisabled"
    maxlength="1"
    class="w-10 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    data-slot="input-otp-slot"
    @input="handleInput"
    @keydown="handleKeydown"
    @paste="handlePaste"
  />
</template>
