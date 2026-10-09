# S4 — 消费者下单与支付单

<!-- This stage's flags (depends / mode / exec / model / effort / gate) live ONLY in
the PLAN.md stage index — the single authoritative home. Do not restate them
here; a copy is what drifts. -->

> First read `.plan/PLAN.md` (Frozen decisions + Operating protocol) and
> `.plan/LEDGER.md`. Follow the protocol, including the finish protocol.
> Also read S0、S0a 与 S3 ledger notes,
> `BeautyOrderController.createOrder`、`BeautyServiceOrderServiceImpl.createOrder`、
> `BeautyOrderCreateReqVO` / `BeautyOrderCreateRespVO`、
> `BeautyScheduleService.lockSlots`（本阶段不得在下单时调用）。

## Goal

消费者下单在服务端完成全部校验、订单快照和支付单创建，初始状态 `WAIT_PAY`。**不锁定排班**——锁定留给 S5 支付回调，避免待支付订单占时段。抽成比例取自 S3 的 `resolveCommissionRate`，写入快照；请求/响应必须符合 S0a 冻结的金额、时间和幂等协议。

## Steps

- [ ] 核对 `BeautyOrderController.createOrder`（`POST /app-api/beauty/order/create`）已转发到 Service；本阶段工作在 `BeautyServiceOrderServiceImpl.createOrder`。
- [ ] 校验保持并补齐：服务者项目关联、项目上下架、服务者审核通过、三类资质有效、接单开关未暂停、地址属于当前用户、时段合法。价格以服务端快照为准，不信任客户端传入金额。
- [ ] 快照字段写全：项目名称、项目价格、时长、上门费、抽成比例（`resolveCommissionRate`）、结算周期。`payPrice` = 项目实付 + 上门费 - 优惠（优惠暂无则 0）。`platformCommission` / `providerIncome` 本阶段可仍为 0，留给订单完成/S6 计算。
- [ ] 调用 `PayOrderApi.createOrder()` 创建支付单，回写 `payOrderId`。订单状态 `WAIT_PAY`。
- [ ] **删除** `createOrder` 里现有的 `scheduleService.lockSlots(...)` 调用（当前实现在插入订单后立即预占，与冻结决策冲突）。可在下单时只做可用性预检（只读），但不得把时段标为 OCCUPIED。
- [ ] 超时取消（`cancelExpiredOrders`）若仍 `releaseSlots`，在「下单不再锁定」后应是空操作或加防护，避免误伤其他订单的锁。

<!-- Checkboxes are the resume mechanism: a session that stops mid-stage marks
the row `doing`, ticks the boxes it finished, and writes a handoff note in the
ledger. Re-running the stage resumes from the first unticked box. -->

## Acceptance

- `cd apps/ruoyi-vue-pro && mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests` 成功。
- 下单接口成功后：`beauty_service_order` 插入且 `status = WAIT_PAY`；`pay_order_id` 非空；快照字段（名称/价格/时长/上门费/抽成比例/结算周期）均有值。
- 下单后对应排班行仍为 AVAILABLE（未 OCCUPIED）。证据：接口响应 + SQL 查询贴进 ledger（无真实支付环境则用单测/集成测试代替 Postman）。

## Artifacts

- `BeautyServiceOrderServiceImpl.createOrder`（及必要时 VO/错误码）
- 抽成解析在下单路径的调用
- 单测或手工调用记录（ledger notes）
- 不改管理端页面（本阶段无前端交付）
