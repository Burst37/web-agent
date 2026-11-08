(()=>{
 const toggle=document.querySelector('#voice-toggle'),stop=document.querySelector('#voice-stop'),status=document.querySelector('#voice-status'),panel=document.querySelector('#reception-panel'),form=document.querySelector('#service-help'),input=document.querySelector('#service-question'),answer=document.querySelector('#service-answer'),ask=form?.querySelector('button[type=submit]');
 if(!toggle||!form)return;const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 let history=[],active=false,busy=false,listening=false,recognizer=null,audio=null,audioUrl=null,request=null,speechRequest=null,epoch=0;
 const setStatus=t=>{status.textContent=t;};
 function stopAudio(){speechRequest?.abort();speechRequest=null;if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null;}if(audioUrl){URL.revokeObjectURL(audioUrl);audioUrl=null;}}
 function listen(){if(!active||busy||listening||!recognizer)return;try{recognizer.start();}catch{setStatus('Tap End, then Start to reconnect the microphone.');}}
 function end(){epoch++;active=false;busy=false;recognizer?.abort();listening=false;request?.abort();request=null;stopAudio();toggle.setAttribute('aria-pressed','false');toggle.textContent='Start voice conversation';ask.disabled=false;}
 async function say(text){
  stopAudio();const current=epoch;speechRequest=new AbortController();setStatus('Preparing your spoken reply…');
  try{
   const r=await fetch('/api/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text}),signal:speechRequest.signal});
   if(!r.ok){const e=await r.json();throw new Error(e.error||'Voice is unavailable.');}
   if(current!==epoch)return;audio=new Audio();audio.preload='auto';
   audio.onplaying=()=>setStatus('Speaking with Ebony. Tap Stop speaking to interrupt.');
   audio.onended=()=>{stopAudio();if(active)listen();else setStatus('Ready for your next question.');};
   audio.onerror=()=>{stopAudio();setStatus('Audio could not play. You can read the answer or try again.');};
   if(window.MediaSource&&MediaSource.isTypeSupported('audio/mpeg')&&r.body){
    const media=new MediaSource();audioUrl=URL.createObjectURL(media);audio.src=audioUrl;
    await new Promise((resolve,reject)=>{media.addEventListener('sourceopen',resolve,{once:true});media.addEventListener('error',reject,{once:true});});
    if(current!==epoch)return;const source=media.addSourceBuffer('audio/mpeg'),reader=r.body.getReader();let started=false;
    while(true){const {done,value}=await reader.read();if(current!==epoch){await reader.cancel();return;}if(done)break;await new Promise((resolve,reject)=>{source.addEventListener('updateend',resolve,{once:true});source.addEventListener('error',reject,{once:true});source.appendBuffer(value);});if(!started){started=true;audio.play().catch(()=>setStatus('Tap Start voice conversation to enable audio playback.'));}}
    if(media.readyState==='open')media.endOfStream();
   }else{const blob=await r.blob();if(current!==epoch)return;audioUrl=URL.createObjectURL(blob);audio.src=audioUrl;await audio.play();}
  }catch(e){if(e.name!=='AbortError'){setStatus(e.message||'Voice is unavailable. You can read the answer.');if(active)listen();}}
 }
 async function reply(text){
  if(!text||busy)return;busy=true;ask.disabled=true;recognizer?.abort();listening=false;stopAudio();request=new AbortController();const current=epoch;
  const user=document.querySelector('#assistant-user');user.textContent='You: '+text;user.hidden=false;answer.textContent='';document.querySelector('#service-answer-link').hidden=true;document.querySelector('#assistant-sources').hidden=true;setStatus('Thinking about your question…');
  try{
   const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history}),signal:request.signal});const data=await r.json();if(!r.ok)throw new Error(data.error||'The conversation service is unavailable.');if(current!==epoch)return;
   answer.textContent=data.answer;history.push({role:'user',text},{role:'assistant',text:data.answer});history=history.slice(-10);busy=false;ask.disabled=false;
   if(active)await say(data.answer);else setStatus('Reply ready. Start voice conversation to speak with Ebony.');
  }catch(e){if(e.name!=='AbortError'){answer.textContent=e.message;setStatus('Please try again, or call 214-566-3869.');}}
  finally{if(current===epoch){busy=false;ask.disabled=false;}}
 }
 if(Recognition){recognizer=new Recognition();recognizer.lang='en-US';recognizer.continuous=false;recognizer.interimResults=true;
  recognizer.onstart=()=>{listening=true;setStatus('Listening. Ask your transportation question.');};
  recognizer.onresult=e=>{const result=e.results[e.resultIndex];input.value=result[0].transcript;if(result.isFinal){listening=false;reply(result[0].transcript);}};
  recognizer.onend=()=>{listening=false;if(active&&!busy&&!audio)setTimeout(listen,250);};
  recognizer.onerror=e=>{listening=false;if(e.error==='aborted')return;if(e.error==='no-speech'){setStatus('I didn’t hear anything. You can speak or type.');return;}end();setStatus(e.error==='not-allowed'?'Microphone permission was denied. You can still type questions.':'Microphone unavailable. You can still type questions.');};
 }
 toggle.addEventListener('click',()=>{if(active){end();setStatus('Voice conversation stopped.');return;}if(!Recognition){setStatus('This browser does not support voice input. Please type your question, or use Chrome for microphone dialogue.');return;}active=true;toggle.setAttribute('aria-pressed','true');toggle.textContent='End voice conversation';if(answer.textContent&&!busy)say(answer.textContent);else listen();});
 stop.addEventListener('click',()=>{stopAudio();if(active)listen();else setStatus('Speech stopped.');});
 form.addEventListener('submit',e=>{e.preventDefault();reply(input.value.trim());});
 input.addEventListener('input',()=>{if(active&&audio){stopAudio();recognizer?.abort();listening=false;setStatus('Type your question, then tap Ask.');}});
 panel?.addEventListener('close',end);document.addEventListener('visibilitychange',()=>{if(document.hidden)end();});
})();
