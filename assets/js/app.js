import {requireAuth,logout} from "./auth.js";import {getDB,resetDB,exportJSON} from "./storage.js";
import {showSection} from "./router.js";import {listServices,getService} from "./services.js";
import {getCart,addToCart,removeFromCart,cartTotal} from "./cart.js";import {createTicket,listTickets,getTicket,updateTicket,addComment,addAttachmentMeta,slaState} from "./tickets.js";
import {saveAttachment,downloadAttachment} from "./attachments.js";import {createPayment,listPayments,markPayment} from "./checkout.js";
import {createFeedback,listFeedbacks} from "./feedback.js";import {listNotifications,markAllRead} from "./notifications.js";import {listCompanies,createCompany} from "./companies.js";
import {downloadGeneralTXT,downloadTicketTXT,downloadTicketsCSV} from "./reports.js";import {money,dateTime,escapeHTML} from "./utils.js";

const user=requireAuth();if(!user)throw new Error("Sessão ausente");
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let selectedTicketId=null;
const roleLabels={admin:"Administrador",technician:"Técnico",company:"Empresa",client:"Cliente"};
$("#user-name").textContent=user.name;$("#user-role").textContent=roleLabels[user.role]||user.role;
$("#logout").onclick=logout;

function toast(msg){const e=$("#toast");e.textContent=msg;e.hidden=false;setTimeout(()=>e.hidden=true,3000)}
function companyName(id){return getDB().companies.find(c=>c.id===id)?.name||"-"}
function technicianName(id){return getDB().users.find(u=>u.id===id)?.name||"Não atribuído"}
function priceFor(s){return ["company","admin"].includes(user.role)&&s.businessPrice?s.businessPrice:s.price}
function badge(v){return `<span class="badge ${String(v).replaceAll(" ","-")}">${escapeHTML(v)}</span>`}

function renderMetrics(){
 const db=getDB(),tickets=db.tickets,closed=tickets.filter(t=>["Resolvido","Encerrado"].includes(t.status)),slaOk=closed.filter(t=>new Date(t.updatedAt)<=new Date(t.dueAt)).length;
 $("#m-open").textContent=tickets.filter(t=>t.status==="Aberto").length;$("#m-progress").textContent=tickets.filter(t=>t.status==="Em atendimento").length;$("#m-done").textContent=closed.length;
 $("#m-critical").textContent=tickets.filter(t=>t.priority==="Crítica"&&!["Resolvido","Encerrado"].includes(t.status)).length;$("#m-revenue").textContent=money(db.payments.reduce((s,p)=>s+Number(p.total||0),0));
 $("#m-sla").textContent=(closed.length?(slaOk/closed.length*100):0).toFixed(0)+"%";const avg=db.feedbacks.length?db.feedbacks.reduce((s,f)=>s+f.rating,0)/db.feedbacks.length:0;$("#m-rating").textContent=avg.toFixed(1)+"/5";
 $("#m-cart").textContent=getCart().length;
 const recent=tickets.slice(0,5).map(t=>`<tr><td>${t.id}</td><td>${escapeHTML(t.service)}</td><td>${badge(t.priority)}</td><td>${badge(t.status)}</td><td><button class="btn small ghost open-ticket" data-id="${t.id}">Abrir</button></td></tr>`).join("");
 $("#recent-tickets").innerHTML=recent||'<tr><td colspan="5">Sem chamados.</td></tr>';
 bindOpenTicket();
}

function renderServices(){
 const q=$("#service-search").value.toLowerCase(),cat=$("#service-category").value;const arr=listServices().filter(s=>(!q||(s.name+s.description).toLowerCase().includes(q))&&(!cat||s.category===cat));
 $("#services-grid").innerHTML=arr.map(s=>`<article class="card"><div>${badge(s.category)}</div><h3>${escapeHTML(s.name)}</h3><p class="muted">${escapeHTML(s.description)}</p><p><strong>${s.price?money(priceFor(s)):"Sob orçamento"}</strong> • ${s.model}</p><p class="muted">Estimativa: ${s.estimated}</p><button class="btn add-cart" data-id="${s.id}" ${s.price?"":"disabled"}>Adicionar</button></article>`).join("");
 $$(".add-cart").forEach(b=>b.onclick=()=>{const s=getService(b.dataset.id);addToCart(s,priceFor(s));renderCart();renderMetrics();toast("Serviço adicionado.")});
 const cats=[...new Set(listServices().map(s=>s.category))];if(!$("#service-category").dataset.ready){$("#service-category").innerHTML='<option value="">Todas as categorias</option>'+cats.map(c=>`<option>${c}</option>`).join("");$("#service-category").dataset.ready="1"}
}
$("#service-search").oninput=renderServices;$("#service-category").onchange=renderServices;

