# 美容服务平台 P0 全闭环 — build ledger

Statuses: `todo → doing → done`, plus `blocked` (waiting on a human or an
external gate — the stage becomes a runbook) and `skipped` (decided against,
one-line reason). Partial completion is a normal, resumable state.

Keep table rows to **ONE line** — detail goes in the notes block below, never
in a table cell. Sessions read the status table plus only the notes blocks of
the stages they `depend` on (the final review stage reads all of it). Update
your stage's row and notes block at the end of every session (Operating
protocol, finish protocol).

## Status

| Stage | Status | Verified | Date | Result |
|---|---|---|---|---|
| S0 项目分类 CRUD 与菜单 SQL | done | 2026-10-10 | 后端编译通过；前端构建通过，类型检查与 lint 被既有基线错误阻塞 |
| S0a 跨端 API 契约冻结与移动端基础设施 | done | yes | 2026-10-10 | 两端 typecheck、18/22 项测试和微信小程序构建均通过；验收证据见下方 |
| S1 资质/提现/退款分页 | done | 2026-10-10 | 后端编译 23/23 模块成功；管理端构建成功 |
| S2 结算与支付流水接口 | todo | — | — | — |
| S3 抽成模板 CRUD | doing | 2026-10-10 | no | 后端编译与管理端构建通过；ts/lint 为既有基线问题，解析单测受独立运行依赖阻塞 |
| S4 消费者下单与支付单 | todo | — | — | — |
| S5 支付回调与排班锁定 | todo | — | — | — |
| S6 结算生成与退款冲正 | todo | — | — | — |
| S7 消费者真实接口接入 | todo | — | — | — |
| S8 服务者真实接口接入 | todo | — | — | — |
| S9 三端联调与契约验收 | todo | — | — | — |
| SF 最终计划审查 | todo | — | — | — |

## Notes

As-built notes, acceptance evidence, gotchas, handoff notes, follow-ups. One
block per stage; sessions read only the blocks of their `depends` stages.

### S0 项目分类 CRUD 与菜单 SQL
已完成分类 DO/Mapper/Service/Controller、父分类校验和项目引用保护；管理端分类 API、列表/表单页面、Beauty 路由和项目表单分类下拉已接入。`beauty_init.sql` 已补充 Beauty 一级菜单及服务者、项目/分类、订单、审核、财务、抽成菜单与权限节点；错误码编号冲突已修复。验收：在 S0 worktree `apps/ruoyi-vue-pro` 执行 `mvn -f apps/ruoyi-vue-pro/pom.xml compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests`，Reactor 23/23 SUCCESS，built in 3.499s。管理端 Node.js `v20.20.1`，使用 nvm 中 pnpm `12.10.1`：`pnpm build:local` 成功（built in 51.45s）；`pnpm ts:check` 失败，Beauty 文件仅报告 `ref`/`reactive`/`useMessage`/`nextTick` 等自动导入符号未识别，与仓库既有页面同类型；`pnpm lint` 报告 22 个样式顺序/空行错误，全部位于既有非 Beauty 文件。

### S0a 跨端 API 契约冻结与移动端基础设施
已完成 Frozen decisions 增量：真实后端认证契约为 `/member/auth/sms-login`、`/member/auth/weixin-mini-app-login`、`/member/auth/refresh-token`；SMS 登录只发送 `mobile`、`code`，`scene=1` 仅用于发送验证码接口；微信登录发送 `phoneCode`、`loginCode`、非空 `state`。Beauty 当前仅有 `/app-api/beauty/provider/project/*`，订单/退款 Controller 尚未落地，本阶段不编造领域 DTO。

已完成两端 `platform/http/`、session、guard、mapper 和认证 adapter：请求自动附加 Bearer token，写请求生成 `X-Idempotent-Key`，成功响应解包 `CommonResult`，支持 `{ total, list }` 分页；401 通过共享 refresh lock 只刷新一次，刷新失败清理 session 并 `reLaunch` 到登录页；网络错误与后端 `code != 0` 分开映射。`features/services.ts` 仍是页面唯一业务入口，非本阶段领域能力继续使用 mock，页面未直接读取 storage。

验收证据（2026-10-10）：
- Consumer：`npm run typecheck` 通过；`npm test` 为 5 个测试文件、18 项测试全部通过；`npm run build:mp-weixin` 输出 `DONE Build complete.`。
- Provider：`npm run typecheck` 通过；`npm test` 为 5 个测试文件、22 项测试全部通过；`npm run build:mp-weixin` 输出 `DONE Build complete.`。
- HTTP 测试覆盖 Bearer header、写请求幂等键、CommonResult/分页解包、401 单次刷新及刷新失败清 session/跳转登录；mapper 测试覆盖分↔元和毫秒时间戳↔日期。两端构建仅出现既有 Sass `legacy-js-api` 与 `@import` 弃用警告，不影响成功结果。
- 验证期间为两个 app 临时建立指向主 clone `node_modules` 的符号链接，构建完成后已删除；未将依赖目录或构建产物纳入改动。
- 开 PR 前已将 `origin/plan-beauty-p0`（含 S1 squash merge `#5`）merge 进本阶段分支；仅 `.plan/LEDGER.md` 冲突，已保留双方行（S0a `doing` + S1 `done`）。re-verify 仍通过：consumer typecheck + 18 tests + `DONE Build complete.`；provider typecheck + 22 tests + `DONE Build complete.`。

