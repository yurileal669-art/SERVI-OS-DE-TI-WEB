export function showSection(id){
 document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
 document.querySelectorAll("[data-section]").forEach(b=>b.classList.toggle("active",b.dataset.section===id));
 document.getElementById(id)?.classList.add("active");history.replaceState(null,"",`#${id}`);window.scrollTo(0,0);
}
