<script setup>
import { ref, computed, watch } from 'vue'
import { Loader2, Info } from 'lucide-vue-next'
import { Button, Input, Card, CardHeader, CardContent, CardTitle, Label, Select, Alert } from '@/components/ui'
import { MARGIN_PRESETS, BG_STYLES, IMAGE_OPTIONS, GOOGLE_FONTS } from '@/lib/constants'

const props = defineProps({
  state: { type: Object, required: true },
  isSaving: { type: Boolean, default: false }
})

const emit = defineEmits(['save', 'open-media'])

// Margin preset helpers
const presetValues = MARGIN_PRESETS.map(p => p.value).filter(v => v !== 'custom')
const marginTopPreset = ref('')
const marginBottomPreset = ref('')

const HEADING_SIZE_PRESETS = [
  { value: '', label: 'Default (2.25rem)' },
  { value: '32px', label: 'Small (32px)' },
  { value: '40px', label: 'Medium (40px)' },
  { value: '48px', label: 'Large (48px)' },
  { value: '56px', label: 'XL (56px)' },
  { value: 'custom', label: 'Custom' }
]

const TEXT_SIZE_PRESETS = [
  { value: '', label: 'Default (1.125rem)' },
  { value: '14px', label: 'Small (14px)' },
  { value: '16px', label: 'Normal (16px)' },
  { value: '18px', label: 'Large (18px)' },
  { value: '20px', label: 'XL (20px)' },
  { value: 'custom', label: 'Custom' }
]

const headingSizePreset = ref('')
const textSizePreset = ref('')

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

watch(() => props.state.heading_size, (val) => {
  const v = (val || '').trim()
  const allowed = HEADING_SIZE_PRESETS.map(p => p.value).filter(v => v !== 'custom')
  headingSizePreset.value = allowed.includes(v) ? v : (v ? 'custom' : '')
}, { immediate: true })

watch(() => props.state.text_size, (val) => {
  const v = (val || '').trim()
  const allowed = TEXT_SIZE_PRESETS.map(p => p.value).filter(v => v !== 'custom')
  textSizePreset.value = allowed.includes(v) ? v : (v ? 'custom' : '')
}, { immediate: true })

watch(headingSizePreset, (val) => {
  if (val !== 'custom') props.state.heading_size = val
})

watch(textSizePreset, (val) => {
  if (val !== 'custom') props.state.text_size = val
})

const shortcode = computed(() => {
  const parts = ['[proleadsai_widget']
  
  if (props.state.shortcode_heading && props.state.shortcode_heading !== 'Free Roof Estimate Instantly') {
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
  
  if (props.state.heading_font) {
    parts.push(`heading-font="${props.state.heading_font}"`)
  }
  
  if (props.state.heading_color && props.state.heading_color !== '#1c1917') {
    parts.push(`heading-color="${props.state.heading_color}"`)
  }
  
  if (props.state.text_font) {
    parts.push(`text-font="${props.state.text_font}"`)
  }
  
  if (props.state.text_color_shortcode && props.state.text_color_shortcode !== '#44403c') {
    parts.push(`text-color-shortcode="${props.state.text_color_shortcode}"`)
  }

  if (props.state.heading_size) {
    parts.push(`heading-size="${props.state.heading_size}"`)
  }

  if (props.state.text_size) {
    parts.push(`text-size="${props.state.text_size}"`)
  }
  
  return parts.length > 1 ? parts.join(' ') + ']' : '[proleadsai_widget]'
})

function resetToDefaults() {
  props.state.shortcode_heading = 'Free Roof Estimate Instantly'
  props.state.shortcode_bg_style = 'none'
  props.state.shortcode_bg_color = '#f5f5f4'
  props.state.shortcode_image = 'default'
  props.state.shortcode_custom_image = ''
  props.state.shortcode_margin_top = ''
  props.state.shortcode_margin_bottom = ''

  props.state.heading_font = ''
  props.state.heading_color = '#1c1917'
  props.state.heading_size = ''

  props.state.text_font = ''
  props.state.text_color_shortcode = '#44403c'
  props.state.text_size = ''

  emit('save')
}
</script>

<template>
  <Card>
    <CardHeader class="pb-0">
      <CardTitle>Shortcode Embed</CardTitle>
      <p class="text-sm text-muted-foreground" style="margin: 0;">Embed the roof estimator widget on specific pages</p>
    </CardHeader>
    <CardContent class="pt-2">
      <form @submit.prevent="emit('save')" class="space-y-2">
        <div class="space-y-1 p-2 bg-gray-50 rounded-lg">
          <Label>Your Shortcode</Label>
          <Input 
            :value="shortcode" 
            readonly 
            class="font-mono bg-white text-sm"
            @click="$event.target.select()"
          />
          <div class="text-sm text-muted-foreground">
            <p class="mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
              💡 <strong>Tip:</strong> You don't need to save! Just configure, copy, and use different versions on different pages.
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <Label>Section Heading</Label>
          <Input v-model="state.shortcode_heading" placeholder="Get Your Free Roof Estimate" />
        </div>

        <details class="border-t pt-6">
          <summary class="cursor-pointer font-medium select-none">
            Advanced Settings
          </summary>

          <div class="mt-4 space-y-6">
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
                <Button type="button" variant="outline" @click="emit('open-media', 'shortcode_custom_image')">
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

            <!-- Typography Settings -->
            <div class="border-t pt-6 mt-6">
              <h4 class="font-medium mb-4">Typography</h4>

          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">Heading</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label>Font</Label>
                <Select v-model="state.heading_font">
                  <option v-for="font in GOOGLE_FONTS" :key="font.value" :value="font.value">
                    {{ font.label }}
                  </option>
                </Select>
              </div>

              <div class="space-y-2">
                <Label>Size</Label>
                <Select v-model="headingSizePreset">
                  <option v-for="opt in HEADING_SIZE_PRESETS" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </Select>
                <Input
                  v-if="headingSizePreset === 'custom'"
                  v-model="state.heading_size"
                  placeholder="e.g. 48px, 3rem"
                  class="mt-1"
                />
              </div>

              <div class="space-y-2">
                <Label>Color</Label>
                <div class="flex gap-2">
                  <input v-model="state.heading_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
                  <Input v-model="state.heading_color" class="w-28" />
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2 mt-6">
            <p class="text-xs font-medium text-muted-foreground">Body Text</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label>Font</Label>
                <Select v-model="state.text_font">
                  <option v-for="font in GOOGLE_FONTS" :key="font.value" :value="font.value">
                    {{ font.label }}
                  </option>
                </Select>
              </div>

              <div class="space-y-2">
                <Label>Size</Label>
                <Select v-model="textSizePreset">
                  <option v-for="opt in TEXT_SIZE_PRESETS" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </Select>
                <Input
                  v-if="textSizePreset === 'custom'"
                  v-model="state.text_size"
                  placeholder="e.g. 18px, 1.125rem"
                  class="mt-1"
                />
              </div>

              <div class="space-y-2">
                <Label>Color</Label>
                <div class="flex gap-2">
                  <input v-model="state.text_color_shortcode" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
                  <Input v-model="state.text_color_shortcode" class="w-28" />
                </div>
              </div>
            </div>
          </div>
            </div>
          </div>
        </details>

        <div class="flex gap-3">
          <Button type="button" variant="outline" :disabled="isSaving" @click="resetToDefaults">
            Reset to Defaults
          </Button>
          <Button type="submit" :disabled="isSaving">
            <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
            {{ isSaving ? 'Saving...' : 'Save Shortcode Settings' }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
