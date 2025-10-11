import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initializeProvider } from '@metamask/providers'
import LocalMessageDuplexStream from '@/utils/LocalMessageDuplexStream'

import App from './App.vue'
import router from './router'

const metamaskStream = new LocalMessageDuplexStream({
  name: 'inpage',
  target: 'contentscript'
})

initializeProvider({
  connectionStream: metamaskStream
})

const { ethereum } = window

const app = createApp(App)

app.use(createPinia())
app.use(router)

if (ethereum) {
  app.provide('ethereum', window.ethereum)
} else {
  console.error('MetaMask is not installed')
}

app.mount('#app')
