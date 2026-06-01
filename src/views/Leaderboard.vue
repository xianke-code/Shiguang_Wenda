<template>
<div>
<h2>积分榜</h2>
<ul class="board">
<li v-for="(u,idx) in list" :key="idx">{{ idx+1 }}. {{ u.username }} · {{ u.points }}分</li>
</ul>
</div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
const list = ref([])
onMounted(async () => {
  const res = await axios.get('/api/leaderboard')
  list.value = res.data
})
</script>
<style scoped>
.board{list-style:none;padding:0}
.board li{padding:8px;border-bottom:1px solid #d9ccb2}
</style>