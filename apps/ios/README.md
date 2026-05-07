# iOS Sender (Scaffold)

This folder is a scaffold for a native iOS sender app.

## Target approach
- Capture screen using `ReplayKit` Broadcast Upload Extension.
- Encode and send stream with WebRTC.
- Connect to local signaling server over Wi-Fi.

## MVP tasks
1. Create iOS app + Broadcast Upload Extension target.
2. Implement room join and signaling client.
3. Pipe ReplayKit sample buffers into WebRTC video/audio tracks.
4. Add reconnect behavior when app/extension state changes.
5. Expose simple room entry UI.

## Notes
- iOS requires native code for reliable full-screen broadcast.
- Keep all transport/signaling free and self-hosted.
