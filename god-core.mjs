// Public browser adapter. No hidden permissions, no extension installation, no chrome:// control.
export const VERSION = '5.0.1';
export const CAPABILITY_NAMES = Object.freeze({
  secureContext: 'Secure context', webgl2: 'WebGL 2', webgpu: 'WebGPU interface',
  webaudio: 'Web Audio', microphone: 'Microphone API', screenCapture: 'Screen capture API',
  webrtc: 'WebRTC', indexedDB: 'IndexedDB', serviceWorker: 'Service worker',
  clipboard: 'Clipboard API', webusb: 'WebUSB', webserial: 'Web Serial', webbluetooth: 'Web Bluetooth',
  webnfc: 'Web NFC', filesystem: 'File picker API', wakeLock: 'Wake Lock API',
  webShare: 'Web Share', deviceMotion: 'Device motion interface', extensionBridge: 'Chrome external messaging'
});
const yes = v => Boolean(v);
export async function inspectCapabilities() {
  const n = typeof navigator === 'undefined' ? {} : navigator;
  const w = typeof window === 'undefined' ? {} : window;
  const d = typeof document === 'undefined' ? null : document;
  let webgl2 = false;
  try { webgl2 = yes(d?.createElement('canvas').getContext('webgl2')); } catch (_) {}
  const results = {
    secureContext: yes(w.isSecureContext), webgl2,
    webgpu: yes(n.gpu), webaudio: yes(w.AudioContext || w.webkitAudioContext),
    microphone: yes(n.mediaDevices?.getUserMedia), screenCapture: yes(n.mediaDevices?.getDisplayMedia),
    webrtc: yes(w.RTCPeerConnection), indexedDB: yes(w.indexedDB),
    serviceWorker: yes(n.serviceWorker), clipboard: yes(n.clipboard),
    webusb: yes(n.usb), webserial: yes(n.serial), webbluetooth: yes(n.bluetooth),
    webnfc: yes(w.NDEFReader), filesystem: yes(w.showOpenFilePicker),
    wakeLock: yes(n.wakeLock?.request), webShare: yes(n.share),
    deviceMotion: yes(w.DeviceMotionEvent),
    extensionBridge: yes(w.chrome?.runtime?.sendMessage)
  };
  return Object.fromEntries(Object.entries(results).map(([k, supported]) => [k, { supported, status: supported ? 'SUPPORTED_NOT_VERIFIED' : 'UNAVAILABLE' }]));
}
const allow = new Set(['VERIFY_AUDIO_GRAPH','VERIFY_MICROPHONE','VERIFY_SCREEN_CAPTURE','REQUEST_WAKE_LOCK']);
export async function gatedAction(name) {
  if (!allow.has(name)) throw new Error('G.O.D. gate rejected unsupported operation');
  if (name === 'VERIFY_AUDIO_GRAPH') {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) throw new Error('Web Audio unavailable');
    const ctx = new Audio();
    try {
      await ctx.resume();
      if (ctx.state !== 'running') throw new Error('AudioContext did not start');
      const oscillator = ctx.createOscillator(), gain = ctx.createGain();
      oscillator.type='sine'; oscillator.frequency.value=440; gain.gain.value=0.02;
      oscillator.connect(gain).connect(ctx.destination); oscillator.start();
      oscillator.stop(ctx.currentTime+0.12);
      await new Promise((resolve,reject)=>{oscillator.addEventListener('ended',resolve,{once:true}); setTimeout(()=>reject(new Error('Audio test timed out')),2500);});
      return { ok:true, detail:'Audio graph ran; audible speaker playback not verified' };
    } finally { await ctx.close(); }
  }
  if (name === 'VERIFY_MICROPHONE') {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone API unavailable');
    const s = await navigator.mediaDevices.getUserMedia({audio:true});
    try { return {ok:s.getAudioTracks().some(t=>t.readyState==='live'),detail:'Microphone stream opened and tracks released'}; }
    finally { s.getTracks().forEach(t=>t.stop()); }
  }
  if (name === 'VERIFY_SCREEN_CAPTURE') {
    if (!navigator.mediaDevices?.getDisplayMedia) throw new Error('Screen capture API unavailable');
    const s = await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
    try { return {ok:s.getVideoTracks().some(t=>t.readyState==='live'), detail:'User-selected screen track opened and stopped; no frames recorded'}; }
    finally { s.getTracks().forEach(t=>t.stop()); }
  }
  if (!navigator.wakeLock?.request) throw new Error('Wake Lock API unavailable');
  const lock = await navigator.wakeLock.request('screen');
  return {ok:!lock.released,detail:'Screen wake lock granted; browser may release it anytime',lock};
}
export function sendCompanion(extensionId, operation) {
  if (!/^[a-p]{32}$/.test(extensionId)) return Promise.reject(new Error('Invalid installed Chrome extension ID'));
  if (!['PING','GET_PLATFORM'].includes(operation)) return Promise.reject(new Error('Disallowed operation'));
  if (!globalThis.chrome?.runtime?.sendMessage) return Promise.reject(new Error('Chrome external extension messaging unavailable'));
  return new Promise((resolve,reject)=>{
    try { chrome.runtime.sendMessage(extensionId,{protocol:'god-v5',operation},response=>{
      const error=chrome.runtime.lastError;
      if (error) reject(new Error(error.message)); else if (!response?.ok) reject(new Error(response?.error||'Extension rejected request')); else resolve(response);
    }); } catch(e){reject(e);}
  });
}
