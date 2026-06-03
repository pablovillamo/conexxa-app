console.log("[Dashboard] loaded");

// ============================================================ ADMIN DETAIL TABS
function switchDetailTab(tab, btn) {
  document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.detail-tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('tab-' + tab);
  if (el) el.classList.add('active');
  if (tab === 'shopify') {
    if (typeof loadShopifyDashboard === 'function' && selectedClientId)
      loadShopifyDashboard(selectedClientId, 'admin');
    renderShopifyChecklist();
  }
  if (tab === 'notas') renderNotes();
  if (tab === 'brain') {
    brainLoadFromLocal();
    brainUpdate();
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
];

// ── Acciones de navegación por módulo (vista cliente) ──────
const CLIENT_MODULE_ACTIONS = {
  progress:             () => showView('view-client-tracker'),
  tasks:                () => showView('view-client-tasks'),
  brain:                () => showView('view-client-brain'),
  integrations:         () => showView('view-client-integrations'),
  shopify_intelligence: () => showView('view-client-shopify'),
  settings:             () => openConfig(),
  team:                 () => showView('view-ceo-team'),
  notes:                null,   // próximamente
  modules:              null,
  finance:              null,
  operations:           null,
  store_intelligence:   null,
  inventory:            null,
  reports:              null,
  program_deliverables: null,
  dashboard:            null,
  users:                null,
};

// ── Categorías de módulos para el OS cliente ───────────────
const CLIENT_MODULE_CATEGORIES = [
  { label: 'Core',         keys: ['progress', 'tasks', 'brain', 'notes'] },
  { label: 'Ecommerce',    keys: ['shopify_intelligence', 'integrations', 'modules'] },
  { label: 'Operaciones',  keys: ['operations', 'finance', 'store_intelligence', 'inventory'] },
  { label: 'Mi Equipo',    keys: ['team'] },
  { label: 'Reportes',     keys: ['reports', 'program_deliverables'] },
  { label: 'Sistema',      keys: ['settings'] },
];

// ── Render principal — OS estilo Conexxa para cliente ──────
function renderClientOS(stats) {
  const root = document.getElementById('view-client-dashboard');
  if (!root) return;

  const p    = currentProfile;
  const role = window.ConexxaRoles ? window.ConexxaRoles.normalizeRole(p?.role) : p?.role;
  const name = (p?.full_name || currentUser?.email || '').split(' ')[0];
  const now  = new Date();
  const dateStr = now.toLocaleDateString('es-CR', { weekday:'long', day:'numeric', month:'long' });

  const { dayNum, pct, pendingCount, doneCount, totalTasks } = stats;

  // ── Quick stats ──────────────────────────────────────────
  const roleLabel = { ceo:'CEO', program_90d:'Programa 90D', collaborator:'Colaborador', client:'CEO' }[role] || 'Usuario';

  const quickStats = [
    { val: pct + '%',       label: 'Progreso',         cls: pct >= 70 ? 'green' : pct >= 30 ? '' : '' },
    { val: dayNum + '/90',  label: 'Días',              cls: 'mono' },
    { val: pendingCount,    label: 'Tareas pendientes', cls: pendingCount > 0 ? 'amber' : 'green' },
    { val: doneCount,       label: 'Completadas',       cls: doneCount > 0 ? 'green' : '' },
  ].map(s => `
    <div class="cc-qs-card ${s.cls}">
      <div class="cc-qs-val" style="${s.cls==='mono'?'font-family:var(--font-mono);':''}">${s.val}</div>
      <div class="cc-qs-label">${s.label}</div>
    </div>
  `).join('');

  // ── Módulos disponibles según rol y permisos ─────────────
  const visibleKeys = window.ConexxaRoles
    ? window.ConexxaRoles.getVisibleModules(p, currentPermissions).map(m => m.key)
    : ['progress','tasks','brain','integrations','shopify_intelligence','settings'];

  const buildClientModCard = (key) => {
    const modDef = window.ConexxaRoles?.MODULES?.find(m => m.key === key);
    if (!modDef) return '';

    const action    = CLIENT_MODULE_ACTIONS[key];
    const isActive  = !!action;
    const badgeTxt  = isActive ? 'Activo' : 'Próximamente';
    const badgeCls  = isActive ? 'active' : 'soon';
    const cardCls   = `cc-mod-card ${isActive ? 'is-active' : 'is-soon'}`;
    const btn = isActive
      ? `<button class="cc-mod-btn open" onclick="clientNavigate('${key}')">Abrir →</button>`
      : `<button class="cc-mod-btn disabled-btn">Próximamente</button>`;

    return `
      <div class="${cardCls}">
        <div class="cc-mod-card-top">
          <span class="cc-mod-badge ${badgeCls}">${badgeTxt}</span>
        </div>
        <div class="cc-mod-name">${modDef.label}</div>
        ${btn}
      </div>
    `;
  };

  const groupsHTML = CLIENT_MODULE_CATEGORIES.map(cat => {
    const keys = cat.keys.filter(k => visibleKeys.includes(k));
    if (!keys.length) return '';
    return `
      <div class="cc-cat-group">
        <div class="cc-cat-label">${cat.label}</div>
        <div class="cc-modules-grid">${keys.map(buildClientModCard).join('')}</div>
      </div>
    `;
  }).join('');

  // ── Frase aleatoria ──────────────────────────────────────
  const frase = FRASES[Math.floor(Math.random() * FRASES.length)];

  root.innerHTML = `
    <div class="cc-body">

      <!-- Welcome -->
      <div class="cc-welcome">
        <div>
          <p class="cc-greeting">Hola, ${name}</p>
          <h1 class="cc-headline">Conexxa OS</h1>
          <p class="cc-sub">${roleLabel} · Centro de operaciones</p>
        </div>
        <div class="cc-date">${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</div>
      </div>

      <!-- Quick Stats -->
      <div class="cc-quick-stats">${quickStats}</div>

      <!-- Frase -->
      <div style="background:var(--panel-surface);border:1px solid var(--border-line);border-left:3px solid var(--acid);border-radius:8px;padding:16px 20px;margin-bottom:28px;">
        <div style="font-size:13px;color:var(--text-secondary);font-style:italic;line-height:1.6;">"${frase.text}"</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px;font-family:var(--font-mono);">— ${frase.author}</div>
      </div>

      <!-- Módulos -->
      <div class="cc-modules">
        <div class="cc-section-header">
          <span class="cc-section-title">Módulos disponibles</span>
        </div>
        ${groupsHTML || '<div style="color:var(--text-muted);font-size:13px;padding:20px 0;">Sin módulos asignados. Contactá al administrador.</div>'}
      </div>

    </div>
  `;
}

// ── Navegación desde módulo cliente ───────────────────────
function clientNavigate(key) {
  const action = CLIENT_MODULE_ACTIONS[key];
  if (typeof action === 'function') action();
}
window.clientNavigate = clientNavigate;

// ── loadDashboard: carga datos y llama renderClientOS ──────
function loadDashboard() {
  showView('view-client-dashboard');
  // Los datos ya fueron cargados por loadClientView — usar los disponibles
  const p = currentProfile;
  let dayNum = 1;
  if (p?.start_date) {
    const diff = Math.floor((Date.now() - new Date(p.start_date).getTime()) / 86400000) + 1;
    dayNum = Math.min(90, Math.max(1, diff));
  }
  renderClientOS({ dayNum, pct: 0, pendingCount: 0, doneCount: 0, totalTasks: 0 });
}

// ── loadClientView: carga datos y renderiza OS con stats ───
async function loadClientView() {
  const userId = currentUser.id;
  const { data: progress } = await sb.from('client_modules').select('*, modules(*)').eq('client_id', userId);
  const { data: tasks }    = await sb.from('tasks').select('*, modules(name,number)').eq('client_id', userId).order('due_date');

  const p = currentProfile;

  // ── Stats para el OS ─────────────────────────────────────
  let dayNum = 1;
  if (p?.start_date) {
    const diff = Math.floor((Date.now() - new Date(p.start_date).getTime()) / 86400000) + 1;
    dayNum = Math.min(90, Math.max(1, diff));
  }
  const doneModules  = (progress || []).filter(r => r.completed).length;
  const pct          = Math.round((doneModules / 9) * 100);
  const pendingCount = (tasks || []).filter(t => !t.completed).length;
  const doneCount    = (tasks || []).filter(t => t.completed).length;
  const totalTasks   = (tasks || []).length;

  // ── Rellenar vista tracker (view-client-tracker) ─────────
  const titleEl = document.getElementById('client-tracker-title');
  if (titleEl) titleEl.textContent = p?.full_name || 'Mi plan';

  const dayBadgeEl = document.getElementById('client-day-badge');
  if (dayBadgeEl) dayBadgeEl.textContent = p?.start_date ? `DÍA ${dayNum} / 90` : 'Programa activo';

  const startStr = p?.start_date ? new Date(p.start_date).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'}) : null;
  const endStr   = p?.end_date   ? new Date(p.end_date).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'}) : null;
  const datesEl = document.getElementById('client-tracker-dates');
  if (datesEl) datesEl.innerHTML = startStr ? `Inicio: <strong>${startStr}</strong>${endStr ? ` &nbsp;·&nbsp; Fin: <strong>${endStr}</strong>` : ''}` : '';

  const pctEl2 = document.getElementById('client-pct'); if (pctEl2) pctEl2.textContent = pct + '%';
  const barEl2 = document.getElementById('client-bar'); if (barEl2) barEl2.style.width  = pct + '%';

  const p1done = (progress||[]).filter(r => r.modules?.phase===1 && r.completed).length;
  const p2done = (progress||[]).filter(r => r.modules?.phase===2 && r.completed).length;
  const p3done = (progress||[]).filter(r => r.modules?.phase===3 && r.completed).length;
  const pillsEl = document.getElementById('client-phase-pills');
  if (pillsEl) pillsEl.innerHTML = [
    { label:'Fase 1', done:p1done, total:2, color:'var(--stable)' },
    { label:'Fase 2', done:p2done, total:3, color:'var(--stable)' },
    { label:'Fase 3', done:p3done, total:4, color:'var(--stable)' },
  ].map(ph => `<div class="phase-pill"><div class="phase-pill-dot" style="background:${ph.color}"></div><span>${ph.label}: ${ph.done}/${ph.total}</span></div>`).join('');

  if (progress && (progress||[]).length > 0) {
    progress.sort((a, b) => (a.modules?.order_index || 0) - (b.modules?.order_index || 0));
    const modListEl = document.getElementById('client-modules-list');
    if (modListEl) modListEl.innerHTML = (progress||[]).map(row => {
      const m = row.modules;
      if (!m) return '';
      return `
        <div class="client-module-row ${row.completed ? 'done' : ''}">
          <div class="client-mod-toggle" style="pointer-events:none;">
            <svg viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="client-mod-info">
            <div class="client-mod-num">MÓDULO ${m.number} · FASE ${m.phase}</div>
            <div class="client-mod-name">${m.name}</div>
            <div class="client-mod-desc">${m.description}</div>
          </div>
          <div class="client-mod-phase">Fase ${m.phase}</div>
        </div>`;
    }).join('');
  }

  // ── Tareas ────────────────────────────────────────────────
  const pctEl        = document.getElementById('tasks-pct');
  const barEl        = document.getElementById('tasks-bar-fill');
  const pendCountEl  = document.getElementById('tasks-pending-count');
  const doneCountEl  = document.getElementById('tasks-done-count');
  const totalCountEl = document.getElementById('tasks-total-count');
  const taskPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;
  if (pctEl)       pctEl.textContent        = taskPct + '%';
  if (barEl)       barEl.style.width        = taskPct + '%';
  if (pendCountEl) pendCountEl.textContent  = pendingCount;
  if (doneCountEl) doneCountEl.textContent  = doneCount;
  if (totalCountEl)totalCountEl.textContent = totalTasks;

  const pendingList = document.getElementById('tasks-pending-list');
  const doneList    = document.getElementById('tasks-done-list');
  const pending = (tasks||[]).filter(t => !t.completed);
  const doneArr = (tasks||[]).filter(t => t.completed);
  if (pendingList) pendingList.innerHTML = pending.length > 0
    ? pending.map(renderTaskItem).join('')
    : '<div class="empty-state">Sin tareas pendientes.</div>';
  if (doneList) doneList.innerHTML = doneArr.length > 0
    ? doneArr.map(renderTaskItem).join('')
    : '<div class="empty-state" style="font-size:12px;padding:16px 0;">Sin tareas completadas aún.</div>';

  // ── Render OS dashboard con stats reales ─────────────────
  renderClientOS({ dayNum, pct, pendingCount, doneCount, totalTasks });
  showView('view-client-dashboard');
}
