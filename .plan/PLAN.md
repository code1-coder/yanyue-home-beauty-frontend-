# 美容服务平台 P0 全闭环 — plan & protocol

管理端补齐剩余查询契约（资质/提现/退款分页、结算与支付流水），实现消费者下单、支付回调、排班锁定与 T+7 结算/退款冲正；同时冻结跨端 API 契约，把消费者端和服务者端从 mock/local-storage 接到真实 Beauty 接口，完成三端联调。排班日历、营销活动、统计报表、商城订单、消息中心不在此计划。 This file is the **single source of truth** for durable decisions: the
architecture, the frozen decisions, the stage index, and the operating
protocol every stage session follows. Decisions live here and are *referenced,
never copied* — a decision that exists in one place cannot diverge.

## Architecture (what we're building)

```
后端 apps/ruoyi-vue-pro/yudao-module-beauty/
├─ controller/admin/
│  ├─ project/
│  │  └─ BeautyProjectCategoryController     ← S0 新增：分类 CRUD
│  ├─ provider/
│  │  └─ BeautyQualificationAdminController  ← S1 补充：getQualificationPage
│  ├─ finance/
│  │  ├─ BeautyWithdrawAdminController       ← S1 补充：getWithdrawPage
│  │  ├─ BeautyRefundAdminController         ← S1 补充：getRefundPage
│  │  ├─ BeautySettlementAdminController     ← S2 新增：Controller（Service 已有）
│  │  └─ BeautyPaymentAdminController        ← S2 新增：支付流水查询
│  └─ commission/
│     ├─ BeautyCommissionTemplateController  ← S3 新增：抽成模板 CRUD
│     └─ BeautyProviderCommissionController  ← S3 新增：独立抽成设置
├─ controller/app/customer/
│  └─ BeautyOrderController.createOrder      ← S4 补齐实现（Controller 已有）
├─ service/order/
│  └─ BeautyServiceOrderServiceImpl          ← S5 补充：updateOrderPaid 实现
└─ sql/mysql/beauty_init.sql
   └─ system_menu                            ← S0 补充：完整菜单树

管理端 apps/yudao-ui-admin-vue3/
├─ views/beauty/project/category/           ← S0 新增：分类页面
├─ views/beauty/audit/                      ← S1 接真实分页（3 个审核页）
├─ views/beauty/finance/                    ← S2 接真实分页（结算/支付流水）
└─ views/beauty/commission/                 ← S3 接真实 CRUD（模板/独立抽成）

消费者端 apps/consumer/
├─ platform/http/                           ← S0a：uni.request、token、401 刷新
├─ features/services.ts                     ← S7：从 mock 换成真实 adapter
└─ pages/{login,order,pay,address}/         ← S7：接真实登录/预约/支付/订单

服务者端 apps/provider/
├─ platform/http/                           ← S0a：uni.request、token、401 刷新
├─ platform/media.ts                        ← S8：infra 文件服务，禁止临时路径
├─ features/services.ts                     ← S8：从 mock 换成真实 adapter
└─ pages/{login,schedule,orders,finance}/   ← S8：接真实排班/履约/钱包
```

## Frozen decisions

Change these in THIS file only — never restate them in stage files or the
ledger. If a stage changes a decision, amend it here as the last step of that
stage (Operating protocol, finish step 3).

从 `~/.claude/plans/apps-ruoyi-vue-pro-typed-lemur.md` 继承：

- **金额单位**：后端数据库和接口统一使用分（Long），前端展示和输入使用元（`/ 100`、`Math.round(* 100)`）
- **管理端路由**：动态菜单由后端 `system_menu` 表驱动，前端 `router/modules/beauty.ts` 只声明页面和权限元数据
- **订单快照**：保存项目名称、价格、时长、上门费、抽成比例、结算周期，历史订单不受当前目录变化影响
- **服务项目模型**：平台项目目录 + 服务者项目关联（多对多），`categoryId` 必填
- **抽成规则**：独立抽成 > 条件模板 > 默认模板；抽成基数 = 项目实付 + 上门费 - 优惠
- **结算周期**：T+7 生成结算单，退款冲正按比例冲减
- **API 路径**：管理端 `/beauty/*`（由 axios 统一加前缀），不调用 `/app-api/beauty/*`
- **权限标识**：与后端 `@PreAuthorize` 一致，页面按钮使用 `v-hasPermi`

本计划新增（后端领域）：

- **分类表已存在**：`beauty_service_project_category`，只需补 Controller/Service/VO
- **抽成比例单位**：后端数据库和接口使用百分比 `decimal(5,2)`（例如 15.00 表示 15%），前端直接展示和输入百分数，无需额外转换
- **结算 Service 已实现**：`BeautySettlementServiceImpl.processSettlement()` 完整，只需补管理端 Controller
- **消费者下单 Controller 已有**：`BeautyOrderController.createOrder` 骨架存在，Service 层 `createOrder` 需补齐校验、快照、支付单创建逻辑
- **支付回调**：实现 `BeautyServiceOrderServiceImpl.updateOrderPaid`，事务内完成状态更新 + 排班锁定，幂等键为 `payOrderId`
- **排班锁定时机**：支付成功回调时锁定，而非下单时，避免待支付订单占用时段
- **验证命令**：
  - 后端：`cd apps/ruoyi-vue-pro && mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests`
  - 管理端：`cd apps/yudao-ui-admin-vue3 && pnpm ts:check && pnpm lint && pnpm build:local`

