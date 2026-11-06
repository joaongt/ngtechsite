const filters=document.querySelectorAll('[data-filter]');
filters.forEach(button=>button.addEventListener('click',()=>{filters.forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active));});document.querySelectorAll('[data-category]').forEach(project=>{project.hidden=button.dataset.filter!=='all'&&project.dataset.category!==button.dataset.filter;});}));
// Animate only when supported; all content stays visible without JavaScript.
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver' in window&&!motionPreference.matches){
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}
 }),{threshold:0.08});
 const revealElements=document.querySelectorAll('.section-heading,.services article,.phase-card,.project,.steps>div,.about,.forms-entry,.closing');
 revealElements.forEach(element=>{element.classList.add('reveal');revealObserver.observe(element);});
 motionPreference.addEventListener('change',event=>{if(event.matches){revealObserver.disconnect();revealElements.forEach(element=>element.classList.add('is-visible'));}});
}

const menuToggle=document.querySelector('.menu-toggle');const mainNav=document.querySelector('#main-nav');menuToggle.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';menuToggle.setAttribute('aria-expanded',String(open));mainNav.classList.toggle('open',open);});document.querySelectorAll('#main-nav a').forEach(a=>{if(new URL(a.href).pathname===location.pathname)a.setAttribute('aria-current','page');});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mainNav.classList.contains('open')){mainNav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.focus();}});
