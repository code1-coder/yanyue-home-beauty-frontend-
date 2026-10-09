# S9 — 三端联调与契约验收

<!-- This stage's flags (depends / mode / exec / model / effort / gate) live ONLY in
the PLAN.md stage index — the single authoritative home. Do not restate them
here; a copy is what drifts. -->

> First read `.plan/PLAN.md` (Frozen decisions + Operating protocol) and
> `.plan/LEDGER.md`. Follow the protocol, including the finish protocol.
> Also read S8 ledger notes、三端 README、
> `docs/common/业务规则与跨端流程.md`、
> `apps/consumer/features/mock/repository.test.ts`、
> `apps/provider/features/mock/services.test.ts`。

## Goal

只做契约验收和集成问题修复，不新增业务功能。验证管理端审核影响服务者资格、消费者下单→支付成功→排班锁定→服务者履约→结算和提现，以及金额/时间/幂等/401/providerId/文件协议。

## Steps

- [ ] 管理端审核服务者资质和提现，验证服务者端资格和余额变化。
- [ ] 消费者下单并支付成功，验证订单状态变为待接单、排班已锁定、重复回调不重复占用。
- [ ] 服务者接单、到达、开始、上传凭证、完成，验证消费者端订单状态同步。
- [ ] 完成后 T+7，验证结算单生成、服务者余额转入可提现、余额大于 1 元提现成功。
- [ ] 退款申请后，验证按比例冲正、已结算冲可用余额、未结算冲待结算余额。
- [ ] 金额全部为分、时间为毫秒、写请求有幂等键、401 只刷新一次、providerId 由服务端解析、文件经过 infra 服务。
- [ ] 三端构建和可复现的接口/数据库/页面证据写入 ledger；集成测试或手工验证清单。

## Acceptance

- 三端构建通过：后端编译、管理端 `pnpm build:local`、消费者/服务者 `npm run build:mp-weixin`。
- 完整流程证据：管理端审核 → 消费者下单支付 → 排班锁定 → 服务者履约 → T+7 结算 → 提现。截图、SQL 查询或接口响应贴进 ledger。
- 契约验证清单：金额/时间/幂等/401/providerId/文件协议。每项贴进 ledger（测试日志或手工验证结果）。

## Artifacts

- 不新增业务代码（只修复集成问题）
- ledger notes：完整流程证据 + 契约清单 + 遗留问题列表
- 可选：集成测试脚本或 Postman collection
