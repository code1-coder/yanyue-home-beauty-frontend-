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
| S0a 跨端 API 契约冻结与移动端基础设施 | todo | — | — | — |
| S1 资质/提现/退款分页 | done | 2026-10-10 | 后端编译 23/23 模块成功；管理端构建成功 |
| S2 结算与支付流水接口 | todo | — | — | — |
| S3 抽成模板 CRUD | todo | — | — | — |
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
_(empty)_

### S1 资质/提现/退款分页
已补齐三张业务表（`beauty_qualification`、`beauty_withdraw`、`beauty_refund`）及 DO/Mapper/Service/Controller 分页与详情接口。后端路径：`/beauty/qualification`、`/beauty/withdraw`、`/beauty/refund`；权限码分别为 `beauty:audit:qualification`、`beauty:audit:withdraw`、`beauty:finance:refund`。管理端新增 `src/api/beauty/audit/index.ts`、`src/api/beauty/finance/index.ts` 及三张分页页面，金额展示用元（/ 100）。退款查询权限选择 `beauty:finance:refund` 已记入 PLAN.md Frozen decisions。验收：后端 `mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests` 输出 `[INFO] Reactor Summary for yudao-dependencies 2.3.0-snapshot: [INFO] yudao-dependencies ................................. SUCCESS [  0.001 s] ... [INFO] yudao-module-beauty-biz ............................ SUCCESS [  0.943 s] [INFO] BUILD SUCCESS [INFO] Total time:  32.809 s`；管理端 `pnpm build:local` 输出 `✓ built in 45.71s`；`pnpm ts:check` 和 `pnpm lint` 失败属既有基线问题（ref/reactive 等自动导入符号错误、既有非 Beauty 文件样式问题，与 S0 一致）。

### S2 结算与支付流水接口
_(empty)_

### S3 抽成模板 CRUD
_(empty)_

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
