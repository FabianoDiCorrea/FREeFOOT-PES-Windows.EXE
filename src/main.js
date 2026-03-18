import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

import { hotfixService } from './services/hotfix.service'

const app = createApp(App)
app.use(router)

// Aplica correções de dados conhecidas na inicialização
hotfixService.applyArgentinaFix();

app.mount('#app')
