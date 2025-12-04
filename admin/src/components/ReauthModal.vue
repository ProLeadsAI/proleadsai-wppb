<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Verify Your Account</h3>
          <Button variant="ghost" size="sm" @click="$emit('close')">
            <X class="w-4 h-4" />
          </Button>
        </div>
        
        <p class="text-sm text-muted-foreground mb-4">
          Your session has expired. Please verify your email to continue.
        </p>

        <Alert v-if="error" variant="destructive" class="mb-4">
          {{ error }}
        </Alert>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Email Address</Label>
            <div class="flex gap-2">
              <Input 
                v-model="email" 
                type="email" 
                :disabled="codeSent"
                class="flex-1"
              />
              <Button 
                @click="sendCode"
                :disabled="isLoading || !email || cooldown > 0"
                variant="outline"
              >
                <Loader2 v-if="isLoading && !codeSent" class="w-4 h-4 mr-2 animate-spin" />
                {{ cooldown > 0 ? `${cooldown}s` : (codeSent ? 'Resend' : 'Send Code') }}
              </Button>
            </div>
          </div>

          <div v-if="codeSent" class="space-y-2">
            <Label>Verification Code</Label>
            <div class="flex gap-2">
              <Input 
                v-model="code" 
                placeholder="Enter 6-digit code"
                maxlength="6"
                class="flex-1"
              />
              <Button 
                @click="verifyCode"
                :disabled="isLoading || code.length < 6"
              >
                <Loader2 v-if="isLoading && codeSent" class="w-4 h-4 mr-2 animate-spin" />
                Verify
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'
import { Button, Input, Label, Alert } from '@/components/ui'
import { getApiUrl } from '@/lib/api'

const props = defineProps({
  show: { type: Boolean, default: false },
  initialEmail: { type: String, default: '' },
  userId: { type: String, default: '' },
  settings: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'success'])

const email = ref(props.initialEmail)
const code = ref('')
const isLoading = ref(false)
const error = ref('')
const codeSent = ref(false)
const cooldown = ref(0)

watch(() => props.initialEmail, (val) => {
  email.value = val
})

watch(() => props.show, (val) => {
  if (val) {
    error.value = ''
    code.value = ''
    codeSent.value = false
  }
})

async function sendCode() {
  error.value = ''
  isLoading.value = true
  cooldown.value = 60
  
  const timer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(timer)
  }, 1000)

  try {
    const baseUrl = getApiUrl()
    const res = await fetch(`${baseUrl}/wordpress/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })
    
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || 'Failed to send verification code')
    }
    
    codeSent.value = true
  } catch (e) {
    error.value = e.message
    cooldown.value = 0
  } finally {
    isLoading.value = false
  }
}

async function verifyCode() {
  error.value = ''
  isLoading.value = true

  try {
    const baseUrl = getApiUrl()
    
    // Verify OTP
    const verifyRes = await fetch(`${baseUrl}/wordpress/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, code: code.value })
    })
    
    const verifyData = await verifyRes.json()
    if (!verifyRes.ok) {
      throw new Error(verifyData.message || 'Invalid verification code')
    }
    
    const userId = verifyData.user?.id
    if (!userId) {
      throw new Error('Failed to get user ID')
    }
    
    // Regenerate API key
    const regenRes = await fetch(`${baseUrl}/wordpress/auth/regenerate-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    
    const regenData = await regenRes.json()
    if (!regenRes.ok) {
      throw new Error(regenData.message || 'Failed to regenerate API key')
    }
    
    // Emit success with the new credentials
    emit('success', {
      userId,
      authToken: regenData.apiKey,
      teamId: regenData.organization?.id
    })
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}
</script>
