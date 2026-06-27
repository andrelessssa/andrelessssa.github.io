/* ============================================================
   DADOS — ACADEMIA (treino do PDF: A, B, C, D, E)
   Seg=A · Ter=B · Qua=C · Qui=D · Sex=E
============================================================ */
const PLANO = [
  {
    id:'seg', dow:'Segunda-feira', letra:'A', grupo:'Peito e Tríceps', color:'a',
    aquecimento:'Supino inclinado com halter — carga baixa, 15 a 20 movimentos. Depois pode adicionar um drop set.',
    exercicios:[
      { nome:'Supino reto na máquina', equip:'Máquina', series:4, reps:'30-25-20-15kg', descanso:90,
        obs:'Drop set de 3-4 quedas. Comece com 30kg e vá até a falha. Tire algumas anilhas, espere ~10s e continue até a falha de novo (30-25-20-15).', tech:'Drop set' },
      { nome:'Abdominal', equip:'Solo / banco', series:3, reps:'15 a 20', descanso:45, obs:'' },
      { nome:'Crucifixo na polia baixa', equip:'Polia baixa', series:5, reps:'1 aquecimento + 2x(15-20) + 2-3x(8-12)', descanso:75,
        obs:'1 série de aquecimento, depois 2 séries de adaptação (15-20 reps), depois 2 a 3 séries de carga máxima (8-12 reps).', tech:'Pirâmide' },
      { nome:'Prancha', equip:'Solo', series:1, reps:'1 a 2 min', descanso:60, obs:'' },
      { nome:'Tríceps francês na polia', equip:'Polia', series:3, reps:'8 a 12 (já no máximo)', descanso:60, obs:'' },
      { nome:'Tríceps corda inclinado', equip:'Polia corda', series:3, reps:'8 a 12 (já no máximo)', descanso:60, obs:'' },
      { nome:'Tríceps testa na polia', equip:'Polia', series:3, reps:'8 a 12 (já no máximo)', descanso:60, obs:'' },
    ]
  },
  {
    id:'ter', dow:'Terça-feira', letra:'B', grupo:'Quadríceps', color:'b',
    aquecimento:'Agachamento sumô — carga leve, 15 a 20 movimentos antes de intensificar.',
    exercicios:[
      { nome:'Leg press 45°', equip:'Leg press', series:4, reps:'Pirâmide (sobe carga, desce reps)', descanso:90, obs:'Técnica de pirâmide.', tech:'Pirâmide' },
      { nome:'Cadeira extensora', equip:'Máquina', series:4, reps:'Pirâmide (sobe carga, desce reps)', descanso:75, obs:'Técnica de pirâmide.', tech:'Pirâmide' },
      { nome:'Cadeira flexora', equip:'Máquina', series:3, reps:'8 a 12', descanso:75, obs:'' },
      { nome:'Panturrilha', equip:'Máquina / Smith', series:3, reps:'8 a 12', descanso:45, obs:'' },
    ]
  },
  {
    id:'qua', dow:'Quarta-feira', letra:'C', grupo:'Costas e Bíceps', color:'c',
    aquecimento:'Pull down — 3 séries de 8 a 12, carga leve para ativar antes da puxada pesada.',
    exercicios:[
      { nome:'Puxada com triângulo', equip:'Polia triângulo', series:3, reps:'8 a 12', descanso:90, obs:'' },
      { nome:'Remada aberta pronada (barra)', equip:'Barra', series:3, reps:'8 a 12', descanso:90, obs:'' },
      { nome:'Remada unilateral (serrote)', equip:'Haltere', series:5, reps:'8 a 12', descanso:75, obs:'4 a 5 séries.' },
      { nome:'Remada máquina unilateral', equip:'Máquina', series:5, reps:'8 a 12', descanso:75, obs:'4 a 5 séries.' },
      { nome:'Rosca Scott barra W', equip:'Banco Scott + barra W', series:3, reps:'12', descanso:75, obs:'' },
      { nome:'Rosca martelo cruzada + rosca concentrada', equip:'Halteres', series:5, reps:'12', descanso:60, obs:'4 a 5 séries, bisset martelo cruzada seguido de concentrada.' },
    ]
  },
  {
    id:'qui', dow:'Quinta-feira', letra:'D', grupo:'Ombro e Posterior de Coxa', color:'d',
    aquecimento:'Remada em pé com carga leve para aquecer ombros antes da elevação lateral.',
    exercicios:[
      { nome:'Remada em pé', equip:'Barra / Halteres', series:5, reps:'12', descanso:75, obs:'4 a 5 séries.' },
      { nome:'Elevação lateral', equip:'Halteres', series:5, reps:'12', descanso:60, obs:'4 a 5 séries.' },
      { nome:'Desenvolvimento na máquina', equip:'Máquina', series:5, reps:'12', descanso:75, obs:'4 a 5 séries.' },
      { nome:'Elevação Y', equip:'Halteres', series:5, reps:'12', descanso:60, obs:'4 a 5 séries.' },
      { nome:'Abdutora', equip:'Máquina', series:5, reps:'12', descanso:60, obs:'4 a 5 séries.' },
    ]
  },
  {
    id:'sex', dow:'Sexta-feira', letra:'E', grupo:'Treino Misto (um de cada)', color:'e',
    aquecimento:'Remada fechada triângulo com carga leve para abrir o treino misto.',
    exercicios:[
      { nome:'Remada fechada triângulo', equip:'Polia triângulo', series:5, reps:'12', descanso:75, obs:'4 a 5 séries.' },
      { nome:'Supino declinado', equip:'Banco declinado + barra/halteres', series:5, reps:'12', descanso:90, obs:'4 a 5 séries.' },
      { nome:'Tríceps na barra W', equip:'Barra W', series:5, reps:'12', descanso:60, obs:'4 a 5 séries.' },
      { nome:'Bíceps na barra W em pé', equip:'Barra W', series:5, reps:'12', descanso:60, obs:'4 a 5 séries.' },
      { nome:'Abdominal declinado', equip:'Banco declinado', series:5, reps:'12', descanso:45, obs:'4 a 5 séries.' },
    ]
  },
];

