# S0 — 项目分类 CRUD 与菜单 SQL

<!-- This stage's flags (depends / mode / exec / model / effort / gate) live ONLY in
the PLAN.md stage index — the single authoritative home. Do not restate them
here; a copy is what drifts. -->

> First read `.plan/PLAN.md` (Frozen decisions + Operating protocol) and
> `.plan/LEDGER.md`. Follow the protocol, including the finish protocol.
> Also read `apps/ruoyi-vue-pro/sql/mysql/beauty_init.sql`（分类表已存在）,
> `apps/yudao-ui-admin-vue3/src/router/modules/beauty.ts`,
> `apps/yudao-ui-admin-vue3/src/views/beauty/project/project/`（项目页参考）,
> 以及 `BpmCategoryController` / `views/mall/product/category` 作为 CRUD 范本。

## Goal

补齐平台项目分类的管理端 CRUD，并写入完整 `system_menu` 菜单树，让后续审核、财务、抽成、项目页面都能通过动态菜单和 `categoryId` 下拉真正跑起来。

## Steps

- [x] 后端：在 `yudao-module-beauty-biz` 新增分类 DO/Mapper/Service/Controller（表 `beauty_service_project_category` 已存在，不要再写 DDL）。参考 `BpmCategoryController`：`GET /page`、`GET /get`、`GET /list`（下拉用）、`POST /create`、`PUT /update`、`DELETE /delete`。路径 `/beauty/project-category`，权限 `beauty:category:query|create|update|delete`。VO 走 `PageParam` + `CommonResult` + MapStruct/`BeanUtils`。
- [x] 删除分类时校验是否被 `beauty_service_project.category_id` 引用；`categoryId` 在项目创建/更新时保持必填。
- [x] 管理端：新增 `src/api/beauty/project/category.ts` 与 `src/views/beauty/project/category/index.vue` + `CategoryForm.vue`（树形或列表均可，参考 `views/mall/product/category`）。金额不涉及；按钮用 `v-hasPermi`。
- [x] 在 `router/modules/beauty.ts` 声明 `/beauty/project/category` 页面与权限元数据（动态菜单仍由后端 `system_menu` 驱动）。
- [x] SQL：在 `beauty_init.sql` 补充 `system_menu` 完整菜单树，覆盖服务者、项目（含分类）、订单、审核、财务、抽成的一级/二级菜单；权限标识与后端 `@PreAuthorize` 及前端 `v-hasPermi` 一致。
- [x] 项目表单（`ProjectForm.vue`）分类下拉改为调用分类 list 接口，不再写死。

<!-- Checkboxes are the resume mechanism: a session that stops mid-stage marks
the row `doing`, ticks the boxes it finished, and writes a handoff note in the
ledger. Re-running the stage resumes from the first unticked box. -->

## Acceptance

- `cd apps/ruoyi-vue-pro && mvn compile -pl yudao-module-beauty/yudao-module-beauty-biz -am -DskipTests` 成功。
- `cd apps/yudao-ui-admin-vue3 && pnpm ts:check && pnpm lint && pnpm build:local` 成功（若 `node_modules` 不存在先 `pnpm install`，并在 ledger notes 记录）。
- `beauty_init.sql` 含 `system_menu` 插入，权限标识与 `@PreAuthorize('beauty:…')` 对得上。
- 创建一个分类后，项目表单下拉能选到该分类（接口或页面证据贴进 ledger）。

## Artifacts

- `apps/ruoyi-vue-pro/yudao-module-beauty/yudao-module-beauty-biz/src/main/java/cn/iocoder/yudao/module/beauty/controller/admin/project/` 分类 Controller/VO
- 对应 `dal/dataobject`、`dal/mysql`、`service/project` 分类实现
- `apps/ruoyi-vue-pro/sql/mysql/beauty_init.sql`（`system_menu`）
- `apps/yudao-ui-admin-vue3/src/api/beauty/project/category.ts`
- `apps/yudao-ui-admin-vue3/src/views/beauty/project/category/`
- `apps/yudao-ui-admin-vue3/src/router/modules/beauty.ts`
- 父仓库 submodule SHA 更新（若代码改在 submodule 内提交）
