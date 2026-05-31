// ============================================================
// V-GROWTH OS — ADMIN OS DASHBOARD
// ============================================================

console.log('[AdminOS] loaded');

function renderAdminOS() {
  const root = document.getElementById('view-admin-os');
  if (!root) return;

  const categories = [
    { id: 'villamo',      label: 'Villamo Growth',  kicker: 'Programa activo' },
    { id: 'core',         label: 'Core OS',          kicker: 'Gestión central' },
    { id: 'business',     label: 'Business OS',      kicker: 'Módulos empresariales' },
    { id: 'integrations', label: 'Integraciones',    kicker: 'Conexiones activas' },
    { id: 'ai',           label: 'IA OS',            kicker: 'Inteligencia artificial' },
  ];

  const activeCount   = OS_MODULES.filter(m => m.status === 'active').length;
  const comingCount   = OS_MODULES.filter(m => m.status === 'coming_soon').length;
  const lockedCount   = OS_MODULES.filter(m => m.status === 'locked').length;

  const sectionsHTML = categories.map(cat => {
    const mods = getModulesByCategory(cat.id);
    if (!mods.length) return '';

    const cardsHTML = mods.map(mod => buildModuleCard(mod)).join('');

    return `
      <div class="os-category">
        <div class="os-category-header">
          <span class="os-category-label">${cat.label}</span>
          <span class="os-category-kicker">${cat.kicker}</span>
        </div>
        <div class="os-grid">${cardsHTML}</div>
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <div class="os-body">

      <div class="os-header">
        <div>
          <p class="os-eyebrow">V-GROWTH OS · ADMIN</p>
          <h1 class="os-title">Sistema Operativo</h1>
          <p class="os-sub">Centro de control para operaciones, clientes e integraciones.</p>
        </div>
        <div class="os-header-stats">
          <div class="os-stat">
            <span class="os-stat-val">${activeCount}</span>
            <span class="os-stat-label">Activos</span>
          </div>
          <div class="os-stat">
            <span class="os-stat-val" style="color:var(--amber)">${comingCount}</span>
            <span class="os-stat-label">Próximamente</span>
          </div>
          <div class="os-stat">
            <span class="os-stat-val" style="color:var(--gray)">${lockedCount}</span>
            <span class="os-stat-label">Bloqueados</span>
          </div>
        </div>
      </div>

      ${sectionsHTML}

    </div>
  `;
}

function buildModuleCard(mod) {
  const isActive  = mod.status === 'active';
  const isLocked  = mod.status === 'locked';
  const isSoon    = mod.status === 'coming_soon';

  const statusBadge = isActive
    ? `<span class="os-badge os-badge-active">Activo</span>`
    : isSoon
      ? `<span class="os-badge os-badge-soon">Próximamente</span>`
      : `<span class="os-badge os-badge-locked">Bloqueado</span>`;

  const indicator = isActive
    ? `<div class="os-card-arrow">→</div>`
    : isLocked
      ? `<div class="os-card-lock">🔒</div>`
      : `<div class="os-card-lock" style="opacity:.4;">⏳</div>`;

  const clickAttr = isActive && mod.action
    ? `onclick="handleOSModuleClick('${mod.id}')"`
    : isSoon
      ? `onclick="osModuleSoon('${mod.name}')"`
      : isLocked
        ? `onclick="osModuleLocked('${mod.name}')"`
        : '';

  const cardClass = `os-card${isActive ? ' os-card-active' : ''}${isLocked ? ' os-card-locked' : ''}${isSoon ? ' os-card-soon' : ''}`;

  return `
    <div class="${cardClass}" ${clickAttr}>
      <div class="os-card-top">
        <div class="os-card-icon">${mod.icon}</div>
        ${statusBadge}
      </div>
      <div class="os-card-name">${mod.name}</div>
      <div class="os-card-desc">${mod.description}</div>
      ${indicator}
    </div>
  `;
}

function handleOSModuleClick(moduleId) {
  const mod = getModuleById(moduleId);
  if (!mod || !mod.action) return;
  mod.action();
}

function osModuleSoon(name) {
  // Feedback sutil sin alert bloqueante
  const toast = document.createElement('div');
  toast.className = 'os-toast';
  toast.textContent = `${name} — Próximamente disponible`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function osModuleLocked(name) {
  const toast = document.createElement('div');
  toast.className = 'os-toast os-toast-locked';
  toast.textContent = `${name} — Requiere plan Enterprise`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

window.renderAdminOS       = renderAdminOS;
window.handleOSModuleClick = handleOSModuleClick;
window.osModuleSoon        = osModuleSoon;
window.osModuleLocked      = osModuleLocked;
