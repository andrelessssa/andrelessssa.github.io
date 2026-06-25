/* =====================================================
   FINANÇAS 2026 — app.js
   ===================================================== */

// ===== CONSTANTS =====
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const CATS     = { FIXO:'Fixo', CARTOES:'Cartões', DIVERSOS:'Diversos', ACORDOS:'Acordos' };
const CAT_ORDER = ['FIXO', 'CARTOES', 'DIVERSOS', 'ACORDOS'];
const CAT_COLORS = { FIXO:'var(--blue)', CARTOES:'var(--gold)', DIVERSOS:'var(--purple)', ACORDOS:'var(--red)' };

// ===== STATE =====
let state = loadState() || buildDefaultState();
let editingId = null;

function buildDefaultState() {
  return {
    selectedMonth: new Date().getMonth(),
    income: { salary: 0, extra: 0, other: 0 },
    expenses: seedData()
  };
}

// ===== PERSISTENCE =====
function loadState() {
  try {
    const raw = localStorage.getItem('fin2026_v2');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveState() {
  try { localStorage.setItem('fin2026_v2', JSON.stringify(state)); } catch {}
}

// ===== SEED DATA =====
function seedData() {
  const E = [];
  let id = 1;

  function add(name, cat, day, amounts, statuses) {
    for (let m = 0; m < 12; m++) {
      if (amounts[m] == null || amounts[m] === 0) continue;
      E.push({ id: id++, name, cat, day, month: m,
               amount: amounts[m], status: statuses[m] || 'pending' });
    }
  }

  const p = 'paid', n = 'pending', na = 'na';

  // FIXO
  add('Feira',            'FIXO', 10, [800,800,800,800,800,800,800,800,800,800,800,800],         [p,p,p,p,p,p,p,n,n,n,n,n]);
  add('Carro',            'FIXO', 10, [750,750,750,750,750,750,750,750,750,750,750,750],         [p,p,p,p,p,p,p,n,n,n,n,n]);
  add('Internet Casa',    'FIXO', 10, [50,50,50,50,50,50,50,50,50,50,50,50],                    [p,p,p,p,p,p,p,n,n,n,n,n]);
  add('Internet Celular', 'FIXO', 10, [118,123,123,119,112,123,123,325,195,138,123,123],        [p,p,p,p,p,p,p,n,n,n,n,n]);
  add('Internet São Jorge','FIXO',10, [81,70,32,51,51,51,51,51,51,51,51,51],                    [p,p,p,p,p,p,p,n,n,n,n,n]);

  // CARTÕES
  add('Mercado Pago',       'CARTOES',10,[491,471,446,446,1518,430,1169,168,138,138,126,126],   [p,p,p,p,p,p,p,n,n,n,n,n]);
  add('Cartão George',      'CARTOES',15,[300,300,300,300,300,null,400,400,400,400,400,400],    [p,p,p,p,p,na,p,n,n,n,n,n]);
  add('Passagem',           'CARTOES',15,[180,180,180,180,null,180,180,180,180,null,null,null], [p,p,p,p,na,p,p,n,n,na,na,na]);
  add('Nubank',             'CARTOES',17,[2260,980,1500,1700,null,95,null,750,750,650,650,400], [p,p,p,p,na,p,na,n,n,n,n,n]);
  add('Meu Santander',      'CARTOES',25,[1400,417,417,180,932,1226,342,342,55,null,null,null], [p,p,p,p,p,p,p,n,n,na,na,na]);
  add('Meu Santander Dia25','CARTOES',25,[226,250,250,312,313,312,312,312,312,312,312,312],     [p,p,p,p,p,p,p,n,n,n,n,n]);

  // DIVERSOS
  add('Obra da Ana','DIVERSOS',15,[null,null,null,null,null,131.70,127.25,127.25,102.58,125,77.30,77.30],[na,na,na,na,na,p,p,n,n,n,n,n]);

  return E;
}

// ===== HELPERS =====
function fmt(n) {
  if (n == null) return '—';
  return 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function totalIncome() {
  const inc = state.income || {};
  return (parseFloat(inc.salary)||0) + (parseFloat(inc.extra)||0) + (parseFloat(inc.other)||0);
}
function monthExpenses(m) { return state.expenses.filter(e => e.month === m); }
function catExpenses(m, cat) { return monthExpenses(m).filter(e => e.cat === cat); }
function catTotal(m, cat) { return catExpenses(m, cat).reduce((s, e) => s + (e.amount||0), 0); }
function monthTotal(m) { return monthExpenses(m).reduce((s, e) => s + (e.amount||0), 0); }
function paidTotal(m) { return monthExpenses(m).filter(e => e.status==='paid').reduce((s,e)=>s+(e.amount||0),0); }
function pendingTotal(m) { return monthExpenses(m).filter(e => e.status==='pending').reduce((s,e)=>s+(e.amount||0),0); }
function nextId() { return state.expenses.reduce((mx,e)=>Math.max(mx,e.id),0)+1; }

// ===== MAIN RENDER =====
function render() {
  saveState();
  renderIncome();
  renderMonths();
  renderSummary();
  renderHealth();
  renderExpenses();
  renderSidebar();
  renderOverview();
}

// ===== INCOME =====
function renderIncome() {
  const inc = state.income || {};
  document.getElementById('incSalary').value = inc.salary || '';
  document.getElementById('incExtra').value  = inc.extra  || '';
  document.getElementById('incOther').value  = inc.other  || '';
  document.getElementById('incomeTotalDisplay').textContent = fmt(totalIncome());
}

function saveIncome() {
  state.income = {
    salary: parseFloat(document.getElementById('incSalary').value) || 0,
    extra:  parseFloat(document.getElementById('incExtra').value)  || 0,
    other:  parseFloat(document.getElementById('incOther').value)  || 0,
  };
  render();
  showToast('Renda salva!');
}

// ===== MONTHS =====
function renderMonths() {
  const row = document.getElementById('monthsRow');
  row.innerHTML = MONTHS.map((name, i) => {
    const tot  = monthTotal(i);
    const pend = pendingTotal(i);
    const hasBadge = tot > 0;
    const allOk = hasBadge && pend === 0;
    return `<button class="month-btn${i===state.selectedMonth?' active':''}" data-m="${i}">
      ${name}${hasBadge ? `<span class="badge${allOk?' ok':''}"></span>` : ''}
    </button>`;
  }).join('');
}

// ===== SUMMARY =====
function renderSummary() {
  const m   = state.selectedMonth;
  const tot  = monthTotal(m);
  const fixo = catTotal(m,'FIXO');
  const cart = catTotal(m,'CARTOES');
  const paid = paidTotal(m);
  const pend = pendingTotal(m);
  const inc  = totalIncome();
  const cnt  = monthExpenses(m).length;

  setText('sumTotal',  fmt(tot));
  setText('sumTotalSub', `${cnt} despesas — Renda: ${fmt(inc)}`);
  setBar('barTotal', tot, inc, 'var(--gold)');

  setText('sumFixo',    fmt(fixo));
  setText('sumFixoSub', tot > 0 ? `${((fixo/tot)*100)|0}% do total` : '—');
  setBar('barFixo', fixo, tot, 'var(--blue)');

  setText('sumCartoes',    fmt(cart));
  setText('sumCartoesSub', tot > 0 ? `${((cart/tot)*100)|0}% do total` : '—');
  setBar('barCartoes', cart, tot, 'var(--gold)');

  setText('sumPago',    fmt(paid));
  setText('sumPendente', fmt(pend) + ' pendente');
  setBar('barPago', paid, tot, 'var(--green)');
}

function setText(id, val) { document.getElementById(id).textContent = val; }
function setBar(id, val, max, color) {
  const el = document.getElementById(id);
  el.style.width = max > 0 ? Math.min(100, (val/max)*100)+'%' : '0%';
  el.style.background = color;
}

// ===== HEALTH =====
function renderHealth() {
  const m    = state.selectedMonth;
  const tot  = monthTotal(m);
  const paid = paidTotal(m);
  const pend = pendingTotal(m);
  const inc  = totalIncome();
  const saldo = inc - tot;
  const pct  = tot > 0 ? Math.round((paid/tot)*100) : 0;

  let score = 50;
  if (inc > 0) {
    const comp = tot / inc;
    score = Math.max(0, Math.min(100, Math.round(100 - comp*60 + pct*0.4)));
  }

  const el = document.getElementById('healthScore');
  el.textContent = score;
  el.className = 'health-score ' + (score>=70?'good':score>=40?'warn':'bad');

  document.getElementById('healthBar').style.width = score+'%';
  document.getElementById('hPaid').textContent    = fmt(paid);
  document.getElementById('hPending').textContent = fmt(pend);
  document.getElementById('hSaldo').textContent   = fmt(saldo);
  document.getElementById('hPct').textContent     = pct+'%';

  let msg, tip;
  if (score >= 80) {
    msg = 'Excelente! Finanças sob controle 🌟';
    tip = 'Orçamento equilibrado. Considere investir o excedente em renda fixa ou fundos de índice.';
  } else if (score >= 60) {
    msg = 'Bom! Alguns ajustes possíveis 📈';
    tip = 'Você está bem, mas há espaço para reduzir cartões e aumentar a reserva de emergência.';
  } else if (score >= 40) {
    msg = 'Atenção: despesas elevadas ⚠️';
    tip = 'Despesas comprometem muito da renda. Revise cartões e gastos variáveis.';
  } else {
    msg = 'Crítico: ação imediata necessária 🚨';
    tip = 'Despesas superam ou ameaçam a renda. Negocie dívidas e corte gastos urgentemente.';
  }

  document.getElementById('healthMsg').textContent = msg;
  document.getElementById('healthTip').textContent = tip;
}

// ===== EXPENSES LIST =====
function renderExpenses() {
  const m   = state.selectedMonth;
  const out = document.getElementById('expenseList');
  out.innerHTML = CAT_ORDER.map(cat => buildCatSection(m, cat)).join('');
}

function buildCatSection(m, cat) {
  const items = catExpenses(m, cat);
  const tot   = items.reduce((s,e)=>s+(e.amount||0), 0);
  const rows  = items.map(e => {
    const amtCls = e.status==='paid'?'amount-paid':e.status==='na'?'amount-na':'amount-pending';
    const dotCls = e.status==='paid'?'paid':e.status==='na'?'na':'pending';
    return `<tr class="exp-row">
      <td><div class="exp-name">
        ${e.day?`<span class="exp-day">dia ${e.day}</span>`:''}
        <span class="exp-name-link" data-edit="${e.id}">${e.name}</span>
      </div></td>
      <td class="exp-status">
        <div class="status-dot ${dotCls}" data-toggle="${e.id}" title="Clique para alterar status"></div>
      </td>
      <td class="exp-amount ${amtCls}">${fmt(e.amount)}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="3" style="padding:16px 20px;color:var(--text-muted);font-size:13px">Nenhuma despesa nesta categoria</td></tr>`;

  return `<div class="cat-section">
    <div class="cat-header">
      <div class="cat-title">
        <span class="cat-pill pill-${cat}">${CATS[cat]}</span>
        <span>${items.length} item${items.length!==1?'s':''}</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <span class="cat-total">${fmt(tot)}</span>
        <span class="chev open">▾</span>
      </div>
    </div>
    <div class="cat-body">
      <table class="exp-table">
        <thead><tr>
          <th>Descrição</th>
          <th style="text-align:center;width:60px">Status</th>
          <th style="text-align:right;width:140px">Valor</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <button class="add-exp-btn" data-addcat="${cat}">
        <span class="plus">+</span> Adicionar em ${CATS[cat]}
      </button>
    </div>
  </div>`;
}

// ===== SIDEBAR =====
function renderSidebar() {
  const m    = state.selectedMonth;
  const tot  = monthTotal(m);
  const inc  = totalIncome();
  const paid = paidTotal(m);
  const pend = pendingTotal(m);
  const saldo = inc - tot;

  // Cashflow
  const cfRows = [
    { label:'Renda total',        val:fmt(inc),           color:inc>0?'var(--green)':'var(--text-muted)' },
    { label:'Total despesas',     val:fmt(tot),           color:'var(--red)' },
    { label:'Saldo disponível',   val:fmt(saldo),         color:saldo>=0?'var(--green)':'var(--red)' },
    { label:'Comprometimento',    val:inc>0?`${((tot/inc)*100)|0}%`:'—', color:(tot/inc)>.7?'var(--red)':'var(--gold)' },
    { label:'Pago este mês',      val:fmt(paid),          color:'var(--text)' },
    { label:'Ainda a pagar',      val:fmt(pend),          color:pend>0?'var(--red)':'var(--text-muted)' },
  ];
  document.getElementById('cfWidget').innerHTML = cfRows.map(r=>
    `<div class="cf-row"><span class="cf-label">${r.label}</span><span class="cf-val" style="color:${r.color}">${r.val}</span></div>`
  ).join('');

  // Mini chart
  document.getElementById('miniChartWrap').innerHTML = CAT_ORDER.map(cat => {
    const val = catTotal(m, cat);
    const pct = tot > 0 ? (val/tot*100) : 0;
    return `<div>
      <div class="mini-bar-top">
        <span class="mini-bar-name">${CATS[cat]}</span>
        <span class="mini-bar-val" style="color:${CAT_COLORS[cat]}">${fmt(val)}</span>
      </div>
      <div class="mini-bar-track">
        <div class="mini-bar-fill" style="width:${pct}%;background:${CAT_COLORS[cat]}"></div>
      </div>
    </div>`;
  }).join('');

  renderCalendar(m);
  renderTips(m);
}

function renderCalendar(m) {
  const items = monthExpenses(m);
  const bills = {};
  items.forEach(e => {
    if (!e.day) return;
    if (!bills[e.day]) bills[e.day] = { paid:0, pending:0 };
    bills[e.day][e.status === 'paid' ? 'paid' : 'pending']++;
  });

  const today = new Date();
  const todayDay = today.getDate();
  const isCurrentMonth = today.getMonth()===m;
  const firstDay = new Date(2026, m, 1).getDay();
  const daysInMonth = new Date(2026, m+1, 0).getDate();

  const heads = ['D','S','T','Q','Q','S','S'];
  let html = heads.map(h=>`<div class="cal-head">${h}</div>`).join('');
  for (let i=0;i<firstDay;i++) html+=`<div class="cal-day empty"></div>`;
  for (let d=1;d<=daysInMonth;d++) {
    const bill = bills[d];
    const isToday = isCurrentMonth && d===todayDay;
    let cls = 'cal-day';
    if (isToday) cls += ' today';
    else if (bill) cls += bill.pending > 0 ? ' has-bill' : ' paid-bill';
    html += `<div class="${cls}">${d}</div>`;
  }
  document.getElementById('calGrid').innerHTML = html;
}

function renderTips(m) {
  const tot  = monthTotal(m);
  const inc  = totalIncome();
  const cart = catTotal(m,'CARTOES');
  const tips = [];

  if (inc === 0) tips.push({ icon:'💰', title:'Cadastre sua renda', text:'Informe seu salário acima para calcular o comprometimento real do orçamento.' });
  if (cart/tot > 0.5) tips.push({ icon:'💳', title:'Cuidado com cartões', text:'Cartões representam mais da metade das despesas. Tente pagar à vista sempre que possível.' });
  if (inc>0 && tot/inc > 0.8) tips.push({ icon:'⚠️', title:'Renda comprometida', text:'Mais de 80% da renda comprometida. Meta ideal: abaixo de 70%.' });
  if (pendingTotal(m) > 0) tips.push({ icon:'📅', title:'Organize os pagamentos', text:'Pague antes do vencimento para evitar juros e proteger seu score.' });
  tips.push({ icon:'🏦', title:'Reserva de emergência', text:'Mantenha 3 a 6 meses de despesas guardados em investimentos líquidos.' });
  tips.push({ icon:'📊', title:'Regra 50-30-20', text:'50% necessidades, 30% desejos, 20% investimentos e poupança.' });

  document.getElementById('tipsWrap').innerHTML = tips.slice(0,4).map(t=>
    `<div class="tip-item"><div class="tip-icon">${t.icon}</div><div class="tip-text"><strong>${t.title}</strong>${t.text}</div></div>`
  ).join('');
}

// ===== OVERVIEW TABLE =====
function renderOverview() {
  const table = document.getElementById('overviewTable');

  // Build unique expense "lines" (name+cat) across all months
  const lineMap = new Map(); // key = name+cat
  state.expenses.forEach(e => {
    const key = e.cat + '||' + e.name + '||' + (e.day||'');
    if (!lineMap.has(key)) lineMap.set(key, { name:e.name, cat:e.cat, day:e.day, months: {} });
    lineMap.get(key).months[e.month] = e;
  });

  // Group lines by category
  const catGroups = {};
  CAT_ORDER.forEach(c => catGroups[c] = []);
  lineMap.forEach((line, key) => {
    if (catGroups[line.cat]) catGroups[line.cat].push({ key, ...line });
  });

  const inc = totalIncome();

  // Build HTML
  let html = '';

  // Header
  html += `<thead>
    <tr class="ov-year-row">
      <th class="ov-year-label" style="text-align:left;min-width:160px">2026</th>
      <th style="min-width:50px" class="ov-month-label">Dia</th>
      ${MONTHS_SHORT.map(m=>`<th class="ov-month-label" style="min-width:100px">${m}</th>`).join('')}
    </tr>
  </thead><tbody>`;

  CAT_ORDER.forEach(cat => {
    const lines = catGroups[cat];

    // Category header
    html += `<tr class="ov-cat-row">
      <td colspan="14" style="color:${CAT_COLORS[cat]}">${CATS[cat].toUpperCase()}</td>
    </tr>`;

    // Expense rows
    lines.forEach(line => {
      html += `<tr class="ov-exp-row">
        <td>${line.name}</td>
        <td>${line.day || '—'}</td>
        ${Array.from({length:12},(_,mi) => {
          const e = line.months[mi];
          if (!e) return `<td class="exp-amount ov-cell-empty">—</td>`;
          const cls = e.status==='paid'?'ov-cell-paid':e.status==='na'?'ov-cell-na':'ov-cell-pending';
          return `<td class="exp-amount ${cls}">
            <span class="ov-cell-click" data-ov-toggle="${e.id}" title="Clique para alterar status">${fmt(e.amount)}</span>
          </td>`;
        }).join('')}
      </tr>`;
    });

    // Subtotal row
    html += `<tr class="ov-sub-row">
      <td colspan="2">Total ${CATS[cat]}</td>
      ${Array.from({length:12},(_,mi)=>{
        const tot = catGroups[cat].reduce((s,line)=>s+(line.months[mi]?.amount||0),0);
        return `<td class="exp-amount ov-cell-total">${tot>0?fmt(tot):'—'}</td>`;
      }).join('')}
    </tr>`;
  });

  // Grand total
  html += `<tr class="ov-total-row">
    <td colspan="2">TOTAL</td>
    ${Array.from({length:12},(_,mi)=>{
      const tot = monthTotal(mi);
      return `<td class="exp-amount" style="color:var(--gold)">${tot>0?fmt(tot):'—'}</td>`;
    }).join('')}
  </tr>`;

  // Situação CX
  html += `<tr class="ov-cx-row">
    <td colspan="2">SITUAÇÃO DO CX</td>
    ${Array.from({length:12},(_,mi)=>{
      const tot = monthTotal(mi);
      if (!tot && inc===0) return `<td class="exp-amount ov-cell-empty">—</td>`;
      const saldo = inc - tot;
      const cls = saldo >= 0 ? 'ov-cell-pos' : 'ov-cell-neg';
      return `<td class="exp-amount ${cls}">${fmt(saldo)}</td>`;
    }).join('')}
  </tr>`;

  html += `</tbody>`;
  table.innerHTML = html;
}

// ===== MODAL =====
function openModal() { document.getElementById('modal-addExpense').classList.add('open'); }
function closeModal() { document.getElementById('modal-addExpense').classList.remove('open'); }

function openAdd(cat) {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Nova Despesa';
  document.getElementById('inp-name').value   = '';
  document.getElementById('inp-amount').value = '';
  document.getElementById('inp-day').value    = '';
  document.getElementById('inp-cat').value    = cat || 'FIXO';
  document.getElementById('inp-status').value = 'pending';
  document.getElementById('deleteBtn').style.display = 'none';
  const sel = document.getElementById('inp-months');
  for (let o of sel.options) o.selected = o.value==='all';
  openModal();
}

function openEdit(id) {
  const e = state.expenses.find(x=>x.id===id);
  if (!e) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Editar Despesa';
  document.getElementById('inp-name').value   = e.name;
  document.getElementById('inp-amount').value = e.amount;
  document.getElementById('inp-day').value    = e.day || '';
  document.getElementById('inp-cat').value    = e.cat;
  document.getElementById('inp-status').value = e.status;
  document.getElementById('deleteBtn').style.display = 'inline-flex';
  const sel = document.getElementById('inp-months');
  for (let o of sel.options) o.selected = o.value===String(e.month);
  openModal();
}

function saveExpense() {
  const name   = document.getElementById('inp-name').value.trim();
  const amount = parseFloat(document.getElementById('inp-amount').value);
  const day    = parseInt(document.getElementById('inp-day').value) || null;
  const cat    = document.getElementById('inp-cat').value;
  const status = document.getElementById('inp-status').value;

  if (!name || isNaN(amount) || amount <= 0) {
    showToast('⚠️ Preencha nome e valor corretamente', false);
    return;
  }

  const sel = document.getElementById('inp-months');
  const hasAll = Array.from(sel.selectedOptions).some(o=>o.value==='all');
  const months = hasAll
    ? Array.from({length:12},(_,i)=>i)
    : Array.from(sel.selectedOptions).map(o=>parseInt(o.value));

  if (editingId !== null) {
    const e = state.expenses.find(x=>x.id===editingId);
    if (e) Object.assign(e, { name, amount, day, cat, status });
  } else {
    let id = nextId();
    months.forEach(m => {
      state.expenses.push({ id: id++, name, cat, day, month: m, amount, status });
    });
  }

  closeModal();
  render();
  showToast('✓ Despesa salva!');
}

function deleteExpense() {
  if (editingId === null) return;
  state.expenses = state.expenses.filter(e=>e.id!==editingId);
  closeModal();
  render();
  showToast('Despesa removida');
}

function toggleStatus(id) {
  const e = state.expenses.find(x=>x.id===id);
  if (!e) return;
  const cycle = { pending:'paid', paid:'na', na:'pending' };
  e.status = cycle[e.status] || 'pending';
  render();
  const labels = { paid:'Marcado como pago ✓', na:'Marcado como N/A', pending:'Marcado como pendente' };
  showToast(labels[e.status]);
}

// ===== TOAST =====
function showToast(msg, success=true) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.className = 'toast show' + (success?' success':'');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'), 2500);
}

// ===== TABS =====
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b=> b.classList.toggle('active', b.dataset.tab===name));
  document.querySelectorAll('.tab-content').forEach(c=> c.classList.toggle('active', c.id==='tab-'+name));
  if (name==='overview') renderOverview();
}

// ===== EVENT DELEGATION =====
document.addEventListener('click', e => {
  // Month select
  const mBtn = e.target.closest('.month-btn');
  if (mBtn) { state.selectedMonth = parseInt(mBtn.dataset.m); render(); return; }

  // Tab
  const tabBtn = e.target.closest('.tab-btn');
  if (tabBtn) { switchTab(tabBtn.dataset.tab); return; }

  // Category header toggle
  const catHdr = e.target.closest('.cat-header');
  if (catHdr) {
    const body = catHdr.nextElementSibling;
    const chev = catHdr.querySelector('.chev');
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : '';
    chev.classList.toggle('open', !open);
    return;
  }

  // Toggle status (dashboard)
  const toggleEl = e.target.closest('[data-toggle]');
  if (toggleEl) { toggleStatus(parseInt(toggleEl.dataset.toggle)); return; }

  // Toggle status (overview)
  const ovToggle = e.target.closest('[data-ov-toggle]');
  if (ovToggle) { toggleStatus(parseInt(ovToggle.dataset.ovToggle)); return; }

  // Edit expense (dashboard)
  const editEl = e.target.closest('[data-edit]');
  if (editEl) { openEdit(parseInt(editEl.dataset.edit)); return; }

  // Add expense in category
  const addCat = e.target.closest('[data-addcat]');
  if (addCat) { openAdd(addCat.dataset.addcat); return; }

  // Top add btn
  if (e.target.closest('#openAddBtn')) { openAdd(); return; }

  // Modal save/cancel/delete
  if (e.target.closest('#modalSaveBtn'))   { saveExpense(); return; }
  if (e.target.closest('#modalCancelBtn')) { closeModal(); return; }
  if (e.target.closest('#deleteBtn'))      { deleteExpense(); return; }

  // Income save
  if (e.target.closest('#incomeSaveBtn')) { saveIncome(); return; }

  // Close modal on backdrop
  if (e.target === document.getElementById('modal-addExpense')) { closeModal(); return; }
});

// Income inputs also trigger total update live
['incSalary','incExtra','incOther'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    const sal = parseFloat(document.getElementById('incSalary').value)||0;
    const ext = parseFloat(document.getElementById('incExtra').value)||0;
    const oth = parseFloat(document.getElementById('incOther').value)||0;
    document.getElementById('incomeTotalDisplay').textContent = fmt(sal+ext+oth);
  });
});

// ===== INIT =====
render();