跨端接口契约（S0a 冻结，S7/S8/S9 遵守）：

- **接口路径命名空间**：沿用现有真实后端路由，不新增 `customer/` 顶级前缀。消费者订单使用 `/app-api/beauty/order/*`、退款使用 `/app-api/beauty/refund/*`；服务者操作使用 `/app-api/beauty/provider/*`；管理端使用 `/beauty/*`（axios 自动加 `/admin-api` 前缀）。新增查询接口按领域归属放置，不因前端尚未上线而迁移现有路径。
- **金额协议**：后端接口统一使用分（`Long`），小程序 API adapter 层负责 `fenToYuan` / `yuanToFen` 转换，页面 ViewModel 使用元；订单快照保存分单位；抽成基数 = 项目实付 + 上门费 - 优惠。
- **时间协议**：时间戳统一毫秒；日期使用 `yyyy-MM-dd`；排班粒度 30 分钟；前端可用时间字符串展示，但请求传标准日期和时段标识。
- **鉴权与刷新**：复用会员认证（`/member/auth/*`），手机验证码登录和微信小程序 `code` 登录；请求头 `Authorization: Bearer {accessToken}`；写请求携带 `X-Idempotent-Key: {uuid}`；401 单次刷新 token（`/member/auth/refresh-token`），失败后清理会话并跳转登录。
- **服务者身份**：`providerId` 只从后端登录态解析，客户端传入的 `providerId` 不作为授权依据；服务者操作必须校验当前用户是否该服务者。
- **文件上传**：资质、身份证、服务凭证和售后证据统一走 infra 文件服务；小程序临时文件路径不得作为永久业务地址；敏感文件使用私有存储和受控临时 URL。
- **统一响应**：`{ code: 0, data: {}, msg: "操作成功" }`；分页为 `{ total, list }`；状态和错误码使用稳定枚举值，不使用中文文案作为协议值，前端单独维护展示映射。
- **财务规则**：T+7 结算；余额严格大于 1 元才能提现；上门费参与抽成；退款冲正按比例冲减平台抽成和服务者收入；商城订单与服务订单保持独立的支付、履约和结算状态机。
- **两端基础设施**：`apps/consumer/platform/http/` 和 `apps/provider/platform/http/` 封装 `uni.request`、CommonResult/分页解包、Bearer token、401 刷新、登录守卫、统一错误；`apps/consumer/features/services.ts` 和 `apps/provider/features/services.ts` 保持为页面唯一业务入口，但实现从 mock 替换为真实 HTTP adapter。
- **会员认证契约（S0a）**：短信登录调用 `POST /member/auth/sms-login`，请求字段为 `mobile`、`code`，短信场景使用 `MEMBER_LOGIN` 的稳定值 `1`；微信小程序登录调用 `POST /member/auth/weixin-mini-app-login`，请求字段为 `phoneCode`、`loginCode`、`state`；令牌响应字段为 `userId`、`accessToken`、`refreshToken`、`expiresTime`、可选 `openid`；刷新调用 `POST /member/auth/refresh-token?refreshToken={refreshToken}`。前端只持久化认证令牌和过期信息，不把客户端 `providerId` 当作授权依据。

技术约束：

- Controller 参考 `BpmCategoryController`、`TradeOrderController`、`PayRefundController`
- VO 参考 `PageParam`、`CommonResult`、MapStruct 转换
- 权限注解 `@PreAuthorize("@ss.hasPermission('beauty:xxx')")`
- 前端组件参考 `views/mall/product`、`views/mall/trade/order`

- **本仓库集成分支是 `dev`，不是 `main`。** 计划分支 `plan-beauty-p0` 从 `dev` 切出；阶段 PR squash 进 `plan-beauty-p0`；closeout 最终 PR 是 `plan-beauty-p0` → `dev`（normal merge）。永不 push `main`。父仓库统筹 `.plan/`；各阶段业务代码在对应 submodule（`apps/ruoyi-vue-pro`、`apps/yudao-ui-admin-vue3`）内提交，阶段 PR 合并后父仓库更新 submodule SHA。
- **Git strategy:** branch-per-stage (fixed — the only supported model).
  `.plan/` is **tracked** on the plan branch and the plan branch has an
  **upstream** — both are load-bearing, not housekeeping (preflight step 0.0).
  `dev` → `plan-beauty-p0` (the plan branch; `.plan/` lives here) → one branch
  per stage `plan-beauty-p0-s<N>` (flat names — git refs can't nest a branch
  under an existing branch), each landing as a **squash-merged** PR into
  `plan-beauty-p0`; final PR `plan-beauty-p0` → `dev` at closeout is a **normal
  (non-squash) merge** so each stage keeps its own commit on `dev`. Commits on
  a stage branch are compulsory
  and incremental (logical units as the stage progresses, not one commit at
  the end). The agent creates and pushes stage and plan branches without
  asking, and **opens** the stage PR as a compulsory part of finishing a
  stage — never merging without your OK, never pushing to `main`. The one
  carve-out is the plan-level `merge: auto` flag (Stage index, plan flags
  line): it gives that OK in advance for **stage PRs only**, so the session
  squash-merges its own stage PR once checks are green; the plan→main PR is
  manual in every mode. A stage
  cannot be marked `done` until its PR is merged into the plan branch; the
  `done` edit itself is committed on the plan branch *after* the merge
  (Operating protocol, finish step 5), never on the stage branch.
