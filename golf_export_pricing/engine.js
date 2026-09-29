(function(root){
'use strict';
const legacy=root.LegacyPricing || (typeof require==='function'?require('./legacy-engine.js'):null);
const common={model:'detail',plan:'starter',fvf:13.6,threshold:7500,upper:2.35,intl:1.35,vat:10,tax:0,ad:null,fxFee:null,buffer:null,duty:null,processing:null,processingBase:'duty',importFixed:null,customsMode:'price',orderLow:.30,orderHigh:.40,orderThreshold:10,returnRate:null,returnLoss:null,pack:null,handling:null,overhead:null,billing:'year',monthlyOrders:null,starterYear:4.95,basicYear:21.95,starterMonth:7.95,basicMonth:27.95};
const product={name:'',sku:'',category:'',origin:'',hts:'',quantity:null,cost:null,yahoo:null,price:null,buyerShipping:null,fx:null,box:'custom',boxId:'',length:null,width:null,height:null,weight:null,divisor:null,freight:null,fuel:null,surcharge:null,customsValue:null,target:null,targetMode:'amount',pricingSource:'wholesale',marketUsage:'reference',referencePrice:null,referenceTaxMode:'gross',referenceTax:10,referenceUplift:null,referenceExtras:'include',referenceURL:'',fxSource:'',fxDate:'',shippingSource:'',shippingDate:''};
const defaults={...common,...product};
const numericKeys=Object.keys(defaults).filter(k=>typeof defaults[k]==='number'||defaults[k]===null);
const round=legacy.round,n=v=>v==null?0:v;
function blank(settings={}){return {...defaults,...settings}}
function sample(settings={}){return {...defaults,...legacy.defaults,...settings,name:'N.S.PRO MODUS³ Tour 115',sku:'MODUS-115-S',quantity:1,cost:4000,pack:150,handling:100,overhead:0,price:47.73,buyerShipping:56.83,fx:150,length:119,width:10,height:5,weight:.5,divisor:5000,freight:3691.25,fuel:60,surcharge:0,duty:12.5,processing:2.1,importFixed:0,ad:2,buffer:20,fxFee:0,returnRate:0,returnLoss:8000,target:2000,model:'detail',pricingSource:'wholesale',referencePrice:null,boxId:'sample-box-a',box:'A'}}
function reference(s){if(s.referencePrice===null)return null;const net=s.referenceTaxMode==='gross'?s.referencePrice/(1+n(s.referenceTax)/100):s.referencePrice;const gross=s.referenceTaxMode==='gross'?s.referencePrice:s.referencePrice*(1+n(s.referenceTax)/100);const extra=s.referenceExtras==='include'?n(s.pack)+n(s.handling)+n(s.overhead)+n(s.returnRate)/100*n(s.returnLoss):0;return {net,gross,extra,recovery:net*n(s.quantity)*(1+n(s.referenceUplift)/100)+extra}}
function effectiveCost(s){if(s.pricingSource!=='wholesale'&&s.marketUsage==='purchase'){const r=reference(s);return r?r.gross:null}return s.cost}
function core(s){const x={...s};for(const k of numericKeys)x[k]=n(x[k]);const purchase=effectiveCost(s);x.cost=n(purchase);
 const revenue=round(x.price+x.buyerShipping),salesTax=round(revenue*x.tax/100),base=round(revenue+salesTax);
 const fvf=x.model==='consultant'?round(base*x.buffer/100):round(Math.min(base,x.threshold)*x.fvf/100+Math.max(0,base-x.threshold)*x.upper/100);
 const order=x.model==='consultant'?0:base<=x.orderThreshold?x.orderLow:x.orderHigh;
 const intl=x.model==='consultant'?0:round(base*x.intl/100),ad=x.model==='consultant'?0:round(base*x.ad/100);
 const vat=x.model==='consultant'?0:round((fvf+order+intl+ad)*x.vat/100),fees=round(fvf+order+intl+ad+vat);
 const payout=round(revenue-fees),fxCost=round(Math.max(0,payout)*x.fxFee/100),customs=x.customsMode==='price'?x.price:x.customsMode==='total'?revenue:x.customsValue;
 const rawDuty=customs*x.duty/100,duty=round(rawDuty),rawProcessing=(x.processingBase==='duty'?rawDuty:customs)*x.processing/100;
 const imports=x.model==='consultant'?round(rawDuty+rawProcessing+x.importFixed):round(duty+round(rawProcessing)+x.importFixed),processing=round(imports-duty-x.importFixed);
 const shipping=round(x.freight*(1+x.fuel/100)+x.surcharge),net=round((payout-fxCost-imports)*x.fx-shipping),cost=x.cost*x.quantity+x.pack+x.handling+x.overhead,risk=round(x.returnRate/100*x.returnLoss),profit=round(net-cost-risk),margin=revenue?profit/(revenue*x.fx)*100:0;
 const dimWeight=s.length!==null&&s.width!==null&&s.height!==null&&s.divisor>0?x.length*x.width*x.height/x.divisor:null,chargeWeight=dimWeight!==null&&s.weight!==null?Math.max(x.weight,dimWeight):null;
 return {revenue,salesTax,base,fvf,order,intl,ad,vat,fees,payout,fxCost,duty,processing,imports,shipping,net,cost,risk,profit,margin,perUnit:x.quantity?profit/x.quantity:0,dimWeight,chargeWeight};
}
function calc(s){const r=core(s);return effectiveCost(s)===null?{...r,cost:null,profit:null,margin:null,perUnit:null}:r}
function issues(s,kind='forward'){
 const required=[['quantity','販売数量'],['fx','為替レート'],['freight','実際に払う基本送料'],['buyerShipping','購入者に請求する送料'],['duty','関税率（かからない場合は 0）']];
 if(kind==='forward')required.push(['price','eBay の商品価格']);
 if(s.pricingSource!=='wholesale')required.push(['referencePrice','楽天・Yahoo! の商品価格']);
 if(s.model==='consultant')required.push(['buffer','概算モデルの手数料率']);
 if(s.customsMode==='manual')required.push(['customsValue','申告価格']);
 if(n(s.returnRate)>0)required.push(['returnLoss','返品 1 件あたりの損失']);
 if(kind==='recommend'&&!(s.pricingSource!=='wholesale'&&s.marketUsage==='reference')){required.push(['target','目標利益']);if(effectiveCost(s)===null)required.push(['cost','仕入原価']);}
 return required.filter(([k])=>s[k]===null||s[k]==='').map(([,label])=>label);
}
function goal(s){if(s.pricingSource!=='wholesale'&&s.marketUsage==='reference')return {mode:'net',target:reference(s)?.recovery??null};return {mode:s.targetMode,target:s.target}}
function solve(s,field='price',target=s.target,mode=s.targetMode){
 if(target===null||!Number.isFinite(target)||mode==='margin'&&target>=100)return null;
 const score=v=>{const r=core({...s,[field]:v});return mode==='net'?r.net-target:mode==='margin'?r.profit-r.revenue*n(s.fx)*target/100:r.profit-target};
 if(score(0)>=0)return 0;let lo=0,hi=100;while(hi<100000000&&score(hi/100)<0)hi*=2;if(score(hi/100)<0)return null;
 while(lo+1<hi){const mid=Math.floor((lo+hi)/2);if(score(mid/100)>=0)hi=mid;else lo=mid;}return hi/100;
}
function recommend(s,field='price'){const g=goal(s);return solve(s,field,g.target,g.mode)}
const api={defaults,common,numericKeys,blank,sample,calc,solve,recommend,goal,reference,effectiveCost,issues,round};root.Pricing=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
