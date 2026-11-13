# 上游移植记录（UPSTREAM）

本项目（随手口袋工具）基于开源项目 [it-tools](https://github.com/CorentinTh/it-tools) 移植，整体以 GPL-3.0 发布。

- 上游仓库：https://github.com/CorentinTh/it-tools
- 上游许可证：GPL-3.0（Copyright Corentin Thomasset）
- 参考克隆 commit：`d505845f918e946ec300af7b36efc107e2f66e9e`（shallow clone，2026-11-12）
- 上游参考副本位置：`../it-tools-upstream`（不随本仓库分发）

## 逐工具移植对照

| 本仓库模块 | 上游路径（src/tools/ 下） | 移植内容 | 状态 |
|---|---|---|---|
| src/core/qr/matrix.ts | qr-code-generator/ | qrcode.create() 位矩阵纯计算入口 | 已移植，单测绿；canvas 渲染待 P3 |
| src/core/qr/wifi.ts | wifi-qr-code-generator/ | WIFI 字符串拼接与特殊字符转义 | 已移植，单测绿 |
| src/core/password/generator.ts | token-generator/token-generator.service.ts | 随机串生成逻辑 | 已移植，单测绿 |
| src/core/password/strength.ts | password-strength-analyser/ | 熵计算与破解时间估算 | 已移植，单测绿 |
| src/core/text/statistics.ts | text-statistics/ | 字数/字符/行数统计 | 已移植，单测绿 |
| src/core/math/percentage.ts | percentage-calculator/ | 百分比计算 | 已移植，单测绿 |
| src/core/math/temperature.ts | temperature-converter/ | 温度换算 | 已移植，单测绿 |
| src/core/datetime/ | date-time-converter/ | 格式识别正则 + 时间戳/日期互转 | 已移植，单测绿 |
| src/core/rmb/ | （原创，无上游） | 人民币大写转换 | 已实现，单测绿 |
| src/core/quota/ | （原创，无上游） | 增值功能每日额度纯逻辑 | 已实现，单测绿 |
| src/adapters/ | （原创，无上游） | random/clipboard/storage 平台适配 | 已实现，单测绿（mock 平台 API） |

## 修改清单（GPL §5 显著标注）

相对上游的全部修改：

1. **UI 全部重建**：上游 naive-ui / UnoCSS / vue-router / vue-i18n 不迁移，改为 uni-app 组件 + 手写 SCSS + pages.json 路由 + 中文单语言。
2. **平台 API 替换**：@vueuse 的 useClipboard/useStorage/useQRCode 等替换为 uni-app API（adapters/ 层集中封装）。
3. **随机源升级**：token-generator 上游使用 Math.random，本仓库升级为 wx.getRandomValues 加密安全随机（adapters/random.ts）。
4. **二维码渲染重写**：上游 useQRCode（依赖 DOM canvas）改为 qrcode.create() 位矩阵 + 小程序 canvas 2d 手动绘制 + 离屏导出。
5. **新增原创工具**：人民币大写转换（src/core/rmb/），同样 GPL-3.0。
6. **新增小程序特有能力**：每日增值额度（usePremiumQuota）、隐私弹窗、分享卡片、广告位（流量主达标后启用）。
7. 仅移植纯逻辑层（*.service.ts 等）与测试向量，未移植上游 e2e 测试与 Web 专属代码。
8. **字符集修复**：上游 token-generator 字母表遗漏 `N`/`n`，本仓库补全（见 generator.ts 与对应测试）。
9. **生成算法改为直接采样**：上游 shuffle 截取改为逐位独立采样（配合可注入 Rng，便于单测与安全随机源）。
10. **浮点修复**：密码强度破解时间用 `charsetLength ** passwordLength / guessesPerSecond` 直接计算，替代上游 `2 ** log2(...)` 的浮点不稳定写法。
11. **破解时长中文化**：上游英文时长格式化改为中文（瞬间/不到 1 秒/秒/分钟/小时/天/周/个月/年/十年/世纪/千年，最多两段）。
12. **字数统计去依赖**：字节数改为手写 UTF-8 码点计数（1-4 字节），词数正则支持中文逐字 + 英文连字符词。
13. **datetime 去 lodash**：`isNil` 改为 `== null`；新增 convert.ts 纯函数层（时间戳单位 s/ms、解析顺序 unix-s→unix-ms→excel→ISO 族→UTC→兜底，date-fns 格式化）。
14. **WiFi 码收紧**：PEAP 的 phase2 为 `'None'` 时视为缺失返回 null（上游仅判空值）；可选字段给默认值。

每个移植文件头部保留上游版权声明与本修改说明。

## 二期原创工具（无上游代码拷贝）

以下工具为原创实现（标准数学/计算机算法，未拷贝上游代码），同样以 GPL-3.0 发布，文件头标注 Original：

| 本仓库模块 | 功能 | 状态 |
|---|---|---|
| src/core/mortgage/ | 房贷等额本息/等额本金 + 逐月明细 | 已实现，单测绿 |
| src/core/units/ | 长度/重量/面积/速度/数据单位换算 | 已实现，单测绿 |
| src/core/color/ | HEX/RGB/HSL 互转 | 已实现，单测绿 |
| src/core/text/diff.ts | LCS 行级文本对比 | 已实现，单测绿 |
| src/core/text/base64.ts | 手工 UTF-8 Base64 编解码 | 已实现，单测绿 |

二期页面位于分包 `pages-tools-more`，复用一期三层架构与组件（tool-page/result-row/copy-button）。