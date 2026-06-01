<template>
<div class="form-page">
<h2>提交题目</h2>
<div class="field">
<label>题目</label>
<input v-model="form.question" placeholder="请输入题目" />
</div>
<div class="field">
<label>选项 (用逗号分隔)</label>
<input v-model="form.optionsStr" placeholder="选项1,选项2,选项3,选项4" />
</div>
<div class="field">
<label>正确答案索引 (0开始)</label>
<input v-model="form.answer" type="number" placeholder="0" />
</div>
<div class="field">
<label>分类</label>
<select v-model="form.category">
<option v-for="cat in categories" :key="cat">{{ cat }}</option>
<option value="其他">其他</option>
</select>
</div>
<div class="field">
<label>难度</label>
<select v-model="form.difficulty">
<option :value="1">简单</option>
<option :value="2">中等</option>
<option :value="3">困难</option>
</select>
</div>
<div class="field">
<label>题目类型</label>
<select v-model="form.type">
<option value="choice">选择题</option>
<option value="boolean">判断题</option>
</select>
</div>
<div class="field">
<label>解析 (可选)</label>
<textarea v-model="form.explanation" placeholder="请输入解析" rows="3"></textarea>
</div>
<button @click="submit">提交审核</button>
<div v-if="msg" :class="msg.includes('成功')?'msg':'error'">{{ msg }}</div>
</div>
</template>
<script setup>
import { reactive, ref, onMounted } from 'vue'
import axios from 'axios'
import { useUserStore } from '../stores/user.js'
const userStore = useUserStore()
const categories = ref([])
const msg = ref('')
const form = reactive({
  question: '',
  optionsStr: '',
  answer: 0,
  category: '综合',
  difficulty: 1,
  type: 'choice',
  explanation: ''
})
onMounted(async () => {
  const res = await axios.get('/api/categories')
  categories.value = res.data
})
const submit = async () => {
  if (!form.question || !form.optionsStr) {
    msg.value = '请填写题目和选项'
    return
  }
  const options = form.optionsStr.split(',').map(s => s.trim())
  try {
    await axios.post('/api/submit-question', {
      question: form.question,
      options,
      answer: parseInt(form.answer),
      category: form.category,
      difficulty: parseInt(form.difficulty),
      type: form.type,
      explanation: form.explanation
    }, { headers: { Authorization: `Bearer ${userStore.token}` } })
    msg.value = '提交成功，等待审核'
    form.question = ''
    form.optionsStr = ''
    form.explanation = ''
  } catch(e) {
    msg.value = e.response?.data?.error || '提交失败'
  }
}
</script>
<style scoped>
.field{margin-bottom:12px}
.field label{display:block;font-size:0.9rem;color:#4a3b2c;margin-bottom:4px}
</style>