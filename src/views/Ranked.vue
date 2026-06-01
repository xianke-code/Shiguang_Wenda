<template>
<div class="ranked-page">
<h2>排位赛</h2>
<div v-if="!playing" class="lobby">
<div class="my-rank">我的段位：{{ rankInfo.rankLevel }} ({{ rankInfo.rankScore }}分)</div>
<button @click="startRankedGame" class="btn-primary">开始排位</button>
<p>随机10题，答对越多排位分越高</p>
<router-link to="/duel" class="btn-secondary">双人对决</router-link>
</div>
<div v-else-if="loading">加载中...</div>
<div v-else-if="finished" class="result">
<h2>排位赛结束</h2>
<p>得分：{{ score }}/{{ total }}</p>
<p>新排位分：{{ newRankScore }}</p>
<p>{{ resultMsg }}</p>
<button @click="resetRanked" class="btn-secondary">再来一局</button>
</div>
<div v-else class="quiz-area">
<div class="progress">第 {{ current+1 }}/{{ questions.length }} 题</div>
<div class="question-card">
  <div class="q-text">{{ questions[current]?.question }}</div>
  <div class="q-meta">{{ questions[current]?.category }} · 难度{{ questions[current]?.difficulty }}</div>
  <div class="options">
    <button v-for="(opt, idx) in questions[current]?.options" :key="idx" @click="selectAnswer(idx)" :disabled="answered" :class="optionClass(idx)">
      {{ ['A','B','C','D'][idx] }}. {{ opt }}
    </button>
  </div>
  <div v-if="feedback" class="feedback">{{ feedback }}</div>
</div>
</div>
</div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useUserStore } from '../stores/user.js'
const userStore = useUserStore()
const rankInfo = ref({ rankLevel: '青铜III', rankScore: 1000 })
const playing = ref(false)
const questions = ref([])
const current = ref(0)
const userAnswers = ref([])
const feedback = ref('')
const answered = ref(false)
const loading = ref(false)
const finished = ref(false)
const score = ref(0)
const total = ref(0)
const newRankScore = ref(0)
const resultMsg = ref('')
onMounted(async () => {
  try {
    const res = await axios.get('/api/rank/info', { headers: { Authorization: `Bearer ${userStore.token}` } })
    rankInfo.value = res.data
  } catch(e) {}
})
const startRankedGame = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/questions?count=10')
    questions.value = res.data
    userAnswers.value = new Array(res.data.length).fill(-1)
    current.value = 0
    answered.value = false
    feedback.value = ''
    playing.value = true
  } catch(e) { alert('加载题目失败，请确认后端已启动') }
  loading.value = false
}
const selectAnswer = (idx) => {
  if (answered.value) return
  answered.value = true
  userAnswers.value[current.value] = idx
  const q = questions.value[current.value]
  if (!q) return
  if (idx === q.answer) {
    feedback.value = '✓ 正确'
  } else {
    feedback.value = '✗ 正确答案：' + q.options[q.answer]
  }
  setTimeout(() => {
    if (current.value < questions.value.length - 1) {
      current.value++
      answered.value = false
      feedback.value = ''
    } else {
      finishRanked()
    }
  }, 800)
}
const optionClass = (idx) => {
  if (!answered.value) return ''
  const q = questions.value[current.value]
  if (!q) return ''
  if (idx === q.answer) return 'correct'
  if (idx === userAnswers.value[current.value] && idx !== q.answer) return 'wrong'
  return ''
}
const finishRanked = async () => {
  const payload = questions.value.map((q, i) => ({
    id: q.id,
    answer: userAnswers.value[i] === -1 ? 0 : userAnswers.value[i]
  }))
  try {
    const checkRes = await axios.post('/api/check-batch', { answers: payload }, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    score.value = checkRes.data.score
    total.value = checkRes.data.total
    const userRes = await axios.get('/api/user/profile', {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    const oldScore = userRes.data.rankScore || 1000
    const expected = 1 / (1 + Math.pow(10, (1200 - oldScore) / 400))
    const actual = score.value / total.value
    const newScore = Math.round(oldScore + 32 * (actual - expected))
    newRankScore.value = newScore
    if (newScore > oldScore) {
      resultMsg.value = '排位分提升了！'
    } else if (newScore < oldScore) {
      resultMsg.value = '排位分下降了，继续加油！'
    } else {
      resultMsg.value = '排位分不变'
    }
    rankInfo.value.rankScore = newScore
    finished.value = true
  } catch(e) {
    alert('提交失败：' + (e.response?.data?.error || e.message))
  }
}
const resetRanked = () => {
  playing.value = false
  finished.value = false
  questions.value = []
  current.value = 0
  answered.value = false
}
</script>
<style scoped>
.ranked-page{max-width:700px;margin:0 auto}
.lobby{text-align:center;padding:30px;background:#faf6ef;border:1px solid #d9ccb2}
.my-rank{font-size:1.2rem;margin-bottom:16px}
.btn-primary{background:#b39b7c;color:#fff;border:none;padding:10px 24px;cursor:pointer;margin:8px;display:inline-block}
.btn-secondary{background:#e8e0d1;border:1px solid #c9b99a;padding:8px 16px;cursor:pointer;display:inline-block;margin-top:12px;text-decoration:none;color:#3a2f2a}
.progress{font-weight:bold;margin-bottom:8px}
.question-card{background:#faf6ef;border:1px solid #d9ccb2;padding:20px;margin-top:10px}
.q-text{font-size:1.2rem;margin-bottom:8px}
.q-meta{font-size:0.9rem;color:#6b5e4a;margin-bottom:16px}
.options button{display:block;width:100%;text-align:left;padding:10px;margin:6px 0;background:#fff;border:1px solid #d9ccb2;cursor:pointer}
.options button:hover{background:#f0e7d6}
.options button.correct{background:#d4edda;border-color:#a3cfbb}
.options button.wrong{background:#f8d7da;border-color:#dca7a7}
.options button:disabled{cursor:not-allowed}
.feedback{margin-top:10px;font-weight:bold}
.result{text-align:center;padding:30px;background:#faf6ef;border:1px solid #d9ccb2}
.result p{margin:8px 0}
</style>