- **Worktree strategy:** worktree-per-stage (fixed — the only supported
  model). *The clone holds the plan; worktrees hold the work.* The main clone
  stays parked on `plan-<slug>` for the life of the plan — that is the only
  branch ever checked out there, which is what keeps `.plan/` readable and the
  `done` write committable at any moment without disturbing an in-flight
  stage. Each stage branch is checked out **only** in its own sibling
  worktree, `../<repo-dirname>-s<N>` (`-redo-<K>` for a redo), created from
  the plan branch tip. Provisioning prefers the harness's native worktree
  mechanism, but only when it honors this convention's exact branch and path
  names, and falls back to `git worktree add` otherwise; it never degrades
  to checking a stage branch out in the clone (Operating protocol, step 4).
  Teardown is part of finishing: a clean, fully-pushed worktree is removed
  with its merged branch, and anything else is left alone and reported
  (finish step 5).
- **Final review stage:** the last stage (`SF`) is a standing plan review. It
  catalogs loose ends — each becomes a new in-plan stage, a spin-off
  candidate, or an explicit "accepted, won't fix" — and NEVER implements.

## Stage index & dependencies

| Stage | File | Depends | mode | exec | model | effort | gate |
|---|---|---|---|---|---|---|---|
| S0 项目分类 CRUD 与菜单 SQL | `stage-0-category-menu.md` | — | direct | inline | opus | med | auto |
| S0a 跨端 API 契约冻结与移动端基础设施 | `stage-0a-mobile-foundation.md` | — | brainstorm | inline | opus | high | human |
| S1 资质/提现/退款分页 | `stage-1-audit-pages.md` | S0 | direct | inline | sonnet | med | auto |
| S2 结算与支付流水接口 | `stage-2-finance-apis.md` | S1 | direct | inline | sonnet | low | auto |
| S3 抽成模板 CRUD | `stage-3-commission-crud.md` | S0 | direct | inline | opus | med | auto |
| S4 消费者下单与支付单 | `stage-4-order-create.md` | S0, S0a, S3 | direct | inline | opus | high | auto |
| S5 支付回调与排班锁定 | `stage-5-pay-callback.md` | S4 | direct | inline | opus | high | auto |
| S6 结算生成与退款冲正 | `stage-6-settlement-refund.md` | S3, S5 | direct | inline | opus | high | auto |
| S7 消费者真实接口接入 | `stage-7-consumer-api.md` | S0a, S4, S5, S6 | direct | inline | opus | high | auto |
| S8 服务者真实接口接入 | `stage-8-provider-api.md` | S0a, S1, S2, S5, S6, S7 | direct | inline | opus | high | auto |
| S9 三端联调与契约验收 | `stage-9-integration.md` | S8 | direct | inline | opus | high | human |
| SF 最终计划审查 | `stage-f-review.md` | S9 | brainstorm | inline | sonnet | med | human |

Plan flags: `merge: auto` · `plan-dir: delete`

This table is the **single authoritative home** for every stage's `depends` /
`mode` / `exec` / `model` / `effort` / `gate`, and the **plan flags** line
under it is the home of the plan-level `merge` and `plan-dir` flags. Stage
files never restate them (a copy is what drifts), and the tooling reads them
from here: `/stage-run`'s weight check reads `model`/`effort` from this index,
the runnable-set logic (below) reads `depends` from it, an unattended runner
reads `gate` and `merge`, and `/plan-close` reads `plan-dir`. A stage that
isn't in this table is invisible to all of them — so adding a new stage
(including one the final review spawns) means adding its row here first.

The two plan flags are this plan's **declared defaults**: the answers a
session applies when there is nobody to ask (`--unattended`). An interactive
session still asks, taking the declared value as its recommendation. See the
`staged-rollout` skill, *Unattended mode*, for the full classification of
which questions have a default and which are hard stops in every mode.

Flag values: `mode` = `direct` \| `brainstorm`; `exec` = `inline` \|
`subagent(<model>)`; `model`/`effort` = launch hints (checked, not faked);
`gate` = `auto` \| `human` \| `local` (may the stage be launched with nobody
watching? `human` means never — a person's judgment or presence is part of
the stage itself; `local` means never *by a driver that could be running
anywhere but the local machine* — the stage needs a resource only that
machine has: local hardware, a LAN-only host, a secret not committed anywhere
reachable, or a locally-installed toolchain. Same refusal, different reason —
an unattended runner stops in front of either exactly the same way); `merge` =
`manual` \| `auto` (does the session merge its own stage PR into the plan
branch once checks are green, or offer it for your OK?); `plan-dir` =
`delete` \| `keep` (at closeout, is `.plan/` removed as the last commit on the
plan branch, or left in place because the plan doubles as documentation?).
Defaults stay cheap where cheap is safe, and preserve the fully-manual flow — `direct`,
`inline`, a model sized to finish the stage, `gate: auto`, `merge: manual`,
`plan-dir: delete`; a missing `gate` column, a missing plan-flags line, or a
missing entry on it means those defaults. Escalate only where a stage has
genuine open design questions (`brainstorm`, which also makes it
`gate: human`), needs a resource only the local machine has (`gate: local`),
or has heavy iteration churn (`subagent`). `merge` governs stage PRs only —
the plan→main PR at closeout is manual in every mode.

