# 📱 持仓雷达 PWA

个人持仓实时看板：腾讯财经直连行情、持仓 2 秒刷新、板块 5 分钟刷新，可装到手机桌面当 App 用。

## 部署

通过 **GitHub Actions 自动化部署到 GitHub Pages**：
- 当前仓库公开；请勿提交真实账号、token 或其他秘密信息
- 推 `main` → Actions 自动构建并部署
- 部署后的站点 URL：公开（GitHub Pages 限制，无法整站加密码）

> 如果想"只有自己打开"，见 README 末尾「私密化方案」。

## 文件说明

| 文件 | 作用 |
|---|---|
| `index.html` | PWA 主页面与交互编排 |
| `core.js` | 行情字段与关键位等可测试的纯逻辑 |
| `manifest.json` | PWA 清单（"添加到主屏幕"用） |
| `sw.js` | Service Worker（缓存策略：导航 network-first、静态 cache-first、行情不缓存） |
| `icon.png` | 应用图标 |
| `.github/workflows/deploy.yml` | 自动部署到 GitHub Pages |

## 数据与隐私

- 纯本地模式：持仓、成本、关键位和模型设置只保存在浏览器 `localStorage`。
- 登录并启用 CloudBase 云同步后：上述数据会发送到配置的 CloudBase 后端，用于多设备同步。
- 行情和搜索依赖腾讯财经、东方财富等第三方数据接口；不要在仓库或页面代码中保存密码、token、pepper 等秘密。

## 本地预览

```bash
# 任意静态服务器即可，比如：
python3 -m http.server 8080
# 打开 http://localhost:8080
```

运行核心逻辑测试：

```bash
node --test tests/core.test.js
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
