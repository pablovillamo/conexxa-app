console.log("[Navigation] loaded");

// ============================================================ ADMIN NAV
function showAdminView(view) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (view === 'clients') {
    document.querySelector('.nav-btn').classList.add('active');
    showView('view-admin-clients');
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
