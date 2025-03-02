<template>
  <VContainer>
    <VCol cols="12">
      <h1>購物車</h1>
    </VCol>
    <VDivider></VDivider>
    <VCol cols="12">
      <VDataTable :items="cart" :headers="headers">
        <template #[`item.product.name`] = "{ item }">
          <span :class="item.product.sell ? [] : ['text-decoration-line-through', 'text-red']">
            {{ item.product.name }}
          <span v-if="item.product.sell">{{ item.product.name }}</span>
          <span v-else class="text-red text-decoration-line-through">{{ item.product.name }}(已下架)</span>
          </span>
        </template>
        <template #[`item.quantity`] =" { item } ">
          <VBtn variant="text" icon="mdi-minus" color="red" @click="addCart(item.product._id, -1)"></VBtn>
          {{ item.quantity }}
          <VBtn variant="text" icon="mdi-plus" color="green" @click="addCart(item.product._id, 1)"></VBtn>
        </template>
        <template #[`item.action`]=" { item } ">
          <VBtn variant="text" icon="mdi-delete" color="red" @click="addCart(item.product._id, item.quantity * -1)"></VBtn>
        </template>
      </VDataTable>
    </VCol>
    <VCol cols="12" class="text-center">
      <p>總金額 {{total}}</p>
      <VBtn color="green" :disabled="!canCheckout"
      :loading="isSubmitting" @click="checkout"
      >結帳</VBtn>
    </VCol>
  </VContainer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()
const router = useRouter()

const cart = ref([])

const headers = [
  { title: '商品名稱', key: 'product.name' },
  { title: '單價', key: 'product.price' },
  { title: '數量', key: 'quantity' },
  { title: '總價', key: 'total', value: item => item.product.price * item.quantity },
  { title: '操作', key: 'action' }
]

// 計算總金額
const total = computed(() => {
  return cart.value.reduce((total, current) => {
    return total + current.quantity * current.product.price
  }, 0)
})

const canCheckout = computed(() => {
  // 購物車陣列長度大於 0 ， 而且購物車內沒有包含未上架的商品
  return cart.value.length > 0 && !cart.value.some(item => !item.product.sell)
})

const addCart = async (product, quantity) => {
  if (!user.isLogin) {
    router.push('/login')
    return
  }
  try {
    const { data } = await apiAuth.patch('/users/cart', {
      product,
      quantity
    })
    user.cart = data.result
    createSnackbar({
      text: '修改成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
    // 找出在購物車內商品的索引
    const idx = cart.value.findIndex(item => item.product._id === product)
    cart.value[idx].quantity += quantity
    if (cart.value[idx].quantity <= 0) {
      cart.value.splice(idx, 1)
    }
  } catch (error) {
    console.log(error)
    const text = error?.response?.data?.message || '發生錯誤，請稍後再試'
    createSnackbar({
      text,
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'red',
        location: 'bottom'
      }
    })
  }
}

// 結帳
const isSubmitting = ref(false)
const checkout = async () => {
  isSubmitting.value = true
  try {
    await apiAuth.post('/orders')
    user.cart = 0
    router.push('/orders')
    createSnackbar({
      text: '結帳成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
  } catch (error) {
    const text = error?.response?.data?.message || '發生錯誤，請稍後再試'
    createSnackbar({
      text,
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'red',
        location: 'bottom'
      }
    })
  }
  isSubmitting.value = false
}

onMounted(async () => {
  try {
    const { data } = await apiAuth.get('/users/cart')
    cart.value.push(...data.result)
  } catch (error) {
    const text = error?.response?.data?.message || '發生錯誤，請稍後再試'
    createSnackbar({
      text,
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'red',
        location: 'bottom'
      }
    })
  }
})

</script>
