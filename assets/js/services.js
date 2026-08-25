import {getDB} from "./storage.js";
export const listServices=()=>getDB().services;
export const getService=id=>getDB().services.find(s=>s.id===id);
