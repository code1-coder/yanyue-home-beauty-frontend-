# SF — 最终计划审查

<!-- This stage's flags (depends / mode / exec / model / effort / gate) live ONLY in
the PLAN.md stage index — the single authoritative home. Do not restate them
here; a copy is what drifts. -->

> First read `.plan/PLAN.md` (Frozen decisions + Operating protocol) and
> `.plan/LEDGER.md` — the *entire* ledger, every note, gotcha, shortcut, and
> known gap. This is the one stage exempt from the read-scope rule: read
> everything, not just what this stage depends on. Follow the protocol,
> including the finish protocol.
> Also skim `docs/admin/需求.md`、`docs/common/业务规则与跨端流程.md`、S0a-S9 的全部阶段文件与 ledger notes，对照 P0 是否真的闭环。

## Goal

Catalog every loose end the plan accumulated and close each one out. This
stage never implements — it only sorts findings into one of three outcomes
and records them.

## Steps

- [ ] Read every ledger row's notes end to end; list every loose end, gotcha,
  shortcut, and known gap surfaced across all stages.
- [ ] For each loose end, resolve it into exactly one outcome:
  - **New stage in this plan** — add a **PLAN.md stage index row** (with its
    `depends` / `mode` / `exec` / `model` / `effort` / `gate` flags — the index is the
    authoritative home, so `/stage-run`'s weight check and next-runnable logic
    can see the stage), a ledger row, and a stage file; it runs later as a
    normal stage in its own fresh session and branch.
  - **Spin-off candidate** — record it in the ledger and note it for the
    final PR body as follow-up; it does not block closeout.
  - **Accepted, won't fix** — write a one-line reason in the ledger so the
    gap is a decision, not a surprise.
- [ ] Confirm no loose end was dropped: every item from the first step maps
  to exactly one of the three outcomes above.
- [ ] Explicitly decide for each of: 订单改派、订单日志、定时任务（接单超时/结算释放/资质到期已有 Job 是否够用）、服务者详情 6 个 Tab（资质/项目/排班/订单/收益/评价）、三端联调测试清单、S0a 的协议落地、消费者/服务者 mock 清理、P1（排班日历/营销/统计）。Each is a new stage, a spin-off, or accepted-won't-fix.

<!-- Checkboxes are the resume mechanism: a session that stops mid-stage marks
the row `doing`, ticks the boxes it finished, and writes a handoff note in the
ledger. Re-running the stage resumes from the first unticked box. -->

## Acceptance

- Every loose end captured from the ledger is either a new stage (a PLAN.md
  stage index row **plus** a ledger row **plus** a stage file) or explicitly
  closed (spin-off note or accepted-won't-fix reason) — paste the resulting
  list into the ledger notes as evidence.

## Artifacts

本阶段不实现业务代码。可能产出：

- `PLAN.md` 新增 stage index 行（若审查决定补阶段）
- `LEDGER.md` 对应新行 / 本阶段 notes（分类清单：新阶段 / spin-off / won't-fix）
- 新的 `stage-*.md`（仅当选择「本计划内新阶段」）
- 最终 PR 可用的 follow-up 列表（P1 建议、三端联调项）
