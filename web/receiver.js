const statusEl = document.getElementById('status');
const logEl = document.getElementById('log');
const roomEl = document.getElementById('room');
const signalEl = document.getElementById('signal');
const connectBtn = document.getElementById('connect');
const videoEl = document.getElementById('video');

let ws;
let senderId;
let pc;
const rtcConfig = {
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
};

function isGitHubPagesHost(hostname) {
  return /(^|\.)github\.io$/i.test(hostname);
}

function setStatus(status) {
  statusEl.textContent = status;
}

function log(msg) {
  logEl.textContent += `${new Date().toLocaleTimeString()} ${msg}\n`;
}

function send(data) {
  ws.send(JSON.stringify(data));
}

function getDefaultSignalUrl() {
  const signalFromQuery = new URLSearchParams(location.search).get('signal');
  if (signalFromQuery) return signalFromQuery;

  const signalFromStorage = localStorage.getItem('signal_url');
  if (signalFromStorage) return signalFromStorage;

  if (isGitHubPagesHost(location.hostname)) return '';
  return `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`;
}

signalEl.value = getDefaultSignalUrl();

async function rebuildPeerConnection() {
  if (pc) {
    pc.close();
  }

  pc = new RTCPeerConnection(rtcConfig);

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
  const room = roomEl.value.trim();
  if (!room) return;
  const signalUrl = signalEl.value.trim();
  if (!signalUrl) {
    setStatus('missing_signal_url');
    log('Enter signaling URL, for example ws://<ip>:8080 or wss://<host>');
    return;
  }

  localStorage.setItem('signal_url', signalUrl);

  ws = new WebSocket(signalUrl);

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
      if (pc) {
        pc.close();
        pc = null;
      }
      setStatus('waiting_for_sender');
      log('Sender disconnected');
    }

    if (msg.type === 'signal') {
      senderId = msg.from;
      const payload = msg.payload;
      if (!pc) {
        await rebuildPeerConnection();
      }

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
