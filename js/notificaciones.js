// ============================================================
// NOTIFICACIONES OS — Gestión de mutes del Admin
// Mutear = dejar de recibir alertas. NO oculta datos.
// Storage: localStorage → preparado para Supabase
// ============================================================

console.log('[Notificaciones] loaded');

const MUTES_KEY = 'notification_mutes_v1';

// ── Storage API ───────────────────────────────────────────

function mutes_getAll() {
  try { return JSON.parse(localStorage.getItem(MUTES_KEY) || '[]'); }
  catch { return []; }
}

function mutes_save(all) {
  localStorage.setItem(MUTES_KEY, JSON.stringify(all));
}

function mutes_isMuted(type, id) {
  return mutes_getAll().some(m => m.mute_type === type && (type === 'client' ? m.client_id === id : m.user_id === id) && m.muted);
}

function mutes_toggle(type, id, reason = '') {
  const all    = mutes_getAll();
  const field  = type === 'client' ? 'client_id' : 'user_id';
  const idx    = all.findIndex(m => m.mute_type === type && m[field] === id);
  const adminId = (typeof currentUser !== 'undefined' && currentUser?.id) || 'admin';

  if (idx !== -1) {
    all[idx].muted    = !all[idx].muted;
    all[idx].muted_at = new Date().toISOString();
  } else {
    all.push({
      id:         crypto.randomUUID(),
      admin_id:   adminId,
      mute_type:  type,
      client_id:  type === 'client' ? id : null,
      user_id:    type === 'user'   ? id : null,
      muted:      true,
      muted_at:   new Date().toISOString(),
      reason,
    });
  }
  mutes_save(all);
}

// ── Render principal ──────────────────────────────────────

function renderNotificacionesView() {
  const root = document.getElementById('view-admin-notificaciones');
  if (!root) return;

  const clients   = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const allMutes  = mutes_getAll();
  const mutedCount = allMutes.filter(m => m.muted).length;

  // Collect authors from existing notes for user mutes
  const notas = typeof notas_getAll === 'function' ? notas_getAll() : [];
  const autorSet = {};
  notas.forEach(n => { if (n.autor) autorSet[n.autor] = true; });
  const autores = Object.keys(autorSet).filter(Boolean);

  root.innerHTML = `
    <div class="notif-body">

      <button class="back-btn" onclick="showAdminView('os')" style="margin-bottom:16px;">
        <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Volver al OS
      </button>

      <p class="notif-eyebrow">Core OS · Admin</p>
      <h1 class="notif-title">Notificaciones</h1>
      <p class="notif-sub">Controlá qué alertas recibís. Mutear no oculta datos — el Super Admin siempre ve todo.</p>

      <!-- Info banner -->
      <div class="notif-banner">
        <div class="notif-banner-icon">
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M8 2L3 4.5V9c0 2.5 2.2 4.5 5 5 2.8-.5 5-2.5 5-5V4.5L8 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
        </div>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--white);margin-bottom:3px;">Visibilidad siempre completa</div>
          <div style="font-size:12px;color:var(--gray);line-height:1.5;">
            Como Super Admin ves <strong style="color:var(--white);">todas las notas de todos los clientes, usuarios y colaboradores</strong>
            sin excepción. Mutear solo silencia las alertas de ese cliente o usuario — nunca oculta información.
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="notif-stats">
        <div class="notif-stat">
          <div class="notif-stat-val">${clients.length}</div>
          <div class="notif-stat-label">Clientes en plataforma</div>
        </div>
        <div class="notif-stat">
          <div class="notif-stat-val" style="color:${mutedCount > 0 ? 'var(--amber)' : 'var(--green)'};">${mutedCount}</div>
          <div class="notif-stat-label">Mutes activos</div>
        </div>
        <div class="notif-stat">
          <div class="notif-stat-val">${autores.length}</div>
          <div class="notif-stat-label">Autores con notas</div>
        </div>
      </div>

      <!-- Section: Clientes -->
      <div class="notif-section">
        <div class="notif-section-header">
          <div>
            <div class="notif-section-title">Notificaciones por cliente</div>
            <div class="notif-section-sub">Silenciá alertas de un cliente completo sin perder visibilidad.</div>
          </div>
        </div>
        <div class="notif-list">
          ${clients.length === 0
            ? `<div class="notif-empty">No hay clientes registrados.</div>`
            : clients.map(c => buildMuteRow('client', c.id, c.full_name || c.email || '—', c.nicho || '', c.client_status || '')).join('')}
        </div>
      </div>

      <!-- Section: Usuarios / Autores -->
      <div class="notif-section">
        <div class="notif-section-header">
          <div>
            <div class="notif-section-title">Notificaciones por usuario</div>
            <div class="notif-section-sub">Silenciá alertas de un colaborador o autor específico.</div>
          </div>
        </div>
        <div class="notif-list">
          ${autores.length === 0
            ? `<div class="notif-empty">Cuando haya notas creadas por usuarios, aparecerán aquí.</div>`
            : autores.map(autor => buildMuteRow('user', autor, autor, 'Autor de notas', '')).join('')}
        </div>
      </div>

      <!-- Future -->
      <div class="notif-future">
        <div class="notif-future-title">⏳ Próximamente</div>
        <div class="notif-future-items">
          <span>Mutear por tipo de nota</span>
          <span>Mutear por prioridad</span>
          <span>Horarios de silencio</span>
          <span>Digest semanal</span>
          <span>Notificaciones push</span>
        </div>
      </div>

    </div>
  `;
}

