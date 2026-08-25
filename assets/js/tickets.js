import {getDB,saveDB} from "./storage.js";import {uid} from "./utils.js";import {notify} from "./notifications.js";
const SLA={"Baixa":72,"Média":24,"Alta":8,"Crítica":4};
export function createTicket(data){
 const db=getDB(),now=new Date(),due=new Date(now.getTime()+(SLA[data.priority]||24)*3600000);
 const t={id:`TI-${now.getFullYear()}-${String(Date.now()).slice(-6)}`,createdAt:now.toISOString(),updatedAt:now.toISOString(),dueAt:due.toISOString(),status:"Aberto",technicianId:"",history:[{at:now.toISOString(),action:"Chamado aberto"}],comments:[],attachments:[],...data};
 db.tickets.unshift(t);saveDB(db);notify(`Novo chamado ${t.id}: ${t.service}.`);return t;
}
export const listTickets=()=>getDB().tickets;
export const getTicket=id=>getDB().tickets.find(t=>t.id===id);
export function updateTicket(id,patch,historyText="Chamado atualizado"){
 const db=getDB(),t=db.tickets.find(x=>x.id===id);if(!t)return null;Object.assign(t,patch,{updatedAt:new Date().toISOString()});
 t.history.push({at:t.updatedAt,action:historyText});saveDB(db);notify(`${t.id}: ${historyText}`);return t;
}
export function addComment(id,author,text){
 const db=getDB(),t=db.tickets.find(x=>x.id===id);if(!t)return;t.comments.push({id:uid("COM"),author,at:new Date().toISOString(),text});t.updatedAt=new Date().toISOString();saveDB(db);notify(`${t.id}: novo comentário.`);
}
export function addAttachmentMeta(id,file){
 const db=getDB(),t=db.tickets.find(x=>x.id===id);if(!t)return;const meta={id:uid("ANX"),name:file.name,type:file.type,size:file.size,addedAt:new Date().toISOString()};
 t.attachments.push(meta);t.history.push({at:meta.addedAt,action:`Anexo registrado: ${file.name}`});saveDB(db);return meta;
}
export function slaState(t){const done=["Resolvido","Encerrado"].includes(t.status);const due=new Date(t.dueAt);const now=new Date();return {expired:!done&&now>due,done,remainingMs:due-now}}
