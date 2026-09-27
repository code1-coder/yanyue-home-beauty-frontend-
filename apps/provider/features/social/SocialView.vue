<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { services } from '../services'
import type { Message, Review } from '../types'
import { run } from '../../shared/navigation'
import DemoBanner from '../../shared/components/DemoBanner.vue'
const props = defineProps<{ mode: 'reviews' | 'messages' }>()
const reviews = shallowRef<Review[]>([]), messages = shallowRef<Message[]>([]), type = shallowRef('全部'), expanded = shallowRef('')
const drafts = reactive<Record<string, { reply: string; appeal: string }>>({})
function draft(id: string) { return drafts[id] ||= { reply: '', appeal: '' } }
const visible = computed(() => type.value === '全部' ? messages.value : messages.value.filter(m => m.type === type.value))
async function refresh() { reviews.value = await services.reviews.list(); messages.value = await services.messages.list() }
onShow(refresh)
onMounted(refresh)
async function open(id: string) { expanded.value = id; await services.messages.detail(id); refresh() }
async function submit(action: () => Promise<void>, id: string) { if (await run(action)) { delete drafts[id]; refresh() } }
</script>
<template><view class="screen"><DemoBanner />
  <template v-if="mode === 'reviews'"><view v-for="item in reviews" :key="item.id" class="panel stack"><view class="row"><text>{{ item.customer }}</text><text class="money">{{ '★'.repeat(item.stars) }}</text></view><text>{{ item.content }}</text><text class="muted">{{ item.date }}</text><text v-if="item.reply" class="muted">我的回复：{{ item.reply }}</text><text v-if="item.appeal" class="muted">申诉中：{{ item.appeal }}</text><label class="field">回复<input v-model="draft(item.id).reply" placeholder="写下回复"/></label><button class="secondary" @click="submit(() => services.reviews.reply(item.id, draft(item.id).reply), item.id)">提交回复</button><label class="field">申诉<input v-model="draft(item.id).appeal" placeholder="描述申诉原因"/></label><button class="secondary" @click="submit(() => services.reviews.appeal(item.id, draft(item.id).appeal), item.id)">提交申诉</button></view><view v-if="!reviews.length" class="empty">暂无评价</view></template>
  <template v-else><view class="chips"><view v-for="item in ['全部','订单','审核','提现','系统']" :key="item" class="chip" :class="{ active: type === item }" @click="type = item">{{ item }}</view></view><view v-for="item in visible" :key="item.id" class="panel stack" @click="open(item.id)"><view class="row"><text>{{ item.read ? '' : '● ' }}{{ item.title }}</text><text class="tag">{{ item.type }}</text></view><text class="muted">{{ item.date }}</text><text v-if="expanded === item.id">{{ item.content }}</text></view><view v-if="!visible.length" class="empty">暂无消息</view></template>
</view></template>
