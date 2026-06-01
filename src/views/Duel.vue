<template>
<div class="duel-page">
<div v-if="!roomId" class="start-screen">
<h2>双人对决</h2>
<p>挑战AI对手，提升排位分</p>
<button @click="startDuel" class="btn-primary">开始匹配</button>
</div>
<div v-else-if="loading" class="loading">准备中...</div>
<div v-else-if="finished" class="result">
<h2>对决结束</h2>
<div class="scores">
  <div class="you">你：{{ playerScore }} 分</div>
  <div class="ai">AI：{{ aiScore }} 分</div>
</div>
<div class="winner">结果：{{ winnerText }}</div>
<p>新排位分：{{ newRankScore }}</p>
<div class="detail-list">
  <div v-for="(d, idx) in details" :key="idx" class="detail-item">
    <div class="q">{{ idx+1 }}. {{ d.question }}</div>
    <div>正确答案：{{ d.correctAnswer }}</div>
    <div :class="{ correct: d.playerCorrect }">你的答案：{{ d.playerAnswer }} ({{ d.playerTime }}ms)</div>
    <div :class="{ correct: d.aiCorrect }">AI答案：{{ d.aiAnswer }} ({{ d.aiTime }}ms)</div>
    <div class="explanation">{{ d.explanation }}</div>
  </div>
</div>
<button @click="resetDuel" class="btn-secondary">再来一局</button>
</div>
<div v-else class="quiz-area">
<div class="progress">第 {{ current+1 }}/{{ questions.length }} 题</div>
<div class="timer" v-if="timerRunning">{{ timeLeft }}s</div>
<div class="question-card" v-if="currentQuestion">
  <div class="q-text">{{ currentQuestion.question }}</div>
  <div class="q-meta">{{ currentQuestion.category }}</div>
  <div class="options">
    <button v-for="(opt, idx) in currentQuestion.options" :key="idx" @click="answerQuestion(idx)" :disabled="answered">
      {{ ['A','B','C','D'][idx] }}. {{ opt }}
    </button>
  </div>
</div>
</div>
</div>
</template>
<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useUserStore } from '../stores/user.js'
const userStore = useUserStore()
const roomId = ref(null)
const questions = ref([])
const current = ref(0)
const loading = ref(false)
const finished = ref(false)
const playerScore = ref(0)
const aiScore = ref(0)
const newRankScore = ref(0)
const details = ref([])
const answered = ref(false)
const timerRunning = ref(true)
const timeLeft = ref(30)
let timer = null
let startTime = 0
const currentQuestion = computed(() => questions.value[current.value] || null)
const winnerText = computed(() => {
  if (playerScore.value > aiScore.value) return '你赢了！'
  if (playerScore.value < aiScore.value) return 'AI赢了'
  return '平局'
})
const startDuel = async () => {
  loading.value = true
  try {
    const res = await axios.post('/api/duel/start', {}, { headers: { Authorization: `Bearer ${userStore.token}` } })
    roomId.value = res.data.roomId
    questions.value = res.data.questions
    current.value = 0
    answered.value = false
    startTimer()
  } catch(e) { alert('启动失败：' + (e.response?.data?.error || e.message)) }
  loading.value = false
}
const startTimer = () => {
  timeLeft.value = 30
  timerRunning.value = true
  startTime = Date.now()
  clearInterval(timer)
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timer)
      timerRunning.value = false
      submitAnswer(-1)
    }
  }, 1000)
}
const answerQuestion = (idx) => {
  clearInterval(timer)
  submitAnswer(idx)
}
const submitAnswer = async (answer) => {
  if (answered.value) return
  answered.value = true
  const elapsed = Date.now() - startTime
  try {
    await axios.post('/api/duel/answer', {
      roomId: roomId.value,
      questionIndex: current.value,
      answer: answer,
      time: elapsed
    }, { headers: { Authorization: `Bearer ${userStore.token}` } })
  } catch(e) {}
  if (current.value < questions.value.length - 1) {
    setTimeout(() => {
      current.value++
      answered.value = false
      startTimer()
    }, 500)
  } else {
    endDuel()
  }
}
const endDuel = async () => {
  try {
    const res = await axios.post('/api/duel/end', { roomId: roomId.value }, { headers: { Authorization: `Bearer ${userStore.token}` } })
    playerScore.value = res.data.playerScore
    aiScore.value = res.data.aiScore
    newRankScore.value = res.data.newRankScore
    details.value = res.data.details
    finished.value = true
  } catch(e) { alert('结束失败：' + (e.response?.data?.error || e.message)) }
}
const resetDuel = () => {
  roomId.value = null
  finished.value = false
  questions.value = []
  current.value = 0
}
onBeforeUnmount(() => clearInterval(timer))
</script>
<style scoped>
.duel-page{max-width:700px;margin:0 auto}
.start-screen{text-align:center;padding:40px;background:#faf6ef;border:1px solid #d9ccb2}
.btn-primary{background:#b39b7c;color:#fff;border:none;padding:10px 24px;cursor:pointer;margin-top:16px}
.loading{text-align:center;padding:20px}
.progress{font-weight:bold;margin-bottom:8px}
.timer{text-align:right;font-size:1.2rem;color:#b35c44}
.question-card{background:#faf6ef;border:1px solid #d9ccb2;padding:20px;margin-top:10px}
.q-text{font-size:1.2rem;margin-bottom:12px}
.options button{display:block;width:100%;text-align:left;padding:10px;margin:6px 0;background:#fff;border:1px solid #d9ccb2;cursor:pointer}
.options button:hover{background:#f0e7d6}
.options button:disabled{cursor:not-allowed}
.result{text-align:center}
.scores{display:flex;justify-content:center;gap:32px;margin:16px 0}
.detail-list{text-align:left;margin-top:20px}
.detail-item{padding:10px;border:1px solid #d9ccb2;margin:8px 0;background:#fdfbf5}
.detail-item .q{font-weight:bold}
.correct{color:#2d6a2d}
.explanation{font-size:0.9rem;color:#6b5e4a}
.btn-secondary{background:#e8e0d1;border:1px solid #c9b99a;padding:8px 20px;cursor:pointer}
</style>