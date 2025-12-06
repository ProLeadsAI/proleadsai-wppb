<script setup>
import { Zap, Home, BarChart3, Sparkles } from 'lucide-vue-next'
</script>

<template>
  <div class="text-center">
    <!-- Logo -->
    <div class="flex items-center justify-center gap-3 mb-6">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
        <Home class="w-6 h-6 text-white" />
      </div>
      <div class="text-left">
        <h1 class="text-xl font-bold text-gray-900">ProLeads AI</h1>
        <a href="https://proleadsai.com" target="_blank" class="text-xs text-emerald-600 hover:text-emerald-700">
          proleadsai.com →
        </a>
      </div>
    </div>

    <h2 class="text-2xl font-bold text-gray-900">Generate instant roof quotes</h2>
    <p class="text-gray-500 mt-2 mb-6">
      Capture more leads with AI-powered roof estimation — automatically.
    </p>

    <!-- Feature Grid -->
    <div class="grid grid-cols-2 gap-4 text-left">
      <div class="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
        <div class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center mb-3">
          <Sparkles class="w-5 h-5 text-white" />
        </div>
        <p class="font-semibold text-gray-900">AI Roof Analysis</p>
        <p class="text-gray-500 text-sm mt-1">Satellite imagery measurements in seconds</p>
      </div>

      <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
        <div class="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center mb-3">
          <Zap class="w-5 h-5 text-white" />
        </div>
        <p class="font-semibold text-gray-900">Instant Proposals</p>
        <p class="text-gray-500 text-sm mt-1">Professional quotes generated automatically</p>
      </div>

      <div class="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
        <div class="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center mb-3">
          <BarChart3 class="w-5 h-5 text-white" />
        </div>
        <p class="font-semibold text-gray-900">Capture More Leads</p>
        <p class="text-gray-500 text-sm mt-1">Embed widget directly on your site</p>
      </div>

      <div class="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
        <div class="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center mb-3">
          <Home class="w-5 h-5 text-white" />
        </div>
        <p class="font-semibold text-gray-900">Free Forever</p>
        <p class="text-gray-500 text-sm mt-1">No credit card required to start using the Wordpress Plugin</p>
      </div>
    </div>
  </div>
</template>
