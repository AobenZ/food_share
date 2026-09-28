# 🍜 food_share

> 分享我平时吃到的美食 · Sharing the food I've enjoyed

![Status](https://img.shields.io/badge/status-in_development-blue)

## 📌 项目状态 / Project Status

🚧 **开发中 (In development)** — 已实现发布(多图/评分/推荐等级/地址)、浏览、详情页、浏览量、隐藏与删除,以及**多用户账号系统**(注册/登录、发布人、作者权限),可以本地运行;标签、搜索、地图等功能还在路上。

Posting (multi-photo / rating / recommend level / address), browsing, detail pages, view counts, hide & delete, and a **multi-user account system** (register / login, authors, per-author permissions) are done and runnable locally; tags, search, maps and more are on the way.

## 💭 一句话介绍 / One-liner

**中文**:一个记录和分享我平时吃到的美食的个人网站。

**English**: A personal website to record and share the food I've enjoyed.

## 🤔 为什么做这个项目 / Why

**中文**:平时吃到好吃的东西,随手发在社交媒体上,时间一长就找不到了。我想要一个属于自己的地方,把吃过的美食记录下来——照片、味道、价格、地点——既是留给自己的「美食回忆录」,也能分享给朋友,帮大家找到值得一试的店。

**English**: Good meals I post on social media get lost in the feed. I want a place of my own to record the food I've eaten — photos, taste, price, location — as a personal "food diary" I can also share with friends, to help everyone find places worth trying.

## ✨ 计划中的功能 / Planned Features

### MVP(最小可用版本 / Minimum Viable Product)

- ✅ 发布美食记录 / Post a food entry:多图、名称、描述、餐厅、价格、地址 (multi-photos, name, description, restaurant, price, address)
- ✅ 浏览时间线 / Browse entries:按时间查看所有记录 (view all entries by time)
- ✅ 记录详情页 / Detail page:点击卡片查看大图与完整信息
- ✅ 评分 / Rating:星级打分,发布后可修改
- ✅ 推荐等级 / Recommend level:强烈推荐 / 推荐 / 一般 / 踩雷
- ✅ 浏览量 / View count:每条记录统计浏览人次
- ✅ 隐藏与删除 / Hide & delete:隐藏后首页可筛选查看;删除连照片一起清理
- ✅ 账号系统 / Accounts:邀请码注册、登录、每条记录显示发布人
- ✅ 作者权限 / Permissions:只能编辑、隐藏、删除自己发布的内容

### 后续想法 / Later ideas

- 标签与分类 / Tags & categories:菜系、场景(夜宵、聚餐、一人食)
- 搜索与筛选 / Search & filter:按菜系、评分、价格查找
- 地图定位 / Map & location:标记吃过的店
- 随机推荐 / Random pick:不知道吃什么?帮我选一个
- 好友互动 / Social:评论、点赞(如果开放给朋友使用)
- 账号增强 / Account upgrades:找回密码、邮箱验证、第三方登录

## 🗺️ 路线图 / Roadmap

- [x] **Phase 0 · 想法 / Idea**:写下这份 README
- [x] **Phase 1 · MVP**:发布、浏览、详情页、评分、推荐等级、浏览量、隐藏与删除、账号系统
- [ ] **Phase 2 · 体验 / Experience**:标签、搜索
- [ ] **Phase 3 · 扩展 / Expansion**:地图、随机推荐、分享

## 🛠️ 技术栈 / Tech Stack

第一版已确定:

Decided for the first version:

| 部分 / Part | 选择 / Choice |
| --- | --- |
| 框架 / Framework | Next.js 16(App Router)+ TypeScript |
| 数据库 / Database | SQLite(better-sqlite3),数据文件在 `data/app.db` |
| 图片 / Images | 本地存储于 `public/uploads/`(部署到 Vercel 等平台时需换成对象存储) |

> 图片本地存储仅适合开发环境;部署时图片需要放到持久化存储。
> Local image storage works for development; on deploy, images need persistent storage.

## 🚀 本地运行 / Getting Started

**环境要求 / Requirements**:Node.js ≥ 20.9(推荐 22 LTS)

```bash
cp .env.example .env.local   # 然后编辑 .env.local,设置 REGISTER_INVITE_CODE(注册邀请码)
npm install
npm run dev
```

打开 / Open:<http://localhost:3000>

数据说明 / Data:`data/app.db`(数据库)和 `public/uploads/`(照片)都在 `.gitignore` 中,不会提交到仓库。

The database file `data/app.db` and photos in `public/uploads/` are gitignored.

## 🔐 账号系统 / Accounts

- 注册需要邀请码(`REGISTER_INVITE_CODE` 环境变量),朋友共用一码;未配置时注册关闭(返回 503)
- 密码用 scrypt 加盐散列存储,不存明文;登录会话为 httpOnly cookie,有效期 30 天
- 权限:浏览完全公开(无需登录);发布和上传照片需要登录;编辑/隐藏/删除仅限作者本人
- 每条帖子展示发布人,首页和详情页都能看到

- Registering requires an invite code (`REGISTER_INVITE_CODE` env var) shared among friends; registration is closed (503) if unset.
- Passwords are stored as salted scrypt hashes; login sessions are httpOnly cookies valid for 30 days.
- Permissions: browsing is fully public; publishing and uploading require login; editing / hiding / deleting is limited to the post's author.
- Every post shows its author on the homepage and detail page.

## 📦 部署提示 / Deployment Note

目前只在本地运行。要让朋友真正访问,需要:部署到平台(如 Vercel),并把数据库换成持久化服务(如 Turso/libSQL,平台文件系统是临时的)、图片换成对象存储(如 S3/R2)。

Currently local-only. To let friends access it: deploy to a platform (e.g. Vercel), swap SQLite for a persistent database (e.g. Turso/libSQL), and move photos to object storage (e.g. S3/R2).

## 🤝 贡献 / Contributing

**中文**:这是一个个人项目,但非常欢迎任何想法和建议——无论是美食相关的功能点子,还是技术选型的建议,都可以通过 [Issue](../../issues) 提出。

**English**: This is a personal project, but ideas and suggestions are very welcome — feature ideas about food, or advice on tech choices. Feel free to open an [Issue](../../issues).

## 📄 许可证 / License

待定 / TBD
