<script setup>
import { computed } from 'vue'
import { Sparkles, Zap, BarChart3, Users, X } from 'lucide-vue-next'
import { Button, Card } from '@/components/ui'
import { BASE_URL } from '@/lib/api'

const props = defineProps({
  show: { type: Boolean, default: false },
  email: { type: String, default: '' },
  slug: { type: String, default: '' },
  feature: { type: String, default: '' } // Optional: which feature triggered the modal
})

const emit = defineEmits(['close'])

const upgradeUrl = computed(() => {
  const baseUrl = BASE_URL.replace(/\/$/, '')
  // Redirect to /{slug}/billing after signin
  const redirect = props.slug ? `/${props.slug}/billing` : '/'
  const params = new URLSearchParams({
    email: props.email,
    mode: 'magic',
    redirect
  })
  return `${baseUrl}/signin?${params.toString()}`
})

const features = [
  { icon: Users, title: 'Unlimited Leads', description: 'No caps on lead generation' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Detailed conversion tracking' },
  { icon: Zap, title: 'Priority Support', description: 'Get help when you need it' },
  { icon: Sparkles, title: 'Custom Branding', description: 'Remove ProLeads AI branding' }
]
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="show" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      @click.self="emit('close')"
    >
      <Card class="w-full max-w-md relative overflow-hidden">
        <!-- Close button -->
        <button 
          @click="emit('close')"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Gradient header -->
        <div class="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-white text-center">
          <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles class="w-7 h-7" />
          </div>
          <h2 class="text-2xl font-bold">Upgrade to Pro</h2>
          <p class="text-emerald-100 mt-2">Unlock all features and grow your business</p>
        </div>

        <!-- Features -->
        <div class="p-6 space-y-4">
          <div 
            v-for="feature in features" 
            :key="feature.title"
            class="flex items-start gap-3"
          >
            <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <component :is="feature.icon" class="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ feature.title }}</p>
              <p class="text-sm text-gray-500">{{ feature.description }}</p>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="px-6 pb-6 space-y-3">
          <a :href="upgradeUrl" target="_blank" class="block">
            <Button class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3">
              <Sparkles class="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </a>
          <p class="text-center text-xs text-gray-500">
            You'll be signed in with <span class="font-medium">{{ email }}</span>
          </p>
        </div>
      </Card>
    </div>
  </Teleport>
</template>
