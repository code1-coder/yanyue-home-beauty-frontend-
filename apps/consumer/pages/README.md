# 页面入口规划

> 来源：[原始原型 §二页面清单](../../../docs/原型整体结构.md)；下列为原文建议路由，**不是已建立的页面文件**。页面要素和跳转细节见[消费者端原型摘录](../../../docs/consumer/原型.md)。

未来 pages 只承担路由入口、页面级组合、参数接收与导航；跨页面业务交互归 [features](../features/README.md)，通用展示归 [shared](../shared/README.md)。

| 页面域 | 原型建议页面/路径 |
| --- | --- |
| 启动与登录 | 启动 /pages/launch、登录 /pages/login |
| 首页与搜索 | 首页 /pages/index/index、位置 /pages/location、搜索 /pages/search |
| 项目 | 列表 /pages/project/list、详情 /pages/project/detail |
| 美容师 | 列表 /pages/beautician/list、详情 /pages/beautician/detail |
| 预约与地址 | 预约 /pages/order/booking、地址列表 /pages/address/list、地址编辑 /pages/address/edit、确认订单 /pages/order/confirm |
| 支付 | 支付 /pages/pay/index、结果 /pages/pay/result |
| 发现 | 发现 /pages/discover/index、详情 /pages/discover/detail |
| 我的与订单 | 我的 /pages/mine/index、订单列表 /pages/order/list、订单详情 /pages/order/detail、售后 /pages/order/refund、评价 /pages/order/comment |
| 其他个人能力 | 我的评价 /pages/mine/comment、优惠券 /pages/mine/coupon、消息 /pages/message/list、投诉 /pages/service/complaint、设置 /pages/mine/setting、安全中心 /pages/safety/index |

原型中的引导、协议、下单成功、关于、消息详情、安全子页等，部分没有独立路由行；**不擅自补造已确认路由**，待交互确认后决定是独立页面、组件、WebView 或复用页面。原型页面清单有 28 行，导航核心为首页/发现/我的三 Tab；正式 pages.json、分包和页面代码待开发授权与平台验证后再创建。消息优先级与阶段冲突见[骨架设计](../ARCHITECTURE.md)。
