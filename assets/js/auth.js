import {getDB,saveDB} from "./storage.js";import {hashText,uid} from "./utils.js";
const SESSION="servicos_ti_session_v2";
export function currentUser(){try{return JSON.parse(sessionStorage.getItem(SESSION))}catch{return null}}
export async function login(email,password){
 const db=getDB();const h=await hashText(password);const u=db.users.find(x=>x.email.toLowerCase()===email.toLowerCase()&&x.passwordHash===h&&x.active);
 if(!u)throw new Error("E-mail ou senha inválidos.");const safe={...u};delete safe.passwordHash;sessionStorage.setItem(SESSION,JSON.stringify(safe));return safe;
}
export async function register(data){
 const db=getDB();if(db.users.some(u=>u.email.toLowerCase()===data.email.toLowerCase()))throw new Error("E-mail já cadastrado.");
 const u={id:uid("USR"),name:data.name.trim(),email:data.email.trim(),passwordHash:await hashText(data.password),role:data.role||"client",companyId:data.companyId||"",active:true};
 db.users.push(u);saveDB(db);const safe={...u};delete safe.passwordHash;sessionStorage.setItem(SESSION,JSON.stringify(safe));return safe;
}
export function logout(){sessionStorage.removeItem(SESSION);location.href="index.html"}
export function requireAuth(){const u=currentUser();if(!u){location.href="index.html";return null}return u}
export function can(role,user=currentUser()){if(!user)return false;if(user.role==="admin")return true;return user.role===role}
