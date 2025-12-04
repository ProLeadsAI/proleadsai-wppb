import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const mountPoint = document.getElementById('proleadsai-app')

if (mountPoint) {
  createApp(App).mount('#proleadsai-app')
}
