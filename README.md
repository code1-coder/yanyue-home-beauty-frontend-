# 轻龄到家

> 上门美容服务平台 · 三端工程与产品文档（草案）

## 项目概览

平台采用自营与担保交易模式，连接消费者、美容师（服务者）及运营管理者，覆盖预约支付、服务履约、审核、抽成结算和提现。消费者端和服务者端已有可构建的微信小程序模拟前端；管理后台仍只有文档，没有后端或真实接口。

| 终端     | 当前批准技术栈与交付平台                           | 入口                                   | 端目录                                   | 拆分文档                                                                                              |
| -------- | -------------------------------------------------- | -------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 消费者端 | 微信小程序：HBuilderX + uni-app Vue 3 + uview-plus | 首页 / 发现 / 我的                     | [apps/consumer](apps/consumer/README.md) | [需求](docs/consumer/需求.md) · [原型](docs/consumer/原型.md) · [接口能力](docs/consumer/接口清单.md) |
| 服务者端 | 微信小程序：HBuilderX + uni-app Vue 3 + uview-plus | 工作台 / 订单 / 商城 / 我的            | [apps/provider](apps/provider/README.md) | [需求](docs/provider/需求.md) · [原型](docs/provider/原型.md) · [接口能力](docs/provider/接口清单.md) |
| 管理后台 | Web：Vue 3 + Element Plus                          | 工作台 / 审核中心 / 业务 / 财务 / 系统 | [apps/admin](apps/admin/README.md)       | [需求](docs/admin/需求.md) · [原型](docs/admin/原型.md) · [接口能力](docs/admin/接口清单.md)          |

**技术选型与仓库结构**：[三端工程规划](docs/技术选型与仓库结构.md)。消费者端依赖与版本见 [package.json](apps/consumer/package.json) 和锁文件；这不删减原始产品范围。模拟支付不代表真实支付能力。

**消费者端进度**：[模拟前端完成情况与待接入能力](docs/consumer/完成情况.md)。页面路径已覆盖原型清单，真实订单与支付等业务能力尚未完成。

