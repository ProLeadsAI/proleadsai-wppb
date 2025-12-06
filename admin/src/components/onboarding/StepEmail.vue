<script setup>
import { ref } from 'vue'
import { Check, Loader2, Mail } from 'lucide-vue-next'
import { Button, Input, Label, Alert } from '@/components/ui'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

const props = defineProps({
  state: { type: Object, required: true },
  error: { type: String, default: '' },
  isLoading: { type: Boolean, default: false },
  codeSent: { type: Boolean, default: false },
  isChangingEmail: { type: Boolean, default: false },
  cooldown: { type: Number, default: 0 }
})

const emit = defineEmits([
  'send-code',
  'verify-code',
  'change-email',
  'update:email',
  'update:code'
])

function handleOtpComplete(code) {
  emit('update:code', code)
  if (code.length === 6) {
    emit('verify-code')
  }
}
</script>

<template>
  <div class="space-y-6">
    <Alert v-if="error" variant="destructive">
      {{ error }}
    </Alert>
    
    <Alert v-if="state.email_verified" variant="success">
      <Check class="w-4 h-4" />
      <span class="ml-2">Email successfully verified!</span>
    </Alert>

    <!-- Email Input -->
    <div class="space-y-2">
      <Label>Email Address</Label>
      <div class="flex gap-2">
        <Input 
          :model-value="state.email"
          @update:model-value="emit('update:email', $event)"
          type="email" 
          placeholder="your@email.com"
          :disabled="state.email_verified && !isChangingEmail"
          class="flex-1"
          @keyup.enter="!state.email_verified && state.email && cooldown <= 0 && emit('send-code')"
        />
        <Button 
          v-if="state.email_verified && !isChangingEmail"
          @click="emit('change-email')"
          variant="outline"
        >
          Change Email
        </Button>
        <Button 
          v-else
          @click="emit('send-code')"
          :disabled="isLoading || !state.email || cooldown > 0"
          class="bg-emerald-600 hover:bg-emerald-700"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
          <Mail v-else class="w-4 h-4 mr-2" />
          {{ cooldown > 0 ? `Resend in ${cooldown}s` : 'Send Code' }}
        </Button>
      </div>
    </div>

    <div v-if="state.email_verified" class="pt-2">
      <p class="text-sm text-muted-foreground">Click Continue to proceed with setup.</p>
    </div>

    <!-- OTP Input -->
    <div v-if="codeSent && !state.email_verified" class="space-y-4 pt-6 border-t">
      <div class="text-center">
        <Label class="text-base">Enter verification code</Label>
        <p class="text-sm text-muted-foreground mt-1">We sent a 6-digit code to {{ state.email }}</p>
      </div>
      
      <div class="flex justify-center">
        <InputOTP 
          :model-value="state.code"
          @update:model-value="emit('update:code', $event)"
          :maxlength="6"
          @complete="handleOtpComplete"
        >
          <InputOTPGroup class="gap-2">
            <InputOTPSlot :index="0" />
            <InputOTPSlot :index="1" />
            <InputOTPSlot :index="2" />
            <InputOTPSlot :index="3" />
            <InputOTPSlot :index="4" />
            <InputOTPSlot :index="5" />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div class="flex flex-col items-center gap-3">
        <Button 
          @click="emit('verify-code')"
          :disabled="isLoading || state.code.length < 6"
          class="bg-emerald-600 hover:bg-emerald-700"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
          Verify Code
        </Button>
        <p class="text-sm text-muted-foreground">
          Didn't receive the code? 
          <button 
            type="button"
            @click="emit('send-code')"
            :disabled="cooldown > 0"
            class="text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
          >
            {{ cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
