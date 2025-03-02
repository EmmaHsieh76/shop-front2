// 重新整理後可維持登入狀態 => 把pinia登入資訊儲存在 localstorage
import { createPinia } from 'pinia'
// 可以保存pinia資訊的套件
import persistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(persistedstate)

export default pinia
