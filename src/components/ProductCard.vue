<template>
  <VCard class="product-card">
    <VImg :src="image" cover height="200px"></VImg>
    <VCardTitle>
      <RouterLink class="text-primary text-decoration-none" :to="'/products/' + _id">
         {{ name }}
      </RouterLink>
    </VCardTitle>
    <VCardSubTitle>${{ price }}</VCardSubTitle>
    <!-- style="white-space: pre;" => 商品描述才能換行 -->
    <VCardText style="white-space: pre;">{{ description }}</VCardText>
    <VCardActions>
      <VBtn color="primary" prepend-icon="mdi-cart" @click="addCart">加入購物車</VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup>
import { useApi } from '@/composables/axios'
import { useUserStore } from '@/store/user'
import { useSnackbar } from 'vuetify-use-dialog'
import { useRouter } from 'vue-router'

const { apiAuth } = useApi()
const user = useUserStore()
const router = useRouter()

const createSnackbar = useSnackbar()

const props = defineProps([
  '_id',
  'category',
  'description',
  'image',
  'name',
  'price',
  'sell'
])

// 加入購物車
const addCart = async () => {
  if (!user.isLogin) {
    router.push('/login')
    return
  }
  try {
    const { data } = await apiAuth.patch('/users/cart', {
      product: props._id,
      quantity: 1
    })
    user.cart = data.result
    createSnackbar({
      text: '加入購物車',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
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
</script>
