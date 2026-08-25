import {getDB,saveDB} from "./storage.js";import {uid} from "./utils.js";
export const listCompanies=()=>getDB().companies;
export function createCompany(data){const db=getDB(),c={id:uid("EMP"),...data};db.companies.push(c);saveDB(db);return c}
