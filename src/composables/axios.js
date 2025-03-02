import axios from 'axios'
import { useUserStore } from '@/store/user'

const api = axios.create({
  baseURL: import.meta.env.VITE_API
})

// 攔截器
const apiAuth = axios.create({
  baseURL: import.meta.env.VITE_API
})

// axios攔截器的功能 =>在資料出去之前或之後先加一點東西
// 請求送出前，執行這個 function
// config 是 function的參數，代表這次請求的設定 (例如:get()、post()...)
// 步驟
// 1. 呼叫 axios.get / axios.post 時
// 2. interceptors.request 請求攔截器
// 3. 送出請求
// 4. interceptors.response 回應攔截器
// 5. 呼叫的地方的 .then() .catch()
apiAuth.interceptors.request.use(config => {
  const user = useUserStore()
  config.headers.Authorization = 'Bearer ' + user.token
  return config
})

// token 舊換新
// apiAuth.interceptors.response(成功時執行, 失敗時執行)
// 範例:
// 1. apiAuth.get('/users/me')
// 2-1. 如果不是 JWT 過期錯誤，將 apiAuth.get('/users/me') 的錯誤回傳
// 2-2. 如果發生 JWT 過期錯誤，進到 3
// 3. 傳送舊換新請求
// 3-1. 如果舊換新成功，修改 apiAuth.get('/users/me') 的 jwt 為新的後送出
// 3-2. 如果舊換新失敗，將 apiAuth.get('/users/me') 的錯誤回傳
// apiAuth.interceptors.response(成功時執行, 失敗時執行)
apiAuth.interceptors.response.use((res) => {
  return res
}, (error) => {
  if (error.message) {
    // 如果錯誤訊息是 JWT 過期 且 請求不是舊換新
    if (error.response.data.message === 'JWT 過期' && error.config.url !== '/users/extend') {
      const user = useUserStore()
      // 傳送舊換新請求
      return apiAuth.patch('/users/extend')
        .then(({ data }) => {
          // 更新 pinia 保存的 token
          user.token = data.result
          // 修改發生錯誤期間的原請求設定的 jwt
          error.config.headers.Authorization = 'Bearer' + user.token
          // 重新傳送原請求
          // error.config => 原始錯誤
          return axios(error.config)
        })
        .catch(() => {
          // 如果舊換新失敗，登出
          user.logout()
          // 回傳原錯誤到呼叫的地方
          return Promise.reject(error)
        })
    }
  }
  // 如果請求沒回應，或不是過期的錯誤，回傳原錯誤到呼叫的地方
  return Promise.reject(error)
})

export const useApi = () => {
  return { api, apiAuth }
}
