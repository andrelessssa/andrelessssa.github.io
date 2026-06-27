/* ============================================================
   PRODUTIVIDADE GAMIFICADA — app.js
   ============================================================ */

/* ---------- Estado global ---------- */
const S = {
  tasks: [
    { id: 1, name: 'Academia',      cat: 'academia', icon: '🏋️', color: '#e34948', xp: 30, trackPages: false, elapsed: 0, doneToday: false },
    { id: 2, name: 'Trabalho',      cat: 'trabalho', icon: '💼', color: '#2a78d6', xp: 20, trackPages: false, elapsed: 0, doneToday: false },
    { id: 3, name: 'Leitura',       cat: 'leitura',  icon: '📚', color: '#1baf7a', xp: 25, trackPages: true,  pages: 0, elapsed: 0, doneToday: false },
    { id: 4, name: 'Concurso',      cat: 'concurso', icon: '🎯', color: '#eda100', xp: 35, trackPages: false, elapsed: 0, doneToday: false },
    { id: 5, name: 'Dev sistemas',  cat: 'devsis',   icon: '💻', color: '#4a3aa7', xp: 35, trackPages: false, elapsed: 0, doneToday: false },
    { id: 6, name: 'Inglês',        cat: 'ingles',   icon: '🌎', color: '#e87ba4', xp: 25, trackPages: false, elapsed: 0, doneToday: false },
  ],
  extraTasks: [],
  workLogs: [],

  xp: 0,
  level: 1,
  streak: 3,
  totalMinutes: 0,
  totalPages: 0,
  dailyXP: 0,
  activeId: null,
  timerInterval: null,

  weekData: { academia: 0, trabalho: 0, leitura: 0, concurso: 0, devsis: 0, ingles: 0, extra: 0 },

  achievements: [
    { id: 'first',   name: 'Primeiro passo',  desc: 'Conclua sua primeira tarefa',    icon: '🌱', unlocked: false },
    { id: 'streak3', name: 'Consistente',      desc: '3 dias seguidos',                icon: '🔥', unlocked: true  },
    { id: 'scholar', name: 'Estudioso',        desc: '2h de estudo em um dia',         icon: '🎓', unlocked: false },
    { id: 'reader',  name: 'Leitor',           desc: '50 páginas lidas',               icon: '📖', unlocked: false },
    { id: 'athlete', name: 'Atleta',           desc: 'Academia 5x na semana',          icon: '🏆', unlocked: false },
    { id: 'coder',   name: 'Desenvolvedor',    desc: '10h de dev sistemas',            icon: '⚡', unlocked: false },
    { id: 'polyglot',name: 'Políglota',        desc: '20 sessões de inglês',           icon: '🌍', unlocked: false },
    { id: 'warrior', name: 'Guerreiro',        desc: 'Nível 10 atingido',              icon: '⚔️', unlocked: false },
  ],
};

const MOTIVATIONAL_MSGS = [
  '🧠 A consistência supera o talento. Mais um dia!',
  '💡 Seu cérebro recompensa o esforço com dopamina!',
  '🔥 Você está construindo hábitos que duram para sempre.',
  '⚡ Cada sessão fortalece suas conexões neurais.',
  '🎯 Foco agora, liberdade depois.',
  '🌱 Pequenos passos diários criam grandes resultados.',
  '🏆 Vencer a preguiça hoje é ganhar o amanhã.',
  '🚀 Cada minuto investido em você nunca é perdido.',
];

const CAT_ICONS  = { extra: '⭐', academia: '🏋️', trabalho: '💼', leitura: '📚', concurso: '🎯', devsis: '💻', ingles: '🌎' };
const CAT_COLORS = { extra: '#888', academia: '#e34948', trabalho: '#2a78d6', leitura: '#1baf7a', concurso: '#eda100', devsis: '#4a3aa7', ingles: '#e87ba4' };

let reportChart = null;
let curReport = 'semana';

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
function allTasks() {
  return S.tasks.concat(S.extraTasks);
}

