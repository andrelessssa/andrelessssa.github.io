/* ============================================================
   DADOS — CASA
============================================================ */
const PLANO_CASA = [
  {
    id:'seg', dow:'Segunda-feira', grupo:'Peito, Ombros e Tríceps', color:'peito',
    exercicios:[
      { nome:'Flexão de Braço Avançada', equip:'Apoios de solo', series:4, reps:'10 a 15 (até à falha)', descanso:90 },
      { nome:'Supino Reto no Chão', equip:'Halteres pesados', series:4, reps:'8 a 12', descanso:90 },
      { nome:'Elevação Lateral', equip:'Halteres ou Elástico Extensor', series:4, reps:'12 a 15', descanso:60 },
      { nome:'Desenvolvimento de Ombros', equip:'Halteres', series:3, reps:'10', descanso:90 },
      { nome:'Tríceps Coice', equip:'Halteres', series:3, reps:'12', descanso:60 },
      { nome:'Tríceps Francês', equip:'Haltere ou Elástico', series:3, reps:'10', descanso:60 },
    ]
  },
  {
    id:'ter', dow:'Terça-feira', grupo:'Costas, Ombros (Posterior) e Bíceps', color:'costas',
    exercicios:[
      { nome:'Remada Curvada', equip:'Halteres ou Pisando no elástico', series:4, reps:'10 a 12', descanso:90 },
      { nome:'Remada Unilateral (Serrote)', equip:'Haltere pesado', series:4, reps:'10 cada lado', descanso:60 },
      { nome:'Crucifixo Invertido', equip:'Halteres leves ou Mini-band', series:3, reps:'12', descanso:60 },
      { nome:'Rosca Direta', equip:'Halteres', series:4, reps:'8 a 12', descanso:90 },
      { nome:'Rosca Martelo', equip:'Halteres', series:3, reps:'10 a 12', descanso:60 },
      { nome:'Rosca Concentrada', equip:'Elástico de pedal (amarelo)', series:3, reps:'12', descanso:60 },
    ]
  },
  {
    id:'qua', dow:'Quarta-feira', grupo:'Membros Inferiores e Panturrilhas', color:'pernas',
    exercicios:[
      { nome:'Agachamento Goblet', equip:'Haltere mais pesado à frente', series:4, reps:'12 a 15', descanso:120 },
      { nome:'Passada / Avanço', equip:'Halteres nas mãos', series:3, reps:'10 cada perna', descanso:90 },
      { nome:'Stiff', equip:'Halteres', series:4, reps:'10', descanso:90 },
      { nome:'Elevação Pélvica', equip:'Haltere no quadril + Mini-band', series:3, reps:'15', descanso:60 },
      { nome:'Gêmeos em Pé (Panturrilha)', equip:'Halteres nas mãos', series:4, reps:'20 (segura 2s no topo)', descanso:60 },
    ]
  },
  {
    id:'qui', dow:'Quinta-feira', grupo:'Foco em Ombros e Peito (Lapidação)', color:'ombros',
    exercicios:[
      { nome:'Crucifixo Reto no Chão', equip:'Halteres', series:4, reps:'12', descanso:90 },
      { nome:'Crucifixo em Pé', equip:'Elástico extensor fixado', series:3, reps:'12 a 15', descanso:60 },
      { nome:'Elevação Lateral', equip:'Elástico Extensor (tensão alta)', series:4, reps:'15', descanso:60 },
      { nome:'Elevação Frontal', equip:'Halteres ou Elástico', series:3, reps:'10 a 12', descanso:60 },
      { nome:'Tríceps no Elástico', equip:'Elástico preso no alto', series:4, reps:'12 (até à falha)', descanso:60 },
    ]
  },
  {
    id:'sex', dow:'Sexta-feira', grupo:'Costas e Braços Completo', color:'bracos',
    exercicios:[
      { nome:'Remada Sentado', equip:'Elástico de pedal (amarelo)', series:4, reps:'12 a 15', descanso:90 },
      { nome:'Remada Curvada (Pegada Supinada)', equip:'Halteres', series:4, reps:'10', descanso:90 },
      { nome:'Rosca Direta', equip:'Halteres', series:4, reps:'10 (descida lenta)', descanso:90 },
      { nome:'Rosca Martelo', equip:'Halteres', series:3, reps:'12', descanso:60 },
      { nome:'Gêmeos em Pé (Panturrilha)', equip:'Peso corporal (unilateral)', series:4, reps:'Máximo', descanso:45 },
    ]
  },
];

