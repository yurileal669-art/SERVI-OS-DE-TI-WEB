import {login,register,currentUser} from "./auth.js";
import {getDB} from "./storage.js";

if(currentUser()) location.href="dashboard.html";

const profileScreen=document.getElementById("profile-screen");
const loginScreen=document.getElementById("login-screen");
const status=document.getElementById("status");
const roleInput=document.getElementById("register-role");
const companyWrap=document.getElementById("company-select-wrap");
const kicker=document.getElementById("login-kicker");
let chosenRole="client";

function showLogin(profile){
  chosenRole=profile;
  roleInput.value=profile;
  profileScreen.style.display="none";
  loginScreen.classList.add("active");
  companyWrap.hidden=profile!=="company";
  kicker.textContent=profile==="company"?"ATENDIMENTO CORPORATIVO":"ATENDIMENTO AUXILIAR";
  const email=document.querySelector('#login-form input[name="email"]');
  const pass=document.querySelector('#login-form input[name="password"]');
  if(profile==="company"){email.value="empresa@cliente.local";pass.value="empresa123"}
  else{email.value="cliente@local.test";pass.value="cliente123"}
}

document.getElementById("company-choice").onclick=()=>showLogin("company");
document.getElementById("user-choice").onclick=()=>showLogin("client");
document.getElementById("back-profile").onclick=()=>{
  loginScreen.classList.remove("active");
  profileScreen.style.display="";
  status.style.display="none";
};

document.getElementById("companyId").innerHTML='<option value="">Selecione</option>'+
  getDB().companies.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");

function showStatus(msg){
  status.textContent=msg;status.style.display="block";
}

document.getElementById("login-form").addEventListener("submit",async e=>{
  e.preventDefault();
  try{
    const d=Object.fromEntries(new FormData(e.currentTarget));
    await login(d.email,d.password);
    location.href="dashboard.html";
  }catch(err){showStatus(err.message)}
});
document.getElementById("register-form").addEventListener("submit",async e=>{
  e.preventDefault();
  try{
    const d=Object.fromEntries(new FormData(e.currentTarget));
    if(d.password.length<6) throw new Error("Senha precisa ter pelo menos 6 caracteres.");
    d.role=chosenRole;
    await register(d);
    location.href="dashboard.html";
  }catch(err){showStatus(err.message)}
});
document.getElementById("show-register").onclick=()=>{
  document.getElementById("login-box").hidden=true;
  document.getElementById("register-box").hidden=false;
};
document.getElementById("show-login").onclick=()=>{
  document.getElementById("register-box").hidden=true;
  document.getElementById("login-box").hidden=false;
};
