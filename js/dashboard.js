console.log("[Dashboard] loaded");

// ============================================================ ADMIN DETAIL TABS
function switchDetailTab(tab, btn) {
  document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.detail-tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('tab-' + tab);
  if(el) el.classList.add('active');
if(tab === 'shopify') {

  if (
    typeof loadShopifyDashboard === 'function' &&
    selectedClientId
  ) {

    loadShopifyDashboard(
      selectedClientId,
      'admin'
    );
  }

  renderShopifyChecklist();
}  if(tab === 'notas') renderNotes();
  if(tab === 'brain') {
    brainLoadFromLocal();
    brainUpdate();
    // Si el módulo de identidad está activo, pre-llenamos desde el perfil
    if (currentBrainModulo === 'identidad') {
      const client = (allClientsData || []).find(c => c.id === selectedClientId);
      if (client) brainPrefillFromProfile(client);
    }
  }
}

// ============================================================ FRASES
const FRASES = [
  { text: 'El éxito no es el destino, es el resultado de sistemas bien construidos.', author: 'Conexxa' },
  { text: 'Tu marca no crece por accidente. Crece por diseño.', author: 'Conexxa' },
  { text: 'No vendas productos. Construye experiencias que la gente no pueda ignorar.', author: 'Conexxa' },
  { text: 'La consistencia hace lo que el talento no puede hacer solo.', author: 'Conexxa' },
  { text: 'El mercado recompensa a quienes entienden a su cliente mejor que nadie.', author: 'Conexxa' },
  { text: 'Escalar no es trabajar más. Es construir el sistema correcto.', author: 'Conexxa' },
  { text: 'Tu ecommerce es tan fuerte como los datos que decides entender.', author: 'Conexxa' },
  { text: 'La automatización no reemplaza tu marca. La libera.', author: 'Conexxa' },
  { text: 'Cada decisión sin datos es una apuesta. Cada decisión con datos es estrategia.', author: 'Conexxa' },
  { text: 'Una marca con estructura puede escalar. Una sin estructura solo sobrevive.', author: 'Conexxa' },
  { text: 'El crecimiento sostenible no se improvisa. Se diseña paso a paso.', author: 'Conexxa' },
  { text: 'No esperes el momento perfecto. Construye el sistema que lo crea.', author: 'Conexxa' },
];

function loadDashboard() {
  const frase = FRASES[Math.floor(Math.random() * FRASES.length)];
  const quoteEl = document.getElementById('dashboard-quote');
  const authorEl = document.getElementById('dashboard-quote-author');
  if (quoteEl) quoteEl.textContent = frase.text;
  if (authorEl) authorEl.textContent = frase.author;
  showView('view-client-dashboard');
}

async function loadClientView() {
  const userId = currentUser.id;
  const { data: progress } = await sb.from('client_modules').select('*, modules(*)').eq('client_id', userId);
  if (progress) progress.sort((a, b) => (a.modules?.order_index || 0) - (b.modules?.order_index || 0));
  const { data: tasks } = await sb.from('tasks').select('*, modules(name,number)').eq('client_id', userId).order('due_date');

  const p = currentProfile;
  const titleEl = document.getElementById('client-tracker-title');
  if (titleEl) titleEl.textContent = p?.full_name || 'Mi plan';

  let dayNum = 1;
  if (p?.start_date) {
    const diff = Math.floor((Date.now() - new Date(p.start_date).getTime()) / 86400000) + 1;
    dayNum = Math.min(90, Math.max(1, diff));
  }
  const dayBadgeEl = document.getElementById('client-day-badge');
  if (dayBadgeEl) dayBadgeEl.textContent = p?.start_date ? `DÍA ${dayNum} / 90` : 'Programa activo';

  const startStr = p?.start_date ? new Date(p.start_date).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'}) : null;
  const endStr = p?.end_date ? new Date(p.end_date).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'}) : null;
  const datesEl = document.getElementById('client-tracker-dates');
  if (datesEl) datesEl.innerHTML = startStr ? `Inicio: <strong>${startStr}</strong>${endStr ? ` &nbsp;·&nbsp; Fin: <strong>${endStr}</strong>` : ''}` : '';

  const doneModules = (progress||[]).filter(p => p.completed).length;
  const pct = Math.round((doneModules / 9) * 100);
  const pctEl2 = document.getElementById('client-pct'); if(pctEl2) pctEl2.textContent = pct + '%';
  const barEl2 = document.getElementById('client-bar'); if(barEl2) barEl2.style.width = pct + '%';

  const p1done = (progress||[]).filter(p => p.modules?.phase===1 && p.completed).length;
  const p2done = (progress||[]).filter(p => p.modules?.phase===2 && p.completed).length;
  const p3done = (progress||[]).filter(p => p.modules?.phase===3 && p.completed).length;
  const pillsEl = document.getElementById('client-phase-pills');
  if(pillsEl) pillsEl.innerHTML = [
    { label:'Fase 1', done:p1done, total:2, color:'#22C55E' },
    { label:'Fase 2', done:p2done, total:3, color:'#16A34A' },
    { label:'Fase 3', done:p3done, total:4, color:'#085041' },
  ].map(ph => `<div class="phase-pill"><div class="phase-pill-dot" style="background:${ph.color}"></div><span>${ph.label}: ${ph.done}/${ph.total}</span></div>`).join('');

  const modListEl = document.getElementById('client-modules-list');
  if(modListEl) modListEl.innerHTML = (progress||[]).map(row => {
    const m = row.modules;
    if (!m) return '';
    return `
      <div class="client-module-row ${row.completed ? 'done' : ''}" style="cursor:default;">
        <div class="client-mod-toggle" style="pointer-events:none;">
          <svg viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="client-mod-info">
          <div class="client-mod-num">MÓDULO ${m.number} · FASE ${m.phase}</div>
          <div class="client-mod-name">${m.name}</div>
          <div class="client-mod-desc">${m.description}</div>
        </div>
        <div class="client-mod-phase">Fase ${m.phase}</div>
      </div>
    `;
  }).join('');

  const pendingList = document.getElementById('tasks-pending-list');
  const doneList = document.getElementById('tasks-done-list');
  const total = (tasks||[]).length;
  const doneCount = (tasks||[]).filter(t => t.completed).length;
  const pendingCount = total - doneCount;
  const taskPct = total > 0 ? Math.round((doneCount/total)*100) : 0;

  const pctEl = document.getElementById('tasks-pct');
  const barEl = document.getElementById('tasks-bar-fill');
  const pendCountEl = document.getElementById('tasks-pending-count');
  const doneCountEl = document.getElementById('tasks-done-count');
  const totalCountEl = document.getElementById('tasks-total-count');
  if(pctEl) pctEl.textContent = taskPct + '%';
  if(barEl) barEl.style.width = taskPct + '%';
  if(pendCountEl) pendCountEl.textContent = pendingCount;
  if(doneCountEl) doneCountEl.textContent = doneCount;
  if(totalCountEl) totalCountEl.textContent = total;

  const pending = (tasks||[]).filter(t => !t.completed);
  const doneArr = (tasks||[]).filter(t => t.completed);
  if(pendingList) pendingList.innerHTML = pending.length > 0 ? pending.map(renderTaskItem).join('') : '<div class="empty-state">Sin tareas pendientes. ¡Bien hecho!</div>';
  if(doneList) doneList.innerHTML = doneArr.length > 0 ? doneArr.map(renderTaskItem).join('') : '<div class="empty-state" style="font-size:12px;padding:16px 0;">Sin tareas completadas aún.</div>';

  showView('view-client-dashboard');
}
