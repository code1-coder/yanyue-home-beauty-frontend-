# S1 — 资质/提现/退款分页

<!-- This stage's flags (depends / mode / exec / model / effort / gate) live ONLY in
the PLAN.md stage index — the single authoritative home. Do not restate them
here; a copy is what drifts. -->

> First read `.plan/PLAN.md` (Frozen decisions + Operating protocol) and
> `.plan/LEDGER.md`. Follow the protocol, including the finish protocol.
> Also read S0 ledger notes,
> `BeautyQualificationAdminController`、`BeautyWithdrawAdminController`、`BeautyRefundAdminController`（现仅有审核动作，无分页）,
> `apps/yudao-ui-admin-vue3/src/api/beauty/audit/index.ts`、
> `src/views/beauty/audit/{qualification,withdraw}/index.vue`、
> `src/views/beauty/finance/refund/index.vue`、
> `src/api/beauty/finance/index.ts`。

## Goal

给资质审核、提现审核、退款记录补上管理端分页/详情查询契约，并把三张已有页面接到真实接口，审核列表不再是空壳。

## Steps

- [x] 后端 `BeautyQualificationAdminController`：补 `GET /page`、`GET /get`（路径已是 `/beauty/qualification`）。Service 层分页查询。权限 `beauty:audit:qualification`。PageReqVO 继承 `PageParam`。
- [x] 后端 `BeautyWithdrawAdminController`：补 `GET /page`、`GET /get`（`/beauty/withdraw`）。权限 `beauty:audit:withdraw`（与现有 approve/reject 一致）。
- [x] 后端 `BeautyRefundAdminController`：补 `GET /page`、`GET /get`（`/beauty/refund`）。权限与现有审核注解对齐（当前为 `beauty:order:refund`；若改为 `beauty:finance:refund` 以匹配前端路由，必须同步改 `@PreAuthorize`、菜单 SQL 和 `v-hasPermi`，并在 Frozen decisions 记下）。
- [x] 管理端：`views/beauty/audit/qualification/index.vue` 接 `getQualificationAuditPage`（API 已指向 `/beauty/qualification/page`）。
- [x] 管理端：`views/beauty/audit/withdraw/index.vue` 接真实分页并启用已有审核按钮（approve/reject API 已存在）。
- [x] 管理端：`views/beauty/finance/refund/index.vue` 接真实分页；在 `src/api/beauty/finance/index.ts` 补上请求函数（当前文件只有类型、没有 request）。金额展示用元（`/ 100`）。

<!-- Checkboxes are the resume mechanism: a session that stops mid-stage marks
the row `doing`, ticks the boxes it finished, and writes a handoff note in the
ledger. Re-running the stage resumes from the first unticked box. -->

## Acceptance

- `cd apps/ruoyi-vue-pro && mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests` 成功。
- `cd apps/yudao-ui-admin-vue3 && pnpm ts:check && pnpm lint && pnpm build:local` 成功。
- 资质 / 提现 / 退款三个 `GET /page` 接口可编译且路径与前端 API 一致；ledger 贴编译输出。有数据时列表能显示真实记录（无数据则贴空分页 JSON，不得再走 mock）。

## Artifacts

- `BeautyQualificationAdminController` / `BeautyWithdrawAdminController` / `BeautyRefundAdminController` 分页与详情方法及对应 VO
- 各 Service/Mapper 分页查询
- `apps/yudao-ui-admin-vue3/src/api/beauty/audit/index.ts`
- `apps/yudao-ui-admin-vue3/src/api/beauty/finance/index.ts`
- `apps/yudao-ui-admin-vue3/src/views/beauty/audit/qualification/index.vue`
- `apps/yudao-ui-admin-vue3/src/views/beauty/audit/withdraw/index.vue`
- `apps/yudao-ui-admin-vue3/src/views/beauty/finance/refund/index.vue`
