/* ============================================================
   DADOS DO TREINO (extraídos da planilha da Ana)
============================================================ */
const PLANO = [
  {
    id:'seg', dow:'Segunda-feira', grupo:'Ênfase em Glúteos e Abdómen', color:'gluteo',
    exercicios:[
      { nome:'Elevação Pélvica', equip:'Halteres + Mini-band', series:4, reps:'12 a 15 (isometria 2s)', descanso:90 },
      { nome:'Agachamento Sumô', equip:'Haltere pesado', series:4, reps:'12 (máxima amplitude)', descanso:90 },
      { nome:'Abdução de Coxa Deitada', equip:'Mini-band de tecido', series:3, reps:'20 (cadência lenta)', descanso:45 },
      { nome:'Abdominal Supra + Prancha', equip:'Peso Corporal', series:4, reps:'20 + 45s prancha', descanso:60 },
    ]
  },
  {
    id:'ter', dow:'Terça-feira', grupo:'Costas, Ombros e Tríceps — Linha e Postura', color:'costas',
    exercicios:[
      { nome:'Remada Curvada', equip:'Halteres ou Elástico', series:4, reps:'12', descanso:90 },
      { nome:'Elevação Lateral', equip:'Halteres ou Elástico', series:4, reps:'15 (foco em estética)', descanso:60 },
      { nome:'Remada Sentado', equip:'Elástico de pedal (amarelo)', series:3, reps:'15', descanso:60 },
      { nome:'Tríceps no Elástico', equip:'Elástico preso no alto', series:4, reps:'12', descanso:60 },
    ]
  },
  {
    id:'qua', dow:'Quarta-feira', grupo:'Quadríceps e Posteriores — Pernas Completas', color:'pernas',
    exercicios:[
      { nome:'Agachamento Goblet', equip:'Haltere pesado à frente', series:4, reps:'10 a 12', descanso:120 },
      { nome:'Stiff', equip:'Halteres', series:4, reps:'10 (alongar posterior)', descanso:90 },
      { nome:'Passada / Avanço', equip:'Halteres nas mãos', series:3, reps:'12 passos totais', descanso:90 },
      { nome:'Gêmeos em Pé (Panturrilha)', equip:'Halteres nas mãos', series:4, reps:'20', descanso:60 },
    ]
  },
  {
    id:'qui', dow:'Quinta-feira', grupo:'Isolados de Glúteo e Core — Lapidação', color:'isolado',
    exercicios:[
      { nome:'Agachamento Búlgaro', equip:'Halteres (pé no sofá)', series:3, reps:'10 cada perna', descanso:90 },
      { nome:'Coice de Glúteo em Pé', equip:'Elástico extensor no pé', series:4, reps:'12 cada perna', descanso:60 },
      { nome:'Monster Walk (Passada Lateral)', equip:'Mini-band nos joelhos', series:3, reps:'20 passos totais', descanso:60 },
      { nome:'Abdominal Infra', equip:'Peso Corporal', series:4, reps:'15 (controle lombar)', descanso:60 },
    ]
  },
  {
    id:'sex', dow:'Sexta-feira', grupo:'Circuito Queima-Gordura e Tonificação', color:'circuito',
    exercicios:[
      { nome:'Flexão de Braço (com joelhos)', equip:'Apoios de solo', series:3, reps:'máximo (até à falha)', descanso:90 },
      { nome:'Desenvolvimento de Ombros', equip:'Halteres', series:3, reps:'12', descanso:60 },
      { nome:'Rosca Martelo (Bíceps)', equip:'Halteres', series:3, reps:'12', descanso:60 },
      { nome:'Polichinelos / Saltos', equip:'Peso Corporal', series:4, reps:'1 minuto contínuo', descanso:45 },
    ]
  },
];

/* ============================================================
   STORAGE
============================================================ */
const LS_PROGRESS = 'ana_treino_progress_v1';
const LS_STREAK   = 'ana_treino_streak_v1';

