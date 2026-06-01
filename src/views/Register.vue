<template>
<div class="form-page">
<h2>注册</h2>
<input v-model="username" placeholder="用户名" />
<input v-model="password" type="password" placeholder="密码" />
<button @click="doRegister">注册</button>
<p style="margin-top:8px">已有账号？<router-link to="/login">去登录</router-link></p>
<div v-if="msg" :class="msg.includes('成功')?'msg':'error'">{{ msg }}</div>
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
const msg = ref('')
const doRegister = async () => {
  try {
    await userStore.register(username.value, password.value)
    msg.value = '注册成功，请登录'
    setTimeout(() => router.push('/login'), 1000)
  } catch(e) { msg.value = e.response?.data?.error || '注册失败' }
}
</script>