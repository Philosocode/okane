// External
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'

// Internal
import App from '@/App.vue'

import { router } from '@/features/navigation/router';

const app = createApp(App)

app.use(createPinia())
app.use(router);
app.use(VueQueryPlugin)

app.mount('#app')
