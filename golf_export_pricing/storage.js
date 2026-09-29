(function(root){
'use strict';
const P=root.Pricing||(typeof require==='function'?require('./engine.js'):null),L=root.LegacyPricing;
const FORMAT='golf-export-lab',VERSION=3,MAX_HISTORY=500,MAX_BOXES=100,MAX_BYTES=3*1024*1024;
const enums={model:['detail','consultant'],plan:['starter','basic'],box:['A','B','custom'],processingBase:['duty','value'],customsMode:['price','total','manual'],targetMode:['amount','margin'],category:['','shaft','grip','sleeve','head','club'],billing:['year','month'],pricingSource:['wholesale','rakuten','yahoo'],marketUsage:['reference','purchase'],referenceTaxMode:['gross','net'],referenceExtras:['include','ignore']};
const percentages=new Set(['tax','fxFee','fvf','upper','intl','ad','vat','buffer','returnRate','referenceTax']);
const boxKeys=['id','name','carrier','rateKey','rateDate','rateSource','length','width','height','weight','divisor','freight','fuel','surcharge','pack'];
const fail=m=>{throw new Error(m)},obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function validateInputs(raw){if(!obj(raw))fail('入力データの形式が正しくありません。');const out={};
 for(const k of Object.keys(raw))if(!Object.hasOwn(P.defaults,k))fail('未対応の項目があります：'+k);
 for(const [k,def] of Object.entries(P.defaults)){const v=raw[k];if(P.numericKeys.includes(k)){
  if(v!==null&&(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1e9))fail(k+' の数値を確認してください。');
  if(v!==null&&percentages.has(k)&&v>100)fail(k+' は 100 以下にしてください。');
  if(v!==null&&['quantity','monthlyOrders'].includes(k)&&(!Number.isInteger(v)||v<1))fail(k+' は 1 以上の整数にしてください。');
  if(v!==null&&((k==='fx'&&v<.01)||(k==='divisor'&&v<1)))fail(k+' が小さすぎます。');
 }else if(typeof v!=='string'||v.length>300)fail(k+' の文字列を確認してください。');
 if(enums[k]&&!enums[k].includes(v))fail(k+' の選択値が不正です。');out[k]=v;}
 for(const k of ['fvf','threshold','upper','intl','vat','tax','orderLow','orderHigh','orderThreshold','referenceTax'])if(out[k]===null)fail(k+' を入力してください。');
 return out;
}
function validateSettings(raw){if(!obj(raw))fail('設定の形式が正しくありません。');for(const k of Object.keys(raw))if(!Object.hasOwn(P.common,k))fail('未対応の設定項目：'+k);const full=validateInputs({...P.defaults,...raw});return Object.fromEntries(Object.keys(P.common).map(k=>[k,full[k]]))}
function validateBox(raw){if(!obj(raw))fail('配送設定を読み取れません。');for(const k of Object.keys(raw))if(!boxKeys.includes(k))fail('未対応の配送項目です。');const out={};
 for(const k of boxKeys){const v=raw[k];if(k==='carrier'){if(!['','speedpak-fedex','speedpak-dhl','other'].includes(v))fail('配送サービスが不正です。');}else if(['rateKey','rateDate','rateSource'].includes(k)){if(typeof v!=='string'||v.length>1000)fail('配送元の情報が不正です。');}else if(['id','name'].includes(k)){if(typeof v!=='string'||!v.trim()||v.length>120)fail('配送設定の名前を入力してください。');}
 else if(v!==null&&(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1e9))fail('配送設定の数値を確認してください。');
 if(['length','width','height','divisor'].includes(k)&&(v===null||v<=0))fail('箱の長さ・幅・高さ・容積重量の除数を入力してください。');if(k==='divisor'&&v<1)fail('容積重量の除数は 1 以上にしてください。');out[k]=v;}return out;
}
function snapshot(raw){if(!obj(raw)||typeof raw.id!=='string'||!raw.id||raw.id.length>120||typeof raw.at!=='string'||!Number.isFinite(Date.parse(raw.at)))fail('履歴の形式が不正です。');if(!['1.1','2.0'].includes(raw.engineVersion))fail('未対応の計算履歴です。');if(typeof raw.checked!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(raw.checked))fail('履歴の日付が不正です。');
 const inputs=validateInputs(raw.engineVersion==='1.1'?{...P.defaults,...raw.inputs}:raw.inputs);
 if(P.issues(inputs,'forward').length)fail('履歴の計算条件が不足しています。');const result=raw.engineVersion==='1.1'?L.calc(inputs):P.calc(inputs);
 if(Object.values(result).some(v=>v!==null&&!Number.isFinite(v)))fail('履歴の計算結果が不正です。');return {id:raw.id,at:raw.at,engineVersion:raw.engineVersion,checked:raw.checked,inputs,result};
}
function migrateV2(d){if(!obj(d.current)||!Array.isArray(d.history))fail('旧版ファイルを読み取れません。');const current={...P.defaults,...d.current},old=d.savedDefaults||d.current,settings=Object.fromEntries(Object.keys(P.common).map(k=>[k,old[k]??P.common[k]]));return {...d,schemaVersion:3,current,settings,boxes:[],history:d.history.map(h=>({...h,inputs:{...P.defaults,...h.inputs}}))}}
function validateDocument(raw){if(!obj(raw)||raw.format!==FORMAT)fail('このツールから書き出した JSON を選んでください。');let d=raw;if(d.schemaVersion===2)d=migrateV2(d);if(d.schemaVersion!==VERSION)fail('このファイルのバージョンは未対応です。');if(!['settings','backup'].includes(d.kind))fail('ファイルの種類が不正です。');if(typeof d.exportedAt!=='string'||!Number.isFinite(Date.parse(d.exportedAt)))fail('書き出し日が不正です。');
 const current=validateInputs(d.current),settings=validateSettings(d.settings),updates=root.RateUpdates.validate(d.updates||root.RateUpdates.defaults);
 if(!Array.isArray(d.boxes)||d.boxes.length>MAX_BOXES)fail('箱・配送設定は 100 件までです。');const boxes=d.boxes.map(validateBox);if(new Set(boxes.map(x=>x.id)).size!==boxes.length)fail('箱の ID が重複しています。');
 if(!Array.isArray(d.history)||d.history.length>MAX_HISTORY)fail('履歴は 500 件までです。');if(d.kind==='settings'&&d.history.length)fail('設定ファイルに履歴が混在しています。');const history=d.history.map(snapshot);if(new Set(history.map(x=>x.id)).size!==history.length)fail('履歴の ID が重複しています。');
 return {format:FORMAT,schemaVersion:VERSION,kind:d.kind,exportedAt:d.exportedAt,current,settings,boxes,history,updates};
}
function parse(text){if(new TextEncoder().encode(text).length>MAX_BYTES)fail('ファイルは 3 MB 以下にしてください。');let d;try{d=JSON.parse(text)}catch{fail('JSON を読み取れません。')}return validateDocument(d)}
function documentData(current,settings,boxes,history,kind='backup',updates=root.RateUpdates.defaults){return validateDocument({format:FORMAT,schemaVersion:VERSION,kind,exportedAt:new Date().toISOString(),current,settings,boxes,updates,history:kind==='settings'?[]:history})}
function mergeHistory(existing,incoming){const map=new Map(existing.map(x=>[x.id,snapshot(x)]));for(const x of incoming){const h=snapshot(x);if(map.has(h.id)&&JSON.stringify(map.get(h.id))!==JSON.stringify(h))fail('同じ ID の異なる履歴があります。');map.set(h.id,h)}if(map.size>MAX_HISTORY)fail('統合後の履歴が 500 件を超えます。');return [...map.values()].sort((a,b)=>Date.parse(b.at)-Date.parse(a.at))}
function mergeBoxes(existing,incoming){const ids=new Set(existing.map(x=>x.id));return [...existing,...incoming.filter(x=>!ids.has(x.id))]}
const api={FORMAT,VERSION,MAX_HISTORY,MAX_BOXES,MAX_BYTES,validateInputs,validateSettings,validateBox,validateDocument,parse,documentData,mergeHistory,mergeBoxes};root.PricingData=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
