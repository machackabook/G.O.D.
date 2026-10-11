import { inspectCapabilities, CAPABILITY_NAMES, gatedAction, sendCompanion, VERSION } from './god-core.mjs';
const $=id=>document.getElementById(id);
const STORE='god.receipts.v5';
let queue=Promise.resolve();
const toHex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
async function receipt(action, outcome){
  if (!crypto?.subtle) return;
  queue=queue.then(async()=>{
    let log=[]; try { log=JSON.parse(localStorage.getItem(STORE)||'[]'); if (!Array.isArray(log)) log=[]; } catch(_){}
    if(log.length>=250) return; // no silent deletion/rebase of existing chain
    const prev=log.at(-1)?.hash||'GENESIS';
    const record={sequence:log.length+1,time:new Date().toISOString(),action,outcome,previous_hash:prev};
    const bytes=new TextEncoder().encode(JSON.stringify(record));
    record.hash=toHex(await crypto.subtle.digest('SHA-256',bytes));
    log.push(record);
    try { localStorage.setItem(STORE,JSON.stringify(log)); } catch(_){}
    $('ledger').textContent=log.slice(-8).map(r=>`${r.sequence} ${r.time} ${r.action} ${r.outcome} ${r.hash.slice(0,12)}`).join('\n');
  });
  return queue;
}
async function render(){
 const matrix=await inspectCapabilities(); const node=$('matrix');node.replaceChildren();
 for(const [k,v] of Object.entries(matrix)){
   const row=document.createElement('div'), name=document.createElement('span'), status=document.createElement('span');
   row.className='cap';name.textContent=CAPABILITY_NAMES[k]||k;
   status.textContent=v.status;status.className=v.supported?'supported':'unavailable';
   row.append(name,status);node.append(row);
 }
}
$('refresh').addEventListener('click',()=>render());
let wake=null;
async function verify(op){
 try {
   if(op==='REQUEST_WAKE_LOCK' && wake && !wake.released){await wake.release();wake=null;$('action-status').textContent='Wake lock released';await receipt(op,'RELEASED');return;}
   $('action-status').textContent='Awaiting browser result…';
   const r=await gatedAction(op);
   if (r.lock) {wake=r.lock; wake.addEventListener('release',()=>{$('action-status').textContent='Wake lock released by browser';});}
   $('action-status').textContent=`${r.ok?'VERIFIED_OPERATION':'FAILED'}: ${r.detail}`;
   await receipt(op,r.ok?'VERIFIED_OPERATION':'FAILED');
 }catch(e){$('action-status').textContent=`NOT VERIFIED: ${e.message}`;await receipt(op,'FAILED');}
}
for(const [btn,op] of [['audio','VERIFY_AUDIO_GRAPH'],['mic','VERIFY_MICROPHONE'],['screen','VERIFY_SCREEN_CAPTURE'],['wake','REQUEST_WAKE_LOCK']]){
 $(btn).addEventListener('click',()=>verify(op));
}
async function comp(op){
 try{const response=await sendCompanion($('extension-id').value.trim(),op);$('extension-status').textContent=JSON.stringify(response);await receipt(`COMPANION_${op}`,'VERIFIED_RESPONSE');}
 catch(e){$('extension-status').textContent=`NOT VERIFIED: ${e.message}`;await receipt(`COMPANION_${op}`,'FAILED');}
}
$('ping').addEventListener('click',()=>comp('PING'));
$('platform').addEventListener('click',()=>comp('GET_PLATFORM'));
$('export').addEventListener('click',()=>{
 const contents=localStorage.getItem(STORE)||'[]';const blob=new Blob([contents],{type:'application/json'});const u=URL.createObjectURL(blob);
 const link=document.createElement('a');link.href=u;link.download=`GOD_LOCAL_RECEIPTS_v${VERSION}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(u),5000);
});
try {$('ledger').textContent=JSON.parse(localStorage.getItem(STORE)||'[]').slice(-8).map(r=>`${r.sequence} ${r.time} ${r.action} ${r.outcome} ${(r.hash||'').slice(0,12)}`).join('\n')||'No receipts';}catch(_){$('ledger').textContent='Storage unavailable';}
render();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{});}
