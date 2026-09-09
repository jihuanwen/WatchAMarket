# 📱 持仓雷达 PWA

个人持仓实时看板：腾讯财经直连行情、5 秒刷新、可装到手机桌面当 App 用。

## 部署

通过 **GitHub Actions 自动化部署到 GitHub Pages**：
- 私有仓库（代码不公开）
- 推 `main` → Actions 自动构建并部署
- 部署后的站点 URL：公开（GitHub Pages 限制，无法整站加密码）

> 如果想"只有自己打开"，见 README 末尾「私密化方案」。

## 文件说明

| 文件 | 作用 |
|---|---|
| `index.html` | PWA 主页面（持仓/板块/大盘强度，5 秒刷新） |
| `manifest.json` | PWA 清单（"添加到主屏幕"用） |
| `sw.js` | Service Worker（缓存策略：导航 network-first、静态 cache-first、行情不缓存） |
| `icon.png` | 应用图标 |
| `.github/workflows/deploy.yml` | 自动部署到 GitHub Pages |

## 本地预览

```bash
# 任意静态服务器即可，比如：
python3 -m http.server 8080
# 打开 http://localhost:8080
```

> ⚠️ Service Worker 必须在 HTTPS 下才能注册（localhost 例外）。所以手机访问请用 Pages 链接而不是 IP。

## 私有化方案（如需）

GitHub Pages 无法整站加密码门。三种更私密的替代：
1. **Vercel / Netlify** — 免费，支持整站 HTTP Basic Auth
2. **Cloudflare Pages + Access** — 免费，用邮箱 OTP 登录
3. **继续沙箱 + cron-job 定时 ping** — 防止沙箱休眠

## 改版后部署

```bash
git add -A
git commit -m "<说明>"
git push origin main
# 等 1-2 分钟，Actions 自动部署，刷新手机浏览器即可
```

## sw.js 缓存更新

每次改代码，**必须把 `sw.js` 里的 `CACHE` 版本号 +1**（比如 `board-v16` → `board-v17`），否则用户会被旧缓存卡住。
