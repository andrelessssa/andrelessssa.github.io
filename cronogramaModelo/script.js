// ─── CORES ───────────────────────────────────────────────────────────────────
const COLORS = ['#6c7bff','#34d399','#fbbf24','#f87171','#c084fc','#2dd4bf','#fb7185','#60a5fa','#a3e635','#f97316'];

// ─── STATE ───────────────────────────────────────────────────────────────────
function getState() {
  try { return JSON.parse(localStorage.getItem('studyos_v2') || 'null') || initState(); }
  catch { return initState(); }
}
function initState() {
  return { materias: [], sessions: [], reviews: [], questions: [] };
}
function saveState(s) {
  localStorage.setItem('studyos_v2', JSON.stringify(s));
}
let state = getState();

// ─── NAVEGAÇÃO ───────────────────────────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const pages = ['dashboard','materias','hoje','revisao','questoes','pomodoro'];
  const idx = pages.indexOf(id);
  document.querySelectorAll('.tab')[idx]?.classList.add('active');
  if (id === 'dashboard') renderDashboard();
  if (id === 'materias') renderMaterias();
  if (id === 'hoje') renderHoje();
  if (id === 'revisao') renderRevisao();
  if (id === 'questoes') renderQuestoes();
}

// ─── DATAS ───────────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().split('T')[0]; }
function dateStr(d) { return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric'}); }
function addDays(ds, n) {
  const d = new Date(ds + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0];
}
function daysBetween(a, b) {
  return Math.floor((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function renderDashboard() {
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  let studied = 0;
  state.materias.forEach(m => m.topics.forEach(t => { if(t.done) studied++; }));
  const correct = state.questions.filter(q=>q.result==='correct').length;
  const total = state.questions.filter(q=>q.result).length;
  const rate = total ? Math.round(correct/total*100)+'%' : '—';
  const revPending = state.reviews.filter(r => r.nextDate <= today() && !r.done).length;

  document.getElementById('dash-studied').textContent = studied;
  document.getElementById('dash-correct').textContent = correct;
  document.getElementById('dash-rate').textContent = rate;
  document.getElementById('dash-reviews').textContent = revPending;

  // Progresso por matéria
  const pl = document.getElementById('dash-progress-list');
  if (!state.materias.length) {
    pl.innerHTML = '<div class="empty"><div class="empty-icon">📚</div>Adicione matérias para ver o progresso</div>';
  } else {
    pl.innerHTML = state.materias.map((m,i) => {
      const tot = m.topics.length;
      const done = m.topics.filter(t=>t.done).length;
      const pct = tot ? Math.round(done/tot*100) : 0;
      return `<div style="margin-bottom:.85rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:13px;font-weight:500;">${m.name}</span>
          <span style="font-size:12px;color:var(--muted);font-family:var(--mono);">${done}/${tot} · ${pct}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%;background:${m.color};"></div>
        </div>
      </div>`;
    }).join('');
  }

  // Calendário
  const cal = document.getElementById('dash-calendar');
  const studiedDays = {};
  state.sessions.forEach(ss => { studiedDays[ss.date] = (studiedDays[ss.date]||0)+1; });
  const now = new Date();
  const year = now.getFullYear(); const month = now.getMonth();
  document.getElementById('cal-title').textContent = now.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^\w/, c=>c.toUpperCase());
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month+1, 0).getDate();
  const todayStr = today();
  const headers = ['D','S','T','Q','Q','S','S'];
  let html = `<div class="cal-grid" style="margin-bottom:6px;">${headers.map(h=>`<div style="text-align:center;font-size:10px;color:var(--muted);padding:4px 0;">${h}</div>`).join('')}</div><div class="cal-grid">`;
  for(let i=0;i<first;i++) html += `<div class="cal-day empty"></div>`;
  for(let d=1;d<=days;d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = ds===todayStr;
    const hasStudy = studiedDays[ds];
    let cls = 'cal-day';
    if(isToday) cls+=' today';
    else if(hasStudy) cls+=' studied';
    html += `<div class="${cls}"><span class="cal-day-num">${d}</span>${hasStudy&&!isToday?`<div class="cal-dot" style="background:var(--green);"></div>`:''}</div>`;
  }
  html += '</div>';
  cal.innerHTML = html;

  // Desempenho
  const perf = document.getElementById('dash-perf-list');
  const answeredQs = state.questions.filter(q=>q.result);
  if(!state.materias.length || !answeredQs.length) {
    perf.innerHTML = '<div class="empty"><div class="empty-icon">✏️</div>Responda questões para ver o desempenho</div>';
  } else {
    const rows = state.materias.map((m,i) => {
      const qs = state.questions.filter(q=>q.matId===m.id&&q.result);
      if(!qs.length) return '';
      const c = qs.filter(q=>q.result==='correct').length;
      const pct = Math.round(c/qs.length*100);
      return `<div style="display:flex;align-items:center;gap:1rem;margin-bottom:.75rem;">
        <div style="width:10px;height:10px;border-radius:50%;background:${m.color};flex-shrink:0;"></div>
        <div style="width:150px;font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.name}</div>
        <div style="flex:1;height:8px;border-radius:99px;overflow:hidden;background:var(--red-dim);">
          <div style="width:${pct}%;height:100%;background:${m.color};"></div>
        </div>
        <div style="font-size:12px;font-family:var(--mono);color:var(--muted);min-width:70px;text-align:right;">${c}/${qs.length} · ${pct}%</div>
      </div>`;
    }).join('');
    perf.innerHTML = rows || '<div class="empty"><div class="empty-icon">✏️</div>Responda questões para ver o desempenho</div>';
  }
}

// ─── MATÉRIAS ─────────────────────────────────────────────────────────────────
function openAddMateria() {
  document.getElementById('materias-panel').style.display = 'block';
  document.getElementById('mat-name').value = '';
  document.getElementById('mat-topics').value = '';
  document.getElementById('mat-name').focus();
}
function closeMateriaPanel() { document.getElementById('materias-panel').style.display = 'none'; }

function saveMateria() {
  const name = document.getElementById('mat-name').value.trim();
  const topicsRaw = document.getElementById('mat-topics').value;
  if(!name) { alert('Informe o nome da matéria.'); return; }
  const topics = topicsRaw.split('\n').map(t=>t.trim()).filter(Boolean)
    .map(t => ({ id: Date.now() + Math.random() + '', name: t, done: false, doneDate: null }));
  state.materias.push({
    id: Date.now() + '',
    name,
    topics,
    color: COLORS[state.materias.length % COLORS.length]
  });
  saveState(state);
  closeMateriaPanel();
  renderMaterias();
}

function renderMaterias() {
  const el = document.getElementById('materias-list');
  if(!state.materias.length) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">📘</div>Nenhuma matéria cadastrada ainda</div>';
    return;
  }
  el.innerHTML = state.materias.map(m => {
    const done = m.topics.filter(t=>t.done).length;
    const pct = m.topics.length ? Math.round(done/m.topics.length*100) : 0;
    return `<div>
      <div class="subject-row" onclick="toggleTopics('tops-${m.id}')">
        <div class="subject-dot" style="background:${m.color};box-shadow:0 0 8px ${m.color}55;"></div>
        <div class="subject-name">${m.name}</div>
        <div class="subject-topics">${done}/${m.topics.length} assuntos</div>
        <div style="width:80px;"><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${m.color};"></div></div></div>
        <span style="font-size:12px;font-family:var(--mono);color:var(--muted);">${pct}%</span>
        <button class="btn sm danger" onclick="event.stopPropagation();deleteMateria('${m.id}')">✕</button>
      </div>
      <div id="tops-${m.id}" style="display:none;padding:.4rem 0 .4rem 1.5rem;">
        ${m.topics.length ? m.topics.map(t=>`
          <div class="topic-row">
            <div class="topic-check ${t.done?'checked':''}" onclick="toggleTopic('${m.id}','${t.id}')"></div>
            <div class="topic-name ${t.done?'done':''}">${t.name}</div>
            ${t.doneDate?`<span style="font-size:11px;color:var(--muted);">${dateStr(t.doneDate)}</span>`:''}
          </div>`).join('') : '<div style="font-size:13px;color:var(--muted);padding:.5rem .9rem;">Nenhum assunto cadastrado</div>'}
      </div>
    </div>`;
  }).join('');
}

function toggleTopics(id) {
  const el = document.getElementById(id);
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function toggleTopic(matId, topicId) {
  const m = state.materias.find(x=>x.id===matId);
  const t = m.topics.find(x=>x.id===topicId);
  t.done = !t.done;
  t.doneDate = t.done ? today() : null;
  if(t.done) scheduleReview(matId, topicId, t.name, m.name);
  else state.reviews = state.reviews.filter(r=>!(r.matId===matId&&r.topicId===topicId&&!r.done));
  saveState(state);
  renderMaterias();
}

function deleteMateria(id) {
  if(!confirm('Remover matéria e todos os dados associados?')) return;
  state.materias = state.materias.filter(m=>m.id!==id);
  state.questions = state.questions.filter(q=>q.matId!==id);
  state.reviews = state.reviews.filter(r=>r.matId!==id);
  saveState(state);
  renderMaterias();
}

// ─── REVISÃO ESPAÇADA ─────────────────────────────────────────────────────────
const INTERVALS = [3, 7, 15, 30];

function scheduleReview(matId, topicId, topicName, matName) {
  state.reviews = state.reviews.filter(r=>!(r.matId===matId&&r.topicId===topicId));
  const t = today();
  INTERVALS.forEach((days, idx) => {
    state.reviews.push({
      id: Date.now() + Math.random() + '',
      matId, topicId, topicName, matName,
      scheduledDate: t,
      nextDate: addDays(t, days),
      interval: days,
      stage: idx + 1,
      done: false
    });
  });
}

function renderRevisao() {
  const t = today();
  const due = state.reviews.filter(r => !r.done && r.nextDate <= t);
  const week = state.reviews.filter(r => !r.done && r.nextDate > t && daysBetween(t, r.nextDate) <= 7);
  const doneCount = state.reviews.filter(r=>r.done).length;

  document.getElementById('rev-today').textContent = due.length;
  document.getElementById('rev-week').textContent = week.length;
  document.getElementById('rev-done').textContent = doneCount;

  const el = document.getElementById('review-list');
  const all = [...due, ...week].sort((a,b)=>a.nextDate.localeCompare(b.nextDate));
  if(!all.length) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">🔁</div>Nenhuma revisão pendente — continue estudando!</div>';
    return;
  }
  const stageColors = ['#f87171','#fbbf24','#60a5fa','#34d399'];
  el.innerHTML = all.map(r => {
    const isToday = r.nextDate <= t;
    const dLeft = daysBetween(t, r.nextDate);
    const badgeClass = isToday ? 'due' : dLeft <= 3 ? 'warn' : 'new';
    const badgeText = isToday ? 'REVISAR HOJE' : `em ${dLeft} dia${dLeft>1?'s':''}`;
    return `<div class="review-card">
      <div class="review-icon" style="background:${stageColors[(r.stage-1)%4]}22;">
        <span style="font-size:14px;font-weight:700;color:${stageColors[(r.stage-1)%4]};">${r.stage}ª</span>
      </div>
      <div class="review-info">
        <div class="review-title">${r.topicName}</div>
        <div class="review-sub">${r.matName} · revisão ${r.stage} de ${INTERVALS.length} (intervalo: ${r.interval} dias)</div>
      </div>
      <span class="badge ${badgeClass}">${badgeText}</span>
      ${isToday ? `<button class="btn sm primary" onclick="doneReview('${r.id}')">✓ Feita</button>` : ''}
    </div>`;
  }).join('');
}

function doneReview(id) {
  const r = state.reviews.find(x=>x.id===id);
  if(r) r.done = true;
  saveState(state);
  renderRevisao();
}

// ─── SESSÃO DE HOJE ───────────────────────────────────────────────────────────
function renderHoje() {
  document.getElementById('hoje-date').textContent = new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
  const sel = document.getElementById('session-mat');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Selecionar matéria...</option>' +
    state.materias.map(m=>`<option value="${m.id}" ${m.id===cur?'selected':''}>${m.name}</option>`).join('');
  loadSessionTopics();

  const hist = document.getElementById('session-history');
  const sessions = [...state.sessions].reverse();
  if(!sessions.length) { hist.innerHTML = '<div class="empty"><div class="empty-icon">🗂️</div>Nenhuma sessão registrada</div>'; return; }
  hist.innerHTML = sessions.map(s => {
    const m = state.materias.find(x=>x.id===s.matId);
    return `<div style="padding:.85rem;background:var(--surface2);border-radius:var(--radius);margin-bottom:.4rem;display:flex;gap:.75rem;align-items:flex-start;">
      <div style="font-family:var(--mono);font-size:11px;color:var(--muted);min-width:70px;padding-top:2px;">${dateStr(s.date)}</div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:500;">${m?m.name:'Matéria removida'}</div>
        ${s.topics&&s.topics.length?`<div style="font-size:12px;color:var(--muted);margin-top:2px;">${s.topics.map(t=>t.name).join(', ')}</div>`:''}
        ${s.notes?`<div style="font-size:12px;color:var(--text);margin-top:4px;opacity:.7;">${s.notes}</div>`:''}
      </div>
      <button class="btn sm danger" onclick="deleteSession('${s.id}')">✕</button>
    </div>`;
  }).join('');
}

function loadSessionTopics() {
  const matId = document.getElementById('session-mat').value;
  const el = document.getElementById('session-topics-list');
  if(!matId) { el.innerHTML='<div class="empty"><div class="empty-icon">📖</div>Selecione uma matéria acima</div>'; return; }
  const m = state.materias.find(x=>x.id===matId);
  if(!m||!m.topics.length) { el.innerHTML='<div class="empty">Nenhum assunto cadastrado nesta matéria</div>'; return; }
  el.innerHTML = m.topics.map(t=>`
    <div class="topic-row">
      <div class="topic-check ${t.done?'checked':''}" onclick="toggleTopicHoje('${matId}','${t.id}')"></div>
      <div class="topic-name ${t.done?'done':''}">${t.name}</div>
      ${t.doneDate?`<span style="font-size:11px;color:var(--muted);">${dateStr(t.doneDate)}</span>`:''}
    </div>`).join('');
}

function toggleTopicHoje(matId, topicId) {
  const m = state.materias.find(x=>x.id===matId);
  const t = m.topics.find(x=>x.id===topicId);
  t.done = !t.done;
  t.doneDate = t.done ? today() : null;
  if(t.done) scheduleReview(matId, topicId, t.name, m.name);
  saveState(state);
  loadSessionTopics();
}

function saveSession() {
  const matId = document.getElementById('session-mat').value;
  if(!matId) { alert('Selecione uma matéria.'); return; }
  const notes = document.getElementById('session-notes').value.trim();
  const m = state.materias.find(x=>x.id===matId);
  const topics = m.topics.filter(t=>t.done);
  state.sessions.push({ id: Date.now()+'', date: today(), matId, topics: topics.map(t=>({name:t.name})), notes });
  saveState(state);
  document.getElementById('session-notes').value = '';
  renderHoje();
}

function deleteSession(id) {
  state.sessions = state.sessions.filter(s=>s.id!==id);
  saveState(state);
  renderHoje();
}

// ─── QUESTÕES ─────────────────────────────────────────────────────────────────
let optionCount = 0;

function openAddQuestion() {
  optionCount = 0;
  document.getElementById('question-panel').style.display = 'block';
  const qm = document.getElementById('q-mat');
  qm.innerHTML = state.materias.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');
  updateQTopics();
  document.getElementById('q-text').value = '';
  document.getElementById('q-comment').value = '';
  document.getElementById('q-options-input').innerHTML = '';
  [0,1,2,3].forEach(() => addOption());
}
function closeQuestionPanel() { document.getElementById('question-panel').style.display = 'none'; }

function updateQTopics() {
  const matId = document.getElementById('q-mat').value;
  const m = state.materias.find(x=>x.id===matId);
  document.getElementById('q-topic').innerHTML = m && m.topics.length
    ? m.topics.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')
    : '<option value="">Sem assuntos</option>';
}

function addOption() {
  const container = document.getElementById('q-options-input');
  const idx = optionCount++;
  const label = String.fromCharCode(65 + idx);
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:.4rem;align-items:center;margin-bottom:.4rem;';
  div.innerHTML = `
    <input type="radio" name="correct-opt" value="${idx}" style="width:auto;flex-shrink:0;accent-color:var(--accent);" title="Marcar como correta">
    <input placeholder="Alternativa ${label}" id="opt-${idx}" style="flex:1;">
    <button class="btn sm" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(div);
}

function saveQuestion() {
  const matId = document.getElementById('q-mat').value;
  const topicId = document.getElementById('q-topic').value;
  const text = document.getElementById('q-text').value.trim();
  if(!text) { alert('Escreva o enunciado da questão.'); return; }
  const m = state.materias.find(x=>x.id===matId);
  const t = m?.topics.find(x=>x.id===topicId);
  let correctIdx = -1;
  document.querySelectorAll('input[name="correct-opt"]').forEach(r => { if(r.checked) correctIdx = parseInt(r.value); });
  const options = [];
  let li = 0;
  document.querySelectorAll('[id^="opt-"]').forEach(inp => {
    if(inp.value.trim()) options.push({ label: String.fromCharCode(65+li++), text: inp.value.trim() });
  });
  if(options.length && correctIdx < 0) { alert('Marque a alternativa correta (botão de rádio à esquerda).'); return; }
  state.questions.push({
    id: Date.now()+'',
    matId, matName: m?.name||'',
    topicId, topicName: t?.name||'',
    text, options, correctIdx,
    comment: document.getElementById('q-comment').value.trim(),
    result: null, answeredIdx: null
  });
  saveState(state);
  closeQuestionPanel();
  renderQuestoes();
}

function renderQuestoes() {
  const filterMat = document.getElementById('filter-mat').value;
  const filterRes = document.getElementById('filter-result').value;

  const fm = document.getElementById('filter-mat');
  const cur = fm.value;
  fm.innerHTML = '<option value="">Todas as matérias</option>' +
    state.materias.map(m=>`<option value="${m.id}" ${m.id===cur?'selected':''}>${m.name}</option>`).join('');

  let qs = [...state.questions];
  if(filterMat) qs = qs.filter(q=>q.matId===filterMat);
  if(filterRes==='correct') qs = qs.filter(q=>q.result==='correct');
  else if(filterRes==='wrong') qs = qs.filter(q=>q.result==='wrong');
  else if(filterRes==='pending') qs = qs.filter(q=>!q.result);

  const el = document.getElementById('questions-list');
  if(!qs.length) { el.innerHTML='<div class="empty"><div class="empty-icon">✏️</div>Nenhuma questão aqui</div>'; return; }

  el.innerHTML = qs.map(q => {
    const rColor = q.result==='correct'?'var(--green)':q.result==='wrong'?'var(--red)':'var(--muted)';
    const rIcon = q.result==='correct'?'✓':q.result==='wrong'?'✗':'—';
    return `<div class="card" style="margin-bottom:.75rem;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.75rem;gap:.5rem;flex-wrap:wrap;">
        <div>
          <span style="font-size:11px;color:var(--muted);">${q.matName}</span>
          ${q.topicName?`<span style="font-size:11px;color:var(--muted);"> · ${q.topicName}</span>`:''}
        </div>
        <div style="display:flex;align-items:center;gap:.5rem;">
          <span style="font-size:15px;color:${rColor};font-weight:700;">${rIcon}</span>
          <button class="btn sm" onclick="resetQ('${q.id}')" ${!q.result?'disabled':''} style="${!q.result?'opacity:.3;':''}" title="Tentar novamente">↺</button>
          <button class="btn sm danger" onclick="deleteQuestion('${q.id}')">✕</button>
        </div>
      </div>
      <div style="font-size:14px;margin-bottom:.75rem;line-height:1.6;">${q.text}</div>
      ${q.options.length ? `<div class="q-options">
        ${q.options.map((o,i) => {
          let cls = 'q-option';
          if(q.answeredIdx !== null) {
            if(i === q.correctIdx) cls += ' correct';
            else if(i === q.answeredIdx) cls += ' wrong';
          }
          return `<div class="${cls}" onclick="answerQ('${q.id}',${i})"><strong>${o.label}</strong> ${o.text}</div>`;
        }).join('')}
      </div>` : `
        ${q.result === null ? `<div style="display:flex;gap:.5rem;margin-top:.5rem;">
          <button class="btn sm primary" onclick="markQ('${q.id}','correct')">✓ Acertei</button>
          <button class="btn sm danger" onclick="markQ('${q.id}','wrong')">✗ Errei</button>
        </div>` : ''}`}
      ${q.answeredIdx !== null && q.comment ? `<div style="font-size:12px;color:var(--muted);background:var(--surface2);padding:.65rem .85rem;border-radius:var(--radius);margin-top:.5rem;line-height:1.5;">💡 ${q.comment}</div>` : ''}
    </div>`;
  }).join('');
}

function answerQ(qId, idx) {
  const q = state.questions.find(x=>x.id===qId);
  if(q.answeredIdx !== null) return;
  q.answeredIdx = idx;
  q.result = idx === q.correctIdx ? 'correct' : 'wrong';
  saveState(state);
  renderQuestoes();
}
function markQ(qId, result) {
  const q = state.questions.find(x=>x.id===qId);
  q.result = result;
  q.answeredIdx = result === 'correct' ? 0 : -1;
  saveState(state);
  renderQuestoes();
}
function resetQ(qId) {
  const q = state.questions.find(x=>x.id===qId);
  q.result = null; q.answeredIdx = null;
  saveState(state);
  renderQuestoes();
}
function deleteQuestion(id) {
  if(!confirm('Remover esta questão?')) return;
  state.questions = state.questions.filter(q=>q.id!==id);
  saveState(state);
  renderQuestoes();
}

// ─── POMODORO ─────────────────────────────────────────────────────────────────
const POMO_MODES = { work: 25*60, short: 5*60, long: 15*60 };
const POMO_LABELS = { work: 'FOCO', short: 'PAUSA', long: 'LONGA' };
const TECHNIQUE_TIPS = {
  'Resumo Ativo': 'Leia o material, depois feche e escreva os pontos principais com suas palavras. Repita até conseguir reproduzir sem olhar.',
  'Mapa Mental': 'Coloque o tema central no meio e ramifique os subtópicos. Use cores e ícones. Conecte conceitos relacionados com setas.',
  'Questões de Prova': 'Resolva questões de provas anteriores do concurso. Anote padrões de cobrança e revise os erros com atenção.',
  'Flashcards Anki': 'Crie cards com pergunta na frente e resposta atrás. Foque em conceitos, fórmulas e definições. Revise diariamente.',
  'Leitura Focada': 'Leia sem sublinhar primeiro. Na segunda leitura, destaque apenas o essencial. Na terceira, anote dúvidas.',
  'Produção Textual': 'Escolha um tema, esboce a estrutura (introdução, desenvolvimento, conclusão) e escreva sem parar. Revise depois.'
};

let pomoTimer = null;
let pomoSeconds = 25*60;
let pomoMode = 'work';
let pomoRunning = false;
let pomoCount = parseInt(localStorage.getItem('pomoCount')||'0');
let lastPomoDate = localStorage.getItem('pomoDate')||'';
if(lastPomoDate !== today()) { pomoCount = 0; localStorage.setItem('pomoDate', today()); localStorage.setItem('pomoCount','0'); }

function setPomoMode(mode) {
  if(pomoRunning) return;
  pomoMode = mode;
  pomoSeconds = POMO_MODES[mode];
  document.querySelectorAll('[id^="pomo-mode-"]').forEach(b => b.style.borderColor='');
  document.getElementById('pomo-mode-'+mode).style.borderColor = 'var(--accent)';
  document.getElementById('pomo-mode-'+mode).style.color = 'var(--accent)';
  updatePomoDisplay();
}

function togglePomo() {
  pomoRunning = !pomoRunning;
  document.getElementById('pomo-btn').textContent = pomoRunning ? '⏸ Pausar' : '▶ Retomar';
  if(pomoRunning) {
    pomoTimer = setInterval(() => {
      pomoSeconds--;
      updatePomoDisplay();
      if(pomoSeconds <= 0) {
        clearInterval(pomoTimer);
        pomoRunning = false;
        document.getElementById('pomo-btn').textContent = '▶ Iniciar';
        if(pomoMode === 'work') {
          pomoCount++;
          localStorage.setItem('pomoCount', pomoCount);
          document.getElementById('pomo-count').textContent = pomoCount;
        }
        if(Notification.permission === 'granted') {
          new Notification('StudyOS', { body: pomoMode==='work' ? '✓ Pomodoro completo! Hora da pausa.' : '▶ Pausa concluída! Volte ao foco.', icon: '' });
        }
        alert(pomoMode==='work' ? '🎯 Pomodoro completo! Hora de descansar.' : '✅ Pausa encerrada! Volte ao foco.');
        setPomoMode(pomoMode==='work'?'short':'work');
      }
    }, 1000);
  } else {
    clearInterval(pomoTimer);
  }
}

function resetPomo() {
  clearInterval(pomoTimer);
  pomoRunning = false;
  pomoSeconds = POMO_MODES[pomoMode];
  document.getElementById('pomo-btn').textContent = '▶ Iniciar';
  updatePomoDisplay();
}

function updatePomoDisplay() {
  const m = String(Math.floor(pomoSeconds/60)).padStart(2,'0');
  const s = String(pomoSeconds%60).padStart(2,'0');
  document.getElementById('pomo-display').textContent = `${m}:${s}`;
  document.getElementById('pomo-label').textContent = POMO_LABELS[pomoMode];
  document.getElementById('pomo-count').textContent = pomoCount;
  const pct = 1 - (pomoSeconds / POMO_MODES[pomoMode]);
  const color = pomoMode==='work'?'var(--accent)':pomoMode==='short'?'var(--green)':'var(--amber)';
  document.getElementById('pomo-circle').style.borderColor = `color-mix(in srgb, ${color} ${Math.round(pct*100)}%, var(--surface3))`;
}

document.getElementById('pomo-technique').addEventListener('change', function() {
  document.getElementById('technique-tip').textContent = TECHNIQUE_TIPS[this.value] || '';
});

// Pedir permissão para notificações
if(Notification.permission === 'default') Notification.requestPermission();

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.getElementById('dash-date').textContent = new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
document.getElementById('hoje-date').textContent = new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
renderDashboard();
updatePomoDisplay();
