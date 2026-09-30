# 守望先锋竞技学宝典

由 **守望先锋竞技学教父** 编写的 Overwatch 2 数字战术教科书。独立品牌、独立源代码仓库、长期稳定的课程 URL，正文和模板分离。

GitHub Pages：https://tsuk2mi.github.io/overwatch-competitive-studies/

独立源仓库：https://github.com/Tsuk2mi/overwatch-competitive-studies

备用网站：https://overwatch-competitive-studies.qp2hw2rxsw.chatgpt.site

## 技术栈

Astro 7 静态生成、原生 Markdown Content Collections、Zod schema、原生 CSS、小型阅读交互脚本、官方 sitemap 集成。正文不依赖 JavaScript；目录折叠、导航、表格在禁用 JavaScript 时仍可阅读。

## 本地运行

Node.js 22.12+（本次使用 Node 24）。

```sh
npm ci
npm run dev
npm run audit:content
npm run build
npm run preview
```

## 文件结构

```text
content/lessons/          正式课程 Markdown 与发布状态
src/content.config.ts    统一 schema 与发布约束
src/pages/               首页、目录、课程模板、关于与 404
src/layouts/Base.astro   品牌、SEO、OG、结构化数据
src/styles/global.css    视觉系统与响应式阅读布局
public/                  字体、favicon、OG 图片、robots
scripts/                 内容检查与网站验证
docs/                    内容清单、编辑规范、验证记录
.openai/hosting.json     当前静态托管配置
```

## 新增课程

在 `content/lessons/` 新建一个 Markdown 文件，复制已有 frontmatter，使用不再变化的 `slug`。不需要新增页面组件。目录、目录锚点、上下篇、独立 URL、SEO 与文章结构化数据由模板生成。

```yaml
---
title: 课程标题
lesson: 7
slug: 07-stable-english-name
status: coming-soon
contentState: draft
description: ''
englishTitle: ENGLISH LABEL
updatedAt: '2026-10-01'
readingTime: 0
concepts: []
source: 正文来源与确认记录
---
```

上例只是 schema 示例，并不表示第七课已确定。待发布文件正文保持空白，工作稿保留在私有资料中。确认后设置 `published` / `approved`，录入正式正文，从 `##` 写章节；阅读时间估计为中文约 300 字/分钟，核心概念只列正文已有术语。

可选 `shortTitle` 用于首页封面小目录。编号范围及所有目录由课程数据自动更新。现有课程有独立 OG 图片；新增课程如没有 `public/og/<slug>.png`，模板会使用品牌分享图片，避免产生失效资源。

第一至三课迁移自用户提供的正式 PDF 提取文字；未声称持有 PDF 附件。第五课保持待发布。详见 `docs/content-inventory.md`。

## 质量检查

```sh
npm run audit:content
npm run build
# 在终端另行启动 npm run preview 后：
npx playwright install chromium --only-shell
node scripts/verify-site.mjs
```

验证包含全部页面、内部链接和章节锚点、元数据、移动端溢出、目录高亮与跳转、工作稿误发布、无障碍检查。测试证据不进入网站。

浏览器检查也可用 `CHROME_PATH` 指定已安装的 Chromium 可执行文件。默认安装的 Playwright 浏览器无需这个变量。

## 部署

当前使用独立 Sites Git 仓库与静态托管。先提交并推送精确源码状态，再构建，将 `dist/` 与 `.openai/hosting.json` 打成静态发布包，保存版本并发布。默认网址写在 `astro.config.mjs`；`robots.txt`、sitemap、分享图片及链接随构建配置自动生成。

也可部署到 Cloudflare Pages 或 Vercel：构建命令 `npm run build`，输出目录 `dist`。部署到根域名无需 adapter。GitHub Pages 使用 `.github/workflows/deploy.yml`：推送到 `main` 后自动构建、发布。仓库 Settings → Pages 的 Source 选择 GitHub Actions。工作流从官方 configure-pages 输出取得域名和项目路径，无需手动修改正文或链接。

本地验证 GitHub Pages 构建：

```sh
SITE_URL=https://tsuk2mi.github.io BASE_PATH=/overwatch-competitive-studies npm run build
```

默认 `npm run build` 仍生成备用 Sites 根路径版本。

## 内容权利

课程正文署名守望先锋竞技学教父；参考作者的署名及来源保留。课程内容未授予默认开源转载许可。字体使用 SIL Open Font License，授权说明见 `public/fonts/OFL.txt`。
