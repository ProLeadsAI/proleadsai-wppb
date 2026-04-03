<template>
  <div>
    <!-- Main Content Area -->
    <div class="w-full min-h-screen py-8 px-4">
      <div class="max-w-3xl mx-auto">

        <!-- Progress Steps (hidden on welcome screen) -->
        <Card v-if="currentStep > 0" class="p-6 shadow-sm rounded-xl mb-4">
          <div class="flex items-center justify-center gap-2">
            <template v-for="(stepName, index) in steps.slice(1)" :key="index">
              <div 
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                  currentStep > index + 1 ? 'bg-green-700 text-white' :
                  currentStep === index + 1 ? 'bg-green-700 text-white ring-4 ring-green-200' : 'bg-gray-200 text-gray-500'
                ]"
              >
                <Check v-if="currentStep > index + 1" class="w-4 h-4" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div v-if="index < steps.length - 2" :class="['w-12 h-1 rounded-full transition-colors duration-300', currentStep > index + 1 ? 'bg-green-700' : 'bg-gray-200']"></div>
            </template>
          </div>
          <p class="text-center text-sm text-gray-500 mt-3">{{ steps[currentStep] }}</p>
        </Card>

        <!-- Main Card -->
        <Card class="p-8 shadow-sm rounded-xl">
          <!-- Step 0: Welcome -->
          <StepWelcome v-if="currentStep === 0" :site-domain="siteDomain" :page="settings.page" :source-version="settings.version" />

          <!-- Step 1: Email Verification -->
          <StepEmail 
            v-if="currentStep === 1"
            :state="state"
            :error="error"
            :is-loading="isLoading"
            :code-sent="codeSent"
            :is-changing-email="isChangingEmail"
            :cooldown="cooldown"
            @send-code="sendVerificationCode"
            @verify-code="verifyCode"
            @change-email="handleChangeEmail"
            @update:email="state.email = $event"
            @update:code="state.code = $event"
          />

          <!-- Step 2: Business Info -->
          <StepBusiness 
            v-if="currentStep === 2"
            v-model="state.business"
            :organizations="availableOrganizations"
            :selected-org-id="state.selected_org_id"
            :requires-selection="requiresOrganizationSelection"
            @update:selected-org-id="applySelectedOrganization(availableOrganizations.find(org => org.id === $event) || null)"
            @submit="nextStep"
          />

          <!-- Step 3: Theme & Pricing -->
          <StepTheme 
            v-if="currentStep === 3"
            :state="state"
            @update:primary_color="state.primary_color = $event"
            @update:text_color="state.text_color = $event"
            @update:button_position="state.button_position = $event"
            @update:price_per_sq="state.price_per_sq = $event"
            @update:timezone="state.timezone = $event"
          />

          <!-- Navigation Buttons -->
          <div class="mt-8 flex gap-3">
            <Button 
              v-if="currentStep > 0"
              @click="prevStep"
              variant="outline"
            >
              <ChevronLeft class="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button 
              @click="nextStep"
              :disabled="!canProceed"
              class="bg-green-700 hover:bg-green-800 text-white px-6 py-3 text-base rounded-lg"
            >
              {{ currentStep === steps.length - 1 ? 'Complete Setup' : currentStep === 0 ? 'Get started' : 'Continue' }}
            </Button>
          </div>
        </Card>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Check, ChevronLeft } from 'lucide-vue-next'
import { Button, Card } from '@/components/ui'
import { StepWelcome, StepEmail, StepBusiness, StepTheme } from '@/components/onboarding'
import { useOnboarding } from '@/composables/useOnboarding'

const props = defineProps({
  settings: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['complete'])

const {
  steps,
  currentStep,
  state,
  error,
  isLoading,
  codeSent,
  isChangingEmail,
  cooldown,
  availableOrganizations,
  requiresOrganizationSelection,
  siteDomain,
  canProceed,
  loadState,
  handleChangeEmail,
  sendVerificationCode,
  verifyCode,
  applySelectedOrganization,
  nextStep,
  prevStep
} = useOnboarding(props.settings, emit)

onMounted(loadState)
</script>
