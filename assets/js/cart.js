import {getDB,saveDB} from "./storage.js";
export const getCart=()=>getDB().cart;
export function addToCart(s,price){const db=getDB(),x=db.cart.find(i=>i.serviceId===s.id);if(x)x.qty++;else db.cart.push({serviceId:s.id,name:s.name,unitPrice:Number(price),qty:1});saveDB(db)}
export function removeFromCart(id){const db=getDB();db.cart=db.cart.filter(i=>i.serviceId!==id);saveDB(db)}
export function clearCart(){const db=getDB();db.cart=[];saveDB(db)}
export const cartTotal=()=>getCart().reduce((a,i)=>a+i.unitPrice*i.qty,0);