### Runnable set & waves (derived, never stored)

The `Depends` column is a full dependency graph, so everything about execution
order is **derived from it** — waves and parallelism are never written down as
their own column. A stored copy is what drifts; the graph is the truth.

- **Runnable set:** every stage whose `LEDGER.md` status is `todo` and whose
  `depends` are all `done` or `skipped` — a skip is a settled outcome, not an
  unmet dependency, so it must not deadlock a dependent — plus any `doing`
  stage (resumable). This is a
  *set*, not a single stage. When it holds more than one, those stages have no
  dependency on each other and can be run **concurrently, one per fresh
  session**.
- **Waves:** wave 0 is every stage with no `depends`; wave *k* is every stage
  whose deepest prerequisite sits in wave *k−1*. The number of waves is the
  fewest rounds the plan can take, and the **critical path** — the longest
  chain of `depends` edges — is the floor on elapsed time that no amount of
  parallelism removes.
- **`depends` means "cannot safely start until", not "written after".** List
  only genuine prerequisites. Chaining `S0 → S1 → S2 → S3` when the real graph
  is `S0 → {S1, S2, S3}` costs three rounds instead of two and hides the cost,
  because the index still looks correct.
- **Concurrency is an operator action.** Nothing here launches sessions:
  running a wave in parallel means opening one session per stage yourself —
  or leaving it to an unattended runner outside any session, which launches
  only `gate: auto` stages and stops in front of a `gate: human` one. What
  the protocol owes you is that doing so is safe — see *Concurrent stages*
  below.

### Concurrent stages (when the set fans out)

Running two stages at once changes nothing about the git model: still one
branch per stage, one PR per branch, one stage per session. It adds one
structural fact and four rules about timing.

- **Separate working trees are what make concurrency physical.** Each stage
  runs in its own worktree, so two sessions never contend for `HEAD` and
  neither can see the other's uncommitted work. The rules below are about
  what happens when their *branches* meet at the plan branch.
- **A sibling's stage branch is expected state, not drift.** Two stage
  branches cut from the same plan-branch tip is exactly what a fan-out looks
  like. Preflight step 0.5 classifies by whose stage the mismatch belongs to:
  drift on the stage *this* session is about to run still stops it, while
  another stage's in-flight branch is reported and stepped over.
- **The plan branch is the serialization point.** Parallel stage PRs merge
  **one at a time, first come first served** — there is no queue to manage.
  Whoever merges second re-syncs first (finish step 4): merge the plan branch
  *into* the stage branch, resolve there, and re-run the acceptance checks. A
  PR GitHub calls "mergeable" only means no textual conflict — not that this
  stage still passes after the sibling's change landed.
- **Shared write territory is a `depends` edge.** Two stages with no logical
  relationship can still write the same files, and `Depends` is the only place
  that can express it — so express it there and let the wave structure narrow
  accordingly. There is deliberately **no** separate "territory" field: a
  second place to record the same constraint is a second thing to drift. If
  the overlap is small and genuinely order-independent, leaving both stages in
  one wave is a legitimate choice, and the re-sync-and-re-verify rule above is
  the net that catches it.
- **The `done` ledger write can race.** It is a direct commit on the plan
  branch (finish step 5), so two sessions finishing minutes apart collide
  there. Finish step 5 says how: edit after the fast-forward, replay on
  rejection, never force-push the plan branch.

## Operating protocol (every stage session)