function renderPricing(){
 $("#pricing-body").innerHTML=listServices().map(s=>`<tr><td>${s.name}</td><td>${s.category}</td><td>${s.model}</td><td>${s.price?money(s.price):"Sob orçamento"}</td><td>${s.businessPrice?money(s.businessPrice):"Negociado"}</td><td>${s.estimated}</td></tr>`).join("");
}


function renderMiniCart(){
 const cart=getCart(),count=cart.reduce((s,i)=>s+Number(i.qty||0),0),total=cartTotal();
 const countEl=$("#service-cart-count"),totalEl=$("#service-cart-total"),itemsEl=$("#mini-cart-items"),modalTotal=$("#mini-cart-total");
 if(countEl) countEl.textContent=`${count} ${count===1?"serviço adicionado":"serviços adicionados"}`;
 if(totalEl) totalEl.textContent=money(total);
 if(modalTotal) modalTotal.textContent=money(total);

 if(itemsEl){
   itemsEl.innerHTML=cart.length ? cart.map(i=>`
     <div class="mini-cart-row">
       <div>
         <strong>${escapeHTML(i.name)}</strong>
         <div class="mini-cart-meta">Quantidade: ${i.qty} • ${money(i.unitPrice)} cada</div>
       </div>
       <div>
         <div class="mini-cart-price">${money(i.unitPrice*i.qty)}</div>
         <button class="btn small ghost mini-remove-cart" data-id="${i.serviceId}" type="button">Remover</button>
       </div>
     </div>`).join("") :
     `<div class="notice">Nenhum serviço foi adicionado ao carrinho ainda.</div>`;

   $$(".mini-remove-cart").forEach(b=>b.onclick=()=>{
     removeFromCart(b.dataset.id);
     renderCart();
     renderMetrics();
     renderMiniCart();
     toast("Serviço removido do carrinho.");
   });
 }
}

function openMiniCart(){
 renderMiniCart();
 const modal=$("#mini-cart-modal");
 if(modal) modal.hidden=false;
}
function closeMiniCart(){
 const modal=$("#mini-cart-modal");
 if(modal) modal.hidden=true;
}

function renderCart(){
 const c=getCart();$("#cart-list").innerHTML=c.length?c.map(i=>`<div class="card"><strong>${i.name}</strong><div class="muted">Qtd: ${i.qty} • ${money(i.unitPrice)}</div><button class="btn small danger remove-cart" data-id="${i.serviceId}">Remover</button></div>`).join(""):'<div class="notice">Carrinho vazio.</div>';
 $("#cart-total").textContent=money(cartTotal());
 $$(".remove-cart").forEach(b=>b.onclick=()=>{removeFromCart(b.dataset.id);renderCart();renderMetrics();toast("Serviço removido do carrinho.")});
 renderMiniCart();
}

function filteredTickets(){
 const q=$("#ticket-search").value.toLowerCase(),st=$("#ticket-status-filter").value,pr=$("#ticket-priority-filter").value;
 return listTickets().filter(t=>(!q||(t.id+t.requester+t.service+companyName(t.companyId)).toLowerCase().includes(q))&&(!st||t.status===st)&&(!pr||t.priority===pr));
}
function renderTickets(){
 $("#tickets-body").innerHTML=filteredTickets().map(t=>{const sla=slaState(t);return `<tr><td>${t.id}</td><td>${escapeHTML(t.requester)}</td><td>${escapeHTML(companyName(t.companyId))}</td><td>${escapeHTML(t.service)}</td><td>${badge(t.priority)}</td><td>${badge(t.status)}</td><td class="${sla.expired?"stat-bad":"stat-good"}">${sla.expired?"Vencido":dateTime(t.dueAt)}</td><td><button class="btn small ghost open-ticket" data-id="${t.id}">Detalhes</button></td></tr>`}).join("")||'<tr><td colspan="8">Nenhum resultado.</td></tr>';bindOpenTicket();
}
$("#ticket-search").oninput=renderTickets;$("#ticket-status-filter").onchange=renderTickets;$("#ticket-priority-filter").onchange=renderTickets;
function bindOpenTicket(){$$(".open-ticket").forEach(b=>b.onclick=()=>openTicket(b.dataset.id))}

