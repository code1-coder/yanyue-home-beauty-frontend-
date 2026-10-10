# S3 — 抽成模板 CRUD

<!-- This stage's flags (depends / mode / exec / model / effort / gate) live ONLY in
the PLAN.md stage index — the single authoritative home. Do not restate them
here; a copy is what drifts. -->

> First read `.plan/PLAN.md` (Frozen decisions + Operating protocol) and
> `.plan/LEDGER.md`. Follow the protocol, including the finish protocol.
> Also read S0 ledger notes,
> `BeautyOrderProperties`（当前下单用 `defaultCommissionRate`，S4 要换成模板解析）,
> `apps/yudao-ui-admin-vue3/src/api/beauty/commission/index.ts`（仅类型）,
> `src/views/beauty/commission/{template,independent}/index.vue`。

## Goal

落地抽成模板与服务者独立抽成的完整 CRUD，并提供「按服务者 + 项目解析实际抽成比例」的查询，供 S4 下单快照和 S6 结算使用。优先级冻结为：独立抽成 > 条件模板 > 默认模板。

## Steps

- [x] DDL：在 `beauty_init.sql` 增加抽成模板表、服务者独立抽成表（若不存在）。模板需支持：名称、比例、是否默认、城市/分类条件、生效时间、优先级、状态。独立抽成：`provider_id`、比例、生效区间、状态。金额相关比例用明确单位（建议万分比整数或小数，选定后写入 Frozen decisions）。
- [x] 后端 `BeautyCommissionTemplateController`：标准 CRUD + page。路径 `/beauty/commission-template`，权限 `beauty:commission:template`（及 create/update/delete/query 细分，与菜单 SQL 一致）。
- [x] 后端 `BeautyProviderCommissionController`：独立抽成 CRUD。路径 `/beauty/provider-commission`，权限 `beauty:provider:commission`。
- [x] Service：实现解析方法 `resolveCommissionRate(providerId, categoryId, cityId, at)` —— 独立抽成 > 匹配条件模板 > 默认模板；无默认模板时明确报错，不要静默回落到 `BeautyOrderProperties.defaultCommissionRate`（除非 Frozen decisions 被本阶段修订）。
- [x] 管理端：`commission/index.ts` 补真实 request；`views/beauty/commission/template/index.vue` 接 CRUD；`views/beauty/commission/independent/index.vue` 接独立抽成设置。

<!-- Checkboxes are the resume mechanism: a session that stops mid-stage marks
the row `doing`, ticks the boxes it finished, and writes a handoff note in the
ledger. Re-running the stage resumes from the first unticked box. -->

## Acceptance

- `cd apps/ruoyi-vue-pro && mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests` 成功。
- `cd apps/yudao-ui-admin-vue3 && pnpm ts:check && pnpm lint && pnpm build:local` 成功。
- 能创建默认模板（例如 10%）、条件模板（城市 + 分类）、为服务者设置独立抽成；解析接口/方法对同一服务者返回独立抽成优先于模板。证据（SQL 插入 + 解析调用结果或单测输出）贴进 ledger。

## Artifacts

- `sql/mysql/beauty_init.sql` 抽成相关表
- `controller/admin/commission/` 两个 Controller 及 VO
- `dal/dataobject` + `dal/mysql` + `service` 抽成实现（含 `resolveCommissionRate`）
- `apps/yudao-ui-admin-vue3/src/api/beauty/commission/index.ts`
- `apps/yudao-ui-admin-vue3/src/views/beauty/commission/template/index.vue`
- `apps/yudao-ui-admin-vue3/src/views/beauty/commission/independent/index.vue`
- 如比例单位被选定/修订：`.plan/PLAN.md` Frozen decisions
