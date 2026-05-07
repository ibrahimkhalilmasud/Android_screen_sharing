# Architecture (MVP)

## Components
- `server/`: local HTTP + WebSocket signaling server.
- `web/receiver.html`: browser viewer endpoint.
- `web/sender.html`: browser sender used for immediate testing and demos.
- `apps/android`: native Android sender scaffold.
- `apps/ios`: native iOS sender scaffold.

## Flow
1. Sender and receiver join the same room over WebSocket.
2. Signaling server relays SDP and ICE messages.
3. WebRTC peer connection carries media directly between peers.
4. Server is used for signaling only.

## Scope
- 100% free, self-hosted signaling workflow.
- Local network works out of the box.
- GitHub Pages is supported for static web deployment (`/web`).
- TURN relay is still out of scope for MVP.
