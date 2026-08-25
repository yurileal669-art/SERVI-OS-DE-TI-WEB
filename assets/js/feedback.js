import {getDB,saveDB} from "./storage.js";import {uid} from "./utils.js";
export function createFeedback(data){const db=getDB(),f={id:uid("FDB"),ticketId:data.ticketId||"",rating:Number(data.rating),comment:data.comment||"",createdAt:new Date().toISOString()};db.feedbacks.unshift(f);saveDB(db);return f}
export const listFeedbacks=()=>getDB().feedbacks;
