<template>
<VContainer>
  <VRow>
    <VCol cols="12">
      <h1 class="text-center">商品管理</h1>
    </VCol>
    <VDivider></VDivider>
    <VCol cols="12">
      <VBtn color="green" @click="openDialog()">新增商品</VBtn>
    </VCol>
    <VCol cols="12">
      <VDataTableServer
      v-model:items-per-page="tableItemsPerPage"
      v-model:sort-by="tableSortBy"
      v-model:page="tablePage"
      :items="tableProducts"
      :headers="tableHeaders"
      :loading="tableLoading"
      :items-length="tableItemsLength"
      :search="tableSearch"
      @update:items-per-page="tableLoadItems"
      @update:sort-by="tableLoadItems"
      @update:page="tableLoadItems"
      hover
      >
      <template #top>
        <VTextField
        label="搜尋"
        append-icon="mdi-magnify"
        v-model="tableSearch"
        @click:append="tableApplySearch"
        @keydown.enter="tableApplySearch"
        >
        </VTextField>
      </template>
      <!-- #[`key=image的欄位`] = "顯示內容(解構data資料的item)"   -->
      <template #[`item.image`] = "{ item }"  >
        <!-- <pre> 全名是 preformatted text（預格式化文字）。它的作用是 保留原始文字的格式 -->
        <VImg :src="item.image" height="50px"></VImg>
      </template>
      <template #[`item.sell`] = "{ item }"  >
        <!-- <pre> 全名是 preformatted text（預格式化文字）。它的作用是 保留原始文字的格式 -->
        <!-- <VIcon v-if="item.sell" icon="mdi-check"></VIcon>
        <VIcon v-else-if="!item.sell" icon="mdi-alpha-x-box"></VIcon> -->
        <VIcon :icon="item.sell ? 'mdi-check' : 'mdi-alpha-x-box'"></VIcon>
      </template>
      <template #[`item.edit`] = "{ item }">
        <VBtn icon="mdi-pencil" variant="text" color="blue" @click="openDialog(item)"></VBtn>
      </template>
      </VDataTableServer>
    </VCol>
  </VRow>
</VContainer>
<VDialog v-model="dialog" persistent width="500px">
  <VForm :disabled="isSubmitting" @submit.prevent="submit">
     <VCard>
      <VCardTitle>{{ dialogId === '' ? '新增商品' : '編輯商品' }}</VCardTitle>
      <VCardText>
        <VTextField
        label="名稱"
        v-model="name.value.value"
        :error-messages="name.errorMessage.value"
        ></VTextField>
        <VTextField
        label="價格" type="number" min="0"
        v-model="price.value.value"
        :error-messages="price.errorMessage.value"
        ></VTextField>
        <VSelect label="分類" :items="categories"
        v-model="category.value.value"
        :error-messages="category.errorMessage.value"
        ></VSelect>
        <VCheckbox
        label="上架"
        v-model="sell.value.value"
        :error-messages="sell.errorMessage.value"
        ></VCheckbox>
        <VTextarea
        label="說明"
        v-model="description.value.value"
        :error-messages="description.errorMessage.value"
        ></VTextarea>
        <VueFileAgent
        v-model="fileRecords" v-model:rawModelValue="rawFileRecords"
        accept="image/jpeg,image/png"
        deletable
        :errorText="{type: '檔案格式不支援', size: '檔案超過1MB大小限制' }"
        helpText="選擇檔案拖曳到這裡"
        :maxFiles="1"
        maxSize="1MB"
        ref="fileAgent"
        ></VueFileAgent>
      </VCardText>
      <VCardActions>
        <VSpacer></VSpacer>
        <VBtn color="red" :disabled="isSubmitting" @click="closeDialog">取消</VBtn>
        <VBtn color="green" type="submit" :loading="isSubmitting">送出</VBtn>
      </VCardActions>
    </VCard>
  </VForm>
</VDialog>
</template>

<script setup>
import { ref } from 'vue'
import * as yup from 'yup'
import { useForm, useField } from 'vee-validate'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const fileAgent = ref(null)

// 表單對話框的開啟狀態
const dialog = ref(false)
// 表單對話框正在編輯的商品 ID ，空的話代表新增商品
const dialogId = ref('')
// 打開編輯對話框
const openDialog = (item) => {
  if (item) {
    dialogId.value = item._id
    name.value.value = item.name
    price.value.value = item.price
    description.value.value = item.description
    category.value.value = item.category
    sell.value.value = item.sell
  } else {
    dialogId.value = ''
  }
  dialog.value = true
}

// 關閉對話框
const closeDialog = () => {
  dialog.value = false
  resetForm()
  fileAgent.value.deleteFileRecord()
}

// 分類
const categories = ['衣服', '食品', '3C', '遊戲']

