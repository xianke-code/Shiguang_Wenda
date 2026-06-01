<template>
<div class="result-page">
<div v-if="!results.length">加载中...</div>
<div v-else>
<h2>成绩：{{ score }}/{{ total }}</h2>
<p>正确率：{{ (score/total*100).toFixed(0) }}% | 获得积分：{{ pointsEarned }}</p>
<div class="list">
<div v-for="item in results" :key="item.id" class="item" :class="{ correct: item.correct }">
<div class="question">{{ item.question }}</div>
<div class="answer">你的答案：{{ item.options?.[item.userAnswer] || '未答' }}</div>
<div v-if="!item.correct" class="correct-answer">正确答案：{{ item.options?.[item.correctAnswer] }}</div>
<div class="explanation">{{ item.explanation }}</div>
<button @click="toggleFavorite(item.id)">{{ isFav(item.id)?'取消收藏':'收藏' }}</button>
</div>
</div>
<router-link to="/">返回首页</router-link>
</div>
</div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '../stores/user.js'
const router = useRouter()
const userStore = useUserStore()
const results = ref([])
const score = ref(0)
const total = ref(0)
const pointsEarned = ref(0)
const favorites = ref([])
const data = history.state?.results
if (data) {
  results.value = data.results
  score.value = data.score
  total.value = data.total
  pointsEarned.value = data.pointsEarned
} else {
  router.push('/')
}
const loadFavorites = async () => {
  if (!userStore.token) return
  const res = await axios.get('/api/favorites', { headers: { Authorization: `Bearer ${userStore.token}` } })
  favorites.value = res.data.map(q => q.id)
}
const isFav = (id) => favorites.value.includes(id)
const toggleFavorite = async (id) => {
  if (isFav(id)) {
    await axios.delete(`/api/favorite/${id}`, { headers: { Authorization: `Bearer ${userStore.token}` } })
  } else {
    await axios.post(`/api/favorite/${id}`, {}, { headers: { Authorization: `Bearer ${userStore.token}` } })
  }
  loadFavorites()
}
onMounted(loadFavorites)
</script>
<style scoped>
.result-page{max-width:700px;margin:0 auto}
.list{margin-top:20px}
.item{padding:12px;margin:8px 0;border:1px solid #d9ccb2;background:#fdfbf5}
.item.correct{border-left:4px solid #7c9a6b}
.question{font-weight:bold}
.answer,.correct-answer{font-size:0.9rem}
.explanation{font-size:0.85rem;color:#8b7a62;margin-top:4px}
button{background:#e8e0d1;border:1px solid #c9b99a;padding:2px 8px;cursor:pointer;margin-top:4px}
</style>