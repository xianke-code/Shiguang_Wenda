<template>
<div>
<h2>错题本</h2>
<div v-if="list.length===0">暂无错题</div>
<div v-for="item in list" :key="item.id" class="item">
<div>{{ item.question }}</div>
<div class="answer">正确答案：{{ item.correctAnswer }}</div>
</div>
</div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useUserStore } from '../stores/user.js'
const userStore = useUserStore()
const list = ref([])
onMounted(async () => {
  const res = await axios.get('/api/wrong-list', { headers: { Authorization: `Bearer ${userStore.token}` } })
  list.value = res.data
})
</script>
<style scoped>
.item{padding:8px;margin:8px 0;border:1px solid #d9ccb2}
.answer{font-size:0.9rem;color:#6b5e4a}
</style>