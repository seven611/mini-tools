# 随手口袋工具

微信小程序：面向大众的高频生活小工具集，纯本地计算、无需登录、数据不出手机。

基于开源项目 [it-tools](https://github.com/CorentinTh/it-tools)（Copyright Corentin Thomasset，GPL-3.0）移植，UI 针对小程序重建。移植与修改记录见 [UPSTREAM.md](UPSTREAM.md)。

## 工具清单

二维码生成器 · WiFi 连接二维码 · 随机密码生成器 · 密码强度检测 · 字数统计 · 百分比计算器 · 温度换算 · 时间戳转换 · 人民币大写转换

## 技术栈

uni-app (Vue3 + TypeScript + Vite) · pinia · vitest · qrcode (MIT) · date-fns (MIT)

三层架构：`src/core` 纯逻辑（零平台依赖，node 可单测）→ `src/adapters` 平台适配（剪贴板/存储/随机/广告，条件编译）→ `src/pages*` 页面与组件。工具元数据集中在 `src/tools-registry.ts`。

## 开发

```bash
npm install
npm run dev:mp-weixin    # 微信开发者工具导入 dist/dev/mp-weixin
npm run dev:h5           # 浏览器冒烟调试
npm run test             # vitest 单测（core 纯逻辑层 + adapters mock）
npm run type-check       # vue-tsc
npm run build:mp-weixin  # 生产构建
```

## 许可证

GPL-3.0，见 [LICENSE](LICENSE)。第三方依赖声明见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

本小程序代码包随微信分发，完整对应源码以本仓库公开版本为准。