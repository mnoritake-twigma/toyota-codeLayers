export function PreferredDateTimeField({id,label,value,onChange}:{id:string;label:string;value:string;onChange:(value:string)=>void}){
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 return <label className="field" htmlFor={id}><span>{label} <span className="text-danger text-xs">必須</span></span><input id={id} type="datetime-local" required min={`${today}T00:00`} value={value} onChange={e=>onChange(e.target.value)} aria-describedby={`${id}-help`}/><small id={`${id}-help`} className="block text-muted mt-2">日本時間でのご希望をお伺いします。日時は確定ではございません。</small></label>;
}
