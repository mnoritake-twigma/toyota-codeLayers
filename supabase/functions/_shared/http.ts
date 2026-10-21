export const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
export const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
export function rest(path:string,init:RequestInit={}) {
 const key=Deno.env.get('SUPABASE_ANON_KEY');const url=Deno.env.get('SUPABASE_URL');
 if(!key||!url) throw new Error('Missing backend configuration');
 return fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...init.headers}});
}
