<template>
<div class="form-page">
<h2>登录</h2>
<input v-model="username" placeholder="用户名" />
<input v-model="password" type="password" placeholder="密码" />
<button @click="doLogin">登录</button>
<p style="margin-top:8px">没有账号？<router-link to="/register">去注册</router-link></p>
<div v-if="error" class="error">{{ error }}</div>
</div>
</template>
<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user.js'
import { useRouter } from 'vue-router'
const userStore = useUserStore()
const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const doLogin = async () => {
  try {
    await userStore.login(username.value, password.value)
    router.push('/')
  } catch(e) { error.value = e.response?.data?.error || '登录失败' }
}
</script>