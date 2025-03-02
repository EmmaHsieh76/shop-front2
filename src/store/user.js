// Utilities
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import UserRole from '@/enums/UserRole'
import { useApi } from '@/composables/axios'

// state = ref、react
// getter = compute
// action = function
// 使用者要保存在 pinia 的東西
export const useUserStore = defineStore('user', () => {
  const { apiAuth } = useApi()
  const token = ref('')
  const account = ref('')
  const email = ref('')
  const cart = ref(0)
  const role = ref(UserRole.USER)

  // 把上面那些改成傳入的資料
  const login = (data) => {
    if (data.token) {
      token.value = data.token
    }
    account.value = data.account
    email.value = data.email
    cart.value = data.cart
    role.value = data.role
  }

  // 判斷是否為登入狀態
  const isLogin = computed(() => {
    return token.value.length > 0
  })

  const isAdmin = computed(() => {
    return role.value === UserRole.ADMIN
  })

  const getProfile = async () => {
    if (token.value.length === 0) return
    try {
      // axios攔截器在送出請求給後端前，把 token 加上 bearer後，再把資料存到 localStorege
      const { data } = await apiAuth.get('/users/me')
      login(data.result)
    } catch (error) {
      logout()
    }
  }

  const logout = () => {
    token.value = ''
    account.value = ''
    email.value = ''
    cart.value = 0
    role.value = UserRole.USER
  }

  return {
    token,
    account,
    email,
    cart,
    role,
    login,
    logout,
    isLogin,
    isAdmin,
    getProfile
  }
}, {
  persist: {
    // localStoreage 的名稱
    key: 'hiko',
    paths: ['token']
  }
})