/* ============================================================
   STORAGE
============================================================ */
function todayKey(){ return new Date().toISOString().slice(0,10); }

function loadProgress(key){
  try{ return JSON.parse(localStorage.getItem(key)) || {}; }
  catch{ return {}; }
}
function saveProgress(key, p){ localStorage.setItem(key, JSON.stringify(p)); }

const PROGRESS_KEY = 'andre_gym_progress_v3';
const STREAK_KEY = 'andre_gym_streak_v3';

let progress = loadProgress(PROGRESS_KEY);
let streak = loadStreak(STREAK_KEY);

function loadStreak(k){
  try{ return JSON.parse(localStorage.getItem(k)) || {count:0,lastDate:null}; }
  catch{ return {count:0,lastDate:null}; }
}
function saveStreakData(){ localStorage.setItem(STREAK_KEY, JSON.stringify(streak)); }

function getDayProgress(dayId){
  const key = todayKey();
  const day = PLANO.find(d=>d.id===dayId);
  if(!progress[dayId] || progress[dayId].date !== key || progress[dayId].done.length !== day.exercicios.length){
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
  saveProgress(PROGRESS_KEY, progress);
  if(isDayComplete(dayId)) updateStreak();
}

function updateStreak(){
  const key = todayKey();
  if(streak.lastDate === key) return;
  const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
  streak.count = streak.lastDate === yesterday ? streak.count+1 : 1;
  streak.lastDate = key;
  saveStreakData();
}

/* ============================================================
   GOLDEN RULES (fixo, modo academia)
============================================================ */
function renderGoldenRules(){
  document.getElementById('golden-rules-block').innerHTML = `
    <h4>Regras de ouro — academia</h4>
    <ul>
      <li><strong>Aquecimento:</strong> sempre 1 série leve (15-20 reps) antes de qualquer série pesada.</li>
      <li><strong>Drop sets:</strong> sem descanso entre as quedas de carga — só descansa ao fim do conjunto completo.</li>
      <li><strong>Pirâmide:</strong> sobe a carga e desce as repetições a cada série.</li>
      <li><strong>Carga máxima:</strong> nas séries de 8-12, vá até a falha controlada.</li>
    </ul>`;
}

/* ============================================================
   TOAST
============================================================ */
function toast(msg){
  const w = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className='toast'; el.textContent=msg;
  w.appendChild(el);
  setTimeout(()=>el.remove(), 3200);
}

function fmtClock(s){
  return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
}

/* ============================================================
   RENDER HOME
============================================================ */
function renderHome(){
  const grid = document.getElementById('week-grid');
  grid.innerHTML='';
  let totalComplete=0;

  PLANO.forEach(day=>{
    const dp = getDayProgress(day.id);
    const done = dp.done.filter(Boolean).length;
    const complete = isDayComplete(day.id);
    if(complete) totalComplete++;

    const card = document.createElement('button');
    card.className='day-card'+(complete?' is-complete':'');
    card.dataset.color = day.color;

    card.innerHTML=`
      <div class="bar"></div>
      <div class="done-check">✓</div>
      <div class="dow">${day.dow} · Treino ${day.letra}</div>
      <h3>${day.grupo}</h3>
      <div class="ex-count">${done}/${dp.done.length} exercícios</div>
    `;
    card.addEventListener('click',()=>openDay(day.id));
    grid.appendChild(card);
  });

  document.getElementById('week-fill').style.width = Math.round(totalComplete/PLANO.length*100)+'%';
  document.getElementById('week-val').textContent = `${totalComplete}/${PLANO.length}`;
  document.getElementById('streak-val').textContent = streak.count;
}

/* ============================================================
   NAVEGAÇÃO
============================================================ */
let currentDayId=null;
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}
function openDay(dayId){ currentDayId=dayId; renderDay(); showView('view-day'); }
document.getElementById('btn-back-home').addEventListener('click',()=>{ renderHome(); showView('view-home'); });

