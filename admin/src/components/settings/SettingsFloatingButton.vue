<script setup>
import { ref, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { Button, Input, Card, CardHeader, CardContent, CardTitle, Label, Select } from '@/components/ui'
import { BUTTON_POSITIONS, BG_STYLES, IMAGE_OPTIONS, GOOGLE_FONTS } from '@/lib/constants'

const props = defineProps({
  state: { type: Object, required: true },
  isSaving: { type: Boolean, default: false }
})

const emit = defineEmits(['save', 'open-media'])

const HEADING_SIZE_PRESETS = [
  { value: '', label: 'Default (1.5rem)' },
  { value: '32px', label: 'Small (32px)' },
  { value: '40px', label: 'Medium (40px)' },
  { value: '48px', label: 'Large (48px)' },
  { value: '56px', label: 'XL (56px)' },
  { value: 'custom', label: 'Custom' }
]

const TEXT_SIZE_PRESETS = [
  { value: '', label: 'Default (1rem)' },
  { value: '14px', label: 'Small (14px)' },
  { value: '16px', label: 'Normal (16px)' },
  { value: '18px', label: 'Large (18px)' },
  { value: '20px', label: 'XL (20px)' },
  { value: 'custom', label: 'Custom' }
]

const sidebarHeadingSizePreset = ref('')
const sidebarTextSizePreset = ref('')

watch(() => props.state.sidebar_heading_size, (val) => {
  const v = (val || '').trim()
  const allowed = HEADING_SIZE_PRESETS.map(p => p.value).filter(v => v !== 'custom')
  sidebarHeadingSizePreset.value = allowed.includes(v) ? v : (v ? 'custom' : '')
}, { immediate: true })

watch(() => props.state.sidebar_text_size, (val) => {
  const v = (val || '').trim()
  const allowed = TEXT_SIZE_PRESETS.map(p => p.value).filter(v => v !== 'custom')
  sidebarTextSizePreset.value = allowed.includes(v) ? v : (v ? 'custom' : '')
}, { immediate: true })

watch(sidebarHeadingSizePreset, (val) => {
  if (val !== 'custom') props.state.sidebar_heading_size = val
})

watch(sidebarTextSizePreset, (val) => {
  if (val !== 'custom') props.state.sidebar_text_size = val
})

function resetToDefaults() {
  props.state.show_widget = true
  props.state.button_position = 'bottom-right'
  props.state.primary_color = '#ffd400'
  props.state.text_color = '#1d1616'
  props.state.button_text = 'Get Roof Estimate'
  props.state.button_emoji = '🏠'

  props.state.sidebar_heading = 'Free Roof Estimate Instantly'
  props.state.sidebar_bg_style = 'none'
  props.state.sidebar_bg_color = '#f5f5f4'
  props.state.sidebar_image = 'default'
  props.state.sidebar_custom_image = ''
  props.state.sidebar_heading_font = ''
  props.state.sidebar_heading_color = '#1c1917'
  props.state.sidebar_text_font = ''
  props.state.sidebar_text_color = '#44403c'
  props.state.sidebar_heading_size = ''
  props.state.sidebar_text_size = ''

  emit('save')
}
</script>

<template>
  <Card>
    <CardHeader class="pb-0">
      <CardTitle>Floating Button</CardTitle>
      <p class="text-sm text-muted-foreground" style="margin: 0;">Customize the floating button and the side panel that opens when it’s clicked</p>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="emit('save')" class="space-y-6">
        <div class="space-y-3 mt-2">
          <Label>Visibility</Label>
          <div class="space-y-2">
            <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-primary bg-primary/5': state.show_widget }">
              <input type="radio" :value="true" v-model="state.show_widget" class="w-4 h-4 cursor-pointer" />
              <div>
                <p class="font-medium">Show on all pages</p>
                <p class="text-sm text-muted-foreground">Floating button appears on every page of your site</p>
              </div>
            </label>
            <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-primary bg-primary/5': !state.show_widget }">
              <input type="radio" :value="false" v-model="state.show_widget" class="w-4 h-4 cursor-pointer" />
              <div>
                <p class="font-medium">Hide floating button</p>
                <p class="text-sm text-muted-foreground">Use shortcode to embed widget on specific pages</p>
              </div>
            </label>
          </div>
        </div>

        <div v-if="state.show_widget" class="space-y-6 pt-4 border-t">
          <div class="space-y-2">
            <Label>Position</Label>
            <Select v-model="state.button_position">
              <option v-for="pos in BUTTON_POSITIONS" :key="pos.value" :value="pos.value">
                {{ pos.label }}
              </option>
            </Select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label>Background Color</Label>
              <div class="flex gap-2">
                <input v-model="state.primary_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
                <Input v-model="state.primary_color" class="w-32" />
              </div>
            </div>

            <div class="space-y-2">
              <Label>Text Color</Label>
              <div class="flex gap-2">
                <input v-model="state.text_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
                <Input v-model="state.text_color" class="w-32" />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label>Button Text</Label>
            <Input v-model="state.button_text" placeholder="Get Roof Estimate" />
          </div>

          <div class="space-y-2">
            <Label>Button Emoji</Label>
            <div class="flex gap-2 items-center">
              <Input v-model="state.button_emoji" class="w-20 text-center text-xl" maxlength="2" />
              <div class="flex gap-1">
                <button type="button" @click="state.button_emoji = '🏠'" class="px-3 py-2 border rounded-md hover:bg-gray-100 text-xl cursor-pointer">🏠</button>
                <button type="button" @click="state.button_emoji = '🏡'" class="px-3 py-2 border rounded-md hover:bg-gray-100 text-xl cursor-pointer">🏡</button>
                <button type="button" @click="state.button_emoji = '⚡'" class="px-3 py-2 border rounded-md hover:bg-gray-100 text-xl cursor-pointer">⚡</button>
                <button type="button" @click="state.button_emoji = '🔨'" class="px-3 py-2 border rounded-md hover:bg-gray-100 text-xl cursor-pointer">🔨</button>
                <button type="button" @click="state.button_emoji = ''" class="px-3 py-2 border rounded-md hover:bg-gray-100 text-sm cursor-pointer">None</button>
              </div>
            </div>
            <p class="text-xs text-gray-500">Note: Emoji appearance may vary on the frontend. Some WordPress themes use Twemoji which displays emojis in a different style than shown here.</p>
          </div>

          <!-- Button Preview -->
          <div class="space-y-2">
            <Label>Preview</Label>
            <div class="p-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <div 
                class="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-full shadow-lg"
                :style="`background-color: ${state.primary_color}; color: ${state.text_color};`"
              >
                <span v-if="state.button_emoji" class="text-lg">{{ state.button_emoji }}</span>
                {{ state.button_text || 'Get Roof Estimate' }}
              </div>
            </div>
          </div>

          <!-- Side Panel Settings -->
          <details class="border-t pt-6">
            <summary class="cursor-pointer font-medium select-none">
              Advanced Settings: Side Panel (Floating Widget)
            </summary>

            <div class="mt-4">

            <div class="space-y-2">
              <Label>Section Heading</Label>
              <Input v-model="state.sidebar_heading" placeholder="Get Your Free Roof Estimate" />
              <p class="text-xs text-muted-foreground">Leave blank to use the same heading as the inline widget.</p>
            </div>

            <div class="space-y-2 mt-4">
              <Label>Background Style</Label>
              <Select v-model="state.sidebar_bg_style">
                <option v-for="style in BG_STYLES" :key="style.value" :value="style.value">
                  {{ style.label }}
                </option>
              </Select>
            </div>

            <div v-if="state.sidebar_bg_style === 'custom'" class="space-y-2 mt-4">
              <Label>Custom Background Color</Label>
              <div class="flex gap-2">
                <input v-model="state.sidebar_bg_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
                <Input v-model="state.sidebar_bg_color" class="w-32" />
              </div>
            </div>

            <div class="space-y-2 mt-4">
              <Label>Hero Image</Label>
              <Select v-model="state.sidebar_image">
                <option v-for="opt in IMAGE_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </Select>
            </div>

            <div v-if="state.sidebar_image === 'custom'" class="space-y-2 mt-4">
              <Label>Custom Image</Label>
              <div class="flex gap-2">
                <Input v-model="state.sidebar_custom_image" placeholder="https://..." class="flex-1" />
                <Button type="button" variant="outline" @click="emit('open-media', 'sidebar_custom_image')">
                  Select Image
                </Button>
              </div>
              <div v-if="state.sidebar_custom_image" class="mt-2">
                <img :src="state.sidebar_custom_image" class="max-h-32 rounded-lg object-cover" alt="Preview" />
              </div>
            </div>

            <div class="border-t pt-6 mt-6">
              <h5 class="font-medium mb-4">Typography</h5>

              <div class="space-y-2">
                <p class="text-xs font-medium text-muted-foreground">Heading</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="space-y-2">
                    <Label>Font</Label>
                    <Select v-model="state.sidebar_heading_font">
                      <option v-for="font in GOOGLE_FONTS" :key="font.value" :value="font.value">
                        {{ font.label }}
                      </option>
                    </Select>
                  </div>

                  <div class="space-y-2">
                    <Label>Size</Label>
                    <Select v-model="sidebarHeadingSizePreset">
                      <option v-for="opt in HEADING_SIZE_PRESETS" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </Select>
                    <Input
                      v-if="sidebarHeadingSizePreset === 'custom'"
                      v-model="state.sidebar_heading_size"
                      placeholder="e.g. 48px, 3rem"
                      class="mt-1"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label>Color</Label>
                    <div class="flex gap-2">
                      <input v-model="state.sidebar_heading_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
                      <Input v-model="state.sidebar_heading_color" class="w-32" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-2 mt-6">
                <p class="text-xs font-medium text-muted-foreground">Body Text</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="space-y-2">
                    <Label>Font</Label>
                    <Select v-model="state.sidebar_text_font">
                      <option v-for="font in GOOGLE_FONTS" :key="font.value" :value="font.value">
                        {{ font.label }}
                      </option>
                    </Select>
                  </div>

                  <div class="space-y-2">
                    <Label>Size</Label>
                    <Select v-model="sidebarTextSizePreset">
                      <option v-for="opt in TEXT_SIZE_PRESETS" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </Select>
                    <Input
                      v-if="sidebarTextSizePreset === 'custom'"
                      v-model="state.sidebar_text_size"
                      placeholder="e.g. 18px, 1.125rem"
                      class="mt-1"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label>Color</Label>
                    <div class="flex gap-2">
                      <input v-model="state.sidebar_text_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
                      <Input v-model="state.sidebar_text_color" class="w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </details>
        </div>

        <div class="flex gap-3">
          <Button type="button" variant="outline" :disabled="isSaving" @click="resetToDefaults">
            Reset to Defaults
          </Button>
          <Button type="submit" :disabled="isSaving">
            <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
            {{ isSaving ? 'Saving...' : 'Save Floating Button Settings' }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
