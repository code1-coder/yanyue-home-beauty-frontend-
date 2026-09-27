# 页面入口规划

> 来源：[原始原型 §三页面清单](../../../docs/原型整体结构.md)，细节见[服务者端原型摘录](../../../docs/provider/原型.md)。下列 27 个路径已在 `pages.json` 注册；拒单为组件。页面已接入 JSON 模拟服务，正式后端联调仍待契约。

pages 只承担页面入口和参数接收；业务交互归[features](../features/README.md)，通用展示归[shared](../shared/README.md)。保留工作台 / 订单 / 商城 / 我的四 TabBar 的原型语义；商城 P1、原型第二阶段，首期呈现待确认。

| 页面域 | 原型建议页面/路径 |
| --- | --- |
| 登录与入驻 | 登录 `/pages/login`；入驻申请 `/pages/join/apply`；审核状态 `/pages/join/status` |
| 工作台 | 首页 `/pages/workbench/index`；排班 `/pages/schedule/index`；缓冲 `/pages/schedule/buffer`；请假/暂停 `/pages/schedule/leave`；我的项目 `/pages/project/mine` |
| 服务订单 | 列表 `/pages/order/list`；详情 `/pages/order/detail`；拒单弹窗**组件（无独立路由）**；服务凭证上传 `/pages/order/upload` |
| 商城 | 商品列表 `/pages/mall/list`；商品详情 `/pages/mall/detail`；确认订单/支付 `/pages/mall/confirm`；商城订单列表 `/pages/mall/order/list`；商城订单详情 `/pages/mall/order/detail` |
| 我的与资料 | 我的 `/pages/mine/index`；个人资料 `/pages/mine/profile`；资质 `/pages/mine/qualification`；服务设置 `/pages/mine/service`；设置 `/pages/mine/setting` |
| 收益与提现 | 收益中心 `/pages/income/index`；提现 `/pages/withdraw/index`；提现记录 `/pages/withdraw/list`；银行卡管理 `/pages/bank/index` |
| 评价与消息 | 评价 `/pages/comment/list`；消息 `/pages/message/list` |

共对应原型清单 **28 行：27 个建议页面路径 + 1 个拒单弹窗组件**。原型信息架构中的物流、售后、消息详情及商城支付结果等没有独立路由行，不能擅自补造已确认路由；由交互与正式契约确认页面、组件或复用详情页。原型收款账户列有银行卡/支付宝/微信，渠道与提现实现方式待确认，不以页面名限制产品范围。

阶段按[架构说明](../ARCHITECTURE.md)对齐：需求 P0/P1 与原型第一/二/三阶段分别记录；不把商城从原型四 Tab 中删去，也不将消息 P0 擅自降级。小程序构建已验证，H5 预览已发布，真机尚未验证。