function todayKey(){
  return new Date().toISOString().slice(0,10);
}
function loadProgress(){
  try{ return JSON.parse(localStorage.getItem(LS_PROGRESS)) || {}; }
  catch{ return {}; }
}
function saveProgress(p){ localStorage.setItem(LS_PROGRESS, JSON.stringify(p)); }

function loadStreak(){
  try{ return JSON.parse(localStorage.getItem(LS_STREAK)) || { count:0, lastDate:null }; }
  catch{ return { count:0, lastDate:null }; }
}
function saveStreak(s){ localStorage.setItem(LS_STREAK, JSON.stringify(s)); }

let progress = loadProgress();
let streak = loadStreak();

function getDayProgress(dayId){
  const key = todayKey();
  if(!progress[dayId] || progress[dayId].date !== key){
    const day = PLANO.find(d=>d.id===dayId);
    progress[dayId] = { date:key, done: day.exercicios.map(()=>false) };
  }
  return progress[dayId];
}

function isDayComplete(dayId){
  const dp = getDayProgress(dayId);
  return dp.done.length>0 && dp.done.every(Boolean);
}

function markExercise(dayId, idx, value){
  const dp = getDayProgress(dayId);
  dp.done[idx] = value;
  progress[dayId] = dp;
  saveProgress(progress);
  if(isDayComplete(dayId)) updateStreak();
}

function updateStreak(){
  const key = todayKey();
  if(streak.lastDate === key) return;
  const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
  if(streak.lastDate === yesterday){
    streak.count += 1;
  } else {
    streak.count = 1;
  }
  streak.lastDate = key;
  saveStreak(streak);
}

/* ============================================================
   TOAST
============================================================ */
function toast(msg){
  const w = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className='toast';
  el.textContent = msg;
  w.appendChild(el);
  setTimeout(()=>el.remove(), 3200);
}

/* ============================================================
   RENDER HOME
============================================================ */
function fmtClock(totalSec){
  const m = Math.floor(totalSec/60).toString().padStart(2,'0');
  const s = Math.floor(totalSec%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function renderHome(){
  const grid = document.getElementById('week-grid');
  grid.innerHTML='';
  let totalComplete = 0;

  PLANO.forEach(day=>{
    const dp = getDayProgress(day.id);
    const done = dp.done.filter(Boolean).length;
    const total = dp.done.length;
    const complete = isDayComplete(day.id);
    if(complete) totalComplete++;

    const card = document.createElement('button');
    card.className = 'day-card' + (complete ? ' is-complete' : '');
    card.dataset.color = day.color;
    card.innerHTML = `
      <div class="bar"></div>
      <div class="done-check">✓</div>
      <div class="dow">${day.dow}</div>
      <h3>${day.grupo}</h3>
      <div class="ex-count">${done}/${total} exercícios · ${day.exercicios.length} no total</div>
    `;
    card.addEventListener('click', ()=> openDay(day.id));
    grid.appendChild(card);
  });

  document.getElementById('week-fill').style.width = Math.round(totalComplete/PLANO.length*100)+'%';
  document.getElementById('week-val').textContent = `${totalComplete}/${PLANO.length}`;
  document.getElementById('streak-val').textContent = streak.count;
}

/* ============================================================
   NAVEGAÇÃO ENTRE VIEWS
============================================================ */
let currentDayId = null;

function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

function openDay(dayId){
  currentDayId = dayId;
  renderDay();
  showView('view-day');
}

document.getElementById('btn-back-home').addEventListener('click', ()=>{
  renderHome();
  showView('view-home');
});

/* ============================================================
   RENDER DIA
============================================================ */
function renderDay(){
  const day = PLANO.find(d=>d.id===currentDayId);
  const dp = getDayProgress(currentDayId);

  document.getElementById('day-title').textContent = day.grupo;
  document.getElementById('day-sub').textContent = day.dow;

  const done = dp.done.filter(Boolean).length;
  document.getElementById('day-progress-mini').textContent = `${done}/${day.exercicios.length}`;

  const list = document.getElementById('exercise-list');
  list.innerHTML = '';

  day.exercicios.forEach((ex, idx)=>{
    const isDone = dp.done[idx];
    const card = document.createElement('div');
    card.className = 'ex-card' + (isDone ? ' is-done' : '');
    card.innerHTML = `
      <div class="ex-card-top">
        <div class="ex-num">${isDone ? '✓' : idx+1}</div>
        <div class="ex-info">
          <div class="ex-name" data-search="${encodeURIComponent(ex.nome + ' exercício como fazer')}">
            ${ex.nome} <span class="search-ic">🔍</span>
          </div>
          <div class="ex-meta">
            <span class="eq">${ex.equip}</span>
            <span class="sr">${ex.series}x ${ex.reps}</span>
            <span class="rest-tag">⏱ ${ex.descanso}s descanso</span>
          </div>
        </div>
        <div class="ex-action">
          ${isDone
            ? `<button class="undo-btn" data-idx="${idx}">↩ Desfazer</button>`
            : `<button class="start-btn" data-idx="${idx}">Iniciar</button>`}
        </div>
      </div>
    `;
    list.appendChild(card);
  });

  // bind: abrir pesquisa no google
  list.querySelectorAll('.ex-name').forEach(el=>{
    el.addEventListener('click', ()=>{
      const q = el.dataset.search;
      window.open(`https://www.google.com/search?q=${q}`, '_blank', 'noopener');
    });
  });

  // bind: iniciar exercício
  list.querySelectorAll('.start-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = parseInt(btn.dataset.idx, 10);
      openTimer(currentDayId, idx);
    });
  });

  // bind: desfazer exercício
  list.querySelectorAll('.undo-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      markExercise(currentDayId, parseInt(btn.dataset.idx, 10), false);
      renderDay();
      toast('Exercício desmarcado — pode repetir!');
    });
  });
}

