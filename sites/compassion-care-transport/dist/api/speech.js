const{Readable}=require('node:stream');const{guard}=require('../server/assistant.cjs');
module.exports=async(req,res)=>{
 if(!guard(req,res,30))return;const key=process.env.ELEVENLABS_API_KEY;
 if(!key)return res.status(503).json({error:'Voice service is not connected. You can keep typing.'});
 let body=req.body;if(typeof body==='string'){try{body=JSON.parse(body)}catch{return res.status(400).json({error:'Invalid request.'})}}
 const text=String(body?.text||'').trim();if(!text||text.length>1800)return res.status(400).json({error:'Voice text is too long.'});
 try{
  const voice=process.env.ELEVENLABS_VOICE_ID||'vzb1D7zjti0h5u8StSra';
  const response=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'/stream?output_format=mp3_44100_128',{method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json'},body:JSON.stringify({text,model_id:'eleven_flash_v2_5',voice_settings:{stability:.45,similarity_boost:.8,speed:1.06}}),signal:AbortSignal.timeout(20000)});
  if(!response.ok){console.error('Voice provider status',response.status);return res.status(502).json({error:'Voice is temporarily unavailable. You can read the reply or keep typing.'});}
  res.setHeader('Content-Type','audio/mpeg');res.setHeader('X-Voice-Provider','ElevenLabs');Readable.fromWeb(response.body).pipe(res);
 }catch(e){console.error('Voice request failed',e.name);if(!res.headersSent)res.status(504).json({error:'Voice timed out. You can keep typing.'});else res.end();}
};
