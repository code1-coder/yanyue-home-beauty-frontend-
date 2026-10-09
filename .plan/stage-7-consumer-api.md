# S7 — 消费者真实接口接入

<!-- This stage's flags (depends / mode / exec / model / effort / gate) live ONLY in
the PLAN.md stage index — the single authoritative home. Do not restate them
here; a copy is what drifts. -->

> First read `.plan/PLAN.md` (Frozen decisions + Operating protocol) and
> `.plan/LEDGER.md`. Follow the protocol, including the finish protocol.
> Also read S0a、S4、S5、S6 ledger notes，
> `apps/consumer/features/services.ts`、`features/mock/repository.ts`、
> `apps/ruoyi-vue-pro` 现有 `/app-api/beauty/order`、`/app-api/beauty/refund`、
> `pages/order/{booking,confirm,list,detail,refund,comment}.vue`、
> `pages/pay/index.vue`、`pages/address/`。

## Goal

后端补齐消费者项目/服务者查询、可约时段、报价、订单分页/详情/取消、退款详情和评价接口；消费者端替换 `features/mock/repository.ts` 为真实 HTTP adapter，接入登录、浏览、预约、支付状态查询、订单和退款流程。

## Steps

- [ ] 后端新增消费者查询 Controller：项目/分类、服务者列表/详情、可预约时段、金额试算、订单分页/详情/取消、退款详情、评价。复用现有 `/order/*`、`/refund/*` 路径，不新增 `/customer/*`。按当前登录消费者隔离数据。
- [ ] 消费者端 `features/` 新增真实 adapter：实现 `CatalogRepository`、`ProfileRepository`、`BookingRepository`、`OrderRepository` 的真实 HTTP 版本，调用 S0a 的 `platform/http/`。
- [ ] `features/services.ts` 从 `export { ... } from './mock/repository'` 改为 `export { ... } from './adapters/repository'`（或类似命名）。保持接口契约不变，页面无需改动。
- [ ] 接入项目、服务者、预约、确认订单、支付页面只能发起支付并查询服务端状态，不能本地标记成功。
- [ ] 订单列表/详情、退款、评价页面从服务端读取；页面不计算最终可约性、退款金额或订单状态。
- [ ] 地址管理若后端尚无独立接口，可暂时保留本地存储，记入 ledger 作为后续改进项；但订单创建时地址必须校验归属。

## Acceptance

- 后端：`cd apps/ruoyi-vue-pro && mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests` 成功。
- 消费者端：`cd apps/consumer && npm run typecheck && npm test && npm run build:mp-weixin` 成功。
- 登录 → 浏览项目/服务者 → 查询可约时段 → 试算 → 下单 → 支付状态查询 → 订单详情 → 退款/评价。证据贴进 ledger（接口响应或小程序截图路径）。

## Artifacts

- `apps/ruoyi-vue-pro/.../controller/app/customer/` 新增查询 Controller 及 VO
- `apps/consumer/features/adapters/` 或类似真实 adapter 实现
- `apps/consumer/features/services.ts` 导出切换
- 集成测试或接口调用记录