function openTicket(id){
 selectedTicketId=id;const t=getTicket(id);if(!t)return;$("#modal-title").textContent=t.id;$("#modal-ticket-main").innerHTML=`
 <p><strong>Solicitante:</strong> ${escapeHTML(t.requester)}</p><p><strong>Empresa:</strong> ${escapeHTML(companyName(t.companyId))}</p>
 <p><strong>Serviço:</strong> ${escapeHTML(t.service)}</p><p><strong>Prioridade:</strong> ${badge(t.priority)}</p><p><strong>Status:</strong> ${badge(t.status)}</p>
 <p><strong>Técnico:</strong> ${escapeHTML(technicianName(t.technicianId))}</p><p><strong>SLA:</strong> ${dateTime(t.dueAt)}</p><p>${escapeHTML(t.description)}</p>`;
 $("#detail-status").value=t.status;$("#detail-technician").innerHTML='<option value="">Não atribuído</option>'+getDB().users.filter(u=>["technician","admin"].includes(u.role)).map(u=>`<option value="${u.id}" ${u.id===t.technicianId?"selected":""}>${u.name}</option>`).join("");
 $("#history-list").innerHTML=t.history.map(h=>`<div class="timeline-item"><strong>${dateTime(h.at)}</strong><div>${escapeHTML(h.action)}</div></div>`).join("");
 $("#comments-list").innerHTML=t.comments.map(c=>`<div class="card"><strong>${escapeHTML(c.author)}</strong><div class="muted">${dateTime(c.at)}</div><p>${escapeHTML(c.text)}</p></div>`).join("")||'<div class="muted">Sem comentários.</div>';
 $("#attachments-list").innerHTML=t.attachments.map(a=>`<div><button class="btn small ghost download-attachment" data-id="${a.id}">${escapeHTML(a.name)}</button> <span class="muted">${Math.ceil(a.size/1024)} KB</span></div>`).join("")||'<div class="muted">Sem anexos.</div>';
 $$(".download-attachment").forEach(b=>b.onclick=()=>downloadAttachment(b.dataset.id));$("#ticket-modal").hidden=false;
}
$("#close-modal").onclick=()=>$("#ticket-modal").hidden=true;
$("#save-ticket-detail").onclick=()=>{const status=$("#detail-status").value,technicianId=$("#detail-technician").value;updateTicket(selectedTicketId,{status,technicianId},`Status: ${status}; técnico: ${technicianName(technicianId)}`);openTicket(selectedTicketId);renderTickets();renderMetrics();toast("Chamado atualizado.")};
$("#comment-form").onsubmit=e=>{e.preventDefault();const text=new FormData(e.currentTarget).get("comment").trim();if(!text)return;addComment(selectedTicketId,user.name,text);e.currentTarget.reset();openTicket(selectedTicketId)};
$("#attachment-input").onchange=async e=>{for(const file of e.target.files){if(file.size>5*1024*1024){toast("Anexo maior que 5 MB ignorado.");continue}const meta=addAttachmentMeta(selectedTicketId,file);await saveAttachment(meta.id,selectedTicketId,file)}openTicket(selectedTicketId);toast("Anexo salvo localmente.")};
$("#ticket-report").onclick=()=>downloadTicketTXT(selectedTicketId);

function populateForms(){
 $("#ticket-service").innerHTML='<option value="">Selecione</option>'+listServices().map(s=>`<option value="${s.id}">${s.name}</option>`).join("");
 $("#ticket-company").innerHTML='<option value="">Sem empresa</option>'+listCompanies().map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
}
$("#ticket-form").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget)),s=getService(d.serviceId);createTicket({requester:d.requester.trim(),companyId:d.companyId,serviceId:s.id,service:s.name,priority:d.priority,description:d.description.trim()});e.currentTarget.reset();renderTickets();renderMetrics();showSection("tickets");toast("Chamado criado.")};

