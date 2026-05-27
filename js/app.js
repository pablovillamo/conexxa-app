console.log("[App] loaded");

const SUPABASE_URL = 'https://crgtdkbobxfbiicuxrfj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZ3Rka2JvYnhmYmlpY3V4cmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODE5ODEsImV4cCI6MjA5NTA1Nzk4MX0.iXSvOrqaEpC-Gw1pdOCOO90pYejzZEJjF0AUR7oEpAA';
const ADMIN_EMAIL = 'pablovillamo123@gmail.com';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentProfile = null;
let selectedClientId = null;
let allModules = [];

async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    await loadUserProfile(session.user);
  } else {
    showScreen('auth');
  }
  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) await loadUserProfile(session.user);
    else if (event === 'SIGNED_OUT') showScreen('auth');
  });
}

async function loadUserProfile(user) {
  currentUser = user;
  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
  currentProfile = profile;

  const { data: mods } = await sb.from('modules').select('*').order('order_index');
  allModules = mods || [];

  const sel = document.getElementById('nt-module');
  sel.innerHTML = '<option value="">Sin módulo específico</option>';
  allModules.forEach(m => {
    const o = document.createElement('option');
    o.value = m.id;
    o.textContent = `Módulo ${m.number} — ${m.name}`;
    sel.appendChild(o);
  });

  const initials = (profile?.full_name || user.email || 'VG').substring(0,2).toUpperCase();
  document.getElementById('user-avatar').textContent = initials;
  document.getElementById('user-name-display').textContent = profile?.full_name || (user.email || '').split('@')[0];
  const ddName = document.getElementById('dd-name');
  if(ddName) ddName.textContent = profile?.full_name || user.email;
  const ddEmail = document.getElementById('dd-email');
  if(ddEmail) ddEmail.textContent = user.email;
  if(profile?.role === 'client') {
    const ddMod = document.getElementById('dd-modules-btn');
    if(ddMod) ddMod.style.display = 'flex';
  }

  if (profile?.role === 'admin') {
    document.getElementById('admin-nav').style.display = 'flex';
    showScreen('app');
    await loadAdminClients();
    showAdminView('clients');
  } else {
    document.getElementById('admin-nav').style.display = 'none';
    showScreen('app');
    await loadClientView();
    loadDashboard();
  }
  document.getElementById('app-loading').style.display = 'none';
}

function openAuditoria(num) {
  alert('Auditoría ' + num + ' — Próximamente podrás documentar reuniones aquí.');
}

// ============================================================ START
document.getElementById('app-loading').style.display = 'flex';
init();
