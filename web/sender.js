const statusEl = document.getElementById('status');
const logEl = document.getElementById('log');
const roomEl = document.getElementById('room');
const connectBtn = document.getElementById('connect');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');

let ws;
let stream;
const pcs = new Map();

function setStatus(status) {
  statusEl.textContent = status;
}

function log(msg) {
  logEl.textContent += `${new Date().toLocaleTimeString()} ${msg}\n`;
}

function send(data) {
  ws.send(JSON.stringify(data));
}

async function setupPeer(receiverId) {
  if (!stream) return;
  if (pcs.has(receiverId)) return pcs.get(receiverId);

  const pc = new RTCPeerConnection();
  pcs.set(receiverId, pc);

  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      send({ type: 'signal', target: receiverId, payload: { type: 'candidate', candidate: event.candidate } });
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  send({ type: 'signal', target: receiverId, payload: { type: 'offer', sdp: offer } });
  log(`Offer sent to ${receiverId}`);
  return pc;
}

connectBtn.onclick = () => {
  const room = roomEl.value.trim();
  if (!room) return;

  ws = new WebSocket(`ws://${location.host}`);

  ws.onopen = () => {
    send({ type: 'join', room, role: 'sender' });
    startBtn.disabled = false;
    setStatus('connected');
    log('Connected to signaling server');
  };

  ws.onmessage = async (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'peers') {
      log(`Peers in room: ${msg.peers.length}`);
      if (stream) {
        for (const peer of msg.peers.filter((p) => p.role === 'receiver')) {
          await setupPeer(peer.clientId);
        }
      }
    }

    if (msg.type === 'peer_joined' && msg.role === 'receiver' && stream) {
      await setupPeer(msg.clientId);
    }

    if (msg.type === 'signal') {
      const from = msg.from;
      const payload = msg.payload;
      const pc = pcs.get(from);
      if (!pc) return;

      if (payload.type === 'answer') {
        await pc.setRemoteDescription(payload.sdp);
        log(`Answer received from ${from}`);
      }

      if (payload.type === 'candidate' && payload.candidate) {
        await pc.addIceCandidate(payload.candidate);
      }
    }

    if (msg.type === 'peer_left') {
      pcs.get(msg.clientId)?.close();
      pcs.delete(msg.clientId);
      log(`Peer left: ${msg.clientId}`);
    }
  };

  ws.onclose = () => {
    setStatus('disconnected');
    startBtn.disabled = true;
    stopBtn.disabled = true;
  };
};

startBtn.onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    setStatus('sharing');
    stopBtn.disabled = false;

    stream.getTracks().forEach((track) => {
      track.addEventListener('ended', () => {
        stopBtn.click();
      });
    });

    const receivers = Array.from(pcs.keys());
    for (const receiverId of receivers) {
      pcs.get(receiverId)?.close();
      pcs.delete(receiverId);
    }

    log('Screen capture started');
  } catch (error) {
    log(`Share failed: ${error.message}`);
    setStatus('share_failed');
  }
};

stopBtn.onclick = () => {
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
  for (const pc of pcs.values()) pc.close();
  pcs.clear();
  stopBtn.disabled = true;
  setStatus('connected');
  log('Screen share stopped');
};
