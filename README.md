# n8n-nodes-wacrapp

An n8n community node for **[WAcr App](https://wa.cr)** — the WhatsApp CRM & messaging platform.

## Features

### Action Node: WAcr App

| Resource | Operations |
|----------|-----------|
| **Account** | Get Info, Get Usage, Get Plan Limits |
| **Comment** | Add, Get Many |
| **Contact** | Create, Get, Get Many, Update, Delete, Batch Create, Batch Delete |
| **Group** | Create, Get, Get Many, Update, Delete, Add Contacts, Remove Contacts |
| **Message** | Get, Get Many, Send Text, Send Template, Send Media, Send Interactive |
| **OTP / Authentication** | Send OTP, Verify OTP, Resend OTP, Check Status, List Auth Templates |
| **Source** | Create, Get, Get Many, Update, Delete |
| **Status** | Create, Get, Get Many, Update, Delete |
| **Template** | Get, Get Many, Sync |

### Trigger Node: WAcr App Trigger (Polling)

Starts a workflow when:
- **New Contact** is created
- **New Inbound Message** arrives
- **New Outbound Message** is sent
- **New Message (Any)** is recorded

## Credentials

Generate your API token from your WAcr App account settings at `https://app.wa.cr/settings/api`.

The token is sent as a Bearer token in the `Authorization` header.

## Installation

In your n8n instance:

1. Go to **Settings → Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-wacrapp`
4. Follow the prompts

Or via CLI:

```bash
npm install n8n-nodes-wacrapp
```

## Base URL

All API calls are made to `https://app.wa.cr/api/v2`.

## License

MIT
