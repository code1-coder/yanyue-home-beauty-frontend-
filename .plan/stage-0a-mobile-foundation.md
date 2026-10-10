# S0a — 跨端 API 契约冻结与移动端基础设施

<!-- This stage's flags (depends / mode / exec / model / effort / gate) live ONLY in
the PLAN.md stage index — the single authoritative home. Do not restate them
here; a copy is what drifts. -->

> First read `.plan/PLAN.md` (Frozen decisions + Operating protocol) and
> `.plan/LEDGER.md`. Follow the protocol, including the finish protocol.
> Also read `apps/consumer/features/services.ts`、`apps/provider/features/services.ts`、
> `apps/provider/features/contracts.ts`、两端 `pages/login.vue`、
> `apps/ruoyi-vue-pro` 现有 `/app-api/beauty/order`、`/app-api/beauty/refund`、
> `/app-api/beauty/provider` Controller，以及会员认证 `/member/auth/*`。

## Goal

冻结跨端 URL、DTO、金额、时间、幂等、鉴权和文件协议，并在消费者端、服务者端落地 `uni.request`、token 持久化、401 单次刷新、登录守卫和统一错误。本阶段不接入项目、订单、排班或钱包等领域 API。

## Steps

- [x] 核对并冻结路径：消费者订单 `/app-api/beauty/order/*`、退款 `/app-api/beauty/refund/*`、服务者 `/app-api/beauty/provider/*`、管理端 `/beauty/*`；不新增 `customer/` 顶级前缀。把方法、字段、错误码、分页形状写入 Frozen decisions（只改本阶段确认的增量，不复制整份协议）。
- [x] 两端新增 `platform/http/`：封装 `uni.request`、`CommonResult`/`{ total, list }` 解包、Bearer token、写请求 `X-Idempotent-Key`、401 单次刷新、刷新失败清会话。
- [x] 两端 token/session：持久化 access/refresh token；启动时恢复登录态；未登录拦截；统一错误映射（网络错误 vs 业务 `code != 0`）。
- [x] 登录页接入真实会员认证：短信验证码和微信小程序 `code` 登录；成功后保存会话。不要在本阶段改订单、预约、排班或财务页面。
- [x] 金额/时间/状态 mapper 放在 adapter 层（分↔元、毫秒时间戳），并补最小单测。页面不得直接处理后端分单位。
- [x] `features/services.ts` 保持为页面唯一入口；本阶段只建立真实 HTTP 边界，领域方法仍可暂时委托现有 mock，但不得让页面直接读 storage。

## Acceptance

- `cd apps/consumer && npm run typecheck && npm test && npm run build:mp-weixin` 成功。
- `cd apps/provider && npm run typecheck && npm test && npm run build:mp-weixin` 成功。
- 登录后能恢复会话；模拟 401 只刷新一次；刷新失败清理会话并跳转登录。
- 写请求携带 `X-Idempotent-Key`；分/元和毫秒映射测试通过。证据贴进 ledger。

## Artifacts

- `apps/consumer/platform/http/`、token/session/error 模块、`pages/login.vue`
- `apps/provider/platform/http/`、token/session/error 模块、`pages/login.vue`
- 两端 mapper 单测
- `.plan/PLAN.md` Frozen decisions（仅本阶段确认的增量）
