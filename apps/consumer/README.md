# 消费者端

> 目录状态：uni-app Vue 3 微信小程序模拟前端已建立。仅供交互与开发测试，无后端、真实登录、支付、退款或可交付业务接口。

按[原始 PRD](../../docs/服务产品需求文档（PRD）.md)保留业务范围；本次已批准采用 **HBuilderX + uni-app Vue 3 + uview-plus**，当前优先规划独立微信小程序工程，原始产品范围不因此删减。职责限于消费者浏览项目与美容师、预约支付、订单售后、评价和个人中心；跨端业务状态与金额规则见[共通规则](../../docs/common/业务规则与跨端流程.md)。

三端技术方向与目录约定见[技术选型与仓库结构](../../docs/技术选型与仓库结构.md)；依赖固定在 [package.json](package.json) 和 [package-lock.json](package-lock.json)。

## 本地验证

在本目录执行 `npm ci`、`npm run typecheck`、`npm test`、`npm run build:mp-weixin`。构建输出在 `dist/build/mp-weixin`，可用微信开发者工具导入；`manifest.json` 的 `touristappid` 只供本地预览，真机和提审需要项目自己的小程序 AppID。开发监听可用 `npm run dev:mp-weixin`。当前仅完成 CLI 构建及类型/单元测试，尚未验证真机和 HBuilderX 打开效果。

**微信开发者工具导入目录**：先运行 `npm run build:mp-weixin`，在开发者工具中重新导入小程序项目，目录必须选择本仓库的 `apps/consumer/dist/build/mp-weixin`（里面直接有 `app.json` 和 `app.js`），不要选择 `apps/consumer` 源码根目录。开发监听时运行 `npm run dev:mp-weixin` 并保持命令运行，另行导入 `apps/consumer/dist/dev/mp-weixin`。如果模拟器提示“在项目根目录未找到 app.json”，先检查开发者工具当前项目目录是否选成了源码根目录；开发者工具不会直接将 uni-app 的 `pages.json`、`main.ts` 编译成小程序文件。生成目录默认使用 `manifest.json` 的体验 AppID；需要使用自己的小程序 AppID 时先配置 `manifest.json`，然后重新构建并导入生成目录。

本工程使用 uni-app **Vue 3/Vite** 编译链。若 HBuilderX 运行日志出现 `uniapp-cli/node_modules/ts-loader`，表示运行时走了 Vue 2/Webpack 编译链；请检查
是否已安装/启用与其版本匹配的 uni-app Vue 3/Vite 编译插件，并使用 Vue 3 的微信小程序运行方式。也可在本目录执行 `npm run dev:mp-weixin`，将 `dist/dev/mp-weixin` 导入微信开发者工具。`npm run typecheck` 自带 `--noEmit`，通用 `tsconfig.json` 不禁用编译输出。

`pages.json` 注册原型建议的 28 个页面路径。首页、项目、美容师、预约、地址、确认单、模拟支付、订单及评价形成本地演示链路；发现、消息、投诉、安全等保留入口，未接接口的动作会说明不可用。JSON 位于 `features/mock/data`，通过 `features/services.ts` 暴露给页面；本地订单及地址暂存小程序存储。请勿填写真实个人资料。上门费和时段只是演示样本，服务端尚未提供最终可约性、金额、支付和退款裁决。

页面人物采用文字示意头像，不对应真实美容师或证照。面护配图 `static/beauty-facial-new.jpg` 来源于 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Cucumber_slices_placed_beside_a_green_facial_mask_and_a_skincare_applicator_on_a_light_pink_background.jpg)，作者 Shixart1985，按 CC BY 2.0 使用。其余演示配图的原始来源与授权尚需核实，正式发布前应统一换成已获商用授权的项目实拍图。

## 开始前阅读

本目录的[就近约束](AGENTS.md)适用于代码工作；当前消费者端编码已获本轮用户授权。

- [需求](../../docs/consumer/需求.md)：功能和 P0/P1/P2 优先级。
- [原型](../../docs/consumer/原型.md)：信息架构、页面清单及建议路由，非已实现页面。
- [接口能力清单](../../docs/consumer/接口清单.md)：待设计能力，非正式接口契约。

## 项目骨架

- [骨架设计](ARCHITECTURE.md)：分层、页面路由映射、业务边界、演进及待确认事项。
- [pages/](pages/README.md)：原型页面与未来路由入口的对应关系。
- [features/](features/README.md)：按业务能力组织的未来功能模块。
- [shared/](shared/README.md)：端内可复用的展示与基础能力。
- [platform/](platform/README.md)：定位、支付、登录等平台适配边界。

工程已初始化；文档中早期“未来目录”描述保留作为设计依据，不代表正式接口已经存在。后续需确认正式接口契约、真实支付渠道、登录鉴权、隐私协议、真机适配和产品未决规则。