function fmt(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = type === 'danger' ? '#e34948' : type === 'warn' ? '#eda100' : '#1baf7a';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ============================================================
   NAVEGAÇÃO POR ABAS
   ============================================================ */
function switchTab(name) {
  document.querySelectorAll('.tab, .panel').forEach(el => el.classList.remove('active'));
  document.querySelector(`.tab[onclick*="'${name}'"]`).classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');

  if (name === 'tarefas')    renderTasks();
  if (name === 'relatorios') renderReport();
  if (name === 'conquistas') renderAchievements();
  if (name === 'trabalho')   renderWorkHistory();
}

/* ============================================================
   HUD (XP, NÍVEL, STREAK)
   ============================================================ */
function updateHUD() {
  const needed = S.level * 100;
  document.getElementById('xp-fill').style.width = Math.min((S.xp / needed) * 100, 100) + '%';
  document.getElementById('xp-text').textContent  = `${S.xp} / ${needed} XP`;
  document.getElementById('level-badge').textContent  = `Nível ${S.level}`;
  document.getElementById('streak-badge').textContent = `🔥 ${S.streak} dias`;
}

function updateTodayStats() {
  document.getElementById('s-min').textContent   = S.totalMinutes;
  document.getElementById('s-done').textContent  = allTasks().filter(t => t.doneToday).length;
  document.getElementById('s-pages').textContent = S.totalPages;
  document.getElementById('s-xp').textContent    = S.dailyXP;
}

/* ============================================================
   RENDERIZAÇÃO: ATIVIDADE ATUAL
   ============================================================ */
function renderActive() {
  const area = document.getElementById('active-task-area');
  const t = allTasks().find(x => x.id === S.activeId);

  if (!t) {
    area.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-target" aria-hidden="true"></i>
        Nenhuma tarefa em andamento.<br>Vá para "Tarefas" e clique em Iniciar.
      </div>`;
    return;
  }

  area.innerHTML = `
    <div class="task-card running">
      <div class="task-top">
        <div class="task-icon" style="background:${t.color}22">${t.icon}</div>
        <div class="task-info">
          <div class="task-name">${t.name}</div>
          <div class="task-meta">Em andamento · +${t.xp} XP ao concluir</div>
          ${t.trackPages ? pagesHTML(t) : ''}
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div class="active-timer">${fmt(t.elapsed)}</div>
          <div style="display:flex;gap:6px;justify-content:flex-end">
            <button class="btn-sm danger"  onclick="stopTask()">
              <i class="ti ti-player-stop" aria-hidden="true"></i> Parar
            </button>
            <button class="btn-sm success" onclick="completeTask(${t.id})">
              <i class="ti ti-check" aria-hidden="true"></i> Concluir
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

function pagesHTML(t) {
  const pct = Math.min((t.pages || 0) * 2, 100);
  return `
    <div class="pages-row">
      <span>Páginas:</span>
      <div class="pages-bar-bg">
        <div class="pages-bar-fill" style="width:${pct}%;background:${t.color}"></div>
      </div>
      <input class="pages-input" type="number" min="0" value="${t.pages || 0}"
        aria-label="Páginas lidas"
        onchange="setPages(${t.id}, this.value)" />
    </div>`;
}

function setPages(id, v) {
  const t = allTasks().find(x => x.id === id);
  if (t) t.pages = Math.max(0, parseInt(v) || 0);
}

/* ============================================================
   RENDERIZAÇÃO: LISTA DE TAREFAS
   ============================================================ */
function renderTasks() {
  document.getElementById('fixed-tasks').innerHTML =
    S.tasks.map(taskHTML).join('');

  const extras = S.extraTasks.filter(t => !t.doneToday);
  document.getElementById('extra-tasks').innerHTML =
    extras.length
      ? extras.map(taskHTML).join('')
      : '<p class="empty-text">Nenhuma tarefa extra adicionada ainda.</p>';
}

function taskHTML(t) {
  const running = t.id === S.activeId;
  return `
    <div class="task-card ${running ? 'running' : t.doneToday ? 'done' : ''}">
      <div class="task-top">
        <div class="task-icon" style="background:${t.color}22">${t.icon}</div>
        <div class="task-info">
          <div class="task-name">${t.name}${t.doneToday ? ' ✅' : ''}</div>
          <div class="task-meta">${t.xp} XP · ${fmt(t.elapsed)} acumulados</div>
        </div>
        <div class="task-actions">
          ${running
            ? `<span class="timer-display">${fmt(t.elapsed)}</span>
               <button class="btn-sm danger"  onclick="stopTask()">Parar</button>
               <button class="btn-sm success" onclick="completeTask(${t.id})">Concluir</button>`
            : t.doneToday
            ? `<button class="btn-sm done-btn" onclick="undoTask(${t.id})">
                 <i class="ti ti-check" aria-hidden="true"></i> Feito
               </button>`
            : `<button class="btn-sm primary" onclick="startTask(${t.id})"
                 ${S.activeId && S.activeId !== t.id ? 'disabled' : ''}>
                 <i class="ti ti-player-play" aria-hidden="true"></i> Iniciar
               </button>`}
        </div>
      </div>
    </div>`;
}

/* ============================================================
   CONTROLE DO CRONÔMETRO
   ============================================================ */
function startTask(id) {
  if (S.activeId && S.activeId !== id) {
    showToast('Pare a tarefa atual antes de iniciar outra!', 'warn');
    return;
  }

  S.activeId = id;
  if (S.timerInterval) clearInterval(S.timerInterval);

  S.timerInterval = setInterval(() => {
    const t = allTasks().find(x => x.id === id);
    if (!t) return;

    t.elapsed++;
    S.weekData[t.cat] = (S.weekData[t.cat] || 0) + (1 / 60);

    // a cada minuto completo
    if (t.elapsed % 60 === 0) {
      S.totalMinutes++;
      S.dailyXP += 2;
      updateTodayStats();
      updateHUD();
    }

    renderActive();
  }, 1000);

  // mensagem motivacional aleatória
  document.getElementById('motivational-msg').innerHTML =
    '<i class="ti ti-flame" aria-hidden="true"></i> ' +
    MOTIVATIONAL_MSGS[Math.floor(Math.random() * MOTIVATIONAL_MSGS.length)];

  renderActive();
  renderTasks();
  switchTab('fazendo');
}

function stopTask() {
  if (S.timerInterval) clearInterval(S.timerInterval);
  S.timerInterval = null;
  S.activeId = null;
  renderActive();
  renderTasks();
  showToast('Tarefa pausada. Continue quando quiser!', 'warn');
}

function completeTask(id) {
  if (S.timerInterval) clearInterval(S.timerInterval);
  S.timerInterval = null;
  S.activeId = null;

  const t = allTasks().find(x => x.id === id);
  if (!t) return;

  t.doneToday = true;
  const bonusMin = Math.floor(t.elapsed / 60) * 2;
  const earned = t.xp + bonusMin;
  S.xp     += earned;
  S.dailyXP += earned;

  if (t.trackPages && t.pages > 0) {
    S.totalPages += t.pages;
  }

  checkLevelUp();
  checkAchievements();
  showToast(`+${earned} XP! ${t.name} concluída! 🎉`);
  renderActive();
  renderTasks();
  updateHUD();
  updateTodayStats();
}

/* ============================================================
   GAMIFICAÇÃO
   ============================================================ */
function checkLevelUp() {
  const needed = S.level * 100;
  if (S.xp >= needed) {
    S.level++;
    S.xp -= needed;
    showToast(`🏆 NÍVEL ${S.level}! Você subiu de nível!`);
  }
}

function checkAchievements() {
  const a = S.achievements;
  const check = (idx, cond, msg) => {
    if (!a[idx].unlocked && cond) {
      a[idx].unlocked = true;
      setTimeout(() => showToast(`${a[idx].icon} Conquista: ${a[idx].name}!`), 600);
    }
  };
  check(0, allTasks().some(t => t.doneToday), '');
  check(2, S.totalMinutes >= 120, '');
  check(3, S.totalPages >= 50, '');
  check(7, S.level >= 10, '');
}

function undoTask(id) {
  const t = allTasks().find(x => x.id === id);
  if (!t) return;
  t.doneToday = false;
  t.elapsed = 0;
  renderTasks();
  updateTodayStats();
}


   ============================================================ */
function addCustomTask() {
  const nameEl = document.getElementById('new-task-name');
  const catEl  = document.getElementById('new-task-cat');
  const name   = nameEl.value.trim();
  const cat    = catEl.value;

  if (!name) { showToast('Digite o nome da tarefa.', 'warn'); return; }

  S.extraTasks.push({
    id: Date.now(),
    name,
    cat,
    icon: CAT_ICONS[cat]  || '⭐',
    color: CAT_COLORS[cat] || '#888',
    xp: 15,
    trackPages: cat === 'leitura',
    pages: 0,
    elapsed: 0,
    doneToday: false,
    extra: true,
  });

  nameEl.value = '';
  renderTasks();
  showToast('Tarefa extra adicionada!');
}

/* ============================================================
   MÓDULO TRABALHO
   ============================================================ */
function saveWorkLog() {
  const txt = document.getElementById('work-now').value.trim();
  if (!txt) { showToast('Descreva o que está fazendo.', 'warn'); return; }

  const now = new Date();
  S.workLogs.unshift({
    text: txt,
    time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    date: now.toLocaleDateString('pt-BR'),
  });

  document.getElementById('work-now').value = '';
  renderWorkHistory();
  showToast('Atividade registrada!');
}

function openNewTab() {
  window.open('about:blank', '_blank');
}

function renderWorkHistory() {
  const el = document.getElementById('work-history');
  if (!S.workLogs.length) {
    el.innerHTML = '<p class="empty-text">Nenhum registro ainda.</p>';
    return;
  }
  el.innerHTML = S.workLogs.map(l => `
    <div class="work-entry">
      <div class="work-entry-header">
        <span class="work-entry-title">
          <i class="ti ti-clock" aria-hidden="true"></i> ${l.time}
        </span>
        <span class="work-entry-time">${l.date}</span>
      </div>
      <div class="work-entry-body">${l.text}</div>
    </div>`).join('');
}

/* ============================================================
   RELATÓRIOS
   ============================================================ */
function switchReport(r) {
  curReport = r;
  document.querySelectorAll('.rtab').forEach(el => el.classList.remove('active'));
  // match parcial pelo texto do botão
  document.querySelectorAll('.rtab').forEach(el => {
    if (el.textContent.toLowerCase().includes(r.slice(0, 3))) el.classList.add('active');
  });
  renderReport();
}

function renderReport() {
  const mult = { semana: 1, mes: 4, ano: 52 };
  const m = mult[curReport] || 1;

  const labels = S.tasks.map(t => t.name);
  const data   = S.tasks.map(t => Math.round((S.weekData[t.cat] || 0) * m));
  const total  = data.reduce((a, b) => a + b, 0);

  document.getElementById('report-stats').innerHTML = `
    <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-lbl">Minutos totais</div></div>
    <div class="stat-card"><div class="stat-num">${(total / 60).toFixed(1)}</div><div class="stat-lbl">Horas totais</div></div>
    <div class="stat-card"><div class="stat-num">${S.totalPages}</div><div class="stat-lbl">Páginas lidas</div></div>
    <div class="stat-card"><div class="stat-num">${S.level}</div><div class="stat-lbl">Nível atual</div></div>`;

  if (reportChart) reportChart.destroy();

  const COLORS = ['#e34948','#2a78d6','#1baf7a','#eda100','#4a3aa7','#e87ba4'];
  reportChart = new Chart(document.getElementById('reportChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Minutos',
        data,
        backgroundColor: COLORS,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#898781', font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: '#898781', font: { size: 11 } }, grid: { color: 'rgba(128,128,128,0.12)' } },
      },
    },
  });
}

/* ============================================================
   CONQUISTAS
   ============================================================ */
function renderAchievements() {
  document.getElementById('achievements-grid').innerHTML =
    S.achievements.map(a => `
      <div class="achievement ${a.unlocked ? 'unlocked' : 'locked'}">
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
        ${a.unlocked ? '<div class="ach-unlocked-label">Desbloqueada</div>' : ''}
      </div>`).join('');
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
updateHUD();
updateTodayStats();
