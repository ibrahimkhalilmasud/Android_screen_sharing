# Android Sender (Scaffold)

This folder is a scaffold for a native Android sender app.

## Target approach
- Capture screen with `MediaProjection`.
- Encode and send video/audio with WebRTC.
- Connect to the local signaling server from `/server` over Wi-Fi.

## MVP tasks
1. Create Android app module.
2. Request projection permission and foreground service permission.
3. Start capture service and publish a WebRTC stream to a room.
4. Add reconnect logic when Wi-Fi changes.
5. Add bitrate and resolution controls.

## Notes
- Keep signaling message format compatible with the browser sender/receiver implementation in `/web`.
- Keep all traffic in local network mode by default.