function renderPayments(){
 $("#payments-body").innerHTML=listPayments().map(p=>`<tr><td>${p.id}</td><td>${escapeHTML(p.client)}</td><td>${p.method}</td><td>${badge(p.status)}</td><td>${money(p.total)}</td><td>${dateTime(p.createdAt)}</td><td>${user.role==="admin"?`<button class="btn small secondary pay-ok" data-id="${p.id}">Marcar pago</button>`:"-"}</td></tr>`).join("");
 $$(".pay-ok").forEach(b=>b.onclick=()=>{markPayment(b.dataset.id,"Pago");renderPayments();renderMetrics()});
}
$("#checkout-form").onsubmit=e=>{e.preventDefault();try{const d=Object.fromEntries(new FormData(e.currentTarget));createPayment({...d,client:d.client||user.name});e.currentTarget.reset();renderCart();renderPayments();renderMetrics();toast("Checkout registrado.")}catch(err){toast(err.message)}};

function renderFeedbacks(){
 $("#feedback-list").innerHTML=listFeedbacks().map(f=>`<div class="card"><strong>${f.rating}/5</strong><div class="muted">${f.ticketId||"Sem chamado"} • ${dateTime(f.createdAt)}</div><p>${escapeHTML(f.comment||"Sem comentário")}</p></div>`).join("");
}
$("#feedback-form").onsubmit=e=>{e.preventDefault();createFeedback(Object.fromEntries(new FormData(e.currentTarget)));e.currentTarget.reset();renderFeedbacks();renderMetrics();toast("Feedback salvo.")};

function renderCompanies(){
 $("#companies-body").innerHTML=listCompanies().map(c=>`<tr><td>${c.id}</td><td>${escapeHTML(c.name)}</td><td>${c.cnpj}</td><td>${c.department||"-"}</td><td>${c.costCenter||"-"}</td><td>${c.slaPlan||"-"}</td><td>${c.contract||"-"}</td></tr>`).join("");
}
$("#company-form").onsubmit=e=>{e.preventDefault();createCompany(Object.fromEntries(new FormData(e.currentTarget)));e.currentTarget.reset();renderCompanies();populateForms();toast("Empresa cadastrada.")};

function renderNotifications(){
 const arr=listNotifications();$("#notification-count").textContent=arr.filter(n=>!n.read).length;$("#notifications-list").innerHTML=arr.slice(0,12).map(n=>`<div class="card">${!n.read?'<span class="notification-dot"></span> ':''}${escapeHTML(n.message)}<div class="muted">${dateTime(n.createdAt)}</div></div>`).join("");
}
$("#mark-read").onclick=()=>{markAllRead();renderNotifications()};


$("#open-mini-cart").onclick=openMiniCart;
$("#close-mini-cart").onclick=closeMiniCart;
$("#mini-cart-go-cart").onclick=()=>{closeMiniCart();showSection("cart")};
$("#mini-cart-go-checkout").onclick=()=>{closeMiniCart();showSection("checkout")};
$("#mini-cart-modal").addEventListener("click",e=>{if(e.target.id==="mini-cart-modal")closeMiniCart()});

$("#report-txt").onclick=downloadGeneralTXT;$("#report-csv").onclick=downloadTicketsCSV;$("#export-json").onclick=exportJSON;
$("#reset-demo").onclick=()=>{if(confirm("Restaurar todos os dados de demonstração?")){resetDB();location.reload()}};

$$("[data-section]").forEach(b=>b.onclick=()=>showSection(b.dataset.section));
const hash=location.hash.slice(1)||"dashboard";showSection(document.getElementById(hash)?hash:"dashboard");

function applyRoleUI(){
 $$("[data-role]").forEach(el=>{const roles=el.dataset.role.split(",");el.hidden=!(user.role==="admin"||roles.includes(user.role))});
}
populateForms();renderMetrics();renderServices();renderPricing();renderCart();renderTickets();renderPayments();renderFeedbacks();renderCompanies();renderNotifications();applyRoleUI();
