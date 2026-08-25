import {getDB,saveDB} from "./storage.js";import {uid} from "./utils.js";
export function notify(message){const db=getDB();db.notifications.unshift({id:uid("NTF"),message,read:false,createdAt:new Date().toISOString()});saveDB(db)}
export const listNotifications=()=>getDB().notifications;
export function markAllRead(){const db=getDB();db.notifications.forEach(n=>n.read=true);saveDB(db)}
