<script setup>
import { ref, computed, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { Button, Input, Card, CardHeader, CardContent, CardTitle, Label, Select } from '@/components/ui'
import { MARGIN_PRESETS, BG_STYLES, IMAGE_OPTIONS } from '@/lib/constants'

const props = defineProps({
  state: { type: Object, required: true },
  isSaving: { type: Boolean, default: false }
})

const emit = defineEmits(['save', 'open-media'])

// Margin preset helpers
const presetValues = MARGIN_PRESETS.map(p => p.value).filter(v => v !== 'custom')
const marginTopPreset = ref('')
const marginBottomPreset = ref('')

// Sync presets with state
watch(() => props.state.shortcode_margin_top, (val) => {
  marginTopPreset.value = presetValues.includes(val) ? val : 'custom'
}, { immediate: true })

watch(() => props.state.shortcode_margin_bottom, (val) => {
  marginBottomPreset.value = presetValues.includes(val) ? val : 'custom'
}, { immediate: true })

watch(marginTopPreset, (val) => {
  if (val !== 'custom') props.state.shortcode_margin_top = val
})

watch(marginBottomPreset, (val) => {
  if (val !== 'custom') props.state.shortcode_margin_bottom = val
})

const shortcode = computed(() => {
  const parts = ['[proleadsai_widget']
  
  if (props.state.shortcode_heading) {
    parts.push(`heading="${props.state.shortcode_heading}"`)
  }
  
  if (props.state.shortcode_bg_style && props.state.shortcode_bg_style !== 'none') {
    if (props.state.shortcode_bg_style === 'custom' && props.state.shortcode_bg_color) {
      parts.push(`bg="${props.state.shortcode_bg_color}"`)
    } else {
      parts.push(`bg="${props.state.shortcode_bg_style}"`)
    }
  }
  
  if (props.state.shortcode_image === 'none') {
    parts.push('image="none"')
  } else if (props.state.shortcode_image === 'custom' && props.state.shortcode_custom_image) {
    parts.push(`image="${props.state.shortcode_custom_image}"`)
  }
  
  if (props.state.shortcode_margin_top) {
    parts.push(`mt="${props.state.shortcode_margin_top}"`)
  }
  
  if (props.state.shortcode_margin_bottom) {
    parts.push(`mb="${props.state.shortcode_margin_bottom}"`)
  }
  
  return parts.length > 1 ? parts.join(' ') + ']' : '[proleadsai_widget]'
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Shortcode Embed</CardTitle>
      <p class="text-sm text-muted-foreground">Embed the roof estimator widget on specific pages</p>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="emit('save')" class="space-y-6">
        <div class="space-y-3 p-4 bg-gray-50 rounded-lg">
          <Label>Your Shortcode</Label>
          <Input 
            :value="shortcode" 
            readonly 
            class="font-mono bg-white text-sm"
            @click="$event.target.select()"
          />
          <div class="text-sm text-muted-foreground space-y-2">
            <p v-if="shortcode === '[proleadsai_widget]'">
              <strong>Default shortcode</strong> — will always use your saved settings below.
            </p>
            <div v-else>
              <p><strong>Custom shortcode</strong> — these parameters are locked in.</p>
              <p class="mt-2 text-xs bg-blue-50 text-blue-700 p-2 rounded">
                💡 <strong>Tip:</strong> You don't need to save! Just configure, copy, and use different versions on different pages.
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <Label>Section Heading</Label>
          <Input v-model="state.shortcode_heading" placeholder="Get Your Free Roof Estimate" />
        </div>

        <div class="space-y-2">
          <Label>Background Style</Label>
          <Select v-model="state.shortcode_bg_style">
            <option v-for="style in BG_STYLES" :key="style.value" :value="style.value">
              {{ style.label }}
            </option>
          </Select>
        </div>

        <div v-if="state.shortcode_bg_style === 'custom'" class="space-y-2">
          <Label>Custom Background Color</Label>
          <div class="flex gap-2">
            <input v-model="state.shortcode_bg_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
            <Input v-model="state.shortcode_bg_color" class="w-32" />
          </div>
        </div>

        <div class="space-y-2">
          <Label>Hero Image</Label>
          <Select v-model="state.shortcode_image">
            <option v-for="opt in IMAGE_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </Select>
          <p v-if="state.shortcode_image === 'custom'" class="text-xs text-muted-foreground">
            Recommended: <strong>1200px wide × 400px tall</strong> (3:1 aspect ratio)
          </p>
        </div>

        <div v-if="state.shortcode_image === 'custom'" class="space-y-2">
          <Label>Custom Image</Label>
          <div class="flex gap-2">
            <Input v-model="state.shortcode_custom_image" placeholder="https://..." class="flex-1" />
            <Button type="button" variant="outline" @click="emit('open-media')">
              Select Image
            </Button>
          </div>
          <div v-if="state.shortcode_custom_image" class="mt-2">
            <img :src="state.shortcode_custom_image" class="max-h-32 rounded-lg object-cover" alt="Preview" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Margin Top</Label>
            <Select v-model="marginTopPreset">
              <option v-for="preset in MARGIN_PRESETS" :key="preset.value" :value="preset.value">
                {{ preset.label }}
              </option>
            </Select>
            <Input 
              v-if="marginTopPreset === 'custom'" 
              v-model="state.shortcode_margin_top" 
              placeholder="e.g. 50px, 3.5rem"
              class="mt-1"
            />
          </div>
          <div class="space-y-2">
            <Label>Margin Bottom</Label>
            <Select v-model="marginBottomPreset">
              <option v-for="preset in MARGIN_PRESETS" :key="preset.value" :value="preset.value">
                {{ preset.label }}
              </option>
            </Select>
            <Input 
              v-if="marginBottomPreset === 'custom'" 
              v-model="state.shortcode_margin_bottom" 
              placeholder="e.g. 50px, 3.5rem"
              class="mt-1"
            />
          </div>
        </div>

        <Button type="submit" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
          {{ isSaving ? 'Saving...' : 'Save Shortcode Settings' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
