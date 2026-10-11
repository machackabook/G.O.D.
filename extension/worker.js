// Guard both origin AND pathname: manifest origin patterns are broader than project path.
const ORIGINS = new Set(['https://machackabook.github.io']);
const ALLOWED_PATH = '/G.O.D./';
chrome.runtime.onMessageExternal.addListener((message,sender,sendResponse)=>{
  try {
    if (typeof sender.url !== 'string') return;
    const url=new URL(sender.url);
    if(!ORIGINS.has(url.origin)||!(url.pathname===ALLOWED_PATH.slice(0,-1)||url.pathname.startsWith(ALLOWED_PATH)))return;
    if(message?.protocol!=='god-v5'||!['PING','GET_PLATFORM'].includes(message.operation))return;
    if(message.operation==='PING'){
      sendResponse({ok:true,protocol:'god-v5',operation:'PING',version:chrome.runtime.getManifest().version});return;
    }
    chrome.runtime.getPlatformInfo(info=>{
      if(chrome.runtime.lastError){sendResponse({ok:false,error:'Platform info unavailable'});return;}
      sendResponse({ok:true,operation:'GET_PLATFORM',os:info.os,arch:info.arch});
    });
    return true;
  }catch(_){return;}
});