// 表單驗證
const schema = yup.object({
  name: yup
    .string()
    .required('缺少商品名稱'),
  price: yup
    .number()
    .typeError('商品價格格式錯誤')
    .required('缺少商品價格')
    .min(0, '價格不能少於0'),
  description: yup
    .string()
    .required('缺少商品說明'),
  // .test(自訂驗證名稱, 自訂錯誤訊息, 驗證function)
  category: yup
    .string()
    .required('缺少商品分類')
    .test('isCategory', '商品分類錯誤', value => categories.includes(value)),
  sell: yup
    .boolean()
})

// 跟上面的驗證綁定
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    price: 0,
    description: '',
    category: '',
    sell: false
  }
})

// 定義欄位
const name = useField('name')
const price = useField('price')
const description = useField('description')
const category = useField('category')
const sell = useField('sell')

const fileRecords = ref([])
const rawFileRecords = ref([])

// values => 表單欄位
const submit = handleSubmit(async (values) => {
  if (fileRecords.value[0]?.error) return
  // 如果我現在是新增，檔案沒有東西 => 不執行
  if (dialogId.value === '' && fileRecords.value.length === 0) return
  try {
    // 建立 ForData 物件
    // 使用fd.append(欄位, 值) 將資料放進去
    const fd = new FormData()
    for (const key in values) {
      fd.append(key, values[key])
    }

    if (fileRecords.value.length > 0) {
      fd.append('image', fileRecords.value[0].file)
    }

    // 如果是新增商品時
    if (dialogId.value === '') {
      // apiAuth.post(網址, 傳出去的資料, 設定)
      await apiAuth.post('/products', fd)
    } else {
      await apiAuth.patch('/products/' + dialogId.value, fd)
    }

    createSnackbar({
      text: dialogId.value === '' ? '新增成功' : '編輯成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
    closeDialog()
    // 回到第一頁，表格重新載入
    tableApplySearch()
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

// 表格 (對應 VDataTableServer )
// 表格每頁有幾個
const tableItemsPerPage = ref(10)
// 表格排序
const tableSortBy = ref([
  { key: 'createAt', order: 'desc' }
])
// 表格頁碼
const tablePage = ref(1)
// 表格商品資料陳列
const tableProducts = ref([])
// 表格欄位設定
const tableHeaders = [
  // sortable => 可否排序
  { title: '圖片', align: 'center', sortable: false, key: 'image' },
  { title: '名稱', align: 'center', sortable: true, key: 'name' },
  { title: '價格', align: 'center', sortable: true, key: 'price' },
  // { title: '說明', align: 'center', sortable: true, key: 'description' },
  { title: '分類', align: 'center', sortable: true, key: 'category' },
  { title: '上架', align: 'center', sortable: true, key: 'sell' },
  { title: '編輯', align: 'center', sortable: false, key: 'edit' }
]
// 表格載入狀態
const tableLoading = ref(true)
// 表格全部資料數
const tableItemsLength = ref(0)
// 表格搜尋文字
const tableSearch = ref('')

// 表格載入資料
const tableLoadItems = async () => {
  tableLoading.value = true
  try {
    // apiAuth.get(網址, 請求設定)
    const { data } = await apiAuth.get('products/all', {
      // 這裡的 params 物件就是 前端傳給後端的參數，會附加在 URL 上，變成類似這樣的請求：
      // GET /products/all?page=1&itemsPerPage=10&sortBy=createAt&sortOrder=-1&search=
      params: {
        page: tablePage.value,
        itemsPerPage: tableItemsPerPage.value,
        // sortBy => 以什麼欄位做排序，這裡預設 '創建商品時間'
        sortBy: tableSortBy.value[0]?.key === 'createAt',
        // sortOrder => 排序遞增或是遞減，這裡是遞減
        sortOrder: tableSortBy.value[0]?.order === 'asc' ? 1 : -1,
        search: tableSearch.value
      }
    })
    // .splice(開始索引, 刪除幾個元素, 要插入的元素1)
    // 0 → 從索引 0 開始。
    // tableProducts.value.length → 刪除所有原本的資料。
    // ...data.result.data → 插入新的商品資料。
    // 總結:清空 tableProducts，插入後端回傳的新商品資料，讓表格更新
    tableProducts.value.splice(0, tableProducts.value.length, ...data.result.data)
    // 更新 tableItemsLength，讓前端知道商品的總數，確保分頁功能正確運作
    tableItemsLength.value = data.result.total
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
  // 全部執行完再把載入狀態變false載入狀態變false
  tableLoading.value = false
}
tableLoadItems()

// 表格套用搜尋
const tableApplySearch = () => {
  // 頁數回到第一頁
  tablePage.value = 1
  // 執行上方載入表格的方法
  tableLoadItems()
}
</script>