/* ============================================================
   DADOS — ACADEMIA
   Fase atual salva no storage. Exibida em badge.
   5ª = repete 2ª  |  6ª = repete 3ª
============================================================ */
const FASES_GYM = { label:'Fase 1', series:3, reps:12 }; // padrão; fase real via storage

function faseAtual(){
  try{ return JSON.parse(localStorage.getItem('andre_gym_fase')) || { num:1, series:3, reps:12 }; }
  catch{ return { num:1, series:3, reps:12 }; }
}

const GYM_SEG = {
  id:'seg', dow:'Segunda-feira', grupo:'Peito e Tríceps', color:'peito',
  aquecimento:'Alongamento geral · Aquecimento: 1 série até a falha de flexão de cotovelos',
  exercicios:[
    { nome:'Supino Reto com Halteres', equip:'Halteres + anilhas', series:null, reps:null, descanso:90,
      obs:'3x12 + 10 compressões com anilhas (pressionar uma mão na outra, não segurar)' },
    { nome:'Peitoral no Crossover — Polia Baixa', equip:'Cross over', series:null, reps:null, descanso:90,
      obs:'3x12 — dedos mínimos se encontram na concêntrica, segurar 2s iso em cada rep' },
    { nome:'Supino Inclinado com Halteres', equip:'Halteres + banco inclinado', series:null, reps:null, descanso:90, obs:'' },
    { nome:'Tríceps no Pulley — Barra V Drop Set', equip:'Pulley barra V', series:null, reps:null, descanso:90,
      obs:'3x 8+8+8 + 12 tríceps corda' },
    { nome:'Tríceps no Pulley — Pegada Inversa', equip:'Pulley', series:null, reps:null, descanso:90,
      obs:'3x12 + 12 tríceps testa' },
    { nome:'HIIT na Esteira', equip:'Esteira', series:null, reps:null, descanso:0,
      obs:'20 min: 5min baixa intensidade → 10 tiros 30s on/30s off → 5min volta calma' },
  ]
};

const GYM_TER = {
  id:'ter', dow:'Terça-feira', grupo:'Costas e Bíceps', color:'costas',
  aquecimento:'Alongamento geral · Aquecimento: 1 série de barra fixa no graviton até a falha',
  exercicios:[
    { nome:'Puxada Frontal', equip:'Polia / Máquina', series:null, reps:null, descanso:90,
      obs:'3x12 + 10 remada unilateral com halteres' },
    { nome:'Remada Sentado — Pegada Pronada', equip:'Polia sentado', series:null, reps:null, descanso:90,
      obs:'3x12 + 10 remada curvada com barra pegada supinada' },
    { nome:'Remada Baixa com Triângulo', equip:'Polia triângulo', series:null, reps:null, descanso:90, obs:'3x12' },
    { nome:'Bíceps Barra W', equip:'Barra W', series:null, reps:null, descanso:90,
      obs:'3x12 + 12 rosca bíceps bilateral com rotação' },
    { nome:'Rosca Scott — Drop Set Decrescente', equip:'Banco Scott', series:null, reps:null, descanso:90,
      obs:'3x 8+8+8 + 10 bíceps martelo' },
    { nome:'Rosca Concentrada', equip:'Haltere', series:null, reps:null, descanso:90, obs:'3x12' },
    { nome:'HIIT na Esteira', equip:'Esteira', series:null, reps:null, descanso:0,
      obs:'20 min: 5min baixa intensidade → 10 tiros 30s on/30s off → 5min volta calma' },
  ]
};

const GYM_QUA = {
  id:'qua', dow:'Quarta-feira', grupo:'Ombros e Trapézio', color:'ombros',
  aquecimento:'Alongamento geral · Aquecimento: 25 reps de rotação externa de ombros na polia média (eixo na altura do cotovelo)',
  exercicios:[
    { nome:'Desenvolvimento de Ombros com Barra', equip:'Barra / rack', series:null, reps:null, descanso:90,
      obs:'3x12 + 12 flexão de ombros com halteres pegada neutra' },
    { nome:'Elevação Lateral — Drop Set Decrescente', equip:'Halteres', series:null, reps:null, descanso:90,
      obs:'3x 10+10+10' },
    { nome:'Crucifixo Inverso no Cross — Polia Média', equip:'Cross over', series:null, reps:null, descanso:90,
      obs:'3x12 + 12 crucifixo inverso com halteres (curvado) · 2s iso no pico de contração' },
    { nome:'Remada Alta com Barra W', equip:'Barra W', series:null, reps:null, descanso:90,
      obs:'3x12 + 12 encolhimento com halteres' },
    { nome:'Face Pull', equip:'Polia corda', series:null, reps:null, descanso:90,
      obs:'3x12 com 2s iso em cada rep' },
    { nome:'HIIT na Esteira', equip:'Esteira', series:null, reps:null, descanso:0,
      obs:'20 min: 5min baixa intensidade → 10 tiros 30s on/30s off → 5min volta calma' },
  ]
};

