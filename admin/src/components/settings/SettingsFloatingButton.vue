<script setup>
import { Loader2 } from 'lucide-vue-next'
import { Button, Input, Card, CardHeader, CardContent, CardTitle, Label, Select } from '@/components/ui'
import { BUTTON_POSITIONS } from '@/lib/constants'

const props = defineProps({
  state: { type: Object, required: true },
  isSaving: { type: Boolean, default: false }
})

const emit = defineEmits(['save'])
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Floating Button</CardTitle>
      <p class="text-sm text-muted-foreground">Customize the floating button that appears on your site</p>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="emit('save')" class="space-y-6">
        <div class="space-y-3">
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
        </div>

        <Button type="submit" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
          {{ isSaving ? 'Saving...' : 'Save Floating Button Settings' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
