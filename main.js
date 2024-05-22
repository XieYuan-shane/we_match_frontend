import App from './App'
import { createSSRApp } from 'vue'
// 创建实例
import { createPinia } from 'pinia';
const pinia = createPinia();
export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia);
  return {
    app
  }
}
//npm run dev