**服务者端进度**：[模拟前端能力与联调边界](apps/provider/README.md)。27 个小程序页面路径、4 个底部 Tab、拒单弹窗和 18 项接口能力均已接入本地 JSON 模拟适配器；类型检查、10 项模拟服务测试和小程序构建已通过。真实审核、短信、支付、上传、结算与提现仍待后端契约，H5 视觉预览已发布为 [服务者端预览](https://h5-six-sigma.vercel.app)。

**文档索引**：[docs/README.md](docs/README.md)。**共通业务规则**：[业务规则与跨端流程](docs/common/业务规则与跨端流程.md)（抽成、排班、支付结算、提现、状态机、非功能要求及页面流转）。

### 后端实现进度

已完成 Phase 0 后端规范文档和第一阶段 `apps/ruoyi-vue-pro/yudao-module-beauty` 模块骨架：

- `docs/backend/接口契约规范.md`
- `docs/backend/第三方接入方案.md`
- `docs/backend/数据库表设计草案.md`
- `docs/backend/待产品确认事项.md`
- `yudao-module-beauty-api` / `yudao-module-beauty-biz` Maven 模块
- 平台标准项目管理后台 CRUD
- 服务者项目配置与个性化价格接口
- `beauty_provider`、`beauty_service_project`、`beauty_provider_project` 等核心表 DDL
- 服务者接口通过当前登录会员解析 `providerId`，不信任客户端传入身份

beauty 模块已通过 `mvn compile -pl yudao-module-beauty -am -DskipTests`。排班、服务订单履约、抽成结算、提现和管理后台页面仍按计划逐阶段实现。

**原始资料**：[服务产品需求文档（PRD）.md](docs/服务产品需求文档（PRD）.md)（V1.0，2026-09-24，草案）与[原型整体结构.md](docs/原型整体结构.md)。拆分文件保留各端需求与原型原文；接口清单是从原文功能拆出的待设计能力，不是已发布接口文档。产品功能、页面及优先级以原始资料为准；当前技术规划不覆盖原始微信/支付宝支付 P0 或 App 兼容要求，平台适配和交付边界须另行确认。

## 业务主线

1. 消费者：定位 → 选项目/美容师 → 半小时时段和地址 → 费用确认 → 平台收款 → 服务 → 评价。
2. 服务者：入驻及资质审核 → 配置服务范围/项目/排班 → 接单履约 → 结算 → 提现；工具商城订单独立于服务订单。
3. 管理后台：入驻与资质审核、订单与退款处理、抽成和结算、提现审核打款、内容与系统配置。

三端交汇的关键状态和金额规则以[共通文档](docs/common/业务规则与跨端流程.md)为准；例如订单创建时保存抽成比例快照、上门费参与抽成、结算周期默认 T+7、余额 **> 1 元** 可申请提现。

## 范围与优先级

原始 PRD 用 P0/P1/P2 标注**功能优先级**，原型文档另以第一/二/三阶段描述**交付节奏**，两者不能直接等同。原型初估消费者端 28 页、服务者端 28 页、管理后台 34 页（页面数量为估算，不是承诺）。

上线前需统一以下口径：

- 消息：消费者/服务者需求列为 P0，但原型将消息列入第二阶段。
- 商城：服务者需求为 P1，原型安排第二阶段；商城 TabBar 是否首期保留需确认。
- 系统配置：后台角色权限与财务规则标为 P0，而原型称第三阶段“系统精细化”，应明确哪些设置必须在首期上线。
- 当前先规划微信小程序工程，原始 PRD 同时要求 iOS/Android 兼容及微信/支付宝支付 P0；如何满足完整产品范围和分阶段交付须产品负责人确认，不擅自更改支付渠道或优先级。
- 优惠分摊、退款抽成冲正、拒单对排序的影响、超服务半径提示、支付/提现回调与对账方案，仍需业务确认。

接口能力表不定义 HTTP 路径、参数、返回值、错误码与认证机制；实施前需另行确认正式接口契约、版本、第三方支付和短信接入。

## 仓库结构

```text
.
├── .gitignore               # 本地凭据、依赖与构建产物不提交
├── README.md                # GitHub 仓库入口
├── CONTRIBUTING.md          # 贡献、提交与 PR 约定
├── agent.md                 # 项目协作约定
├── AGENTS.md                # 代理入口
├── apps/                    # 三端入口
│   ├── consumer/             # 消费者端 uni-app Vue 3 模拟工程
│   │   ├── {README,AGENTS,ARCHITECTURE}.md
│   │   ├── package.json / pages.json / manifest.json
│   │   ├── pages/ / features/ / shared/ / platform/
│   │   └── {pages,features,shared,platform}/README.md
│   ├── provider/             # 服务者端 uni-app 模拟工程
│   │   ├── {README,AGENTS,ARCHITECTURE}.md
│   │   ├── package.json / pages.json / manifest.json
│   │   └── pages/ / features/ / shared/ / platform/
│   └── admin/                # 管理后台文档型骨架
│       ├── {README,AGENTS,ARCHITECTURE}.md
│       └── {app,pages,features,shared,platform}/README.md
└── docs/
    ├── README.md            # 文档索引
    ├── 服务产品需求文档（PRD）.md  # 原始需求，不改动
    ├── 原型整体结构.md        # 原始原型，不改动
    ├── 技术选型与仓库结构.md  # 三端技术方向及目录约定
    ├── common/业务规则与跨端流程.md
    ├── consumer/{需求,原型,接口清单}.md
    ├── provider/{需求,原型,接口清单}.md
    └── admin/{需求,原型,接口清单}.md
```

## 参与协作

仓库阅读入口为本文件；[CONTRIBUTING.md](CONTRIBUTING.md) 说明提交与 PR 自检；根目录 [AGENTS.md](AGENTS.md) 指向完整[协作约定](agent.md)，三端就近 `AGENTS.md` 仅增加各端约束。多份 README 各自介绍所在目录，不另立业务规则。
