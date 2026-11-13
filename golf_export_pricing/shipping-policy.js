(function(root){
'use strict';
const groups=Object.freeze({A01:543,'A01 Copy':543,A02:696,A03:1003,A10:409,A11:505});
const fixed=4015;
function additional(price){
 if(!Number.isFinite(price)||price<0)throw Error('グループ内の最高商品単価を入力してください。');
 return Math.ceil(((100/150+price*.15*1.021)/.8)*100-1e-9);
}
function quote(group,quantity,other='',eligible=false,price=null){
 if(!Number.isInteger(quantity)||quantity<1||quantity+(other?1:0)>10||!eligible)throw Error('鋼製単品・同一梱包の10本以内に限ります。長尺、セット、複数箱、遠隔地は再見積してください。');
 const extra=group==='custom'?additional(price):groups[group];
 if(!Number.isInteger(extra)||other&&!Object.hasOwn(groups,other))throw Error('対象の配送ポリシーを選んでください。');
 const extras=other?[...Array(quantity).fill(extra),groups[other]]:Array(quantity).fill(extra);
 return {first:(fixed+extra)/100,additional:extra/100,shared:fixed/100,total:(fixed+extras.reduce((a,b)=>a+b,0))/100};
}
function reconcile({shipping,duty,processing,estimateDuty,estimateProcessing,earnings,fx,bank}){
 const total=shipping+duty+processing;
 return {total,delta:estimateDuty!=null&&estimateProcessing!=null?duty+processing-estimateDuty-estimateProcessing:null,converted:earnings!=null&&fx>0?earnings*fx-total:null,bankNet:bank!=null?bank-total:null};
}
root.ShippingPolicy={groups,quote,reconcile};
})(globalThis);
