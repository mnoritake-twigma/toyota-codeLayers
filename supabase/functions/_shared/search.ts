export function distanceKm(a:{lat:number;lng:number},b:{lat:number;lng:number}) {
 const rad=(v:number)=>v*Math.PI/180;
 const h=Math.sin(rad(b.lat-a.lat)/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(rad(b.lng-a.lng)/2)**2;
 return Math.round(6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))*10)/10;
}
export function parseSearch(value:unknown):{modelCode:string;prefectureCode?:string;postalCode?:string} {
 if(!value||typeof value!=='object') throw new Error('検索条件をご確認ください。');
 const v=value as Record<string,unknown>;
 if(typeof v.modelCode!=='string'||!/^M(0[1-9]|10)$/.test(v.modelCode)) throw new Error('モデルをご選択ください。');
 const p=typeof v.postalCode==='string'?v.postalCode.replaceAll('-',''):undefined;
 if(Boolean(v.prefectureCode)===Boolean(p)) throw new Error('都道府県または郵便番号をご指定ください。');
 if(v.prefectureCode && (typeof v.prefectureCode!=='string'||!/^(0[1-9]|[1-3][0-9]|4[0-7])$/.test(v.prefectureCode))) throw new Error('都道府県をご確認ください。');
 if(p&&!/^\d{7}$/.test(p)) throw new Error('郵便番号は7桁でご入力ください。');
 return {modelCode:v.modelCode,...(p?{postalCode:p}:{prefectureCode:v.prefectureCode as string})};
}
