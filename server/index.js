const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 8080);
const webDir = path.join(__dirname, '..', 'web');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url === '/' ? '/index.html' : req.url;
  reqPath = reqPath.split('?')[0];
  const filePath = path.normalize(path.join(webDir, reqPath));

  if (!filePath.startsWith(webDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.end(content);
  });
});

const wss = new WebSocketServer({ server });
const clients = new Map();
const rooms = new Map();

function removeFromRoom(clientId, roomName) {
  const room = rooms.get(roomName);
  if (!room) return;
  room.delete(clientId);
  if (room.size === 0) rooms.delete(roomName);
}

function broadcast(roomName, payload, skipClientId) {
  const room = rooms.get(roomName);
  if (!room) return;

  for (const clientId of room) {
    if (skipClientId && skipClientId === clientId) continue;
    const ws = clients.get(clientId)?.ws;
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }
}

wss.on('connection', (ws) => {
  const clientId = crypto.randomUUID();
  clients.set(clientId, { ws, room: null, role: null });
  ws.send(JSON.stringify({ type: 'welcome', clientId }));

  ws.on('message', (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    const state = clients.get(clientId);
    if (!state) return;

    if (message.type === 'join') {
      if (state.room) removeFromRoom(clientId, state.room);

      const roomName = String(message.room || '').trim();
      if (!roomName) return;

      state.room = roomName;
      state.role = message.role || 'unknown';

      if (!rooms.has(roomName)) rooms.set(roomName, new Set());
      rooms.get(roomName).add(clientId);

      const peers = Array.from(rooms.get(roomName))
        .filter((id) => id !== clientId)
        .map((id) => ({
          clientId: id,
          role: clients.get(id)?.role || 'unknown',
        }));

      ws.send(JSON.stringify({ type: 'peers', peers }));
      broadcast(roomName, { type: 'peer_joined', clientId, role: state.role }, clientId);
      return;
    }

    if (message.type === 'signal' && state.room && message.target) {
      const targetState = clients.get(message.target);
      if (!targetState || targetState.room !== state.room) return;

      const targetWs = targetState.ws;
      if (targetWs.readyState === targetWs.OPEN) {
        targetWs.send(
          JSON.stringify({
            type: 'signal',
            from: clientId,
            payload: message.payload,
          })
        );
      }
    }
  });

  ws.on('close', () => {
    const state = clients.get(clientId);
    if (!state) return;

    if (state.room) {
      removeFromRoom(clientId, state.room);
      broadcast(state.room, { type: 'peer_left', clientId }, clientId);
    }

    clients.delete(clientId);
  });
});

server.listen(port, host, () => {
  console.log(`LAN Screen Share server running on http://${host}:${port}`);
});
