<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef, watch } from 'vue'
import { services } from '../services'
import type { Leave, Slot } from '../types'
import { go, inputValue, run, switchValue } from '../../shared/navigation'
import DemoBanner from '../../shared/components/DemoBanner.vue'
const props = defineProps<{ mode: 'calendar' | 'buffer' | 'leave'; refreshKey?: number }>()
function localDate(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}` }
function addDays(value: string, count: number) { const day = new Date(`${value}T12:00:00`); day.setDate(day.getDate() + count); return localDate(day) }
const date = shallowRef(localDate(new Date())), slots = shallowRef<Slot[]>([]), selected = shallowRef<string[]>([]), before = shallowRef(30), after = shallowRef(30), paused = shallowRef(false), leaves = shallowRef<Leave[]>([])
const form = reactive({ fromDate: '', fromTime: '09:00', toDate: '', toTime: '18:00', reason: '' })
const weekStart = computed(() => { const weekday = new Date(`${date.value}T12:00:00`).getDay(); return addDays(date.value, -(weekday === 0 ? 6 : weekday - 1)) })
const dates = computed(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart.value, i)))
const selectedDateLabel = computed(() => `${date.value} 周${'日一二三四五六'[new Date(`${date.value}T12:00:00`).getDay()]}`)
const copyRange = computed(() => `${date.value}—${addDays(date.value, 6)} → ${addDays(date.value, 7)}—${addDays(date.value, 13)}`)
async function refresh() { slots.value = await services.schedule.day(date.value); const buffer = await services.schedule.buffer(); before.value = buffer.before; after.value = buffer.after; leaves.value = await services.schedule.leaves(); paused.value = (await services.profile.get()).paused }
onMounted(refresh)
watch(() => props.refreshKey, () => { if (props.mode === 'calendar') refresh() })
async function setDate(value: string) { date.value = value; selected.value = []; await refresh() }
function toggle(time: string) { if (slots.value.find(s => s.time === time)?.status === '已占用') return; selected.value = selected.value.includes(time) ? selected.value.filter(t => t !== time) : [...selected.value, time] }
async function setSlots(status: '可接'|'休息') { if (!selected.value.length) return; if (await run(() => services.schedule.setDay(date.value, slots.value.map(s => selected.value.includes(s.time) ? { ...s, status } : s)))) { selected.value = []; refresh() } }
async function batch() { if (await run(() => services.schedule.batch(Array.from({ length: 7 }, (_, i) => addDays(date.value, i)), selected.value, '可接'), '已批量设置未来七天')) refresh() }
async function copy() { if (await run(() => services.schedule.copyNextWeek(date.value), '已复制选中日起七天排班')) refresh() }
async function saveLeave() { if (await run(() => services.schedule.addLeave({ from: `${form.fromDate}T${form.fromTime}`, to: `${form.toDate}T${form.toTime}`, reason: form.reason }), '请假已记录')) refresh() }
</script>
<template><view class="screen"><DemoBanner />
  <template v-if="mode === 'calendar'"><view class="schedule-header"><text class="hero-title">排班管理</text><view class="buffer-link" @click="go('pages/schedule/buffer')"><text>前缓冲 {{ before }} 分钟 · 后缓冲 {{ after }} 分钟</text><u-icon name="arrow-right" size="14" color="#2A594F"/></view></view><view class="row"><text class="section-title">选择日期</text><text class="link" @click="go('pages/schedule/leave')">请假 / 暂停</text></view><picker mode="date" :value="date" @change="setDate(inputValue($event))"><view class="date-input">{{ date }} ▾</view></picker><view class="dates"><view v-for="(d, index) in dates" :key="d" class="date-chip" :class="{ active: date === d }" @click="setDate(d)"><text>周{{ '一二三四五六日'[index] }}</text><text>{{ d.slice(5) }}</text></view></view><view class="current-date"><text>{{ selectedDateLabel }} 的排班</text><text class="muted">点击时段可选择</text></view><view class="legend"><text><text class="legend-dot open-dot">●</text> 可接</text><text><text class="legend-dot busy-dot">●</text> 已占用</text><text><text class="legend-dot rest-dot">●</text> 休息</text></view><view class="grid"><view v-for="slot in slots" :key="slot.time" class="slot" :class="[slot.status === '已占用' ? 'busy' : slot.status === '可接' ? 'open' : 'rest', { picked: selected.includes(slot.time) }]" @click="toggle(slot.time)"><text>{{ slot.time }}</text><text>{{ slot.status }}</text></view></view><view class="panel"><text class="muted">已选 {{ selected.length }} 个时段；已占用不可修改。批量设置作用于所选时段的未来七天。</text><button class="action" :disabled="!selected.length" @click="setSlots('可接')">设为可接</button><button class="secondary" :disabled="!selected.length" @click="setSlots('休息')">设为休息</button><button class="secondary" :disabled="!selected.length" @click="batch">批量设为可接</button></view><view class="copy-note"><text>复制范围：{{ copyRange }}</text><text>将选中日起连续 7 天的排班复制到各自 7 天后；来源已占用时段按休息复制，目标已占用时段保持不变。</text></view><button class="action" @click="copy">复制这 7 天排班到下周</button></template>
  <template v-else-if="mode === 'buffer'"><view class="panel"><label class="field">服务前缓冲（分钟）<input v-model.number="before" type="number"/></label><label class="field">服务后缓冲（分钟）<input v-model.number="after" type="number"/></label><text class="muted">演示按半小时倍数设置；实际可约与冲突由服务端确认。</text></view><button class="action" @click="run(() => services.schedule.setBuffer(Number(before), Number(after)))">保存设置</button></template>
  <template v-else><view class="panel row"><text>暂停接单</text><switch :checked="paused" color="#2A594F" @change="run(() => services.schedule.setPaused(switchValue($event)), '状态已更新').then(refresh)"/></view><view class="panel"><view class="field">开始日期<picker mode="date" :value="form.fromDate" @change="form.fromDate = inputValue($event)"><view class="date-input">{{ form.fromDate || '选择日期' }}</view></picker></view><view class="field">开始时间<picker mode="time" :value="form.fromTime" @change="form.fromTime = inputValue($event)"><view class="date-input">{{ form.fromTime }}</view></picker></view><view class="field">结束日期<picker mode="date" :value="form.toDate" @change="form.toDate = inputValue($event)"><view class="date-input">{{ form.toDate || '选择日期' }}</view></picker></view><view class="field">结束时间<picker mode="time" :value="form.toTime" @change="form.toTime = inputValue($event)"><view class="date-input">{{ form.toTime }}</view></picker></view><label class="field">请假原因<input v-model="form.reason" placeholder="选填"/></label></view><button class="action" @click="saveLeave">保存请假</button><text class="section-title">请假记录</text><view v-for="item in leaves" :key="item.id" class="panel stack"><text>{{ item.from.replace('T', ' ') }} 至 {{ item.to.replace('T', ' ') }}</text><text class="muted">{{ item.reason || '未填写原因' }}</text></view><view v-if="!leaves.length" class="empty">暂无请假记录</view></template>
</view></template>
<style scoped>
.schedule-header { display: flex; flex-direction: column; align-items: flex-start; gap: 10rpx; padding: 12rpx 0 24rpx; }
.buffer-link { display: flex; align-items: center; gap: 8rpx; color: #386C5D; font-size: 22rpx; padding: 12rpx 16rpx; border-radius: 999rpx; background: #EAF3EE; }
.date-input { box-sizing: border-box; min-height: 80rpx; display: flex; align-items: center; background: #FFFFFF; padding: 18rpx 24rpx; border: 1rpx solid #E2E9E6; border-radius: 24rpx; color: #5F6863; }
.dates { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6rpx; margin: 20rpx 0 24rpx; }
.date-chip { min-width: 0; min-height: 88rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1rpx solid #E2E9E6; border-radius: 20rpx; background: #FFFFFF; color: #666; font-size: 20rpx; }
.date-chip.active { background: #386C5D; border-color: #386C5D; color: #fff; font-weight: 600; box-shadow: 0 4rpx 12rpx rgba(56,108,93,.16); }
.date-chip:active, .slot:active { opacity: .78; transform: scale(.98); }
.current-date { display: flex; justify-content: space-between; align-items: baseline; gap: 12rpx; color: #386C5D; font-size: 28rpx; font-weight: 600; }
.current-date .muted { font-weight: 400; }
.grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 12rpx; margin: 24rpx 0; }
.slot { height: 92rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 20rpx; font-size: 22rpx; border: 2rpx solid transparent; transition: transform .12s ease, opacity .12s ease; }
.open { background: #FFFFFF; color: #386C5D; border-color: #C9DDD6; }
.rest { background: #F1F2F0; color: #777; }
.busy { background: #EAF3EE; color: #386C5D; }
.picked { border-color: #386C5D; box-shadow: inset 0 0 0 2rpx #386C5D; }
.legend { display: flex; justify-content: space-between; font-size: 22rpx; color: #666; margin-top: 24rpx; }
.legend-dot { font-size: 22rpx; }.open-dot { color: #A8C7BD; }.busy-dot { color: #386C5D; }.rest-dot { color: #999; }
.copy-note { display: flex; flex-direction: column; gap: 8rpx; color: #666; font-size: 22rpx; margin: 24rpx 0 0; padding: 20rpx; border-radius: 24rpx; background: #F6F3EE; }
.copy-note text:first-child { color: #386C5D; font-weight: 600; }
.secondary[disabled] { opacity: .45; }
</style>
