# LAN Screen Share (Free, Wi-Fi First)

This repository now provides a **free, self-hosted local-network screen sharing baseline** designed to support:
- Android sender (native scaffold)
- iPhone sender (native scaffold)
- Browser receiver (ready)

No paid service is required for the LAN workflow.

## What is implemented now
- Local signaling server: `server/index.js`
- Browser receiver: `web/receiver.html`
- Browser sender for validation/demo: `web/sender.html`
- Android sender scaffold notes: `apps/android/README.md`
- iOS sender scaffold notes: `apps/ios/README.md`

## Why this replaces the old approach
The previous repository only documented `scrcpy`/`sndcpy` setup and did not support iPhone screen sharing in the same architecture.

This redesign uses a shared, open, self-hosted WebRTC signaling model so Android and iOS can target the same receiver flow.

## Quick start (LAN)

### 1) Install dependencies
```bash
npm install
```

### 2) Start server
```bash
npm start
```

Server starts on `http://0.0.0.0:8080`.

### 3) Open receiver
On the viewer device (same Wi-Fi), open:
- `http://<your-computer-ip>:8080/receiver.html`

### 4) Open sender
For immediate validation, open sender in a browser:
- `http://<your-computer-ip>:8080/sender.html`
- Enter the same room ID on both pages
- Click **Connect** on both pages
- Click **Start screen share** on sender

## Android and iPhone implementation path
- Android native sender plan: `apps/android/README.md`
- iOS native sender plan: `apps/ios/README.md`

These are scaffolds for native implementation with MediaProjection (Android) and ReplayKit (iOS), both targeting the same free local signaling model.

## Current limitations
- LAN/same Wi-Fi only by default.
- Browser sender support depends on browser-level screen capture capabilities.
- Native Android/iOS senders are scaffolded but not fully implemented yet.

## Validation checklist
- Browser sender → browser receiver on same room
- Reconnect by refreshing receiver
- Stop/start share from sender

## Architecture
See: `docs/ARCHITECTURE.md`
