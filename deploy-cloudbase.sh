#!/bin/sh
# 部署看板到 CloudBase 静态托管
#
# 为什么有这个脚本：
#   CloudBase 体验版套餐不允许添加自定义安全域名，所以 GitHub Pages 域名
#   (microji.github.io) 加不进白名单 → 在那个域名下云同步无法工作。
#   而 CloudBase 静态托管的自有域名 *.tcloudbaseapp.com 建环境时系统已自动
#   加入白名单，所以云同步必须用这个入口。
#
# 用法： sh deploy-cloudbase.sh
set -e

DIR=$(cd "$(dirname "$0")" && pwd)
ENV_ID=market-a-d7gejrs7t89064ea2
TCB=/Users/mj/.workbuddy/binaries/node/workspace/node_modules/.bin/tcb

if [ ! -x "$TCB" ]; then
  echo "未找到 tcb，请先安装："
  echo "  cd /Users/mj/.workbuddy/binaries/node/workspace && npm install @cloudbase/cli --registry=https://registry.npmmirror.com"
  exit 1
fi

TMP=$(mktemp -d)
cp "$DIR/index.html" "$DIR/sw.js" "$DIR/manifest.json" "$DIR/icon.png" "$TMP/"

# 部署前必须确认 sw.js 的 CACHE 版本号已 +1，否则用户端拿不到新版本
CACHE=$(grep -o "board-v[0-9]*" "$DIR/sw.js" | head -1)
echo "本次部署缓存版本：$CACHE"

$TCB hosting deploy "$TMP" -e "$ENV_ID" --yes
rm -rf "$TMP"
echo ""
echo "已部署： https://$ENV_ID-1484955629.tcloudbaseapp.com"
echo "提示：CDN 有数分钟缓存，验证时用无痕模式或 curl -H 'Cache-Control: no-cache'"
