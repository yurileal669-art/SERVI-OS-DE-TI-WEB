import {getDB,saveDB} from "./storage.js";import {getCart,cartTotal,clearCart} from "./cart.js";import {uid} from "./utils.js";import {notify} from "./notifications.js";
export function createPayment(data){
 const cart=getCart();if(!cart.length)throw new Error("Carrinho vazio.");const db=getDB(),p={id:uid("PAY"),client:data.client||"Cliente",createdAt:new Date().toISOString(),status:"Pendente",method:data.method,total:cartTotal(),items:cart,costCenter:data.costCenter||"",purchaseOrder:data.purchaseOrder||""};
 db.payments.unshift(p);saveDB(db);clearCart();notify(`Checkout ${p.id} registrado via ${p.method}.`);return p;
}
export function markPayment(id,status){const db=getDB(),p=db.payments.find(x=>x.id===id);if(!p)return;p.status=status;saveDB(db);notify(`${p.id}: pagamento ${status}.`)}
export const listPayments=()=>getDB().payments;