/* ============================================================
   RENDER DIA
============================================================ */
function renderDay(){
  const day = PLANO.find(d=>d.id===currentDayId);
  const dp = getDayProgress(currentDayId);
  const done = dp.done.filter(Boolean).length;

  document.getElementById('day-title').textContent = `${day.letra} · ${day.grupo}`;
  document.getElementById('day-sub').textContent = day.dow;
  document.getElementById('day-progress-mini').textContent = `${done}/${day.exercicios.length}`;

  const list = document.getElementById('exercise-list');
  list.innerHTML='';

  if(day.aquecimento){
    list.insertAdjacentHTML('beforeend',`
      <div class="warmup-card panel-surface">
        <div class="wlabel">⚠️ Aquecimento obrigatório</div>
        <p>${day.aquecimento}</p>
      </div>
    `);
  }

  day.exercicios.forEach((ex,idx)=>{
    const isDone = dp.done[idx];
    const card = document.createElement('div');
    card.className='ex-card'+(isDone?' is-done':'');

    const srLabel = `${ex.series}x ${ex.reps}`;

    card.innerHTML=`
      <div class="ex-card-top">
        <div class="ex-num">${isDone?'✓':idx+1}</div>
        <div class="ex-info">
          <div class="ex-name" data-search="${encodeURIComponent(ex.nome+' exercício como fazer')}">
            ${ex.nome} <span class="search-ic">🔍</span>
          </div>
          <div class="ex-meta">
            <span class="grp">${ex.equip}</span>
            <span class="sr">${srLabel}</span>
            ${ex.descanso>0 ? `<span class="rest-tag">⏱ ${ex.descanso}s descanso</span>` : ''}
          </div>
          ${ex.tech ? `<div class="tech-badge">${ex.tech}</div>` : ''}
          ${ex.obs ? `<div style="margin-top:6px;font-size:.8rem;color:var(--txt-dim);line-height:1.45;">${ex.obs}</div>` : ''}
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

  list.querySelectorAll('.ex-name').forEach(el=>{
    el.addEventListener('click',()=>window.open(`https://www.google.com/search?q=${el.dataset.search}`,'_blank','noopener'));
  });
  list.querySelectorAll('.start-btn').forEach(btn=>{
    btn.addEventListener('click',()=>openTimer(currentDayId, parseInt(btn.dataset.idx,10)));
  });
  list.querySelectorAll('.undo-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      markExercise(currentDayId, parseInt(btn.dataset.idx,10), false);
      renderDay();
      toast('Exercício desmarcado — pode repetir!');
    });
  });
}

/* ============================================================
   TIMER
============================================================ */
const RING_CIRC = 2*Math.PI*90;
let timerState = { dayId:null,idx:null,phase:'work',seconds:0,restTotal:0,interval:null,paused:false };

function openTimer(dayId,idx){
  const day = PLANO.find(d=>d.id===dayId);
  const ex = day.exercicios[idx];
  const srLabel = `${ex.series}x ${ex.reps}`;

  const totalSeries = ex.series || 3;
  timerState = {dayId,idx,phase:'work',seconds:0,restTotal:ex.descanso||60,interval:null,paused:false,serieAtual:1,totalSeries};
  document.getElementById('timer-ex-tag').textContent = `Exercício ${idx+1} de ${day.exercicios.length}`;
  document.getElementById('timer-exname').textContent = ex.nome;
  document.getElementById('timer-target').textContent = `${srLabel}`;
  setPhaseWork();
  document.getElementById('timer-screen').classList.add('open');
  startInterval();
}

