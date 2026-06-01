console.log("[Navigation] loaded");

// ============================================================ ADMIN NAV
function showAdminView(view) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  if (view === 'os') {
    showView('view-admin-os');
    if (typeof renderAdminOS === 'function') renderAdminOS();
    if (typeof setSidebarActive === 'function') setSidebarActive('os');
    if (typeof syncSidebarUser === 'function') syncSidebarUser();
  } else if (view === 'clients') {
    showView('view-admin-clients');
    if (typeof setSidebarActive === 'function') setSidebarActive('clients');
  } else if (view === 'notificaciones') {
    showView('view-admin-notificaciones');
    if (typeof renderNotificacionesView === 'function') renderNotificacionesView();
    if (typeof setSidebarActive === 'function') setSidebarActive('notif');
  } else if (view === 'notas-os') {
    showView('view-admin-notas-os');
    if (typeof renderNotasOSView === 'function') renderNotasOSView();
    if (typeof setSidebarActive === 'function') setSidebarActive('notes');
  } else if (view === 'brain') {
    showView('view-admin-brain');
    if (typeof renderAdminBrainView === 'function') renderAdminBrainView();
    if (typeof setSidebarActive === 'function') setSidebarActive('brain');
    // Reinit brain DOM on every visit
    if (typeof renderBrainNav === 'function') renderBrainNav();
    if (typeof renderBrainForm === 'function' && typeof currentBrainModulo !== 'undefined') renderBrainForm(currentBrainModulo);
  } else if (view === 'tasks') {
    showView('view-admin-tasks');
    if (typeof renderAdminTasksView === 'function') renderAdminTasksView();
    if (typeof setSidebarActive === 'function') setSidebarActive('tasks');
  } else if (view === 'finanzas') {
    showView('view-admin-finanzas');
    if (typeof renderAdminFinanzasOS === 'function') renderAdminFinanzasOS();
    if (typeof setSidebarActive === 'function') setSidebarActive('finanzas');
  } else if (view === 'costos') {
    showView('view-admin-costos');
    if (typeof renderCostosView === 'function') renderCostosView();
    if (typeof setSidebarActive === 'function') setSidebarActive('costos');
  } else if (view === 'operaciones') {
    showView('view-admin-operaciones');
    if (typeof renderAdminOperacionesOS === 'function') renderAdminOperacionesOS();
    if (typeof setSidebarActive === 'function') setSidebarActive('ops');
  } else if (view === 'ecommerce') {
    showView('view-admin-ecommerce');
    if (typeof renderAdminEcommerceOS === 'function') renderAdminEcommerceOS();
    if (typeof setSidebarActive === 'function') setSidebarActive('ecom');
  } else if (view === 'integrations') {
    showView('view-admin-integrations');
    if (typeof renderAdminIntegrationsPanel === 'function') renderAdminIntegrationsPanel();
    if (typeof setSidebarActive === 'function') setSidebarActive('integrations');
  } else if (view === 'metodologia') {
    showView('view-admin-metodologia');
    if (typeof renderAdminMetodologia === 'function') renderAdminMetodologia();
    if (typeof setSidebarActive === 'function') setSidebarActive('metodologia');
  } else if (view === 'detail') {
    showView('view-admin-detail');
  }
}

// ============================================================ UTILS
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  if (name === 'auth') document.getElementById('screen-auth').classList.add('active');
  if (name === 'app')  document.getElementById('screen-app').classList.add('active');
  document.getElementById('app-loading').style.display = 'none';
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.querySelectorAll(`#${id} .modal-msg`).forEach(m => m.style.display = 'none');
}

function showMsg(el, type, text) {
  el.className = `auth-msg ${type}`;
  el.textContent = text;
  el.style.display = 'block';
}

document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) closeModal(o.id); });
});

// ============================================================ DROPDOWN
function toggleDropdown() {
  const dd = document.getElementById('user-dropdown');
  dd.classList.toggle('open');
}

function closeDropdown() {
  const dd = document.getElementById('user-dropdown');
  if(dd) dd.classList.remove('open');
}

document.addEventListener('click', (e) => {
  const wrap = document.getElementById('user-dropdown-wrap');
  if (wrap && !wrap.contains(e.target)) closeDropdown();
});
