# S5 — 支付回调与排班锁定

<!-- This stage's flags (depends / mode / exec / model / effort / gate) live ONLY in
the PLAN.md stage index — the single authoritative home. Do not restate them
here; a copy is what drifts. -->

> First read `.plan/PLAN.md` (Frozen decisions + Operating protocol) and
> `.plan/LEDGER.md`. Follow the protocol, including the finish protocol.
> Also read S4 ledger notes,
> `BeautyOrderNotifyController.updateOrderPaid`、
> `BeautyServiceOrderServiceImpl.updateOrderPaid`（现已做 WAIT_PAY→WAIT_ACCEPT 与 payOrderId 幂等，**尚未 lockSlots**）、
> `BeautyScheduleService.lockSlots`。

## Goal

支付成功回调在同一事务内把订单从 `WAIT_PAY` 更新为 `WAIT_ACCEPT` 并锁定排班。幂等键为 `payOrderId`：重复回调不得重复锁定、不得改已接单/已取消订单。

## Steps

- [ ] `BeautyOrderNotifyController`（`POST /app-api/beauty/order/notify/update-paid`）已存在且 `@PermitAll`；确认 Pay 模块回调 URL 指向此处，不另起一套 HTTP 入口。
- [ ] 在 `updateOrderPaid` 的状态条件更新成功之后、同一 `@Transactional` 内调用 `scheduleService.lockSlots(...)`（服务者、预约日、slot、时长、前后缓冲、orderId）。更新失败走现有幂等返回，不要锁。
- [ ] 保持现有校验：订单存在、`payOrderId` 匹配、Pay 单成功且金额/商户订单号一致。条件更新 `WAIT_PAY → WAIT_ACCEPT`，写入支付时间。
- [ ] 幂等：已是 `WAIT_ACCEPT` 且 `payOrderId` 相同则直接 return；此时排班应已锁定，重复调用 `lockSlots` 会因 OCCUPIED 抛冲突——必须在二次进入时跳过锁定。
- [ ] 锁定失败（时段已被占）必须让事务回滚，订单不得停在「已支付但无排班」。该冲突如何对账（人工/退款）若本阶段无法闭环，记入 ledger follow-up 供 SF 处理，不要吞掉异常。

<!-- Checkboxes are the resume mechanism: a session that stops mid-stage marks
the row `doing`, ticks the boxes it finished, and writes a handoff note in the
ledger. Re-running the stage resumes from the first unticked box. -->

## Acceptance

- `cd apps/ruoyi-vue-pro && mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests` 成功。
- 模拟一次支付回调：订单变为 `WAIT_ACCEPT`；对应半小时段（含缓冲）`status = OCCUPIED` 且 `booking_order_id = orderId`。
- 用同一 `payOrderId` 再回调一次：订单状态不变、时段不重复占用、不抛冲突。证据贴 ledger（单测优先）。

## Artifacts

- `BeautyServiceOrderServiceImpl.updateOrderPaid`
- 覆盖成功回调与重复回调的测试（推荐）
- 不改管理端页面
