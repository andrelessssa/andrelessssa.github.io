// ===== CONTEÚDO DOS TOASTS =====
const toastContent = {
  "why-hire": {
    title: "Por que contratar o André",
    text: "Combina disciplina militar, 9 anos de experiência em atendimento e infraestrutura, com formação recém-concluída em ADS e uso prático de Java/Spring/Angular no dia a dia da ARSAL. Já entrega features full stack em produção — não está começando do zero."
  },
  "exp-arsal": {
    title: "Destaque ARSAL",
    text: "Trabalha com upload híbrido de arquivos e streaming nativo de vídeo .mp4 — sinal de domínio de fluxos complexos, não só CRUD básico."
  },
  "exp-smartphone": {
    title: "9 anos de bagagem técnica",
    text: "Quase uma década resolvendo problemas reais de hardware, redes e segurança da informação — uma base sólida que poucos devs juniores trazem."
  },
  "exp-comercial": {
    title: "Soft skills que importam",
    text: "Experiência comercial trouxe negociação e comunicação com não-técnicos; o serviço militar trouxe disciplina e trabalho sob pressão — combinação rara em times de desenvolvimento."
  },
  "stack-backend": {
    title: "Backend em produção",
    text: "Cria APIs REST seguras com Spring Security, mapeamento ORM via JPA/Hibernate e tratamento de exceções com @ControllerAdvice ."
  },
  "stack-frontend": {
    title: "Frontend que conversa com o backend",
    text: "Domina o ciclo de vida de componentes Angular, consumo de APIs com HttpClient/RxJS e data binding com *ngFor, *ngIf e [(ngModel)]."
  },
  "stack-db": {
    title: "Confortável com SQL",
    text: "Trabalha tanto com SQL Server quanto PostgreSQL em ambiente corporativo, otimizando consultas e mantendo bases evolutivas."
  },
  "stack-praticas": {
    title: "Pensa em manutenção",
    text: "Usa DTOs/Records e encapsulamento — escreve código pensando em quem vai dar manutenção depois, não só em fazer funcionar hoje."
  }
};

const toast = document.getElementById('toast');
const toastBody = document.getElementById('toast-body');
const toastClose = document.getElementById('toast-close');
let toastTimer = null;

function showToast(key){
  const data = toastContent[key];
  if(!data) return;
  toastBody.innerHTML = `<strong>${data.title}</strong>${data.text}`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), 6500);
}

toastClose.addEventListener('click', ()=> toast.classList.remove('show'));

document.querySelectorAll('[data-toast]').forEach(el=>{
  el.addEventListener('click', (e)=>{
    // Evita disparar toast duplicado quando o card de experiência já expande
    showToast(el.getAttribute('data-toast'));
  });
});

// ===== ACORDEAO DE EXPERIENCIA =====
document.querySelectorAll('.exp-card').forEach(card=>{
  const head = card.querySelector('.exp-head');
  const body = card.querySelector('.exp-body');

  function toggle(){
    const isOpen = card.classList.contains('is-open');
    if(isOpen){
      card.classList.remove('is-open');
      body.style.maxHeight = '0px';
      head.setAttribute('aria-expanded','false');
    } else {
      card.classList.add('is-open');
      body.style.maxHeight = body.scrollHeight + 'px';
      head.setAttribute('aria-expanded','true');
    }
  }

  head.addEventListener('click', toggle);
  head.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      toggle();
    }
  });
});

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
},{ threshold: 0.12 });
revealEls.forEach(el=> observer.observe(el));
