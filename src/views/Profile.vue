<template>
<div class="profile">
<h2>个人中心</h2>
<div v-if="profile">
<p>用户名：{{ profile.username }}</p>
<p>积分：{{ profile.points }}</p>
<p>连续签到：{{ profile.streak }} 天</p>
<p>已完成答题：{{ profile.quizzesCompleted }} 次</p>
<h3>成就</h3>
<ul>
<li v-for="ach in achievements" :key="ach.key">{{ ach.unlocked?'✅':'🔒' }} {{ ach.name }} - {{ ach.desc }}</li>
</ul>
</div>
</div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user.js'
import axios from 'axios'
const userStore = useUserStore()
const profile = ref(null)
const achievements = ref([])
onMounted(async () => {
  const res = await axios.get('/api/user/profile', { headers: { Authorization: `Bearer ${userStore.token}` } })
  profile.value = res.data
  const resAch = await axios.get('/api/achievements', { headers: { Authorization: `Bearer ${userStore.token}` } })
  achievements.value = resAch.data
})
</script>