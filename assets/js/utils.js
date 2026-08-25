export const money=v=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(v||0));
export const dateTime=v=>v?new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(v)):"-";
export const dateOnly=v=>v?new Intl.DateTimeFormat("pt-BR",{dateStyle:"short"}).format(new Date(v)):"-";
export function uid(prefix){return `${prefix}-${Date.now().toString().slice(-8)}-${Math.floor(Math.random()*900+100)}`}
export function escapeHTML(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
export async function hashText(text){const data=new TextEncoder().encode(text);const buf=await crypto.subtle.digest("SHA-256",data);return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("")}
