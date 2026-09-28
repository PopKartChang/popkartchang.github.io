(function(root){
'use strict';
const FORMAT='golf-export-lab',VERSION=2,MAX_HISTORY=500,MAX_BYTES=2*1024*1024;
const enums={model:['detail','consultant'],plan:['starter','basic'],box:['A','B','custom'],processingBase:['duty','value'],customsMode:['price','manual'],targetMode:['amount','margin'],category:['shaft','grip','sleeve','head','club'],billing:['year','month']};
const percent=new Set(['tax','fxFee','fvf','upper','intl','ad','vat','buffer','returnRate']);
function fail(message){throw new Error(message)}
function object(x){return x!==null&&typeof x==='object'&&!Array.isArray(x)}
function validateInputs(value){
 if(!object(value))fail('設定の形式が正しくありません。');
 const defs=root.Pricing.defaults,out={};
 for(const k of Object.keys(value))if(!Object.hasOwn(defs,k))fail('未対応の設定項目があります：'+k);
 for(const [k,def] of Object.entries(defs)){
  const v=value[k];
  if(typeof def==='number'){
   if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1e9)fail(k+'：数値の範囲が正しくありません。');
   if(percent.has(k)&&v>100)fail(k+'：0～100 の範囲で指定してください。');
   if(['quantity','monthlyOrders'].includes(k)&&(!Number.isInteger(v)||v<1))fail(k+'：1 以上の整数を指定してください。');
   if((k==='fx'&&v<.01)||(k==='divisor'&&v<1))fail(k+'：最小値を下回っています。');
  }else if(typeof v!=='string'||v.length>300)fail(k+'：文字列の形式が正しくありません。');
  if(enums[k]&&!enums[k].includes(v))fail(k+'：選択値が正しくありません。');
  out[k]=v;
 }
 const result=root.Pricing.calc(out);if(Object.values(result).some(v=>!Number.isFinite(v)))fail('計算可能な範囲を超えています。');
 return out;
}
function validSnapshot(v){
 if(!object(v)||typeof v.id!=='string'||v.id.length>100||!v.id||typeof v.at!=='string'||!Number.isFinite(Date.parse(v.at)))fail('履歴の形式が正しくありません。');
 if(v.engineVersion!=='1.1')fail('未対応の計算エンジンの履歴です。');
 if(typeof v.checked!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v.checked))fail('履歴の確認日が正しくありません。');
 const inputs=validateInputs(v.inputs);return {id:v.id,at:v.at,engineVersion:v.engineVersion,checked:v.checked,inputs,result:root.Pricing.calc(inputs)};
}
function validateDocument(d){
 if(!object(d)||d.format!==FORMAT)fail('Golf Export Lab の JSON ファイルを選択してください。');
 if(d.schemaVersion!==VERSION)fail('このファイルのバージョンには対応していません。');
 if(!['settings','backup'].includes(d.kind))fail('ファイルの種類が正しくありません。');
 if(typeof d.exportedAt!=='string'||!Number.isFinite(Date.parse(d.exportedAt)))fail('書き出し日時が正しくありません。');
 const current=validateInputs(d.current),savedDefaults=d.savedDefaults===null?null:validateInputs(d.savedDefaults);
 if(!Array.isArray(d.history)||d.history.length>MAX_HISTORY)fail('履歴は最大 500 件まで読み込めます。');
 if(d.kind==='settings'&&d.history.length)fail('設定ファイルに履歴が含まれています。');
 const history=d.history.map(validSnapshot);if(new Set(history.map(x=>x.id)).size!==history.length)fail('ファイル内で履歴 ID が重複しています。');
 return {format:FORMAT,schemaVersion:VERSION,kind:d.kind,exportedAt:d.exportedAt,current,savedDefaults,history};
}
function parse(text){if(new TextEncoder().encode(text).length>MAX_BYTES)fail('ファイルは 2 MB 以下にしてください。');let raw;try{raw=JSON.parse(text)}catch{fail('JSON ファイルを読み取れませんでした。')}return validateDocument(raw)}
function documentData(current,savedDefaults,history,kind='backup'){return validateDocument({format:FORMAT,schemaVersion:VERSION,kind,exportedAt:new Date().toISOString(),current,savedDefaults,history:kind==='settings'?[]:history})}
function mergeHistory(existing,incoming){const map=new Map(existing.map(h=>[h.id,h]));for(const h of incoming){if(map.has(h.id)){if(JSON.stringify(validSnapshot(map.get(h.id)))!==JSON.stringify(validSnapshot(h)))fail('同じ ID の異なる履歴があります。既存データは変更していません。');}else map.set(h.id,h)}if(map.size>MAX_HISTORY)fail('統合後の履歴が 500 件を超えます。');return [...map.values()].sort((a,b)=>Date.parse(b.at)-Date.parse(a.at))}
const api={FORMAT,VERSION,MAX_HISTORY,MAX_BYTES,validateInputs,validateDocument,parse,documentData,mergeHistory};root.PricingData=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
