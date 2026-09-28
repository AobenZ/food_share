# 🍜 food_share

> 分享我平时吃到的美食 · Sharing the food I've enjoyed

![Status](https://img.shields.io/badge/status-in_development-blue)

## 📌 项目状态 / Project Status

🚧 **开发中 (In development)** — 第一版已实现「发布 + 浏览」,可以本地运行;评分、搜索等功能还在路上。

The first version with "post + browse" is done and runnable locally; rating, search and more are on the way.

## 💭 一句话介绍 / One-liner

**中文**:一个记录和分享我平时吃到的美食的个人网站。

**English**: A personal website to record and share the food I've enjoyed.

## 🤔 为什么做这个项目 / Why

**中文**:平时吃到好吃的东西,随手发在社交媒体上,时间一长就找不到了。我想要一个属于自己的地方,把吃过的美食记录下来——照片、味道、价格、地点——既是留给自己的「美食回忆录」,也能分享给朋友,帮大家找到值得一试的店。

**English**: Good meals I post on social media get lost in the feed. I want a place of my own to record the food I've eaten — photos, taste, price, location — as a personal "food diary" I can also share with friends, to help everyone find places worth trying.

## ✨ 计划中的功能 / Planned Features

### MVP(最小可用版本 / Minimum Viable Product)

- ✅ 发布美食记录 / Post a food entry:照片、名称、餐厅、价格 (photos, name, restaurant, price)
- ✅ 浏览时间线 / Browse entries:按时间查看所有记录 (view all entries by time)
- ⏳ 评分 / Rating:星级打分 (star rating)

### 后续想法 / Later ideas

- 标签与分类 / Tags & categories:菜系、场景(夜宵、聚餐、一人食)
- 搜索与筛选 / Search & filter:按菜系、评分、价格查找
- 地图定位 / Map & location:标记吃过的店
- 随机推荐 / Random pick:不知道吃什么?帮我选一个
- 好友互动 / Social:评论、点赞(如果开放给朋友使用)

## 🗺️ 路线图 / Roadmap

- [x] **Phase 0 · 想法 / Idea**:写下这份 README
- [x] **Phase 1 · MVP**:能够发布和浏览美食记录
- [ ] **Phase 2 · 体验 / Experience**:标签、搜索、评分
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
npm install
npm run dev
```

打开 / Open:<http://localhost:3000>

数据说明 / Data:`data/app.db`(数据库)和 `public/uploads/`(照片)都在 `.gitignore` 中,不会提交到仓库。

The database file `data/app.db` and photos in `public/uploads/` are gitignored.

## 🤝 贡献 / Contributing

**中文**:这是一个个人项目,但非常欢迎任何想法和建议——无论是美食相关的功能点子,还是技术选型的建议,都可以通过 [Issue](../../issues) 提出。

**English**: This is a personal project, but ideas and suggestions are very welcome — feature ideas about food, or advice on tech choices. Feel free to open an [Issue](../../issues).

## 📄 许可证 / License

待定 / TBD
