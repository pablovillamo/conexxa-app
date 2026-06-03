console.log("[Config] loaded");

// ── Theme system ──────────────────────────────────────────

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('conexxa_theme', theme);
  _syncThemeButtons(theme);
}

function _syncThemeButtons(theme) {
  ['', '-admin'].forEach(suffix => {
    const d = document.getElementById('theme-btn-dark'  + suffix);
    const l = document.getElementById('theme-btn-light' + suffix);
    if (d) d.classList.toggle('active', theme === 'dark');
    if (l) l.classList.toggle('active', theme === 'light');
  });
}

function initTheme() {
  const saved = localStorage.getItem('conexxa_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  _syncThemeButtons(saved);
}

window.setTheme  = setTheme;
window.initTheme = initTheme;

function openConfig() {
  closeDropdown();
  const p = currentProfile;
  if(p) {
    const ownerEl = document.getElementById('cfg-owner'); if(ownerEl) ownerEl.value = p.full_name || '';
    const emailEl = document.getElementById('cfg-email'); if(emailEl) emailEl.value = p.email || '';
    const nichoEl = document.getElementById('cfg-nicho'); if(nichoEl) nichoEl.value = p.nicho || '';
    const startEl = document.getElementById('cfg-start-date');
    if(startEl && p.start_date) startEl.value = new Date(p.start_date).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
    const endEl = document.getElementById('cfg-end-date');
    if(endEl && p.end_date) endEl.value = new Date(p.end_date).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
    const daysEl = document.getElementById('cfg-days');
    if(daysEl && p.start_date) {
      const diff = Math.floor((Date.now() - new Date(p.start_date).getTime()) / 86400000) + 1;
      daysEl.value = `Día ${Math.min(90, Math.max(1, diff))} de 90`;
    }
  }
  showView('view-client-config');
  setTimeout(loadSavedLogo, 100);
  _syncThemeButtons(localStorage.getItem('conexxa_theme') || 'dark');
}

function openChangePassword() {
  closeDropdown();
  alert('Para cambiar tu contraseña, cierra sesión y usa "¿Olvidé mi contraseña?" en la pantalla de inicio.');
}

function previewLogo(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { alert('El archivo es muy grande. Máximo 2MB.'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('logo-preview');
    const placeholder = document.getElementById('logo-placeholder');
    const removeBtn = document.getElementById('logo-remove-btn');
    img.src = e.target.result;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    removeBtn.style.display = 'inline';
    localStorage.setItem('business_logo_' + (currentUser?.id || 'user'), e.target.result);
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  const img = document.getElementById('logo-preview');
  const placeholder = document.getElementById('logo-placeholder');
  const removeBtn = document.getElementById('logo-remove-btn');
  const input = document.getElementById('logo-upload');
  img.src = ''; img.style.display = 'none';
  placeholder.style.display = 'block';
  removeBtn.style.display = 'none';
  input.value = '';
  localStorage.removeItem('business_logo_' + (currentUser?.id || 'user'));
}

function loadSavedLogo() {
  const saved = localStorage.getItem('business_logo_' + (currentUser?.id || 'user'));
  if (saved) {
    const img = document.getElementById('logo-preview');
    const placeholder = document.getElementById('logo-placeholder');
    const removeBtn = document.getElementById('logo-remove-btn');
    if(img) { img.src = saved; img.style.display = 'block'; }
    if(placeholder) placeholder.style.display = 'none';
    if(removeBtn) removeBtn.style.display = 'inline';
  }
}

// ── Admin config ──────────────────────────────────────────

function openAdminConfig() {
  const p = currentProfile;
  const nameEl  = document.getElementById('admin-cfg-name');
  const emailEl = document.getElementById('admin-cfg-email');
  if (nameEl  && p) nameEl.value  = p.full_name || '';
  if (emailEl && p) emailEl.value = currentUser?.email || '';
  _syncThemeButtons(localStorage.getItem('conexxa_theme') || 'dark');
}

async function saveAdminConfig() {
  const btn = document.getElementById('view-admin-config')?.querySelector('.btn-save');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
  try {
    const fullName = document.getElementById('admin-cfg-name')?.value?.trim() || '';
    if (currentUser && fullName) {
      await sb.from('profiles').update({ full_name: fullName }).eq('id', currentUser.id);
      currentProfile = { ...currentProfile, full_name: fullName };
      window.ConexxaState.setCurrentProfile(currentProfile);
      const nameEl = document.getElementById('user-name-display');
      if (nameEl) nameEl.textContent = fullName;
      const ddNameEl = document.getElementById('dd-name');
      if (ddNameEl) ddNameEl.textContent = fullName;
      if (typeof syncSidebarUser === 'function') syncSidebarUser();
    }
    if (btn) btn.textContent = 'Guardado';
  } catch(e) {
    if (btn) btn.textContent = 'Error — intenta de nuevo';
  } finally {
    if (btn) { btn.disabled = false; setTimeout(() => { btn.textContent = 'Guardar cambios'; }, 2000); }
  }
}

window.openAdminConfig = openAdminConfig;
window.saveAdminConfig = saveAdminConfig;

async function saveConfig() {
  const btn = document.querySelector('.btn-save');
  if(btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
  try {
    const nicho = document.getElementById('cfg-nicho')?.value || '';
    const fullName = document.getElementById('cfg-owner')?.value || '';
    if(currentUser) {
      await sb.from('profiles').update({ nicho, full_name: fullName }).eq('id', currentUser.id);
      currentProfile = { ...currentProfile, nicho, full_name: fullName };
      const nameEl = document.getElementById('user-name-display');
      if(nameEl) nameEl.textContent = fullName || currentUser.email.split('@')[0];
      const ddNameEl = document.getElementById('dd-name');
      if(ddNameEl) ddNameEl.textContent = fullName || currentUser.email;
    }
    if(btn) btn.textContent = 'Guardado ✓';
  } catch(e) {
    if(btn) btn.textContent = 'Error — intenta de nuevo';
  } finally {
    if(btn) {
      btn.disabled = false;
      setTimeout(() => { btn.textContent = 'Guardar cambios'; }, 2000);
    }
  }
}
