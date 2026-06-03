console.log("[App] loaded");

const SUPABASE_URL = 'https://crgtdkbobxfbiicuxrfj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZ3Rka2JvYnhmYmlpY3V4cmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODE5ODEsImV4cCI6MjA5NTA1Nzk4MX0.iXSvOrqaEpC-Gw1pdOCOO90pYejzZEJjF0AUR7oEpAA';
const ADMIN_EMAIL = 'pablovillamo123@gmail.com';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.ConexxaState.setSupabaseClient(sb);

let currentUser        = null;
let currentProfile     = null;
let selectedClientId   = null;
let allModules         = [];
let currentPermissions = [];   // user_module_permissions del usuario activo

function safeShowScreen(name) {
  if (typeof window.showScreen === 'function') {
    window.showScreen(name);
  } else {
    console.error('[App] showScreen no está disponible — navigation.js no cargó correctamente');
    document.getElementById('app-loading').style.display = 'none';
    if (name === 'auth') document.getElementById('screen-auth')?.classList.add('active');
    if (name === 'app')  document.getElementById('screen-app')?.classList.add('active');
  }
}

async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    await loadUserProfile(session.user);
  } else {
    safeShowScreen('auth');
  }
  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN'  && session) await loadUserProfile(session.user);
    if (event === 'SIGNED_OUT') safeShowScreen('auth');
  });
}

async function loadUserProfile(user) {
  currentUser = user;
  window.ConexxaState.setCurrentUser(user);

  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
  currentProfile = profile;
  window.ConexxaState.setCurrentProfile(profile);

  // ── Verificar cuenta activa ──────────────────────────────
  if (profile?.is_active === false) {
    console.warn('[App] Cuenta desactivada — redirigiendo a auth');
    await sb.auth.signOut();
    safeShowScreen('auth');
    return;
  }

  // ── Cargar módulos del programa ──────────────────────────
  const { data: mods } = await sb.from('modules').select('*').order('order_index');
  allModules = mods || [];
  window.ConexxaState.setAllModules(allModules);

  // ── Cargar permisos si es colaborador ────────────────────
  if (profile?.role === 'collaborator') {
    const { data: perms } = await sb
      .from('user_module_permissions')
      .select('*')
      .eq('user_id', user.id);
    currentPermissions = perms || [];
  }

  // ── Selector de módulo en formularios ────────────────────
  const sel = document.getElementById('nt-module');
  if (sel) {
    sel.innerHTML = '<option value="">Sin módulo específico</option>';
    allModules.forEach(m => {
      const o = document.createElement('option');
      o.value = m.id;
      o.textContent = `Módulo ${m.number} — ${m.name}`;
      sel.appendChild(o);
    });
  }

  // ── UI común: avatar, nombre ─────────────────────────────
  const initials = (profile?.full_name || user.email || 'CX').substring(0,2).toUpperCase();
  document.getElementById('user-avatar').textContent = initials;
  document.getElementById('user-name-display').textContent = profile?.full_name || (user.email || '').split('@')[0];
  const ddName  = document.getElementById('dd-name');
  const ddEmail = document.getElementById('dd-email');
  if (ddName)  ddName.textContent  = profile?.full_name || user.email;
  if (ddEmail) ddEmail.textContent = user.email;

  // ── Render por rol ───────────────────────────────────────
  const role = window.ConexxaRoles
    ? window.ConexxaRoles.normalizeRole(profile?.role)
    : profile?.role;

  console.log('[App] role:', role);

  switch (role) {
    case 'admin':
      _showAdminShell();
      await loadAdminClients();
      if (typeof renderSidebarNav === 'function') renderSidebarNav();
      showAdminView('os');
      break;

    case 'ceo':
      _showClientShell();
      _showCEOModulesBtn();
      await loadClientView();
      loadDashboard();
      break;

    case 'program_90d':
      _showClientShell();
      await loadClientView();
      loadDashboard();
      break;

    case 'collaborator':
      _showClientShell();
      await loadClientView();
      loadDashboard();
      break;

    default:
      // Rol desconocido — fallback seguro, NO muestra admin
      console.warn('[App] Rol desconocido:', profile?.role, '— mostrando acceso limitado');
      _showClientShell();
      _showAccessDenied();
      break;
  }

  document.getElementById('app-loading').style.display = 'none';
}

// ── Helpers de shell ─────────────────────────────────────

function _showAdminShell() {
  document.getElementById('admin-nav').style.display    = 'none';
  document.getElementById('os-sidebar').style.display   = 'flex';
  document.getElementById('screen-app').classList.add('admin-mode');
  safeShowScreen('app');
}

function _showClientShell() {
  document.getElementById('admin-nav').style.display    = 'none';
  document.getElementById('os-sidebar').style.display   = 'none';
  document.getElementById('screen-app').classList.remove('admin-mode');
  safeShowScreen('app');
}

function _showCEOModulesBtn() {
  const ddMod = document.getElementById('dd-modules-btn');
  if (ddMod) ddMod.style.display = 'flex';
}

function _showAccessDenied() {
  const v = document.getElementById('view-client-dashboard');
  if (v) {
    v.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:16px;text-align:center;padding:40px;">
        <svg viewBox="0 0 24 24" fill="none" width="40" height="40" style="color:var(--text-muted)"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <div style="font-size:18px;font-weight:600;color:var(--text-primary);">Acceso no configurado</div>
        <div style="font-size:13px;color:var(--text-muted);max-width:360px;">Tu cuenta no tiene un tipo de acceso configurado correctamente. Contactá al administrador de Conexxa.</div>
        <button onclick="logout()" style="margin-top:8px;padding:10px 20px;background:var(--border-line);border:none;border-radius:8px;color:var(--text-primary);cursor:pointer;font-size:13px;">Cerrar sesión</button>
      </div>`;
    showView('view-client-dashboard');
  }
}

function openAuditoria(num) {
  alert('Auditoría ' + num + ' — Próximamente podrás documentar reuniones aquí.');
}

// ============================================================ START
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('app-loading').style.display = 'flex';
  init();
});
