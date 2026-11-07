(() => {
 const toggle=document.querySelector('#voice-toggle'),stop=document.querySelector('#voice-stop'),status=document.querySelector('#voice-status'),panel=document.querySelector('#reception-panel');
 if(!toggle)return;
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 let active=false,recognizer=null,listening=false;
 const synth=window.speechSynthesis;
 function setStatus(text){status.textContent=text;}
 function speak(text){
  if(!synth){setStatus('Speech playback is unavailable. You can type your question or call 214-566-3869.');return;}
  synth.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=.98;
  const voices=synth.getVoices();utterance.voice=voices.find(v=>/en-US/.test(v.lang)&&/Samantha|Aria|Jenny|Susan|Zira|female/i.test(v.name))||voices.find(v=>v.lang==='en-US')||null;
  utterance.onstart=()=>setStatus('Speaking. Tap Stop speaking to interrupt.');
  utterance.onend=()=>{if(active)listen();else setStatus('Ready for your next question.');};
  utterance.onerror=()=>{setStatus('Speech playback stopped. You can keep typing.');if(active)listen();};synth.speak(utterance);
 }
 function listen(){if(!active||listening||!recognizer)return;try{recognizer.start();}catch{setStatus('Tap the microphone again to continue.');}}
 function end(){active=false;listening=false;recognizer?.abort();synth?.cancel();toggle.setAttribute('aria-pressed','false');toggle.textContent='Start voice conversation';}
 if(Recognition){
  recognizer=new Recognition();recognizer.lang='en-US';recognizer.continuous=false;recognizer.interimResults=false;
  recognizer.onstart=()=>{listening=true;setStatus('Listening… Speak your transportation question.');};
  recognizer.onresult=e=>{listening=false;document.querySelector('#service-question').value=e.results[0][0].transcript;document.querySelector('#service-help').requestSubmit();};
  recognizer.onerror=e=>{end();setStatus(e.error==='not-allowed'?'Microphone permission was denied. Enable it in your browser settings or type your question.':'Microphone unavailable. Type your question or tap Start voice conversation to retry.');};
  recognizer.onend=()=>{listening=false;};
 }else{toggle.disabled=true;setStatus('Voice input is unavailable in this browser. Type a question to hear a spoken reply, or call 214-566-3869.');}
 toggle.addEventListener('click',()=>{if(active){end();setStatus('Voice conversation stopped.');return;}active=true;toggle.setAttribute('aria-pressed','true');toggle.textContent='End voice conversation';listen();});
 stop.addEventListener('click',()=>{synth?.cancel();if(active)listen();});
 document.querySelector('#service-help')?.addEventListener('submit',()=>{const text=document.querySelector('#service-answer').textContent;if(text)speak(text);});
 panel?.addEventListener('close',end);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)end();});
})();
