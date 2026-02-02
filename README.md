# lark-openclaw

[![npm version](https://img.shields.io/npm/v/lark-openclaw.svg)](https://www.npmjs.com/package/lark-openclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** | [中文](#中文文档)

---

Lark (International) channel plugin for OpenClaw / Clawdbot — **Webhook mode only**

> **Note:** This plugin is for **Lark** (international version). For Feishu (飞书, China version), see [openclaw-feishu](https://github.com/AlexAnys/openclaw-feishu).

## ⚠️ Important: Webhook Mode

Unlike Feishu which supports WebSocket long-connection, **Lark only supports HTTP Webhook** for receiving messages.

**Requirements:**
- A publicly accessible HTTP endpoint (e.g., via ngrok, Cloudflare Tunnel, or your own server)
- Configure your Webhook URL in Lark Open Platform

---

## Prerequisites

### 1. Create Lark Bot

1. Go to [Lark Open Platform](https://open.larksuite.com/app) → **Create App**
2. Add **Bot** capability
3. **Permissions** → Enable:
   - `im:message`
   - `im:message.group_at_msg`
   - `im:message.p2p_msg`
4. **Version Management** → Create version → Publish
5. Note your **App ID** and **App Secret**

### 2. Configure Webhook

1. **Events & Callbacks** → Add `im.message.receive_v1`
2. **Subscription Method** → Select **Webhook**
3. Enter your public Webhook URL (e.g., `https://your-domain.com/lark/webhook`)
4. Save and verify

---

## Installation

### OpenClaw

```bash
openclaw plugins install lark-openclaw
```

### Clawdbot

```bash
clawdbot plugins install lark-openclaw
```

---

## Configuration

```bash
# OpenClaw
openclaw config set channels.lark.enabled true --json
openclaw config set channels.lark.appId "your_app_id"
openclaw config set channels.lark.appSecret "your_app_secret"
openclaw gateway restart
```

### Optional Settings

```bash
# Encrypt Key (for event encryption)
openclaw config set channels.lark.encryptKey "your_encrypt_key"

# Verification Token
openclaw config set channels.lark.verificationToken "your_token"

# Custom webhook path (default: /lark/webhook)
openclaw config set channels.lark.webhookPath "/custom/path"
```

---

## Verify

```bash
openclaw status
```

Expected output:
```
│ Lark     │ ON      │ OK     │ configured                    │
```

---

## Features

- ✅ **Webhook mode** — HTTP endpoint for Lark events
- ✅ **Dual platform** — Works with both OpenClaw and Clawdbot
- ✅ **Direct + Group chat** — Full @mention support
- ✅ **Media support** — Image, video, audio, and file transfer
- ✅ **Multi-account** — Configure multiple Lark bots
- ✅ **Event deduplication** — Handles duplicate webhook calls
- ✅ **AES decryption** — Supports encrypted event payloads

---

## Links

- 📦 [npm: lark-openclaw](https://www.npmjs.com/package/lark-openclaw)
- 🔗 [GitHub: lark-openclaw](https://github.com/abca12a/lark-openclaw)
- 📖 [Lark Open Platform](https://open.larksuite.com)
- 📖 [OpenClaw Docs](https://docs.openclaw.ai)

---

## License

MIT

---

# 中文文档

**[English](#lark-openclaw)** | 中文

---

Lark（国际版飞书）渠道插件，适用于 OpenClaw / Clawdbot — **仅支持 Webhook 模式**

> **注意：** 本插件适用于 **Lark**（国际版）。如需飞书（中国版），请参阅 [openclaw-feishu](https://github.com/AlexAnys/openclaw-feishu)。

## ⚠️ 重要：Webhook 模式

与支持 WebSocket 长连接的飞书不同，**Lark 仅支持 HTTP Webhook** 接收消息。

**要求：**
- 一个可公开访问的 HTTP 端点（如通过 ngrok、Cloudflare Tunnel 或自有服务器）
- 在 Lark 开放平台配置 Webhook URL

---

## 前置准备

### 1. 创建 Lark 机器人

1. 访问 [Lark 开放平台](https://open.larksuite.com/app) → **创建应用**
2. 添加 **机器人** 能力
3. **权限管理** → 开启：
   - `im:message`
   - `im:message.group_at_msg`
   - `im:message.p2p_msg`
4. **版本管理** → 创建版本 → 发布
5. 记录 **App ID** 和 **App Secret**

### 2. 配置 Webhook

1. **事件与回调** → 添加 `im.message.receive_v1`
2. **订阅方式** → 选择 **Webhook**
3. 输入公开的 Webhook URL（如 `https://your-domain.com/lark/webhook`）
4. 保存并验证

---

## 安装

### OpenClaw

```bash
openclaw plugins install lark-openclaw
```

### Clawdbot

```bash
clawdbot plugins install lark-openclaw
```

---

## 配置

```bash
# OpenClaw
openclaw config set channels.lark.enabled true --json
openclaw config set channels.lark.appId "你的_app_id"
openclaw config set channels.lark.appSecret "你的_app_secret"
openclaw gateway restart
```

### 可选配置

```bash
# 加密密钥（用于事件加密）
openclaw config set channels.lark.encryptKey "你的加密密钥"

# 验证令牌
openclaw config set channels.lark.verificationToken "你的令牌"

# 自定义 webhook 路径（默认：/lark/webhook）
openclaw config set channels.lark.webhookPath "/custom/path"
```

---

## 验证

```bash
openclaw status
```

预期输出：
```
│ Lark     │ ON      │ OK     │ configured                    │
```

---

## 功能特性

- ✅ **Webhook 模式** — 用于 Lark 事件的 HTTP 端点
- ✅ **双平台支持** — 同时兼容 OpenClaw 和 Clawdbot
- ✅ **私聊 + 群聊** — 完整的 @提及 支持
- ✅ **媒体支持** — 图片、视频、音频和文件传输
- ✅ **多账户** — 可配置多个 Lark 机器人
- ✅ **事件去重** — 处理重复的 webhook 调用
- ✅ **AES 解密** — 支持加密的事件负载

---

## 相关链接

- 📦 [npm: lark-openclaw](https://www.npmjs.com/package/lark-openclaw)
- 🔗 [GitHub: lark-openclaw](https://github.com/abca12a/lark-openclaw)
- 📖 [Lark 开放平台](https://open.larksuite.com)
- 📖 [OpenClaw 文档](https://docs.openclaw.ai)

---

## 许可证

MIT