/* ============================================================
   TIMER
============================================================ */
const RING_CIRC = 2 * Math.PI * 90; // r=90

let timerState = {
  dayId:null, idx:null,
  phase:'work',
  seconds:0,
  restTotal:0,
  interval:null,
  paused:false,
};

function openTimer(dayId, idx){
  const day = PLANO.find(d=>d.id===dayId);
  const ex = day.exercicios[idx];

  const totalSeries = ex.series || 3;
  timerState = { dayId, idx, phase:'work', seconds:0, restTotal:ex.descanso, interval:null, paused:false, serieAtual:1, totalSeries };

  document.getElementById('timer-ex-tag').textContent = `Exercício ${idx+1} de ${day.exercicios.length}`;
  document.getElementById('timer-exname').textContent = ex.nome;
  document.getElementById('timer-target').textContent = `${ex.series}x séries · ${ex.reps} repetições`;

  setPhaseWork();
  document.getElementById('timer-screen').classList.add('open');
  startInterval();
}

function setPhaseWork(){
  timerState.phase='work';
  timerState.seconds=0;
  const label = document.getElementById('timer-phase-label');
  label.className='timer-phase-label work';
  label.textContent='Em execução — cronometrando';
  const sc = document.getElementById('serie-counter');
  if(sc){ sc.textContent=`SÉRIE ${timerState.serieAtual} DE ${timerState.totalSeries}`; sc.className='serie-counter work'; }
  document.getElementById('ring-fg').className='ring-fg work';
  document.getElementById('ring-fg').style.strokeDasharray = RING_CIRC;
  document.getElementById('ring-fg').style.strokeDashoffset = 0;
  document.getElementById('timer-sub').textContent='tempo da série';
  document.getElementById('timer-clock').classList.remove('pulse');
  document.getElementById('btn-main-action').textContent='Concluir série';
  document.getElementById('btn-main-action').className='tbtn primary-wine';
  document.getElementById('btn-pause').textContent='Pausar';
  document.getElementById('btn-skip').textContent='pular para o descanso →';
  renderClock();
}

