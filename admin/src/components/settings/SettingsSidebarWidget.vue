<script setup>
import { ref, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { Button, Input, Card, CardHeader, CardContent, CardTitle, Label, Select } from '@/components/ui'
import { BG_STYLES, IMAGE_OPTIONS, GOOGLE_FONTS } from '@/lib/constants'

const props = defineProps({
  state: { type: Object, required: true },
  isSaving: { type: Boolean, default: false }
})

const emit = defineEmits(['save', 'open-media'])

const HEADING_SIZE_PRESETS = [
  { value: '', label: 'Default' },
  { value: '32px', label: 'Small (32px)' },
  { value: '40px', label: 'Medium (40px)' },
  { value: '48px', label: 'Large (48px)' },
  { value: '56px', label: 'XL (56px)' },
  { value: 'custom', label: 'Custom' }
]

const TEXT_SIZE_PRESETS = [
  { value: '', label: 'Default' },
  { value: '14px', label: 'Small (14px)' },
  { value: '16px', label: 'Normal (16px)' },
  { value: '18px', label: 'Large (18px)' },
  { value: '20px', label: 'XL (20px)' },
  { value: 'custom', label: 'Custom' }
]

const headingSizePreset = ref('')
const textSizePreset = ref('')

watch(() => props.state.sidebar_heading_size, (val) => {
  const v = (val || '').trim()
  const allowed = HEADING_SIZE_PRESETS.map(p => p.value).filter(v => v !== 'custom')
  headingSizePreset.value = allowed.includes(v) ? v : (v ? 'custom' : '')
}, { immediate: true })

watch(() => props.state.sidebar_text_size, (val) => {
  const v = (val || '').trim()
  const allowed = TEXT_SIZE_PRESETS.map(p => p.value).filter(v => v !== 'custom')
  textSizePreset.value = allowed.includes(v) ? v : (v ? 'custom' : '')
}, { immediate: true })

watch(headingSizePreset, (val) => {
  if (val !== 'custom') props.state.sidebar_heading_size = val
})

watch(textSizePreset, (val) => {
  if (val !== 'custom') props.state.sidebar_text_size = val
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Side Panel (Floating Widget)</CardTitle>
      <p class="text-sm text-muted-foreground">Customize the widget that opens when someone clicks your floating button</p>
    </CardHeader>

    <CardContent>
      <form @submit.prevent="emit('save')" class="space-y-6">
        <div class="space-y-2">
          <Label>Section Heading</Label>
          <Input v-model="state.sidebar_heading" placeholder="Get Your Free Roof Estimate" />
          <p class="text-xs text-muted-foreground">Leave blank to use the same heading as the inline widget.</p>
        </div>

        <div class="space-y-2">
          <Label>Background Style</Label>
          <Select v-model="state.sidebar_bg_style">
            <option v-for="style in BG_STYLES" :key="style.value" :value="style.value">
              {{ style.label }}
            </option>
          </Select>
        </div>

        <div v-if="state.sidebar_bg_style === 'custom'" class="space-y-2">
          <Label>Custom Background Color</Label>
          <div class="flex gap-2">
            <input v-model="state.sidebar_bg_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
            <Input v-model="state.sidebar_bg_color" class="w-32" />
          </div>
        </div>

        <div class="space-y-2">
          <Label>Hero Image</Label>
          <Select v-model="state.sidebar_image">
            <option v-for="opt in IMAGE_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </Select>
        </div>

        <div v-if="state.sidebar_image === 'custom'" class="space-y-2">
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

        <div class="border-t pt-6">
          <h4 class="font-medium mb-4">Typography</h4>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Heading Font</Label>
              <Select v-model="state.sidebar_heading_font">
                <option v-for="font in GOOGLE_FONTS" :key="font.value" :value="font.value">
                  {{ font.label }}
                </option>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Heading Color</Label>
              <div class="flex gap-2">
                <input v-model="state.sidebar_heading_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
                <Input v-model="state.sidebar_heading_color" class="w-28" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="space-y-2">
              <Label>Heading Size</Label>
              <Select v-model="headingSizePreset">
                <option v-for="opt in HEADING_SIZE_PRESETS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </Select>
              <Input
                v-if="headingSizePreset === 'custom'"
                v-model="state.sidebar_heading_size"
                placeholder="e.g. 48px, 3rem"
                class="mt-1"
              />
            </div>
            <div class="space-y-2">
              <Label>Body Text Size</Label>
              <Select v-model="textSizePreset">
                <option v-for="opt in TEXT_SIZE_PRESETS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </Select>
              <Input
                v-if="textSizePreset === 'custom'"
                v-model="state.sidebar_text_size"
                placeholder="e.g. 18px, 1.125rem"
                class="mt-1"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="space-y-2">
              <Label>Body Text Font</Label>
              <Select v-model="state.sidebar_text_font">
                <option v-for="font in GOOGLE_FONTS" :key="font.value" :value="font.value">
                  {{ font.label }}
                </option>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Body Text Color</Label>
              <div class="flex gap-2">
                <input v-model="state.sidebar_text_color" type="color" class="w-12 h-10 p-1 border rounded-md cursor-pointer" />
                <Input v-model="state.sidebar_text_color" class="w-28" />
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
          {{ isSaving ? 'Saving...' : 'Save Side Panel Settings' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
