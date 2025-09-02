// script.js - carrito con localStorage, cantidades y total
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

const state = { cart: JSON.parse(localStorage.getItem('cart')||'[]') };

function currency(n){ return 'S/ ' + Number(n).toLocaleString('es-PE'); }

function save(){ localStorage.setItem('cart', JSON.stringify(state.cart)); renderCart(); updateCount(); }

function updateCount(){ const count = state.cart.reduce((s,i)=>s+i.qty,0); $$('#cart-count').forEach(el=>el.textContent = count); }

function renderCart(){
  const list = $('#cart-items'); if(!list) return; list.innerHTML = ''; let total = 0;
  state.cart.forEach((it, idx)=>{
    total += it.price * it.qty;
    const div = document.createElement('div'); div.className = 'cart-item';
    div.innerHTML = `
      <img src="${it.img}" alt="${it.name}">
      <div class="info">
        <div class="name">${it.name}</div>
        <div class="price">${currency(it.price)} x ${it.qty}</div>
      </div>
      <div class="qty-controls">
        <button data-action="dec" data-i="${idx}">-</button>
        <button data-action="inc" data-i="${idx}">+</button>
        <button data-action="rm" data-i="${idx}">Eliminar</button>
      </div>`;
    list.appendChild(div);
  });
  const totalEl = $('#cart-total'); if(totalEl) totalEl.textContent = currency(total);
}

function addItem(obj){
  const found = state.cart.find(i=>i.sku === obj.sku);
  if(found) found.qty += 1;
  else state.cart.push({...obj, qty:1});
  showToast(`${obj.name} agregado`);
  flyToCart(obj.img);
  save();
}

function changeQty(i, delta){
  const it = state.cart[i];
  if(!it) return;
  it.qty += delta;
  if(it.qty <=0) state.cart.splice(i,1);
  save();
}

function removeIndex(i){ state.cart.splice(i,1); save(); }

function flyToCart(imgUrl){
  const img = document.createElement('img'); img.src = imgUrl; img.className = 'fly';
  img.style.position='fixed'; img.style.left='50%'; img.style.top='50%'; img.style.width='200px'; img.style.transform='translate(-50%,-50%)';
  img.style.transition='transform .6s cubic-bezier(.2,.8,.2,1),opacity .6s ease'; document.body.appendChild(img);
  requestAnimationFrame(()=>{ img.style.transform='translate(260px,-360px) scale(.08)'; img.style.opacity='0.2'; });
  setTimeout(()=> img.remove(),650);
}

let toastTimer;
function showToast(text){
  const t = $('#toast'); if(!t) return; t.textContent = text; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(()=> t.classList.remove('show'),1700);
}

document.addEventListener('click',(e)=>{
  const btn = e.target.closest('.add');
  if(btn){
    const sku = btn.dataset.sku;
    const obj = { sku, name: btn.dataset.name, price: Number(btn.dataset.price), img: btn.dataset.img };
    addItem(obj);
  }
  if(e.target.id === 'cart-btn' || e.target.closest('#cart-btn') || e.target.id === 'cart-toggle') openCart();
  if(e.target.id === 'close-cart') closeCart();
  if(e.target.id === 'checkout') alert('Simulación: total ' + ($('#cart-total')?$('#cart-total').textContent:''));
  const action = e.target.dataset.action;
  if(action){
    const i = Number(e.target.dataset.i);
    if(action === 'dec') changeQty(i, -1);
    if(action === 'inc') changeQty(i, +1);
    if(action === 'rm') removeIndex(i);
  }
});

function openCart(){ $('#cart-drawer').classList.add('open'); $('#cart-drawer').setAttribute('aria-hidden','false'); renderCart(); }
function closeCart(){ $('#cart-drawer').classList.remove('open'); $('#cart-drawer').setAttribute('aria-hidden','true'); }

document.addEventListener('DOMContentLoaded', ()=>{ renderCart(); updateCount(); const form = $('#contact-form'); if(form) form.addEventListener('submit',(ev)=>{ ev.preventDefault(); showToast('Mensaje enviado, gracias!'); form.reset(); }); });
