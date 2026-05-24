# 隐私政策 / Privacy Policy

**最后更新日期：2024年6月23日**

## 概述

官网导航器（Official Site Navigator）扩展程序**绝不收集、存储或传输任何用户数据到外部服务器**。所有功能均在你设备的本地浏览器中完成。

## 数据收集声明

**我们不收集任何数据。** 具体而言：

- ❌ **不收集**浏览历史
- ❌ **不收集**访问的网站 URL
- ❌ **不收集**个人身份信息
- ❌ **不收集**设备信息或指纹
- ❌ **不收集**IP 地址或地理位置
- ❌ **不包含**任何第三方分析或跟踪代码
- ❌ **不共享**任何数据给第三方（因为根本没有收集）

## 权限用途说明

该扩展申请以下浏览器权限，**全部仅用于实现本地功能**，不涉及数据传输：

| 权限 | 用途 |
|------|------|
| `tabs` | 读取当前标签页 URL，仅用于比对本地官网数据库 |
| `webNavigation` | 监听到访 URL，仅用于触发本地验证检查 |
| `storage` | 保存你的语言偏好（中文/英文）和你提交的假冒网站举报，**数据仅存在你本地浏览器中** |
| `scripting` | 在可疑网站上显示安全警告横幅 |
| `activeTab` | 在弹窗中显示当前网站状态 |
| `alarms` | 定期检查内置官网数据库更新 |

## URL 处理方式

- 所有 URL 匹配比对均在**扩展程序内部完成**
- 官网数据库**内置于扩展包中**，无需联网查询
- **没有任何 URL 被发送到外部服务器**

## 用户举报

你可以在扩展中手动举报假冒网站。举报记录**仅存储在你本地的浏览器中**（`chrome.storage.local`），不会上传到任何服务器。

## 开源代码

本扩展完全开源，你可以随时审查源代码确认上述声明：

[https://github.com/VON-wxj/official-site-navigator](https://github.com/VON-wxj/official-site-navigator)

## 联系我们

如有隐私相关问题，请在 GitHub 仓库提交 Issue。

---

# Privacy Policy

**Last Updated: June 23, 2024**

## Overview

The Official Site Navigator extension **does not collect, store, or transmit any user data to external servers**. All functionality runs entirely locally within your browser.

## Data Collection Statement

**We collect nothing.** Specifically:

- ❌ **No** browsing history collection
- ❌ **No** visited URL collection
- ❌ **No** personally identifiable information
- ❌ **No** device information or fingerprinting
- ❌ **No** IP addresses or geolocation
- ❌ **No** third-party analytics or tracking code
- ❌ **No** data sharing with any third party (since nothing is collected)

## Permission Justification

The extension requests the following browser permissions, **solely for local functionality**:

| Permission | Purpose |
|------------|---------|
| `tabs` | Read current tab URL to compare against local official-site database |
| `webNavigation` | Detect navigation events to trigger local verification |
| `storage` | Save your language preference and fake-site reports — **stored locally only** |
| `scripting` | Display security warning banners on suspicious sites |
| `activeTab` | Show current site status in the popup |
| `alarms` | Periodically check for built-in database updates |

## URL Handling

- All URL matching runs **entirely within the extension**
- The official-site database is **bundled inside the extension package** — no network lookup needed
- **No URL is ever sent to any external server**

## User Reports

You may manually report fake websites within the extension. Reports are stored **exclusively in your local browser storage** (`chrome.storage.local`) and are never uploaded.

## Open Source

This extension is fully open source. You can audit the source code at:

[https://github.com/VON-wxj/official-site-navigator](https://github.com/VON-wxj/official-site-navigator)

## Contact

For privacy-related questions, please file a GitHub Issue in the repository.
