# Screen Share (Free, GitHub Deploy Ready)

This repository now provides a **free, self-hosted screen sharing baseline** designed to support:
- Android sender (native scaffold)
- iPhone sender (native scaffold)
- Browser receiver (ready)

No paid service is required for local use, and the web UI can be deployed with GitHub Pages.

## What is implemented now
- Local signaling server: `server/index.js`
- Browser receiver: `web/receiver.html`
- Browser sender for validation/demo: `web/sender.html`
- Android sender scaffold notes: `apps/android/README.md`
- iOS sender scaffold notes: `apps/ios/README.md`

## Why this replaces the old approach
The previous repository only documented `scrcpy`/`sndcpy` setup and did not support iPhone screen sharing in the same architecture.

This redesign uses a shared, open, self-hosted WebRTC signaling model so Android and iOS can target the same receiver flow.

## Quick start (local signaling)

### 1) Install dependencies
```bash
npm install
```

### 2) Start server
```bash
npm start
```

Server starts on `http://0.0.0.0:8080` and WebSocket signaling on `ws://<host>:8080`.

### 3) Open receiver
On the viewer device (same Wi-Fi), open:
- `http://<your-computer-ip>:8080/receiver.html`

### 4) Open sender
For immediate validation, open sender in a browser:
- `http://<your-computer-ip>:8080/sender.html`
- Enter the same room ID on both pages
- Keep signaling URL as `ws://<your-computer-ip>:8080`
- Click **Connect** on both pages
- Click **Start screen share** on sender

## Deploy web UI with GitHub

This repository includes `.github/workflows/deploy-pages.yml` for GitHub Pages deployment of `/web`.

1. Push to `main` (or run the workflow manually).
2. In GitHub, enable **Settings → Pages → Build and deployment → GitHub Actions**.
3. Open your Pages URL (`https://<user>.github.io/<repo>/`).
4. On both sender and receiver pages, set **Signaling URL** to your signaling endpoint:
   - local network: `ws://<computer-ip>:8080`
   - public TLS endpoint: `wss://<your-domain>`

> Note: GitHub Pages hosts static files only. It does not host the Node.js signaling server.

## Android and iPhone implementation path
- Android native sender plan: `apps/android/README.md`
- iOS native sender plan: `apps/ios/README.md`

These are scaffolds for native implementation with MediaProjection (Android) and ReplayKit (iOS), both targeting the same free local signaling model.

## Current limitations
- Cross-network sessions may require TURN in stricter NAT networks.
- Browser sender support depends on browser-level screen capture capabilities.
- iPhone browser can reliably receive, but native ReplayKit sender is still scaffolded (see `apps/ios/README.md`).
- Native Android/iOS senders are scaffolded but not fully implemented yet.

## Validation checklist
- Browser sender → browser receiver on same room
- Reconnect by refreshing receiver
- Stop/start share from sender

## Architecture
See: `docs/ARCHITECTURE.md`
