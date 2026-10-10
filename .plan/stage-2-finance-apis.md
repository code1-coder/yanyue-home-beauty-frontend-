# S2 — 结算与支付流水接口

<!-- This stage's flags (depends / mode / exec / model / effort / gate) live ONLY in
the PLAN.md stage index — the single authoritative home. Do not restate them
here; a copy is what drifts. -->

> First read `.plan/PLAN.md` (Frozen decisions + Operating protocol) and
> `.plan/LEDGER.md`. Follow the protocol, including the finish protocol.
> Also read S1 ledger notes,
> `BeautySettlementService` / `BeautySettlementServiceImpl.processSettlement`（已实现，不要重写结算逻辑）,
> `BeautySettlementMapper` / `BeautySettlementDO`,
> `apps/yudao-ui-admin-vue3/src/views/beauty/finance/{settlement,payment}/index.vue`,
> `src/api/beauty/finance/index.ts`（当前只有类型，无 request）。

## Goal

为已有的结算 Service 补管理端查询 Controller，并新增支付流水分页查询，让结算单和支付流水两页接到真实数据。本阶段依赖 S1 的财务 API 类型和权限结果，不做 T+7 生成或退款冲正（那是 S6）。

## Steps

- [x] 新增 `BeautySettlementAdminController`：`GET /beauty/settlement/page`、`GET /beauty/settlement/get`。注入已有 `BeautySettlementService`，只加查询方法，不改 `processSettlement()`。权限 `beauty:finance:settlement`。金额字段 Long 分。
- [x] 新增 `BeautyPaymentAdminController`：`GET /beauty/payment/page`（及必要时 `/get`）。支付流水以 beauty 订单已支付记录为准（`pay_order_id` + 订单实付），不要新造一张无来源的流水表。权限 `beauty:finance:payment`。
- [x] 管理端 `src/api/beauty/finance/index.ts` 补 `getSettlementPage` / `getPaymentPage`（及 get），页面 `views/beauty/finance/settlement/index.vue`、`views/beauty/finance/payment/index.vue` 接真实分页。展示用元。

<!-- Checkboxes are the resume mechanism: a session that stops mid-stage marks
the row `doing`, ticks the boxes it finished, and writes a handoff note in the
ledger. Re-running the stage resumes from the first unticked box. -->

## Acceptance

- `cd apps/ruoyi-vue-pro && mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests` 成功。
- `cd apps/yudao-ui-admin-vue3 && pnpm ts:check && pnpm lint && pnpm build:local` 成功。
- 结算、支付流水两个 page 接口路径与前端 API 一致；ledger 贴编译输出。无数据时允许空分页，不得再注释「尚未形成正式后端契约」。

## Artifacts

- `controller/admin/finance/BeautySettlementAdminController.java` 及 VO
- `controller/admin/finance/BeautyPaymentAdminController.java` 及 VO
- `BeautySettlementService` 查询方法（若接口目前只有 `processSettlement`）
- `apps/yudao-ui-admin-vue3/src/api/beauty/finance/index.ts`
- `apps/yudao-ui-admin-vue3/src/views/beauty/finance/settlement/index.vue`
- `apps/yudao-ui-admin-vue3/src/views/beauty/finance/payment/index.vue`
