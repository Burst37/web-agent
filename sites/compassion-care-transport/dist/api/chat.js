const {guard}=require('../server/assistant.cjs');const {systemPrompt}=require('../server/knowledge.json');
module.exports=async(req,res)=>{
 if(!guard(req,res))return;const key=process.env.GEMINI_API_KEY;
 if(!key)return res.status(503).json({error:'Conversation service is not connected. Please call 214-566-3869.'});
 let body=req.body;if(typeof body==='string'){try{body=JSON.parse(body)}catch{return res.status(400).json({error:'Invalid request.'})}}
 const text=String(body?.message||'').trim();if(!text||text.length>1200)return res.status(400).json({error:'Please ask a question under 1,200 characters.'});
 const history=Array.isArray(body.history)?body.history.slice(-10):[];
 const contents=history.filter(m=>['user','assistant'].includes(m.role)&&typeof m.text==='string').map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.text.slice(0,1400)}]}));contents.push({role:'user',parts:[{text}]});
 try{
  const model=process.env.CARE_CHAT_MODEL||'gemini-2.5-flash';
  const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:systemPrompt}]},contents,generationConfig:{temperature:.35,maxOutputTokens:300,thinkingConfig:{thinkingBudget:0}}}),signal:AbortSignal.timeout(18000)});
  if(!response.ok){console.error('Conversation provider status',response.status);return res.status(502).json({error:'I could not connect to the conversation service. Please try again or call 214-566-3869.'});}
  const data=await response.json(),answer=(data.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim();
  if(!answer)return res.status(502).json({error:'Please rephrase your question or call 214-566-3869.'});res.status(200).json({answer});
 }catch(e){console.error('Conversation request failed',e.name);res.status(504).json({error:'The reply took too long. Please try again or call 214-566-3869.'});}
};
