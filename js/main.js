/* LÓGICA DA PÁGINA: links de contato, galeria com filtros, carrossel de fotos e lightbox (lê os dados de config.js) */
var wa = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(MSG);
document.querySelectorAll("[data-wa]").forEach(function(a){a.href=wa;a.target="_blank";a.rel="noopener"});
for (var k in LINKS){var e=document.getElementById(k); if(e) e.href=LINKS[k];}

var gal=document.getElementById("gallery"), fl=document.getElementById("filters");
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

// Monta a área de foto do card: até 3 imagens (ou emoji, se não houver foto)
function slider(p){
  var imgs=(p.images||[]).slice(0,3);
  if(!imgs.length) return '<div class="thumb">'+esc(p.emoji||"🧊")+'</div>';
  var sl=imgs.map(function(src,i){return '<img src="'+esc(src)+'" alt="'+esc(p.name)+' - foto '+(i+1)+'" loading="lazy"'+(i?'':' class="on"')+'>'}).join("");
  var nav=imgs.length>1?'<button class="arr prev" aria-label="Foto anterior">‹</button><button class="arr next" aria-label="Próxima foto">›</button><div class="dots">'+imgs.map(function(_,i){return '<i'+(i?'':' class="on"')+'></i>'}).join("")+'</div>':'';
  return '<div class="thumb slider" data-i="0">'+sl+nav+'</div>';
}

function render(cat){
  gal.innerHTML=PRODUCTS.map(function(p,idx){return {p:p,idx:idx}}).filter(function(o){return cat==="Todos"||o.p.cat===cat}).map(function(o){
    var p=o.p;
    var link="https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent("Olá! Tenho interesse em: "+p.name+".");
    return '<article class="prod" data-p="'+o.idx+'">'+slider(p)+'<div class="pinfo"><span class="pcat">'+esc(p.cat)+'</span><span class="pname">'+esc(p.name)+'</span><p class="pdesc">'+esc(p.desc)+'</p><div class="pfoot"><a class="btn primary" href="'+link+'" target="_blank" rel="noopener">Pedir pelo WhatsApp</a></div></div></article>';
  }).join("");
}

var cats=["Todos"].concat(PRODUCTS.map(function(p){return p.cat}).filter(function(c,i,a){return a.indexOf(c)===i}));
fl.innerHTML=cats.map(function(c,i){return '<button class="chip'+(i?'':' on')+'" data-c="'+esc(c)+'">'+esc(c)+'</button>'}).join("");
fl.addEventListener("click",function(e){var b=e.target.closest(".chip");if(!b)return;fl.querySelectorAll(".chip").forEach(function(x){x.classList.remove("on")});b.classList.add("on");render(b.dataset.c)});

// Carrossel dentro do card (setas) e abertura da foto ampliada ao clicar
function go(sl,d){
  var im=sl.querySelectorAll("img"),ds=sl.querySelectorAll(".dots i"),i=+sl.dataset.i;
  im[i].classList.remove("on"); if(ds[i])ds[i].classList.remove("on");
  i=(i+d+im.length)%im.length; sl.dataset.i=i;
  im[i].classList.add("on"); if(ds[i])ds[i].classList.add("on");
}
gal.addEventListener("click",function(e){
  var sl=e.target.closest(".slider"); if(!sl)return;
  var ar=e.target.closest(".arr");
  if(ar){go(sl,ar.classList.contains("next")?1:-1);return}
  var p=PRODUCTS[+sl.closest(".prod").dataset.p];
  openLb(p.images.slice(0,3),+sl.dataset.i);
});

// Lightbox (foto ampliada)
var lb=document.getElementById("lb"),lbi=lb.querySelector("img"),L={a:[],i:0};
function lbShow(d){L.i=(L.i+d+L.a.length)%L.a.length;lbi.src=L.a[L.i];lb.classList.toggle("single",L.a.length<2)}
function openLb(a,i){L.a=a;L.i=i;lbShow(0);lb.hidden=false;document.body.style.overflow="hidden"}
function lbClose(){lb.hidden=true;document.body.style.overflow=""}
lb.addEventListener("click",function(e){
  if(e.target.closest(".next"))lbShow(1);
  else if(e.target.closest(".prev"))lbShow(-1);
  else if(e.target!==lbi)lbClose();
});
document.addEventListener("keydown",function(e){
  if(lb.hidden)return;
  if(e.key==="Escape")lbClose();
  if(e.key==="ArrowRight")lbShow(1);
  if(e.key==="ArrowLeft")lbShow(-1);
});

render("Todos");

// Menu mobile (hambúrguer)
var burger=document.querySelector(".burger"),menu=document.querySelector(".menu");
burger.addEventListener("click",function(){var o=menu.classList.toggle("open");burger.setAttribute("aria-expanded",o)});
menu.addEventListener("click",function(e){if(e.target.closest("a")){menu.classList.remove("open");burger.setAttribute("aria-expanded","false")}});

// Deslizar o dedo para trocar de foto (celular)
var tx=null;
function swipe(el,fn){
  el.addEventListener("touchstart",function(e){tx=e.touches[0].clientX},{passive:true});
  el.addEventListener("touchend",function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>40)fn(e,dx>0?-1:1)});
}
swipe(gal,function(e,d){var sl=e.target.closest(".slider");if(sl&&sl.querySelectorAll("img").length>1)go(sl,d)});
swipe(lb,function(e,d){if(L.a.length>1)lbShow(d)});
