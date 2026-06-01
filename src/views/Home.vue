<template>
<div class="home">
<div class="hero">
<h1>每日知识挑战</h1>
<p>用一点好奇，拾起散落的光</p>
<button v-if="userStore.token" @click="signToday" :disabled="signed" class="btn-primary">签到 (+{{ signBonus }})</button>
<div v-if="quote" class="quote">“{{ quote }}”</div>
</div>
<div class="quick-actions">
<div class="action-card" @click="router.push({path:'/quiz',query:{count:10}})"><span>📝</span> 随机10题</div>
<div class="action-card" @click="router.push({path:'/quiz',query:{count:20}})"><span>📚</span> 随机20题</div>
<div class="action-card" @click="router.push('/submit')"><span>✏️</span> 我要出题</div>
<div class="action-card" @click="router.push('/leaderboard')"><span>🏆</span> 积分榜</div>
</div>
</div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
const router = useRouter()
const userStore = useUserStore()
const signed = ref(false)
const signBonus = ref(5)
const quote = ref('')
const quotes = ['学而不思则罔，思而不学则殆。', '知识就是力量。', '千里之行，始于足下。', '不积跬步，无以至千里。']
const signToday = async () => {
  const data = await userStore.sign()
  signBonus.value = data.bonus
  signed.value = true
}
onMounted(() => { quote.value = quotes[Math.floor(Math.random()*quotes.length)] })
</script>
<style scoped>
.home{text-align:center}
.hero{margin:30px 0}
.hero h1{font-size:2rem;color:#4a3b2c}
.hero p{color:#6b5e4a;margin:8px 0}
.btn-primary{background:#b39b7c;color:#fff;border:none;padding:8px 24px;cursor:pointer;font-size:1rem;margin-top:8px}
.btn-primary:disabled{opacity:0.6}
.quote{margin-top:16px;font-style:italic;color:#8b7a62}
.quick-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:24px}
.action-card{background:#faf6ef;border:1px solid #d9ccb2;padding:24px;cursor:pointer;transition:background 0.2s}
.action-card:hover{background:#f0e7d6}
.action-card span{font-size:2rem;display:block;margin-bottom:8px}
</style>