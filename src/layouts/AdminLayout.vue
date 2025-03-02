<template>
  <VNavigationDrawer permanent>
    <VList>
      <VListItem :prepend-avatar="avatar" :title="user.account">

      </VListItem>
    </VList>
    <VList>
      <VListItem
      v-for="item in navItems" :key="item.to"
      :to="item.to" :title="item.text" :prepend-icon="item.icon"
      >
      </VListItem>
    </VList>
  </VNavigationDrawer>
  <!-- 頁面內容 -->
  <VMain>
    <RouterView></RouterView>
  </VMain>
</template>

<script setup>
import { useUserStore } from '@/store/user'
import { computed } from 'vue'

const user = useUserStore()

const navItems = [
  { to: '/admin/products', text: '商品管理', icon: 'mdi-shoe-ballet' },
  { to: '/admin/orders', text: '訂單管理', icon: 'mdi-list-box' },
  { to: '/', text: '回首頁', icon: 'mdi-home' }
]

const avatar = computed(() => {
  return `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${user.account}`
})

</script>
