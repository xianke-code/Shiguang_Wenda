<template>
<div class="quiz-page">
<div v-if="loading" class="loading">加载中...</div>
<div v-else-if="finished">
<p>答题完成，即将跳转结果...</p>
</div>
<div v-else class="quiz-interface">
<div class="quiz-info">
<span>第 {{ current+1 }}/{{ questions.length }} 题</span>
<select v-model="timerMode" class="form-select">
<option :value="false">不限时</option>
<option :value="true">每题30秒</option>
</select>
<button @click="skipQuestion" class="btn-secondary">跳过</button>
</div>
<div class="progress-bar"><div :style="{width: ((current+1)/questions.length)*100+'%'}"></div></div>
<div class="question-card">
<div class="q-text">{{ questions[current]?.question }}</div>
<div class="q-meta">{{ questions[current]?.category }} · 难度{{ questions[current]?.difficulty }}</div>
<div v-if="questions[current]?.type==='choice'" class="options">
<button v-for="(opt,idx) in questions[current]?.options" :key="idx" @click="selectAnswer(idx)" :class="optionClass(idx)" :disabled="selected !== -1">{{ ['A','B','C','D'][idx] }}. {{ opt }}</button>
</div>
<div v-else>
<button @click="selectAnswer(0)" :class="optionClass(0)" :disabled="selected !== -1">✅ 正确</button>
<button @click="selectAnswer(1)" :class="optionClass(1)" :disabled="selected !== -1">❌ 错误</button>
</div>
<div v-if="feedback" class="feedback">{{ feedback }}</div>
<div v-if="questions[current]?.explanation && selected !== -1" class="explanation">{{ questions[current].explanation }}</div>
</div>
</div>
</div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '../stores/user.js'
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const questions = ref([])
const current = ref(0)
const userAnswers = ref([])
const correctAnswers = ref([])
const feedback = ref('')
const loading = ref(true)
const finished = ref(false)
const timerMode = ref(false)
const timeLeft = ref(30)
let timer = null
const selected = ref(-1)
const loadQuestions = async () => {
  const count = route.query.count || 10
  const res = await axios.get(`/api/questions?count=${count}`)
  questions.value = res.data
  userAnswers.value = new Array(res.data.length).fill(-1)
  loading.value = false
  startTimer()
}
const startTimer = () => {
  if (!timerMode.value) return
  timeLeft.value = 30
  clearInterval(timer)
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timer)
      selectAnswer(-1)
    }
  }, 1000)
}
watch(timerMode, () => {
  clearInterval(timer)
  if (timerMode.value) startTimer()
})
const selectAnswer = async (idx) => {
  if (selected.value !== -1) return
  selected.value = idx
  userAnswers.value[current.value] = idx
  clearInterval(timer)
  const q = questions.value[current.value]
  const res = await axios.post('/api/check-batch', { answers: [{ id: q.id, answer: idx === -1 ? 0 : idx }] }, { headers: { Authorization: `Bearer ${userStore.token}` } })
  const result = res.data.results[0]
  correctAnswers.value[current.value] = result.correctAnswer
  feedback.value = result.correct ? '✓ 正确' : `✗ 正确答案：${q.options[result.correctAnswer]}`
  setTimeout(() => nextQuestion(), 1000)
}
const skipQuestion = () => {
  selected.value = -1
  nextQuestion()
}
const nextQuestion = () => {
  if (current.value < questions.value.length - 1) {
    current.value++
    selected.value = -1
    feedback.value = ''
    startTimer()
  } else {
    finishQuiz()
  }
}
const finishQuiz = async () => {
  clearInterval(timer)
  const payload = questions.value.map((q,i) => ({ id: q.id, answer: userAnswers.value[i] === -1 ? 0 : userAnswers.value[i] }))
  const res = await axios.post('/api/check-batch', { answers: payload }, { headers: { Authorization: `Bearer ${userStore.token}` } })
  router.push({ path: '/result', state: { results: res.data } })
}
const optionClass = (idx) => {
  const correct = correctAnswers.value[current.value]
  if (selected.value === -1) return ''
  if (idx === selected.value) return idx === correct ? 'correct' : 'wrong'
  if (idx === correct && selected.value !== -1) return 'correct'
  return ''
}
onMounted(loadQuestions)
</script>
<style scoped>
.quiz-page{max-width:700px;margin:0 auto}
.loading{text-align:center;padding:20px}
.quiz-info{display:flex;gap:12px;align-items:center;margin-bottom:10px;background:#f0e8d6;padding:8px 16px;border:1px solid #d9ccb2}
.form-select{padding:4px;border:1px solid #c9b99a;background:#fff}
.btn-secondary{background:#e0d5c0;border:1px solid #c9b99a;padding:4px 12px;cursor:pointer}
.progress-bar{height:4px;background:#e5d9cc;margin-bottom:20px;border-radius:2px;overflow:hidden}
.progress-bar div{height:100%;background:#b39b7c;transition:width 0.3s}
.question-card{background:#faf6ef;border:1px solid #d9ccb2;padding:20px}
.q-text{font-size:1.2rem;font-weight:bold;margin-bottom:8px}
.q-meta{font-size:0.9rem;color:#6b5e4a;margin-bottom:16px}
.options button,.question-card button{display:block;width:100%;text-align:left;padding:10px;margin:6px 0;background:#fff;border:1px solid #d9ccb2;cursor:pointer}
.options button:hover{background:#f0e7d6}
button.correct{background:#d4edda;border-color:#a3cfbb}
button.wrong{background:#f8d7da;border-color:#dca7a7}
.feedback{margin-top:12px;font-weight:bold}
.explanation{margin-top:8px;color:#6b5e4a;font-size:0.9rem}
</style>