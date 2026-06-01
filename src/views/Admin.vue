<template>
<div>
<h2>管理员审核</h2>
<div v-if="!isAdmin">无权限</div>
<div v-else>
<div v-if="submissions.length===0">暂无待审题目</div>
<div v-for="sub in submissions" :key="sub.id" class="sub-item">
<div><strong>{{ sub.question }}</strong></div>
<div>选项：{{ sub.options.join('，') }}</div>
<div>答案：{{ sub.options[sub.answer] }}</div>
<button @click="approve(sub.id)">通过入库</button>
</div>
</div>
</div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useUserStore } from '../stores/user.js'
const userStore = useUserStore()
const submissions = ref([])
const isAdmin = computed(() => userStore.user?.username === 'admin')
onMounted(async () => {
  if (isAdmin.value) {
    const res = await axios.get('/api/submissions', { headers: { Authorization: `Bearer ${userStore.token}` } })
    submissions.value = res.data
  }
})
const approve = async (id) => {
  await axios.post(`/api/submissions/${id}/approve`, {}, { headers: { Authorization: `Bearer ${userStore.token}` } })
  submissions.value = submissions.value.filter(s => s.id !== id)
}
</script>
<style scoped>
.sub-item{padding:10px;margin:8px 0;border:1px solid #d9ccb2;background:#fdfbf5}
button{background:#7c9a6b;color:#fff;border:none;padding:4px 12px;cursor:pointer}
</style>