function buildMuteRow(type, id, name, sub, status) {
  const muted = mutes_isMuted(type, id);
  const statusColor = status === 'activo' ? 'var(--green)' : 'var(--gray)';
  const initials = name.substring(0, 2).toUpperCase();

  return `
    <div class="notif-row${muted ? ' notif-row-muted' : ''}" id="notif-row-${type}-${id.replace(/[^a-zA-Z0-9]/g,'_')}">
      <div class="notif-row-left">
        <div class="notif-avatar">${initials}</div>
        <div>
          <div class="notif-row-name">${name}</div>
          <div class="notif-row-sub">
            ${sub ? `${sub}` : ''}
            ${status ? `<span style="color:${statusColor};"> · ● ${status}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="notif-row-right">
        ${muted ? `<span class="notif-muted-badge">🔕 Silenciado</span>` : `<span class="notif-active-badge">🔔 Activo</span>`}
        <button class="notif-toggle-btn${muted ? ' muted' : ''}"
          onclick="notif_toggle('${type}','${id}',this)">
          ${muted ? 'Reactivar' : 'Silenciar'}
        </button>
      </div>
    </div>
  `;
}

function notif_toggle(type, id, btn) {
  mutes_toggle(type, id);
  const muted = mutes_isMuted(type, id);
  const rowId = `notif-row-${type}-${id.replace(/[^a-zA-Z0-9]/g,'_')}`;
  const row = document.getElementById(rowId);

  if (row) {
    row.classList.toggle('notif-row-muted', muted);
    const badge = row.querySelector('.notif-muted-badge, .notif-active-badge');
    if (badge) {
      badge.className = muted ? 'notif-muted-badge' : 'notif-active-badge';
      badge.textContent = muted ? '🔕 Silenciado' : '🔔 Activo';
    }
  }

  if (btn) {
    btn.classList.toggle('muted', muted);
    btn.textContent = muted ? 'Reactivar' : 'Silenciar';
  }

  // Update mute count in stats
  const statEls = document.querySelectorAll('.notif-stat-val');
  if (statEls[1]) {
    const count = mutes_getAll().filter(m => m.muted).length;
    statEls[1].textContent = count;
    statEls[1].style.color = count > 0 ? 'var(--amber)' : 'var(--green)';
  }

  if (typeof showOSToast === 'function') {
    showOSToast(muted
      ? `${type === 'client' ? 'Cliente' : 'Usuario'} silenciado — seguís viendo todas sus notas`
      : `Notificaciones reactivadas`
    );
  }
}

// ── Exports ───────────────────────────────────────────────

window.renderNotificacionesView = renderNotificacionesView;
window.notif_toggle             = notif_toggle;
window.mutes_isMuted            = mutes_isMuted;
window.mutes_getAll             = mutes_getAll;
