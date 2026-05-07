const statusEl = document.getElementById('status');
const logEl = document.getElementById('log');
const roomEl = document.getElementById('room');
const connectBtn = document.getElementById('connect');
const videoEl = document.getElementById('video');

let ws;
let senderId;
let pc;

function setStatus(status) {
  statusEl.textContent = status;
}

function log(msg) {
  logEl.textContent += `${new Date().toLocaleTimeString()} ${msg}\n`;
}

function send(data) {
  ws.send(JSON.stringify(data));
}

async function rebuildPeerConnection() {
  if (pc) {
    pc.close();
  }

  pc = new RTCPeerConnection();

  pc.ontrack = (event) => {
    videoEl.srcObject = event.streams[0];
    setStatus('receiving');
    log('Receiving stream');
  };

  pc.onicecandidate = (event) => {
    if (event.candidate && senderId) {
      send({ type: 'signal', target: senderId, payload: { type: 'candidate', candidate: event.candidate } });
    }
  };
}

connectBtn.onclick = async () => {
  await rebuildPeerConnection();
  const room = roomEl.value.trim();
  if (!room) return;

  ws = new WebSocket(`ws://${location.host}`);

  ws.onopen = () => {
    send({ type: 'join', room, role: 'receiver' });
    setStatus('connected');
    log('Connected to signaling server');
  };

  ws.onmessage = async (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'peers') {
      const sender = msg.peers.find((p) => p.role === 'sender');
      senderId = sender?.clientId;
      log(senderId ? `Sender online: ${senderId}` : 'Waiting for sender');
    }

    if (msg.type === 'peer_joined' && msg.role === 'sender') {
      senderId = msg.clientId;
      log(`Sender joined: ${senderId}`);
    }

    if (msg.type === 'peer_left' && msg.clientId === senderId) {
      senderId = null;
      await rebuildPeerConnection();
      setStatus('waiting_for_sender');
      log('Sender disconnected');
    }

    if (msg.type === 'signal') {
      senderId = msg.from;
      const payload = msg.payload;

      if (payload.type === 'offer') {
        await pc.setRemoteDescription(payload.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        send({ type: 'signal', target: senderId, payload: { type: 'answer', sdp: answer } });
        log('Offer received, answer sent');
      }

      if (payload.type === 'candidate' && payload.candidate) {
        await pc.addIceCandidate(payload.candidate);
      }
    }
  };

  ws.onclose = () => {
    setStatus('disconnected');
  };
};