function setPhaseWork(){
  timerState.phase='work'; timerState.seconds=0;
  const lbl = document.getElementById('timer-phase-label');
  lbl.className='timer-phase-label work'; lbl.textContent='Em execução — cronometrando';
  const sc=document.getElementById('serie-counter'); if(sc){sc.textContent=`SÉRIE ${timerState.serieAtual} DE ${timerState.totalSeries}`;sc.className='serie-counter work';}
  document.getElementById('ring-fg').className='ring-fg work';
  document.getElementById('ring-fg').style.strokeDasharray=RING_CIRC;
  document.getElementById('ring-fg').style.strokeDashoffset=0;
  document.getElementById('timer-sub').textContent='tempo da série';
  document.getElementById('timer-clock').classList.remove('pulse');
  document.getElementById('btn-main-action').textContent='Concluir série';
  document.getElementById('btn-main-action').className='tbtn primary-fire';
  document.getElementById('btn-skip').textContent='pular para o descanso →';
  renderClock();
}

function setPhaseRest(){
  timerState.phase='rest'; timerState.seconds=timerState.restTotal;
  const lbl = document.getElementById('timer-phase-label');
  lbl.className='timer-phase-label rest'; lbl.textContent='Descanso — recupere o fôlego';
  const scr=document.getElementById('serie-counter'); if(scr){scr.textContent=`SÉRIE ${timerState.serieAtual} DE ${timerState.totalSeries}`;scr.className='serie-counter rest';}
  document.getElementById('ring-fg').className='ring-fg rest';
  document.getElementById('timer-sub').textContent='descanso restante';
  document.getElementById('timer-clock').classList.add('pulse');
  document.getElementById('btn-main-action').textContent='Pular descanso';
  document.getElementById('btn-main-action').className='tbtn primary-rest';
  document.getElementById('btn-skip').textContent='marcar como feito →';
  renderClock();
}

function renderClock(){
  document.getElementById('timer-clock').textContent=fmtClock(timerState.seconds);
  if(timerState.phase==='rest'){
    document.getElementById('ring-fg').style.strokeDashoffset = RING_CIRC*(1-timerState.seconds/timerState.restTotal);
  } else {
    document.getElementById('ring-fg').style.strokeDashoffset = RING_CIRC*(1-Math.min(timerState.seconds/60,1));
  }
}

function startInterval(){
  clearInterval(timerState.interval);
  timerState.interval=setInterval(()=>{
    if(timerState.paused) return;
    if(timerState.phase==='work'){ timerState.seconds++; }
    else {
      timerState.seconds--;
      if(timerState.seconds<=0){ timerState.seconds=0; renderClock(); finishRest(); return; }
    }
    renderClock();
  },1000);
}

document.getElementById('btn-pause').addEventListener('click',function(){
  timerState.paused=!timerState.paused;
  this.textContent=timerState.paused?'Retomar':'Pausar';
});
document.getElementById('btn-main-action').addEventListener('click',()=>{
  timerState.phase==='work' ? setPhaseRest() : finishRest();
});
document.getElementById('btn-skip').addEventListener('click',()=>{
  timerState.phase==='work' ? setPhaseRest() : finishRest();
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

  markExercise(timerState.dayId,timerState.idx,true);
  closeTimer();
  const day = PLANO.find(d=>d.id===timerState.dayId);
  renderDay();
  toast(`💪 ${day.exercicios[timerState.idx].nome} concluído! Todas as ${timerState.totalSeries} séries feitas.`);
  if(isDayComplete(timerState.dayId)) setTimeout(()=>showCompleteModal(day),400);
}
function closeTimer(){
  clearInterval(timerState.interval);
  document.getElementById('timer-screen').classList.remove('open');
}
document.getElementById('btn-back-day').addEventListener('click',()=>{ clearInterval(timerState.interval); closeTimer(); renderDay(); });

/* ============================================================
   COMPLETION MODAL
============================================================ */
function showCompleteModal(day){
  document.getElementById('complete-title').textContent='Treino concluído! 🔥';
  document.getElementById('complete-text').textContent=
    `Você fechou o treino ${day.letra} de ${day.dow.toLowerCase()} — ${day.grupo}. Sequência atual: ${streak.count} dia(s). Hidrate, coma sua proteína e descanse.`;
  document.getElementById('complete-overlay').classList.add('open');
}
document.getElementById('complete-confirm').addEventListener('click',()=>{
  document.getElementById('complete-overlay').classList.remove('open');
  renderHome(); showView('view-home');
});

/* ============================================================
   INIT
============================================================ */
renderGoldenRules();
renderHome();
showView('view-home');