// 5ª repete 2ª, 6ª repete 3ª
const GYM_QUI = { ...GYM_SEG, id:'qui', dow:'Quinta-feira' };
const GYM_SEX = { ...GYM_TER, id:'sex', dow:'Sexta-feira' };

const PLANO_GYM = [GYM_SEG, GYM_TER, GYM_QUA, GYM_QUI, GYM_SEX];

/* ============================================================
   ESTADO
============================================================ */
let env = localStorage.getItem('andre_env') || 'casa'; // 'casa' | 'gym'

function planoAtivo(){ return env === 'gym' ? PLANO_GYM : PLANO_CASA; }

/* ============================================================
   STORAGE
============================================================ */
function todayKey(){ return new Date().toISOString().slice(0,10); }

function loadProgress(key){
  try{ return JSON.parse(localStorage.getItem(key)) || {}; }
  catch{ return {}; }
}
function saveProgress(key, p){ localStorage.setItem(key, JSON.stringify(p)); }

function progressKey(){ return env==='gym' ? 'andre_gym_progress_v2' : 'andre_casa_progress_v2'; }
function streakKey(){   return env==='gym' ? 'andre_gym_streak_v2'   : 'andre_casa_streak_v2'; }

let progress = loadProgress(progressKey());
let streak   = loadStreak(streakKey());

function loadStreak(k){
  try{ return JSON.parse(localStorage.getItem(k)) || {count:0,lastDate:null}; }
  catch{ return {count:0,lastDate:null}; }
}
function saveStreakData(){ localStorage.setItem(streakKey(), JSON.stringify(streak)); }

