# S6 — 结算生成与退款冲正

<!-- This stage's flags (depends / mode / exec / model / effort / gate) live ONLY in
the PLAN.md stage index — the single authoritative home. Do not restate them
here; a copy is what drifts. -->

> First read `.plan/PLAN.md` (Frozen decisions + Operating protocol) and
> `.plan/LEDGER.md`. Follow the protocol, including the finish protocol.
> Also read S3 与 S5 ledger notes,
> `BeautySettlementServiceImpl.processSettlement`、
> `BeautyRefundServiceImpl.updateRefundSuccess` / `auditRefund`、
> `BeautyServiceOrderServiceImpl` 完成订单时对 `platformCommission` / `providerIncome` 的写入（当前下单将其置 0）。

## Goal

订单完成后按快照抽成比例计算平台抽成与服务者收入；T+7 生成结算单并释放可提现余额；退款按比例冲减抽成与收入（已结算冲 `availableBalance`，未结算冲 `pendingBalance`）。管理端查询接口属于 S2，本阶段不改页面。

## Steps

- [ ] 在订单进入 `COMPLETED` 的路径计算并落库：抽成基数 = 项目实付 + 上门费 - 优惠（即快照口径的 `payPrice`）；`platformCommission = 基数 × 快照抽成比例`；`providerIncome = 基数 - platformCommission`。使用订单快照比例，不重新解析模板。
- [ ] 核对 `processSettlement()`：完成后 `completeTime + settlementDays`（默认 7）到期才出结算单；已有结算单则跳过；条件更新订单 `COMPLETED → SETTLED`；`pending_balance -= providerIncome` 且 `available_balance += providerIncome`。按需补 `generateSettlement(orderId)` 便于单测/手工触发，内部规则与批量任务一致。
- [ ] 退款冲正：核对 `updateRefundSuccess` 的按比例冲减；修复重复累加 `order.refund_amount` 等与 `applyRefund` 已预占金额冲突的问题。全额退款订单置 `REFUNDED`；已结算走可用余额冲减，未结算走待结算冲减。金额全部为分，舍入规则写进代码注释（指向 Frozen decisions）。
- [ ] `BeautySettlementJob` 继续调 `processSettlement`；不要在本阶段做接单超时/资质到期以外的新 Job。

<!-- Checkboxes are the resume mechanism: a session that stops mid-stage marks
the row `doing`, ticks the boxes it finished, and writes a handoff note in the
ledger. Re-running the stage resumes from the first unticked box. -->

## Acceptance

- `cd apps/ruoyi-vue-pro && mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests` 成功。
- 手工触发或单测：完成单 T+7 后生成一条结算单；抽成与服务者收入与快照比例一致。
- 退款成功后：订单抽成/收入被按比例冲减；对应服务者余额字段变化正确。计算用例（含整除不尽）贴 ledger。

## Artifacts

- `BeautyServiceOrderServiceImpl` 完成路径的抽成落库
- `BeautySettlementService` / `BeautySettlementServiceImpl`（及可选 `generateSettlement`）
- `BeautyRefundServiceImpl` 冲正修正
- 结算/退款计算测试
- 不改管理端页面（查询已在 S2）
