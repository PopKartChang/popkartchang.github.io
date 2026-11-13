(function(root){
'use strict';
// Store policy cents are authoritative; the recovery mode is only a comparison.
const prices={A01:23.99,'A01 Copy':23.99,A02:31.99,A03:47.99,A04:76.99,A05:99.99,A06:148.99,A07:168.99,A08:286.99,A09:400.99,A10:16.99,A11:21.99};
const groups=Object.freeze({A01:508,'A01 Copy':508,A02:652,A03:940,A04:1462,A05:2256,A06:3138,A07:3498,A08:5622,A09:7294,A10:382,A11:472});
const usesSetReserve=group=>['A05','A06','A07','A08'].includes(group);
const sharedCents=group=>usesSetReserve(group)?3343:3342;
function additional(price,units,factor){
 if(!Number.isFinite(price)||price<0)throw Error('グループ内の最高商品単価を入力してください。');
 return Math.ceil(((100*units/158+price*.15)*factor)*100-1e-9);
}
function quote(group,quantity,other='',eligible=false,price=null,mode='store'){
 if(!Number.isInteger(quantity)||quantity<1||quantity+(other?1:0)>10||!eligible)throw Error('同じ箱で10点まで。条件外は配送会社で再見積してください。');
 if((group!=='custom'&&!Object.hasOwn(groups,group))||(other&&!Object.hasOwn(groups,other)))throw Error('対象の配送ポリシーを選んでください。');
 if((usesSetReserve(group)||usesSetReserve(other))&&(quantity!==1||other))throw Error('セットを含むグループの同梱は、単品と別に再見積してください。');
 const recovery=mode==='recovery';
 const fixed=recovery?Math.round(4400/158/.8*100):sharedCents(group);
 const getExtra=g=>!recovery&&g!=='custom'?groups[g]:additional(g==='custom'?price:prices[g],usesSetReserve(g)?6:1,recovery?1/.8:1.2);
 const extra=getExtra(group),otherExtra=other?getExtra(other):0;
 return {first:(fixed+extra)/100,additional:extra/100,shared:fixed/100,total:(fixed+quantity*extra+otherExtra)/100,otherAdditional:otherExtra/100};
}
function dplPrice(jpy,rate='0.00666667',markup='13.64'){
 function decimal(value){
  const str=String(value);
  if(!/^\d{1,12}(?:\.\d{1,12})?$/.test(str))throw Error('価格・換算率・上乗せ率を確認してください。');
  const [whole,fraction='']=str.split('.');
  return [BigInt(whole+fraction),10n**BigInt(fraction.length)];
 }
 const [a,b]=decimal(jpy),[c,d]=decimal(rate),[e,f]=decimal(markup);
 if(!a||!c)throw Error('国内売価と換算率を入力してください。');
 const numerator=a*c*(100n*f+e),denominator=b*d*f;
 const cents=(numerator+denominator-1n)/denominator;
 return Number((cents/100n)*100n+99n)/100;
}
function reconcile({shipping,duty,processing,estimateDuty,estimateProcessing,earnings,fx,bank}){
 const total=shipping+duty+processing;
 return {total,delta:estimateDuty!=null&&estimateProcessing!=null?duty+processing-estimateDuty-estimateProcessing:null,converted:earnings!=null&&fx>0?earnings*fx-total:null,bankNet:bank!=null?bank-total:null};
}
root.ShippingPolicy={groups,quote,reconcile,usesSetReserve,sharedCents,dplPrice};
})(globalThis);
