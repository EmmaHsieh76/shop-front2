<template>
<VContainer>
  <VRow>
    <VCol cols="12">
       <h1>RegisterView</h1>
    </VCol>
    <VDivider></VDivider>
    <VCol cols="12">
      <VForm :disable="isSubmitting" @submit.prevent="submit">
        <VTextField label="帳號" minlength="4" maxlength="20" counter
        v-model="account.value.value"
        :error-messages="account.errorMessage.value"
        ></VTextField>
        <VTextField label="信箱" type="email"
         v-model="email.value.value"
        :error-messages="email.errorMessage.value"
        ></VTextField>
        <VTextField label="密碼" minlength="4" maxlength="20" counter type="password"
         v-model="password.value.value"
        :error-messages="password.errorMessage.value"
        ></VTextField>
        <VTextField label="確認密碼" minlength="4" maxlength="20" counter type="password"
         v-model="passwordConfirm.value.value"
        :error-messages="passwordConfirm.errorMessage.value"
        ></VTextField>
        <VBtn type="submit" color="green">註冊</VBtn>
      </VForm>
    </VCol>
  </VRow>
</VContainer>
</template>

<script setup>
import validator from 'validator'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
// useRouter => 做跳頁處理
// useRoute => 取此頁資訊
import { useRouter } from 'vue-router'
import { useSnackbar } from 'vuetify-use-dialog'
import { useApi } from '@/composables/axios'

const { api } = useApi()

const router = useRouter()
const createSnackbar = useSnackbar()

// 定義註冊表單的資料格式
const schema = yup.object({
  // 定義帳號必須為文字,必填,限制長度
  account: yup
    .string()
    .required('帳號為必填欄位')
    .min(4, '使用者帳號長度不符')
    .max(20, '使用者帳號長度不符'),
  email: yup
    .string()
    .required('信箱為必填欄位')
    // .test(自訂名稱, 錯誤訊息, 驗證function)
    .test(
      'isEmail', '信箱格式錯誤',
      (value) => {
        return validator.isEmail(value)
      }),
  password: yup
    .string()
    .required('密碼為必填欄位')
    .min(4, '密碼長度不符')
    .max(20, '密碼長度不符'),
  passwordConfirm: yup
    .string()
    .required('密碼為必填欄位')
    .min(4, '密碼長度不符')
    .max(20, '密碼長度不符')
  // .oneOf 只允許符合陣列內其中一個值
  // .oneOf(陣列, 錯誤訊息)
  // .ref('password') 代表這個 schema 的 password 欄位值
    .oneOf([yup.ref('password')], '密碼不一致')
})

// 建立表單，利用上面定義的欄位 schema
// handleSubmit => 資料送出做的處理，例如: 把資料傳去後端
// isSubmitting => 判斷表單是否還在送出處理中，才能把表單停用，避免後端收到重複資料
const { handleSubmit, isSubmitting } = useForm({
  // 表單驗證方式使用上面定義的schema
  validationSchema: schema
})

// 綁定表單欄位，利用上面定義的 schema 裡的欄位
// useField(欄位名稱要和上面定義的 schema 一樣)
const account = useField('account')
const email = useField('email')
const password = useField('password')
const passwordConfirm = useField('passwordConfirm')

const submit = handleSubmit(async (values) => {
  // values => 表單欄位裡所有的值
  try {
    await api.post('/users', {
      account: values.account,
      email: values.email,
      password: values.password
    })
    createSnackbar({
      text: '註冊成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
    router.push('/login')
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
