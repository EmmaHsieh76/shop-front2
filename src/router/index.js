// Composables
import { createRouter, createWebHashHistory, START_LOCATION } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/FrontLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/front/HomeView.vue'),
        meta: {
          title: '購物網',
          // 不用登入就能看
          login: false,
          // 不是管理員也能看
          admin: false
        }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/front/RegisterView.vue'),
        meta: {
          title: '購物網 | 註冊',
          login: false,
          admin: false
        }
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/front/LoginView.vue'),
        meta: {
          title: '購物網 | 登入',
          login: false,
          admin: false
        }
      },
      {
        path: 'products/:id',
        name: 'Product',
        component: () => import('@/views/front/ProductView.vue'),
        meta: {
          title: '購物網 | 商品',
          login: false,
          admin: false
        }
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/views/front/CartView.vue'),
        meta: {
          title: '購物網 | 購物車',
          login: true,
          admin: false
        }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/front/OrdersView.vue'),
        meta: {
          title: '購物網 | 訂單',
          login: true,
          admin: false
        }
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'AdminHome',
        component: () => import('@/views/admin/HomeView.vue'),
        meta: {
          title: '購物網 | 管理',
          // 登入才能看
          login: true,
          // 是管理員才能看
          admin: true
        }
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('@/views/admin/ProductsView.vue'),
        meta: {
          title: '購物網 | 商品管理',
          // 登入才能看
          login: true,
          // 是管理員才能看
          admin: true
        }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/OrdersView.vue'),
        meta: {
          title: '購物網 | 訂單管理',
          // 登入才能看
          login: true,
          // 是管理員才能看
          admin: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

// 進到每頁後把每頁的標題改成相對應的名稱
router.afterEach((to, from) => {
  document.title = to.meta.title
})

// 在進到每頁前
router.beforeEach(async (to, from, next) => {
  const user = useUserStore()

  // START_LOCATION => 第一次跳轉到頁面
  if (from === START_LOCATION) {
    // 取得使用者資訊
    await user.getProfile()
  }

  // 當使用者登入後要去的頁面包含 註冊跟登入時
  if (user.isLogin && ['/register', '/login'].includes(to.path)) {
    // 重新導向首頁
    next('/')
    // 如果要去的頁面需要登入，但還沒登入
  } else if (to.meta.login && !user.isLogin) {
    // 重新導向到登入頁面
    next('/login')
    // 如果要去的頁面需要管理員身分，但權限不同
  } else if (to.meta.admin && !user.isAdmin) {
    // 重新導向到首頁
    next('/')
  } else {
    // 不重新導向
    next()
  }
})

export default router
