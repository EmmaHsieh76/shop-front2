<template>
<VContainer>
  <VRow>
    <VCol cols="12">
      <h1>購物網</h1>
    </VCol>
    <VDivider></VDivider>
    <VCol cols="12" md="6" lg="3" v-for="product in products" :key="product._id">
      <ProductCard v-bind="product"></ProductCard>
    </VCol>
  </VRow>
</VContainer>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ProductCard from '@/components/ProductCard.vue'
import gsap from 'gsap'

const { api } = useApi()
const createSnackbar = useSnackbar()

const products = ref([])

// onMounted() => 元件被掛載到DOM上後，就會發請求，執行這個方法
onMounted(async () => {
  try {
    const { data } = await api.get('/products', {
      // -1 =>  把全部的商品都傳過來，沒有加 -1 這個設定 會是預設的20筆資料
      // 預設 在 back controller 的 products.js 的 get 方法
      params: {
        itemsPerPage: -1
      }
    })
    products.value.push(...data.result.data)
    // nextTick() => 等待 DOM 更新後再執行某些操作
    await nextTick()
    gsap
      .to('.product-card', { opacity: 1, duration: 0.5 })
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
})
</script>

<style lang="sass">
.product-card
  opacity: 0
</style>
