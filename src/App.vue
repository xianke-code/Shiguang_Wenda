<template>
<div class="app-container" :class="{ dark: isDark }">
<header class="top-nav">
<router-link to="/" class="logo">拾光问答</router-link>
<nav class="nav-links">
<router-link to="/ranked">排位</router-link>
<router-link to="/duel">对决</router-link>
<router-link to="/leaderboard">排行</router-link>
<template v-if="userStore.token">
<router-link to="/profile">我</router-link>
<router-link to="/history">记录</router-link>
<router-link to="/favorites">收藏</router-link>
<router-link to="/wrong-list">错题</router-link>
<router-link to="/submit">投稿</router-link>
<button @click="logout">退出</button>
</template>
<template v-else>
<router-link to="/login">登录</router-link>
<router-link to="/register">注册</router-link>
</template>
<button @click="toggleDark" class="dark-toggle">{{ isDark ? '☀️' : '🌙' }}</button>
</nav>
</header>
<main>
<router-view />
</main>
</div>
</template>
<script setup>
import { ref } from 'vue'
import { useUserStore } from './stores/user.js'
import { useRouter } from 'vue-router'
const userStore = useUserStore()
const router = useRouter()
const isDark = ref(localStorage.getItem('dark') === 'true')
const toggleDark = () => {
  isDark.value = !isDark.value
  localStorage.setItem('dark', isDark.value)
}
const logout = () => {
  userStore.logout()
  router.push('/')
}
</script>
<style scoped>
.app-container{min-height:100vh;background:#f5f0e8;display:flex;flex-direction:column}
.app-container.dark{background:#1e1e1e;color:#d4d4d4}
.top-nav{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;background:#e8e0d1;border-bottom:1px solid #c9b99a;position:sticky;top:0;z-index:100}
.dark .top-nav{background:#2d2d2d;border-color:#444}
.logo{font-size:1.4rem;font-weight:bold;color:#4a3b2c;text-decoration:none}
.dark .logo{color:#e0d6c8}
.nav-links{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.nav-links a,.nav-links button{color:#4a3b2c;text-decoration:none;font-size:0.95rem;background:none;border:none;cursor:pointer;padding:4px 8px}
.dark .nav-links a,.dark .nav-links button{color:#e0d6c8}
.nav-links a:hover,.nav-links button:hover{text-decoration:underline}
.dark-toggle{font-size:1.2rem}
main{flex:1;padding:24px;max-width:900px;width:100%;margin:0 auto}
</style>