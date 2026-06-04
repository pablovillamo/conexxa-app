console.log('[ConexxaHome] loaded');

// ============================================================
// CONEXXA HOME — Launcher / pantalla inicial del admin
// Vista separada del dashboard actual (view-admin-os). No lo
// reemplaza: solo es la primera pantalla al entrar como admin.
// ============================================================

// Cards de acceso rápido → cada una navega a una vista admin existente.
const CONEXXA_HOME_CARDS = [
  {
    title: 'Admin OS',
    desc:  'Gestiona clientes, CEOs, servicios, apps y usuarios del sistema.',
    view:  'clients',
    icon:  '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v6l9 4 9-4V7" fill="none"/>',
  },
  {
    title: 'Core OS',
    desc:  'Accede al núcleo: dashboard, IA, tareas, notas y configuración.',
    view:  'os',
    icon:  '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  },
  {
    title: 'Módulos',
    desc:  'Activa y administra módulos para escalar tu operación.',
    view:  'ecommerce',
    icon:  '<path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z"/><path d="M12 11l8-4.5M12 11v9M12 11L4 6.5"/>',
  },
  {
    title: 'Clientes',
    desc:  'Visualiza y administra tus clientes y su información clave.',
    view:  'clients',
    icon:  '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4a3 3 0 0 1 0 6M21 20a6 6 0 0 0-5-5.9"/>',
  },
  {
    title: 'Brain IA',
    desc:  'Inteligencia artificial que te ayuda a decidir y automatizar.',
    view:  'brain',
    icon:  '<path d="M12 4a4 4 0 0 0-4 4v8a4 4 0 0 0 8 0V8a4 4 0 0 0-4-4z"/><path d="M8 9h8M8 13h8"/>',
  },
  {
    title: 'Tareas',
    desc:  'Organiza, asigna y da seguimiento a las tareas de tu equipo.',
    view:  'tasks',
    icon:  '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M8 12l3 3 5-6"/>',
  },
];

let _conexxaHomeMouseBound = false;

function renderConexxaHome() {
  const root = document.getElementById('view-conexxa-home');
  if (!root) { console.warn('[ConexxaHome] view-conexxa-home no encontrado'); return; }

  const cardsHTML = CONEXXA_HOME_CARDS.map((c, i) => `
    <button class="conexxa-home-card" onclick="conexxaHomeGo('${c.view}')" aria-label="${c.title}">
      <div class="conexxa-home-card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${c.icon}</svg>
      </div>
      <div class="conexxa-home-card-title">${c.title}</div>
      <div class="conexxa-home-card-desc">${c.desc}</div>
      <span class="conexxa-home-card-arrow">
        <svg viewBox="0 0 16 16" fill="none" style="width:16px;height:16px;"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </button>
  `).join('');

  root.innerHTML = `
    <div class="conexxa-home-inner">
      <div class="conexxa-home-hero">
        <div class="conexxa-home-logo">
          <img src="/conexxa-64.png" alt="Conexxa" />
        </div>
        <div class="conexxa-home-subtitle">Sistema Operativo Empresarial</div>
        <h1 class="conexxa-home-title">Conexxa OS</h1>
        <p class="conexxa-home-desc">Unifica procesos, datos e inteligencia para tomar mejores decisiones y escalar tu negocio con claridad y control.</p>
      </div>

      <div class="conexxa-home-cards">${cardsHTML}</div>

      <div class="conexxa-home-metrics" id="conexxa-home-metrics">
        ${homeMetricCard('—', 'Clientes activos')}
        ${homeMetricCard('—', 'Usuarios')}
        ${homeMetricCard('—', 'Apps activas')}
        ${homeMetricCard('—', 'Módulos activos')}
      </div>
    </div>
  `;

  bindConexxaHomeMouse();
  renderConexxaHomeMetrics();
}

function homeMetricCard(val, label) {
  return `<div class="conexxa-home-metric">
    <div class="conexxa-home-metric-val">${val}</div>
    <div class="conexxa-home-metric-label">${label}</div>
  </div>`;
}

// Navegación de las cards hacia vistas admin existentes.
function conexxaHomeGo(view) {
  if (typeof showAdminView === 'function') showAdminView(view);
}
window.conexxaHomeGo = conexxaHomeGo;

// Glow que sigue el cursor — un solo listener delegado en el root.
function bindConexxaHomeMouse() {
  if (_conexxaHomeMouseBound) return;
  const root = document.getElementById('view-conexxa-home');
  if (!root) return;
  root.addEventListener('mousemove', (e) => {
    const rect = root.getBoundingClientRect();
    root.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    root.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });
  _conexxaHomeMouseBound = true;
}

// KPIs mínimos: usa datos ya cargados; el total de usuarios se consulta aparte.
async function renderConexxaHomeMetrics() {
  const wrap = document.getElementById('conexxa-home-metrics');
  if (!wrap) return;

  const clients = (typeof allClientsData !== 'undefined' && allClientsData) ? allClientsData : [];
  const isActive = (c) => c.is_active !== false;

  const clientesActivos = clients.filter(isActive).length;
  const appsActivas = clients.filter(c => c.role === 'app_client' && isActive(c)).length;
  const modulosActivos = (typeof OS_MODULES !== 'undefined' ? OS_MODULES : []).filter(m => m.status === 'active').length;

  // Usuarios: total de perfiles. Fallback al nº de clientes comerciales.
  let usuarios = clients.length;
  try {
    const client = (typeof sb !== 'undefined' && sb) || (window.ConexxaState && window.ConexxaState.getSupabaseClient && window.ConexxaState.getSupabaseClient());
    if (client) {
      const { count, error } = await client.from('profiles').select('id', { count: 'exact', head: true });
      if (!error && typeof count === 'number') usuarios = count;
    }
  } catch (err) {
    console.warn('[ConexxaHome] no se pudo contar usuarios, usando fallback:', err);
  }

  wrap.innerHTML =
    homeMetricCard(clientesActivos, 'Clientes activos') +
    homeMetricCard(usuarios, 'Usuarios') +
    homeMetricCard(appsActivas, 'Apps activas') +
    homeMetricCard(modulosActivos, 'Módulos activos');
}

window.renderConexxaHome = renderConexxaHome;
