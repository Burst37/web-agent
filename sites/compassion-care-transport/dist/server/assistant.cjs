const buckets=new Map();
exports.guard=(req,res,limit=24)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).json({error:'Use POST.'});return false;}
 let allowed=false;try{allowed=new URL(req.headers.origin).host===req.headers.host;}catch{}
 if(!allowed){res.status(403).json({error:'Open the assistant from the website.'});return false;}
 const ip=String(req.headers['x-forwarded-for']||'unknown').split(',')[0],now=Date.now();let b=buckets.get(ip);
 if(!b||b.until<now)b={count:0,until:now+600000};b.count++;buckets.set(ip,b);
 if(buckets.size>10000)for(const[k,v]of buckets)if(v.until<now)buckets.delete(k);
 if(b.count>limit){res.status(429).json({error:'Please pause for a few minutes or call 214-566-3869.'});return false;}return true;
};