### S1 资质/提现/退款分页
已补齐三张业务表（`beauty_qualification`、`beauty_withdraw`、`beauty_refund`）及 DO/Mapper/Service/Controller 分页与详情接口。后端路径：`/beauty/qualification`、`/beauty/withdraw`、`/beauty/refund`；权限码分别为 `beauty:audit:qualification`、`beauty:audit:withdraw`、`beauty:finance:refund`。管理端新增 `src/api/beauty/audit/index.ts`、`src/api/beauty/finance/index.ts` 及三张分页页面，金额展示用元（/ 100）。退款查询权限选择 `beauty:finance:refund` 已记入 PLAN.md Frozen decisions。验收：后端 `mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests` 输出 `[INFO] Reactor Summary for yudao-dependencies 2.3.0-snapshot: [INFO] yudao-dependencies ................................. SUCCESS [  0.001 s] ... [INFO] yudao-module-beauty-biz ............................ SUCCESS [  0.943 s] [INFO] BUILD SUCCESS [INFO] Total time:  32.809 s`；管理端 `pnpm build:local` 输出 `✓ built in 45.71s`；`pnpm ts:check` 和 `pnpm lint` 失败属既有基线问题（ref/reactive 等自动导入符号错误、既有非 Beauty 文件样式问题，与 S0 一致）。

### S2 结算与支付流水接口
_(empty)_

### S3 抽成模板 CRUD
已完成抽成模板、服务者独立抽成的 DDL、DO/Mapper/VO、Service 和管理端 Controller。解析优先级固定为独立抽成 > 条件模板 > 默认模板；无启用默认模板时抛出 `COMMISSION_DEFAULT_TEMPLATE_REQUIRED`，未回落到旧配置。默认模板启用状态唯一校验，比例为百分比 `decimal(5,2)`，菜单 SQL 与路由/API/两页 CRUD 已接通。

验收证据（2026-10-10）：后端在 `apps/ruoyi-vue-pro` 执行 `mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests`，Reactor 23/23 SUCCESS，`yudao-module-beauty-biz SUCCESS`，`BUILD SUCCESS`，总耗时 4.131s。管理端 `pnpm build:local` 成功，`built in 32.31s`。`pnpm ts:check` 失败：新增 commission 两页仅报自动导入符号 `useMessage/ref/reactive/nextTick/onMounted`，其余为既有 `wms` 等目录同类错误；`pnpm lint` 失败为既有非 Beauty 文件 22 个 stylelint 顺序/空行错误。解析单测已添加 `BeautyCommissionServiceImplTest`，覆盖四种优先级/无默认路径；直接模块测试因 worktree 未安装 reactor 所需本地 SNAPSHOT 依赖而无法启动（独立执行时报 `Could not find artifact ... in aliyunmaven`），编译验收已通过。

待 PR 合并后由计划分支完成 `done` 翻转。

### S4 消费者下单与支付单
_(empty)_

### S5 支付回调与排班锁定
_(empty)_

### S6 结算生成与退款冲正
_(empty)_

### S7 消费者真实接口接入
_(empty)_

### S8 服务者真实接口接入
_(empty)_

### S9 三端联调与契约验收
_(empty)_

<!-- One ### S<N> block per stage. Templates for the states you'll hit:

  done      — paste the real acceptance output, then the as-built summary and
              any gotchas the next stage needs to know.
  doing     — tick the completed Steps checkboxes in the stage file; write a
              handoff note here (what's left, where to resume).
  blocked   — record exactly what human/external action unblocks it, as a
              runbook the human can follow; no faked progress. Where that row
              and runbook get committed depends on whether the stage branch
              exists yet — see PLAN.md, Operating protocol, "Recording a
              block". A mid-stage block lands on the stage branch, so this
              file's copy on the plan branch keeps reading `doing` and the
              block is recorded in BLOCKED.md instead. Discovered mid-run that
              the stage needs a resource only the local machine has? Use the
              literal reason `needs-local` in the Result cell (or the
              BLOCKED.md section) instead of a generic note — see PLAN.md,
              "Recording a block", "The discovered case".
  skipped   — one-line reason; if this stage owned acceptance/verification
              work nothing else covers, say so here too, so SF sees it.
  follow-up — a shortcut or scope-creep item spotted here that became (or
              should become) its own stage; name it so the review stage sees it.
-->

### SF 最终计划审查
_(empty)_
