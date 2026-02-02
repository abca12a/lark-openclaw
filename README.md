# lark-openclaw

[![npm version](https://img.shields.io/npm/v/@openclaw/lark.svg)](https://www.npmjs.com/package/@openclaw/lark)

Lark (International) × AI Assistant plugin — **Webhook mode**

---

## ⚠️ Important: Webhook Mode

This plugin uses **HTTP Webhook** to receive messages from Lark.

**Requirements:**
- A publicly accessible HTTP endpoint
- Configure your Webhook URL in Lark Open Platform

---

## Prerequisites (5 minutes)

### 1. Create Lark Bot

1. [Lark Open Platform](https://open.larksuite.com/app) → **Create App**
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
4. Save

---

## 📦 Installation

### OpenClaw

```bash
openclaw plugins install @openclaw/lark
```

### Clawdbot

```bash
clawdbot plugins install @openclaw/lark
```

---

## 🔧 Configuration

```bash
# OpenClaw
openclaw config set channels.lark.enabled true --json
openclaw config set channels.lark.appId "your_app_id"
openclaw config set channels.lark.appSecret "your_app_secret"
openclaw gateway restart
```

### Optional: Encrypt Key

```bash
openclaw config set channels.lark.encryptKey "your_encrypt_key"
```

---

## ✅ Verify

```bash
openclaw status
```

You should see:
```
│ Lark     │ ON      │ OK     │ configured                    │
```

---

## Features

- ✅ **Webhook mode** — HTTP endpoint for Lark events
- ✅ **Dual environment** — OpenClaw and Clawdbot
- ✅ **Direct + Group chat** — @mention support
- ✅ **Image/file transfer**
- ✅ **Multi-account support**

---

## Links

- 📦 [npm: @openclaw/lark](https://www.npmjs.com/package/@openclaw/lark)
- 📖 [Lark Open Platform](https://open.larksuite.com)
- 📖 [OpenClaw Docs](https://docs.openclaw.ai)

---

## License

MIT