function getDayProgress(dayId){
  const key = todayKey();
  const plano = planoAtivo();
  const day = plano.find(d=>d.id===dayId);
  // reinicia se: data diferente OU qtd de exercícios diferente do plano atual (ambiente trocado)
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
  saveProgress(progressKey(), progress);
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
   TOGGLE AMBIENTE
============================================================ */
function setEnv(e){
  env = e;
  localStorage.setItem('andre_env', e);
  progress = loadProgress(progressKey());  // recarrega progresso do ambiente correto
  streak   = loadStreak(streakKey());
  currentDayId = null; // garante que não carregue dia do ambiente anterior

  document.body.classList.toggle('gym-mode', e==='gym');
  document.getElementById('btn-casa').classList.toggle('active', e==='casa');
  document.getElementById('btn-gym').classList.toggle('active', e==='gym');

  // banner e regras dinamicamente
  if(e==='gym'){
    document.getElementById('header-sub').textContent = 'Academia · Hipertrofia avançada';
    document.getElementById('banner-eyebrow').textContent = 'Academia — modo avançado';
    document.getElementById('banner-title').textContent = 'Conexão mente-músculo. Carga progressiva.';
    document.getElementById('banner-text').textContent = 'Cada treino segue as fases: Fase 1 · 3x12 / Fase 2 · 3x10 / Fase 3 · 4x8. Trocam a cada 4 semanas com o orientador.';
    document.getElementById('golden-rules-block').innerHTML = `
      <h4>Regras de ouro — academia</h4>
      <ul>
        <li><strong>Fases:</strong> Fase 1 (3x12) → Fase 2 (3x10) → Fase 3 (4x8). Muda a cada ~4 semanas.</li>
        <li><strong>Drop sets:</strong> sem descanso entre as séries do drop, descanso só ao fim do conjunto.</li>
        <li><strong>HIIT na esteira:</strong> sempre ao fim — 5min aquecimento, 10 tiros 30/30, 5min volta calma.</li>
      </ul>`;
  } else {
    document.getElementById('header-sub').textContent = 'Hipertrofia · 80kg · 160g proteína/dia';
    document.getElementById('banner-eyebrow').textContent = 'Estratégia da semana';
    document.getElementById('banner-title').textContent = 'Intensidade alta, falha controlada.';
    document.getElementById('banner-text').textContent = 'Cadência: 1-2s na subida, 3s segurando a descida. Se passar do teto de reps com facilidade, suba a carga.';
    document.getElementById('golden-rules-block').innerHTML = `
      <h4>Regras de ouro</h4>
      <ul>
        <li><strong>Cadência:</strong> subida explosiva e controlada (1-2s), descida lenta de 3s.</li>
        <li><strong>Progressão:</strong> passou do teto de reps fácil? Aumente a carga.</li>
        <li><strong>Recuperação:</strong> o treino dá o estímulo, o descanso constrói o músculo.</li>
      </ul>`;
  }

  // fecha timer se estiver aberto e volta sempre pra home ao trocar ambiente
  clearInterval(timerState.interval);
  document.getElementById('timer-screen').classList.remove('open');
  showView('view-home');
  renderHome();
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
  const plano = planoAtivo();
  const grid = document.getElementById('week-grid');
  grid.innerHTML='';
  let totalComplete=0;

  plano.forEach(day=>{
    const dp = getDayProgress(day.id);
    const done = dp.done.filter(Boolean).length;
    const complete = isDayComplete(day.id);
    if(complete) totalComplete++;

    const card = document.createElement('button');
    card.className='day-card'+(complete?' is-complete':'');
    card.dataset.color = day.color;

    // badge "repete" pra 5ª e 6ª no modo gym
    const repeatTag = (env==='gym' && day.id==='qui') ? '<span style="font-family:var(--f-mono);font-size:.62rem;color:var(--txt-dim)"> · repete 2ª</span>'
                    : (env==='gym' && day.id==='sex') ? '<span style="font-family:var(--f-mono);font-size:.62rem;color:var(--txt-dim)"> · repete 3ª</span>'
                    : '';

    card.innerHTML=`
      <div class="bar"></div>
      <div class="done-check">✓</div>
      <div class="dow">${day.dow}</div>
      <h3>${day.grupo}</h3>
      <div class="ex-count">${done}/${dp.done.length} exercícios${repeatTag}</div>
    `;
    card.addEventListener('click',()=>openDay(day.id));
    grid.appendChild(card);
  });

  document.getElementById('week-fill').style.width = Math.round(totalComplete/plano.length*100)+'%';
  document.getElementById('week-val').textContent = `${totalComplete}/${plano.length}`;
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
  const plano = planoAtivo();
  const day = plano.find(d=>d.id===currentDayId);
  const dp = getDayProgress(currentDayId);
  const done = dp.done.filter(Boolean).length;

  document.getElementById('day-title').textContent = day.grupo;
  document.getElementById('day-sub').textContent = day.dow + (env==='gym' && (day.id==='qui'||day.id==='sex') ? ' (repetição)' : '');
  document.getElementById('day-progress-mini').textContent = `${done}/${day.exercicios.length}`;

  const list = document.getElementById('exercise-list');
  list.innerHTML='';

  // aquecimento + fase badge (modo academia)
  if(env==='gym' && day.aquecimento){
    const f = faseAtual();
    list.insertAdjacentHTML('beforeend',`
      <div class="fase-badge">📊 Fase ${f.num} — ${f.series}x${f.reps}</div>
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

    const srLabel = env==='gym' && ex.series===null
      ? (() => { const f=faseAtual(); return `${f.series}x${f.reps}`; })()
      : `${ex.series}x ${ex.reps}`;

    card.innerHTML=`
      <div class="ex-card-top">
        <div class="ex-num">${isDone?'✓':idx+1}</div>
        <div class="ex-info">
          <div class="ex-name" data-search="${encodeURIComponent(ex.nome+' exercício como fazer')}">
            ${ex.nome} <span class="search-ic">🔍</span>
          </div>
          <div class="ex-meta">
            <span class="eq">${ex.equip}</span>
            <span class="sr">${srLabel}</span>
            ${ex.descanso>0 ? `<span class="rest-tag">⏱ ${ex.descanso}s descanso</span>` : '<span class="rest-tag">⏱ cardio</span>'}
          </div>
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
  const plano = planoAtivo();
  const day = plano.find(d=>d.id===dayId);
  const ex = day.exercicios[idx];
  const f = faseAtual();
  const srLabel = env==='gym' && ex.series===null ? `${f.series}x${f.reps}` : `${ex.series}x ${ex.reps}`;

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
  const day = planoAtivo().find(d=>d.id===timerState.dayId);
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
    `Você fechou o treino de ${day.dow.toLowerCase()} — ${day.grupo}. Sequência atual: ${streak.count} dia(s). Hidrate, coma sua proteína e descanse.`;
  document.getElementById('complete-overlay').classList.add('open');
}
document.getElementById('complete-confirm').addEventListener('click',()=>{
  document.getElementById('complete-overlay').classList.remove('open');
  renderHome(); showView('view-home');
});

/* ============================================================
   INIT
============================================================ */
if(env==='gym') document.body.classList.add('gym-mode');
document.getElementById('btn-casa').classList.toggle('active', env==='casa');
document.getElementById('btn-gym').classList.toggle('active', env==='gym');
setEnv(env); // aplica banner e regras corretos