0. **Preflight & sync (required):** run this before reading any status or
   touching any branch. The ledger is canonical but may only be trusted
   *after* it passes — git state inherited from a previous session, a remote
   merge, or a crash is verified here, never assumed.
   0. **Verify the plan is real git, not a loose directory.** Two checks,
      both hard gates — the whole protocol rests on them:
      - **`.plan/` is tracked:** `git ls-files --error-unmatch .plan/PLAN.md`.
        If it fails, `.plan/` is untracked or ignored — stop. An untracked
        plan produces no committable content, so stages that only amend
        `PLAN.md`/`LEDGER.md` can never open a PR, which makes every
        downstream dependency gate unsatisfiable; and the entire decision
        record dies with the working directory. Fix by removing the ignore
        rule (`git check-ignore -v .plan/PLAN.md` names it) and committing
        `.plan/` on the plan branch before running any stage.
      - **The plan branch has an upstream:**
        `git rev-parse --abbrev-ref plan-<slug>@{upstream}`. If it fails, the
        branch is local-only — the fetch and fast-forward below would succeed
        while doing nothing, forever. Push it (`git push -u origin
        plan-<slug>`) and continue; pushing a feature branch needs no
        approval.
   1. **Fetch:** `git fetch origin`.
   2. **Sync the plan branch:** fast-forward local `plan-<slug>` to
      `origin/plan-<slug>` — `git merge --ff-only origin/plan-<slug>` when it
      is checked out, `git fetch origin plan-<slug>:plan-<slug>` otherwise
      (both refuse non-fast-forward updates). This holds under both remote
      squash-merge and merge-commit: either way the remote plan branch only
      moves forward. If it won't fast-forward, the branch has diverged — stop
      and report.
   3. **Verify the trees:** a clean working tree is required in *this* tree
      **and** in the main clone. The clone matters even when the stage runs
      elsewhere: the `done` write (finish step 5) is a commit there, so a
      dirty clone blocks the stage from ever closing. If either is dirty,
      stop and list exactly what is uncommitted — never auto-stash.
   4. **Verify position (the two-tree rule):** the clone is parked on
      `plan-<slug>`; stage branches live only in sibling worktrees. Establish
      which tree this session is in — inside a worktree `git rev-parse
      --git-dir` and `--git-common-dir` differ; in the clone they match —
      then check:
      - **The clone's HEAD must be `plan-<slug>`.** A stage branch checked
        out there is drift: stop and report. The fix is to check the plan
        branch back out in the clone and give that stage its own worktree —
        never run the stage in the clone.
      - **A fresh stage starts in the clone**, which is where step 4 creates
        its worktree.
      - **A resumed stage must run inside that stage's worktree.** If the
        worktree exists but this session is in the clone, print its path and
        enter it (step 4's provisioning rule) — do not check the branch out.
      - Detached HEAD anywhere, or a worktree whose HEAD is not its own stage
        branch → stop and report.
   5. **Reconcile ledger vs reality:** cross-check the `LEDGER.md` status
      table against actual branch and PR state (`gh pr list --base
      plan-<slug> --state all`, `git branch -a --no-merged plan-<slug>`).
      Classify each mismatch by *whose* stage it belongs to — the stage this
      session is about to run, or another one:
      - **Self-healing:** a `doing` row whose stage PR is already merged
        means the merge happened remotely — complete the finish protocol's
        post-merge bookkeeping (finish step 5) by recording that row `done`
        on the plan branch. If that row is the stage *this* session was
        launched to run, the stage is finished: skip to finish step 6 (the
        announcement) — it is neither a resume nor a redo, in any mode.
      - **Drift — report and stop:** a `done` row with an open or unmerged
        stage PR; an open stage PR based on `main` instead of
        `plan-<slug>`; and **this session's own stage** showing a `todo` row
        while its stage branch already exists with commits (a crashed
        earlier attempt at the very stage you are starting — resume it or
        discard it, don't run over it).
      - **Report and continue:** *another* stage's `todo` row with an
        existing stage branch that has commits. Under concurrent execution
        that is the ordinary signature of a **live sibling** — a session
        working that stage right now, whose `doing` flip and evidence are
        still on its own unmerged branch and therefore invisible from here.
        Halting would stop every parallel session, so list each one in the
        preflight report (stage id, branch, whether it has an open PR) and
        carry on. Detection is re-aimed, not weakened: the same signature
        with no session behind it is a crashed stage, it reappears in every
        later preflight report, the final review stage sees it, and closeout
        still refuses to run while any stage PR is open or unmerged.

      Then reconcile **worktrees** by the same rule, from `git worktree list
      --porcelain` — but only worktrees whose branch matches
      `plan-<slug>-s*`. An operator's unrelated worktree (any other branch)
      is none of this plan's business: it is ignored entirely, never
      classified into any bucket below and never offered for removal. A
      worktree belonging to *this* session's stage that this session did not
      create is the crashed-attempt case — stop, resume or discard it, don't
      run over it. A worktree for *another* `todo`/`doing` stage is the
      ordinary live sibling — list it and carry on. A worktree whose stage
      branch is already merged or gone is an **orphan** from an interrupted
      teardown — report its path and offer removal; never remove it unasked,
      and never assume it is empty.

      Finally, read `.plan/BLOCKED.md` if it exists. A `### S<N>` section there
      records a stage a previous session or an unattended runner marked
      `blocked` while its `LEDGER.md` row still reads `todo` or `doing` — so
      the row alone will not tell you. List each one in the preflight report,
      and where the section belongs to **this session's own stage**, state what
      it was waiting on before starting, so the stage is not walked straight
      back into the same gate. Relaunching by hand is itself the operator's
      answer, so this does not stop the session; deleting the section is theirs
      to do, not yours (*Recording a block*, below).
   6. **Report, don't repair:** on anything preflight can't fast-forward or
      reconcile, stop with an accurate report of the state and what would fix
      it — no auto-stash, no reset, no branch deletion, no `git worktree
      remove --force`, and no automatic `git worktree prune`.
1. **Read only:** this file + the target stage file + the `LEDGER.md` status
   table + the notes blocks of the stages this one `depends` on + any docs the
   stage file names. Do NOT scan the rest of the repo. (Exception: the final
   review stage reads the *entire* ledger.)
2. **Weight check:** compare the session's model against the stage's `model`
   flag (your system prompt states your model), checked mechanically against
   the `staged-rollout` skill's **Model weight tiers** rubric — not a guess
   about your own weight; state the `effort` actually set, read from
   `CLAUDE_EFFORT`, next to the stage's `effort` flag (`med` = `medium`), and
   say it could not be read if that variable is absent rather than assuming
   it matched — an unreadable effort is not a mismatch and neither asks nor
   blocks. If the session is lighter than recommended, or the effort set
   differs from the flag (higher or lower — both are misaligned), **stop**
   before doing anything: name the mismatch and the model and effort to
   relaunch with. There is no continue option; nothing is written and the
   row stays `todo`. A heavier model alone is not a mismatch. Attended, end
   the stop with one plain line the operator can act on in place — *"switch
   the model and effort in this session's model menu to \<model> /
   \<effort>, then type **go** (or just **.**)"* — and treat a **go** or
   **.** as the next message as a fresh start of this same stage, re-reading
   the model and `CLAUDE_EFFORT`: it re-checks, it never overrides. If the
   disclosed model doesn't recognizably match a tier in the rubric, don't
   guess — state the exact model ID/name and ask the user which tier applies.
   **Unattended?** If this session was launched with nobody to answer it (an
   unattended runner, or `/stage-run`'s `--unattended` argument), check the
   stage's `gate` first: a `gate: human` or `gate: local` stage is never
   started unattended — report that and stop here. For a `gate: auto` stage, every offer or
   question in this step and the ones below either has a **declared default**
   on the plan flags line or is a **hard stop** — there is no third option
   and nothing waits for an answer (see the `staged-rollout` skill,
   *Unattended mode*, for the full classification). Nothing in this step has a
   declared default, so a lighter-than-recommended model, a readable effort
   that differs from the flag, or an unrecognised tier marks the row `blocked` with the mismatch as the runbook, commits it
   per *Recording a block* below — this step runs before step 4, so that is a
   direct commit on the plan branch — and stops.
3. **Dependency gate:** for every `depends` stage, confirm it is `done` or
   `skipped` in `LEDGER.md` **AND its stage branch/PR is merged into the plan
   branch** (`git fetch` first — the merge may be remote and not yet local).
   Both must hold, for a `skipped` dependency exactly as for a `done` one: a
   skip still commits its ledger row and opens a PR (nothing here exempts it
   from the git strategy above), and a dependent branched before that PR is
   merged would silently miss the decision. A `done`/`skipped` ledger row
   alone is not enough: a stage branched off the plan branch before a
   prerequisite's PR is merged will silently lack that prerequisite's work. If
   either isn't true, stop and say so. This gate is always satisfiable:
   **every** stage has repo artifacts, because `.plan/` is tracked and every
   stage edits the ledger — a documentation- or decision-only stage, and a
   skipped one, still commits its `PLAN.md`/`LEDGER.md` changes and still
   opens a PR. A depends-stage with no PR means preflight step 0.0 was
   skipped, not that the stage was exempt.
4. **Branch & worktree:** the stage runs in its own sibling worktree and the
   clone stays on the plan branch (frozen decision above). Create branch and
   worktree together from the plan branch, which preflight step 2 already
   brought up to date — or use them as-is if the human already made them:
   - **Prefer the harness's native mechanism** where there is one (Claude
     Code's `EnterWorktree`, or the `superpowers:using-git-worktrees` skill
     when installed) — but only if it honors this protocol's naming
     convention (branch `plan-<slug>-s<N>`, path `../<repo-dirname>-s<N>`).
     A mechanism that picks its own path or branch name breaks the ledger's
     path references, the teardown command, and the next session's resume
     lookup — none of them can find a worktree under any name but this one.
     If it can't be pointed at this exact name and path, don't use it.
   - **Otherwise:** `git worktree add ../<repo-dirname>-s<N> -b
     plan-<slug>-s<N> plan-<slug>`, then work there by absolute path for the
     rest of the stage.
   - **If the harness refuses to work outside its starting directory:** stop,
     print the worktree path, and tell the operator to relaunch this stage
     with that path as the working directory. **Never** fall back to checking
     the stage branch out in the clone — that closes the ledger window and
     breaks every concurrent session.
   - **A fresh worktree holds only tracked files.** Untracked local setup the
     stage needs — `.env`, local config, build caches, dependency directories
     — is not there. Copy what it needs and record in the ledger notes what
     you copied, because the next session starts from the same blank slate.
   **Redo:** re-running a `done` stage cuts a fresh
   `plan-<slug>-s<N>-redo-<K>` branch in its **own** worktree
   (`../<repo-dirname>-s<N>-redo-<K>`) from the current plan branch tip —
   never reuse a merged stage branch or its worktree.
5. **Honor `mode` / `exec`:**
   - `mode: direct` → state a one-line plan, then implement.
   - `mode: brainstorm` → run a design pass scoped to THIS stage first,
     treating frozen decisions as settled; land outcomes as frozen decisions
     here, not in a second spec.
   - `exec: inline` → implement in this session.
   - `exec: subagent(<model>)` → act as orchestrator and dispatch the
     implementation to a subagent so the churn stays out of this context.
6. **Scope discipline:** do only this stage. Work belonging to another stage →
   note it in the ledger notes and leave it untouched. It may become a new
   stage.
7. **Finish protocol (required):**
   1. Run the stage's **Acceptance** checks; paste the real output into the
      stage's notes block in `LEDGER.md`.
   2. Update the stage's table row: absolute date, verified yes/no, one-line
      result — but the status stays `doing` here. `done` is recorded only
      after the PR merges (step 5 below), so a `done` row is always visible
      from a synced plan branch. Detail goes in the notes block, never the
      table. A stage stopping `blocked` instead of finishing never reaches
      step 5 at all — *Recording a block* below says where its row and runbook
      are committed, and it still opens its PR at step 4.
   3. If a decision changed or was added, amend **Frozen decisions in this
      file** — nowhere else.
   4. Commit on the stage branch throughout the stage at logical units
      (conventional messages) — not one commit at the end. Everything in this
      step — commits, push, the PR, any sibling re-sync merge — happens
      **inside the stage worktree**, never in the clone. There is no such
      thing as a stage with nothing to commit: steps 1–3 above always change
      tracked files under `.plan/`, so a stage whose Artifacts are "no host or
      secret changes" still lands its ledger evidence and any frozen-decision
      amendment as a commit. Push the branch
      and **open the PR** into `plan-<slug>` (compulsory, not offered),
      pinning the base explicitly — `gh pr create --base plan-<slug>` — never
      relying on the default, which falls back to the repo's default branch
      (`main`). Then **offer** to merge it once reviewed — never merge on
      your own. Stage PRs are **squash-merged** (one commit per stage on the
      plan branch), and the merged stage branch is deleted. The stage cannot
      be marked `done` until this PR is merged.
      **Under `merge: auto`** (plan flags line): the OK is given in advance
      for stage PRs, so once the sibling re-sync check below has run and
      every required check on the PR is green, squash-merge it yourself
      (`gh pr merge --squash --delete-branch`) and continue straight to step
      5. Never force or retry past a refusal — a red or missing check, or a
      protection rule on the plan branch, means the merge did not happen this
      session: leave the row `doing`, report the refusal and why, and end;
      the next preflight (step 0.5) finishes the bookkeeping once someone
      merges it. `merge` never applies to the plan→main PR, and it never
      reaches a stage that is stopping `blocked` — that PR is opened and left
      for a person (*Recording a block* below).
      **Merge order with a sibling in flight:** parallel stage PRs merge one
      at a time, first come first served — the plan branch is the
      serialization point, so there is no queue to coordinate. Before
      offering the merge, `git fetch origin` and check whether
      `origin/plan-<slug>` has moved past this stage branch's merge base. If
      it has, a sibling merged while this stage was in flight: merge the plan
      branch *into* the stage branch (`git merge origin/plan-<slug>`),
      resolve any conflict there, push, and **re-run the Acceptance checks**,
      replacing the evidence in the ledger notes with the output from the
      merged result. GitHub reporting the PR as mergeable is not enough — it
      means no textual conflict, not that this stage still passes after the
      sibling's change. Never rebase or force-push a stage branch: resolving
      with a merge commit on the stage branch costs the plan branch nothing,
      because the squash merge discards it. If yet another sibling lands in
      the window between the re-sync and the merge, repeat the check — it is
      cheap, and a stale re-verify is worth less than none.
   5. **After the merge:** return to the main clone — it is already on
      `plan-<slug>`, so there is no checkout to do — and fast-forward it
      (`git fetch origin` + `git merge --ff-only origin/plan-<slug>`), then
      flip the stage's row to `done` as a direct commit on the plan branch
      and push. The `done` edit lives on the plan branch, after the merge —
      never on the stage branch. If the merge doesn't happen this session,
      leave the row `doing` and end anyway; the next session's preflight
      (step 0.5) completes this bookkeeping when it finds the merged PR.
      **If a sibling stage is running, this write races.** Both sessions
      commit directly on the plan branch, so: make the edit *after* the
      fast-forward (never before), touch only your own row, and push
      immediately. If the clone is dirty on arrival and the change isn't
      yours — a sibling's session is mid-edit in this same clone — wait and
      retry rather than committing on top of it or folding it into your own
      commit; that is the one case the push-race handling below doesn't cover,
      because it happens before either side has pushed. If the push is
      rejected as non-fast-forward, the sibling won the race by seconds —
      fetch and replay your single ledger commit on top (`git pull --rebase
      origin plan-<slug>`), then push again. **Never
      force-push the plan branch**: last-writer-wins would erase the
      sibling's `done` row. If the replay conflicts, both rows are wanted —
      the two edits touch adjacent lines of the same table, so resolve by
      keeping **both**.

      **Then tear the worktree down, from the clone.** If the stage worktree
      is clean and fully pushed, remove it and delete the merged stage branch:
      `git worktree remove ../<repo-dirname>-s<N>`, then `git branch -D
      plan-<slug>-s<N>`. Use `-D`, not `-d` — the stage PR was squash-merged,
      so git's own merge-tracking never sees this branch as merged into
      `plan-<slug>` and `-d` refuses with "not fully merged" even though the
      squash commit already carries the work safely onto the plan branch,
      which is exactly what makes `-D` safe here. If the worktree holds
      anything uncommitted, unpushed, or stashed, **leave it** and report its
      path and what is in it — a worktree is a real directory and its
      contents are not
      recoverable from git. Never `--force`, never `prune` to tidy up; an
      orphan left behind is reported by every later preflight and gates
      closeout, which is the safe failure. **The two thresholds differ on
      purpose:** a stage leaves anything it is unsure about, and closeout
      sweeps up whichever of those turn out to be merged with nothing
      unpushed. Erring towards leaving costs a line in a report; erring
      towards removing costs a directory git cannot give back. If the merge did not happen this
      session, the worktree stays — teardown belongs with the `done` write.

      End the session in the clone, on the plan branch.
   6. Announce: this stage is **finished**, then the **complete runnable
      set** — *every* `todo` stage whose `depends` are now all `done` or
      `skipped`, not just the first (see *Runnable set & waves* above). For
      each one, give
      the exact prompt/command to run it, its recommended `model`/`effort`
      and its `gate` from the stage index — a `gate: human` stage needs a
      person at the keyboard and a `gate: local` stage needs a machine that
      has what it needs, so an unattended runner reading this stops in front
      of either. If the set holds more than one stage, say so
      plainly: they are independent and can be launched **concurrently, one
      per fresh session**. If it is empty, say which it is — every stage
      `done`/`skipped` (ready for closeout) or stalled on `blocked` rows and
      unmet dependencies. Then stop.

### Recording a block (wherever it happens)

A `blocked` record is only worth writing if the next reader — a person, or an
unattended runner — can find it **without waiting for a merge**. Where the
session commits it depends on one thing and nothing else: whether this stage's
branch exists yet.

- **Before the stage branch exists** — preflight, the weight check (step 2),
  the `gate: human` backstop, the dependency gate (step 3). This session is in
  the clone, on the plan branch, and no stage branch can be holding unmerged
  edits to this stage's row. Set the row `blocked` in `LEDGER.md`, write the
  runbook in its notes block, and commit that **directly on the plan branch,
  then push** — the same write as the `done` edit of finish step 5, with the
  same race handling: edit after the fast-forward, touch only your own row,
  replay on a rejected push, never force-push.
- **After the stage branch exists** — any block from step 4 onwards, including
  a mid-stage question the frozen decisions don't settle. The row and its notes
  may already carry this stage's own committed evidence on the stage branch, so
  the plan branch must not be edited into conflict with it. Two writes, in this
  order:
  1. **In the worktree, on the stage branch:** set the row `blocked`, write the
     full runbook in the stage's notes block, commit, push, and **open the
     stage PR** into `plan-<slug>` (compulsory at finish step 4 in every case)
     so the runbook is reviewable there. Never merge it — a blocked stage is
     not a finished one, and `merge: auto` does not reach it.
  2. **In the clone, on the plan branch:** append a `### S<N>` section to
     `.plan/BLOCKED.md` — **never** the ledger row — carrying one line on what
     is being waited for, the stage branch name, and the stage PR's URL. Commit
     and push it. Point at the PR for the detail rather than restating the
     runbook: a copy is what drifts.

  Leave the plan branch's ledger row reading `doing`. It becomes `blocked`
  there only once the stage PR is merged, and that is a person's call.

**The discovered case — `needs-local`.** `gate: local` (Stage index &
dependencies, above) covers a local-resource need known at authoring time. A
stage can also discover this *mid-run*, with nothing declared up front — a
credential that turns out to live only on this machine, a host only reachable
from a LAN this session isn't on, a locally-installed toolchain the session
doesn't have. Record it exactly like any other block above — same two cases
by whether the stage branch exists yet, same commit points — but write the
one-line reason as the literal token `needs-local`: in the row's `Result`
cell for the before-the-branch case, or as the first line of the
`.plan/BLOCKED.md` section's body for the after-the-branch case. That literal
token is what lets an unattended runner's report say "re-run this stage
locally" instead of a bare failure the next reader has to diagnose from
scratch. The full runbook — what exactly is missing and how to get it — still
goes in the notes block or the stage PR, same as any other block; `needs-local`
is a machine-readable tag, not a substitute for it.

**Not every unattended stop is a block.** A stage that did its work and stopped
only because `merge: manual` withheld the merge — or because a required check
was red — is not `blocked`: it leaves the row `doing` with its PR open, exactly
as finish step 4 says, and writes nothing here. This record is for a question
or a gate the stage cannot get past at all.

**Why the sibling file and not the row.** `.plan/BLOCKED.md` is the one file no
stage branch ever edits, so a write to it on the plan branch cannot contend
with the stage branch's own ledger edits. Writing the block into `LEDGER.md` on
the plan branch instead would diverge from the stage branch's unmerged commit
and leave that stage's own PR unmergeable — the runbook would be naming a merge
its own write had just made impossible.

**Both readers see it.** Preflight step 0.5 reads `.plan/BLOCKED.md` alongside
the ledger, and an unattended runner treats any stage id with a `### S<N>`
section there as `blocked` and never retries it, whatever the `LEDGER.md` row
still reads. Nothing clears a section automatically: delete that stage's
section by hand once the stage is resolved — its PR merged, or its row `done`.
