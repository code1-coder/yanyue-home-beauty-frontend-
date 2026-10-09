# S8 — 服务者真实接口接入

<!-- This stage's flags (depends / mode / exec / model / effort / gate) live ONLY in
the PLAN.md stage index — the single authoritative home. Do not restate them
here; a copy is what drifts. -->

> First read `.plan/PLAN.md` (Frozen decisions + Operating protocol) and
> `.plan/LEDGER.md`. Follow the protocol, including the finish protocol.
> Also read S0a、S1、S2、S5、S6、S7 ledger notes，
> `apps/provider/features/services.ts`、`features/contracts.ts`、`features/mock/services.ts`、
> `platform/media.ts`、现有服务者项目/资质/订单动作 Controller、
> `pages/{schedule,orders,finance,profile}/`。

## Goal

后端补齐服务者排班查询/设置、订单列表/详情、工作台汇总、钱包/收益/提现记录/档案接口；服务者端替换 `features/mock/services.ts` 为真实 adapter，`platform/media.ts` 改为 infra 文件服务；接入排班、履约、钱包、提现和档案流程。

## Steps

- [ ] 后端补齐服务者接口：排班查询/设置、请假、订单列表/详情、工作台汇总、钱包/收益明细、提现试算/记录、收款账户、档案查询/更新。复用现有 `/provider/*`；`providerId` 只从登录用户解析。
- [ ] 服务者端新增真实 adapter：实现 `ProviderServices` 的真实 HTTP 版本，调用 S0a 的 `platform/http/`。
- [ ] `features/services.ts` 从 `export const services: ProviderServices = mockServices` 改为 `= realServices`。保持 `contracts.ts` 接口不变。
- [ ] `platform/media.ts` 改为真实选择图片并上传 infra 文件服务，返回文件 ID 或受控 URL；禁止保存小程序临时路径。
- [ ] 接入入驻状态、排班、订单履约（接单/拒单/到达/开始/完成）、上传凭证、工作台、钱包、提现和档案页面。
- [ ] 余额必须由服务端返回；余额不大于 1 元时禁止提交提现。商城、消息、评价若无真实 P0 契约，列为后续阶段，不伪造接口。

## Acceptance

- 后端：`cd apps/ruoyi-vue-pro && mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests` 成功。
- 服务者端：`cd apps/provider && npm run typecheck && npm test && npm run build:mp-weixin` 成功。
- 登录 → 入驻/审核状态 → 排班 → 接单/拒单 → 到达/开始/完成 → 上传凭证 → 收益 → 提现。证据贴进 ledger。

## Artifacts

- `apps/ruoyi-vue-pro/.../controller/app/provider/` 补充 Controller 及 VO
- `apps/provider/features/adapters/` 或类似真实 adapter 实现
- `apps/provider/platform/media.ts` 接 infra 文件服务
- `apps/provider/features/services.ts` 导出切换
- 集成测试或接口调用记录
