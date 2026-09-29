(function(root){
const defaults={name:'N.S.PRO MODUS³ Tour 115',sku:'MODUS-115-S',category:'shaft',origin:'Japan（製造原産国を確認）',hts:'9506.39.0060（候補・要確認）',quantity:1,cost:4000,pack:150,handling:100,overhead:0,yahoo:5727,price:47.73,buyerShipping:56.83,tax:0,fx:150,fxFee:0,box:'A',length:119,width:10,height:5,weight:.5,divisor:5000,freight:3691.25,fuel:60,surcharge:0,duty:12.5,processing:2.1,processingBase:'duty',importFixed:0,customsMode:'price',customsValue:47.73,model:'detail',plan:'starter',fvf:13.6,threshold:7500,upper:2.35,intl:1.35,ad:2,vat:10,buffer:20,returnRate:0,returnLoss:8000,target:2000,targetMode:'amount',billing:'year',monthlyOrders:30};
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
function calc(s){
 const revenue=round(s.price+s.buyerShipping),salesTax=round(revenue*s.tax/100),base=round(revenue+salesTax);
 const fvf=s.model==='consultant'?round(base*s.buffer/100):round(Math.min(base,s.threshold)*s.fvf/100+Math.max(0,base-s.threshold)*s.upper/100);
 const order=s.model==='consultant'?0:base<=10?.30:.40;
 const intl=s.model==='consultant'?0:round(base*s.intl/100),ad=s.model==='consultant'?0:round(base*s.ad/100);
 const vat=s.model==='consultant'?0:round((fvf+order+intl+ad)*s.vat/100),fees=round(fvf+order+intl+ad+vat);
 const payout=round(revenue-fees),fxCost=round(Math.max(0,payout)*s.fxFee/100),customs=s.customsMode==='price'?s.price:s.customsValue;
 const rawDuty=customs*s.duty/100,duty=round(rawDuty),rawProcessing=(s.processingBase==='duty'?rawDuty:customs)*s.processing/100;
 const imports=s.model==='consultant'?round(rawDuty+rawProcessing+s.importFixed):round(duty+round(rawProcessing)+s.importFixed),processing=round(imports-duty-s.importFixed);
 const shipping=round(s.freight*(1+s.fuel/100)+s.surcharge),net=round((payout-fxCost-imports)*s.fx-shipping),cost=s.cost*s.quantity+s.pack+s.handling+s.overhead,risk=round(s.returnRate/100*s.returnLoss),profit=round(net-cost-risk),margin=revenue?profit/(revenue*s.fx)*100:0;
 return{revenue,salesTax,base,fvf,order,intl,ad,vat,fees,payout,fxCost,duty,processing,imports,shipping,net,cost,risk,profit,margin,perUnit:profit/s.quantity,dimWeight:s.length*s.width*s.height/s.divisor,chargeWeight:Math.max(s.weight,s.length*s.width*s.height/s.divisor)};
}
function solve(s,field='price',target=s.target,mode=s.targetMode){
 const score=v=>{let x={...s,[field]:v},r=calc(x);return mode==='margin'?r.profit-r.revenue*s.fx*target/100:r.profit-target;};
 if(mode==='margin'&&target>=100)return null;
 if(score(0)>=0)return 0;
 // Search in cents; result always rounded upward to meet target.
 let lo=0,hi=100;while(hi<100000000&&score(hi/100)<0)hi*=2;if(score(hi/100)<0)return null;
 while(lo+1<hi){let mid=Math.floor((lo+hi)/2);if(score(mid/100)>=0)hi=mid;else lo=mid;}return hi/100;
}
root.LegacyPricing={defaults,calc,solve,round};if(typeof module!=='undefined')module.exports=root.LegacyPricing;
})(typeof window!=='undefined'?window:globalThis);
