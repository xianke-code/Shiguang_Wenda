<template>
<div>
<h2>我的收藏</h2>
<div v-if="list.length===0">暂无收藏</div>
<div v-for="q in list" :key="q.id" class="q-item">
<div>{{ q.question }}</div>
<button @click="removeFav(q.id)">移除</button>
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
  const res = await axios.get('/api/favorites', { headers: { Authorization: `Bearer ${userStore.token}` } })
  list.value = res.data
})
const removeFav = async (id) => {
  await axios.delete(`/api/favorite/${id}`, { headers: { Authorization: `Bearer ${userStore.token}` } })
  list.value = list.value.filter(q => q.id !== id)
}
</script>
<style scoped>
.q-item{padding:8px;margin:8px 0;border:1px solid #d9ccb2;background:#fdfbf5}
button{background:#e8e0d1;border:1px solid #c9b99a;padding:2px 8px;cursor:pointer}
</style>