function setPhaseRest(){
  timerState.phase='rest';
  timerState.seconds=timerState.restTotal;
  const label = document.getElementById('timer-phase-label');
  label.className='timer-phase-label rest';
  label.textContent='Descanso — recupere o fôlego';
  const scr = document.getElementById('serie-counter');
  if(scr){ scr.textContent=`SÉRIE ${timerState.serieAtual} DE ${timerState.totalSeries}`; scr.className='serie-counter rest'; }
  document.getElementById('ring-fg').className='ring-fg rest';
  document.getElementById('timer-sub').textContent='descanso restante';
  document.getElementById('timer-clock').classList.add('pulse');
  document.getElementById('btn-main-action').textContent='Pular descanso';
  document.getElementById('btn-main-action').className='tbtn primary-purple';
  document.getElementById('btn-pause').textContent='Pausar';
  document.getElementById('btn-skip').textContent='marcar como feito →';
  renderClock();
}

function renderClock(){
  document.getElementById('timer-clock').textContent = fmtClock(timerState.seconds);
  if(timerState.phase==='rest'){
    const pct = timerState.seconds / timerState.restTotal;
    const offset = RING_CIRC * (1-pct);
    document.getElementById('ring-fg').style.strokeDashoffset = offset;
  } else {
    const pct = Math.min(timerState.seconds/60, 1);
    document.getElementById('ring-fg').style.strokeDashoffset = RING_CIRC * (1-pct);
  }
}

function startInterval(){
  clearInterval(timerState.interval);
  timerState.interval = setInterval(()=>{
    if(timerState.paused) return;
    if(timerState.phase==='work'){
      timerState.seconds++;
    } else {
      timerState.seconds--;
      if(timerState.seconds<=0){
        timerState.seconds=0;
        renderClock();
        finishRest();
        return;
      }
    }
    renderClock();
  },1000);
}

document.getElementById('btn-pause').addEventListener('click', function(){
  timerState.paused = !timerState.paused;
  this.textContent = timerState.paused ? 'Retomar' : 'Pausar';
});

document.getElementById('btn-main-action').addEventListener('click', ()=>{
  if(timerState.phase==='work'){
    setPhaseRest();
  } else {
    finishRest();
  }
});

document.getElementById('btn-skip').addEventListener('click', ()=>{
  if(timerState.phase==='work'){
    setPhaseRest();
  } else {
    finishRest();
  }
});

function playBeep(){
  try{
    const audio = document.getElementById('beep-audio');
    audio.currentTime = 0;
    audio.play();
  } catch(e){}
}

function finishRest(){
  clearInterval(timerState.interval);
  playBeep();

  if(timerState.serieAtual < timerState.totalSeries){
    timerState.serieAtual++;
    toast(`✓ Série ${timerState.serieAtual - 1} concluída! Iniciando série ${timerState.serieAtual}…`);
    setPhaseWork();
    startInterval();
    return;
  }

  markExercise(timerState.dayId, timerState.idx, true);
  closeTimer();
  const day = PLANO.find(d=>d.id===timerState.dayId);
  renderDay();
  toast(`💪 ${day.exercicios[timerState.idx].nome} concluído! Todas as ${timerState.totalSeries} séries feitas.`);
  if(isDayComplete(timerState.dayId)){
    setTimeout(()=> showCompleteModal(day), 400);
  }
}

function closeTimer(){
  clearInterval(timerState.interval);
  document.getElementById('timer-screen').classList.remove('open');
}

document.getElementById('btn-back-day').addEventListener('click', ()=>{
  clearInterval(timerState.interval);
  closeTimer();
  renderDay();
});

/* ============================================================
   COMPLETION MODAL
============================================================ */
function showCompleteModal(day){
  document.getElementById('complete-title').textContent = 'Treino concluído!';
  document.getElementById('complete-text').textContent =
    `Você fechou o treino de ${day.dow.toLowerCase()} — ${day.grupo}. Sequência atual: ${streak.count} dia(s). Execução perfeita, mente conectada ao músculo.`;
  document.getElementById('complete-overlay').classList.add('open');
}
document.getElementById('complete-confirm').addEventListener('click', ()=>{
  document.getElementById('complete-overlay').classList.remove('open');
  renderHome();
  showView('view-home');
});

/* ============================================================
   INIT
============================================================ */
renderHome();
