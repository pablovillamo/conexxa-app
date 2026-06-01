// ============================================================
// NOTAS OS — Memoria Empresarial Compartida
// Storage: localStorage → preparado para Supabase
// ============================================================

console.log('[NotasOS] loaded');

const NOTAS_KEY = 'notas_os_v1';

// ── Tipos ─────────────────────────────────────────────────

const NOTA_TIPOS = {
  nota_rapida:  { label:'Nota Rápida',  color:'#3B82F6', bg:'rgba(59,130,246,.12)',   border:'rgba(59,130,246,.3)',  icon:'📝' },
  idea:         { label:'Idea',          color:'#EAB308', bg:'rgba(234,179,8,.12)',    border:'rgba(234,179,8,.3)',   icon:'💡' },
  decision:     { label:'Decisión',      color:'#22C55E', bg:'rgba(34,197,94,.12)',    border:'rgba(34,197,94,.3)',   icon:'✅' },
  problema:     { label:'Problema',      color:'#EF4444', bg:'rgba(239,68,68,.12)',    border:'rgba(239,68,68,.3)',   icon:'🚨' },
  aprendizaje:  { label:'Aprendizaje',   color:'#06B6D4', bg:'rgba(6,182,212,.12)',    border:'rgba(6,182,212,.3)',   icon:'🎓' },
  reunion:      { label:'Reunión',       color:'#8B5CF6', bg:'rgba(139,92,246,.12)',   border:'rgba(139,92,246,.3)',  icon:'🎙️' },
  historial:    { label:'Historial',     color:'#6B7280', bg:'rgba(107,114,128,.12)',  border:'rgba(107,114,128,.3)', icon:'📅' },
};

const NOTA_PRIORIDADES = {
  baja:    { label:'Baja',    color:'#6B7280' },
  media:   { label:'Media',   color:'#F59E0B' },
  alta:    { label:'Alta',    color:'#EF4444' },
  critica: { label:'Crítica', color:'#DC2626' },
};

const NOTA_ESTADOS = {
  abierta:     { label:'Abierta',      color:'#22C55E' },
  en_revision: { label:'En revisión',  color:'#F59E0B' },
  resuelta:    { label:'Resuelta',     color:'#6B7280' },
  archivada:   { label:'Archivada',    color:'#374151' },
};

const NOTAS_TAGS = [
  'Marketing','Ventas','Ecommerce','Inventario','Compras','RRHH',
  'Finanzas','Operaciones','IA','Franquicias','Producto','Branding',
  'SEO','Meta Ads','Shopify',
];

// ── Filtros activos ───────────────────────────────────────

let notasFilter = { tipo:'all', clientId:'all', tag:'all', search:'', favorites:false };

// ── Storage API ───────────────────────────────────────────

function notas_getAll() {
  try { return JSON.parse(localStorage.getItem(NOTAS_KEY) || '[]'); }
  catch { return []; }
}

function notas_normalize(nota) {
  // Backward compatibility: ensure new fields exist on old notes
  return {
    is_favorite:  false,
    comments:     [],
    attachments:  [],
    convertido_en: null,
    ...nota,
  };
}

function notas_save(nota) {
  const all = notas_getAll();
  const idx = all.findIndex(n => n.id === nota.id);
  if (idx !== -1) {
    all[idx] = { ...notas_normalize(all[idx]), ...nota, updated_at: new Date().toISOString() };
  } else {
    all.unshift(notas_normalize({
      ...nota,
      id:           crypto.randomUUID(),
      autor:        (typeof currentUser !== 'undefined' && currentUser)
                      ? (typeof currentProfile !== 'undefined' && currentProfile?.full_name) || currentUser.email
                      : 'Admin',
      created_at:   new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    }));
  }
  localStorage.setItem(NOTAS_KEY, JSON.stringify(all));
}

function notas_getById(id) {
  const found = notas_getAll().find(n => n.id === id);
  return found ? notas_normalize(found) : null;
}

function notas_delete(id) {
  localStorage.setItem(NOTAS_KEY, JSON.stringify(notas_getAll().filter(n => n.id !== id)));
}

function notas_filtered() {
  let all = notas_getAll().map(notas_normalize);
  if (notasFilter.tipo !== 'all')     all = all.filter(n => n.tipo === notasFilter.tipo);
  if (notasFilter.clientId !== 'all') all = all.filter(n => n.client_id === notasFilter.clientId);
  if (notasFilter.tag !== 'all')      all = all.filter(n => (n.etiquetas || []).includes(notasFilter.tag));
  if (notasFilter.favorites)          all = all.filter(n => n.is_favorite);
  if (notasFilter.search)             all = all.filter(n =>
    (n.titulo || '').toLowerCase().includes(notasFilter.search) ||
    (n.contenido || '').toLowerCase().includes(notasFilter.search)
  );
  return all;
}

// ── Menciones ─────────────────────────────────────────────

function highlightMentions(text) {
  if (!text) return '';
  const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return escaped.replace(/@([\wÀ-ÿ]+)/g, '<span class="nota-mention">@$1</span>');
}

// ── Render principal ──────────────────────────────────────

function renderNotasOSView() {
  const root = document.getElementById('view-admin-notas-os');
  if (!root) return;

  const clients = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const all     = notas_getAll().map(notas_normalize);

  const kpis = {
    total:       all.length,
    decisiones:  all.filter(n => n.tipo === 'decision').length,
    ideas:       all.filter(n => n.tipo === 'idea').length,
    problemas:   all.filter(n => n.tipo === 'problema').length,
    aprendizajes:all.filter(n => n.tipo === 'aprendizaje').length,
    reuniones:   all.filter(n => n.tipo === 'reunion').length,
  };

  const clientOptions = clients.map(c =>
    `<option value="${c.id}" ${c.id === notasFilter.clientId ? 'selected' : ''}>${c.full_name || c.email || '—'}</option>`
  ).join('');

  const tipoBtns = [{ key:'all', label:'Todas', icon:'📋' },
    ...Object.entries(NOTA_TIPOS).map(([k,v]) => ({ key:k, label:v.label, icon:v.icon }))
  ].map(t => `
    <button class="notas-tipo-btn${notasFilter.tipo === t.key ? ' active' : ''}"
      onclick="notas_filterTipo('${t.key}')"
      ${t.key !== 'all' ? `style="--nt-color:${NOTA_TIPOS[t.key]?.color || '#888'}"` : ''}>
      ${t.icon} ${t.label}
    </button>
  `).join('');

  const tagOptions = NOTAS_TAGS.map(tag =>
    `<option value="${tag}" ${notasFilter.tag === tag ? 'selected' : ''}>${tag}</option>`
  ).join('');

  root.innerHTML = `
    <div class="notas-body">

      <div class="notas-header">
        <div>
          <button class="back-btn" onclick="showAdminView('os')" style="margin-bottom:12px;">
            <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Volver al OS
          </button>
          <p class="notas-eyebrow">Core OS · Conocimiento</p>
          <h1 class="notas-title">Notas OS</h1>
          <p class="notas-sub">La memoria empresarial donde se almacenan ideas, decisiones, aprendizajes, reuniones y conocimiento estratégico.</p>
        </div>
        <button class="notas-add-btn" onclick="openAddNotaModal()">+ Nueva nota</button>
      </div>

      <div class="notas-kpis">
        <div class="notas-kpi notas-kpi-main">
          <div class="notas-kpi-val">${kpis.total}</div>
          <div class="notas-kpi-label">Notas totales</div>
        </div>
        <div class="notas-kpi" style="--nk:${NOTA_TIPOS.decision.color}">
          <div class="notas-kpi-icon">✅</div>
          <div class="notas-kpi-val">${kpis.decisiones}</div>
          <div class="notas-kpi-label">Decisiones</div>
        </div>
        <div class="notas-kpi" style="--nk:${NOTA_TIPOS.idea.color}">
          <div class="notas-kpi-icon">💡</div>
          <div class="notas-kpi-val">${kpis.ideas}</div>
          <div class="notas-kpi-label">Ideas</div>
        </div>
        <div class="notas-kpi" style="--nk:${NOTA_TIPOS.problema.color}">
          <div class="notas-kpi-icon">🚨</div>
          <div class="notas-kpi-val">${kpis.problemas}</div>
          <div class="notas-kpi-label">Problemas</div>
        </div>
        <div class="notas-kpi" style="--nk:${NOTA_TIPOS.aprendizaje.color}">
          <div class="notas-kpi-icon">🎓</div>
          <div class="notas-kpi-val">${kpis.aprendizajes}</div>
          <div class="notas-kpi-label">Aprendizajes</div>
        </div>
        <div class="notas-kpi" style="--nk:${NOTA_TIPOS.reunion.color}">
          <div class="notas-kpi-icon">🎙️</div>
          <div class="notas-kpi-val">${kpis.reuniones}</div>
          <div class="notas-kpi-label">Reuniones</div>
        </div>
      </div>

      <div class="notas-tipo-filters">${tipoBtns}</div>

      <div class="notas-row-filters">
        <input class="notas-search" type="text" placeholder="🔍 Buscar notas..." value="${notasFilter.search}"
          oninput="notas_filterSearch(this.value)" />
        <select class="notas-select" onchange="notas_filterClient(this.value)">
          <option value="all">Todos los clientes</option>
          ${clientOptions}
        </select>
        <select class="notas-select" onchange="notas_filterTag(this.value)">
          <option value="all">Todas las etiquetas</option>
          ${tagOptions}
        </select>
        <button class="notas-fav-toggle${notasFilter.favorites ? ' active' : ''}"
          onclick="notas_toggleFavFilter()" title="Mostrar favoritas">
          ${notasFilter.favorites ? '★' : '☆'} Favoritas
        </button>
      </div>

      <div id="notas-grid"></div>

    </div>
  `;

  notas_renderGrid();
}

// ── Grid ──────────────────────────────────────────────────

function notas_renderGrid() {
  const el = document.getElementById('notas-grid');
  if (!el) return;

  const notas = notas_filtered();

  if (!notas.length) {
    el.innerHTML = `
      <div class="notas-empty">
        <div style="font-size:40px;margin-bottom:12px;">${notasFilter.favorites ? '★' : '📋'}</div>
        <div style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:6px;">
          ${notasFilter.favorites ? 'Sin notas favoritas todavía' : 'Sin notas todavía'}
        </div>
        <div style="font-size:13px;color:var(--gray);margin-bottom:20px;">
          ${notasFilter.favorites ? 'Marcá notas con ★ para verlas aquí.' : 'Empezá a documentar ideas, decisiones y aprendizajes.'}
        </div>
        ${!notasFilter.favorites ? `<button class="notas-add-btn" onclick="openAddNotaModal()">+ Crear primera nota</button>` : ''}
      </div>`;
    return;
  }

  el.innerHTML = `<div class="notas-grid">${notas.map(buildNotaCard).join('')}</div>`;
}

function buildNotaCard(nota) {
  const tipo       = NOTA_TIPOS[nota.tipo]           || NOTA_TIPOS.nota_rapida;
  const prioridad  = NOTA_PRIORIDADES[nota.prioridad] || NOTA_PRIORIDADES.media;
  const estado     = NOTA_ESTADOS[nota.estado]        || NOTA_ESTADOS.abierta;
  const clients    = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const clientName = clients.find(c => c.id === nota.client_id)?.full_name || '—';
  const date       = new Date(nota.created_at).toLocaleDateString('es-CR', { day:'numeric', month:'short', year:'numeric' });
  const tags       = (nota.etiquetas || []).slice(0, 3);
  const preview    = (nota.contenido || '').substring(0, 100) + ((nota.contenido || '').length > 100 ? '…' : '');
  const commentCount = (nota.comments || []).length;
  const linkCount    = (nota.attachments || []).length;

  return `
    <div class="nota-card${nota.is_favorite ? ' nota-card-fav' : ''}"
      style="--nc:${tipo.color};--nc-bg:${tipo.bg};--nc-border:${tipo.border};">

      <div class="nota-card-top">
        <span class="nota-tipo-badge" style="background:${tipo.bg};color:${tipo.color};border-color:${tipo.border};">
          ${tipo.icon} ${tipo.label}
        </span>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="nota-prioridad-badge" style="color:${prioridad.color};">
            ${nota.prioridad === 'critica' ? '🔴' : nota.prioridad === 'alta' ? '🟠' : nota.prioridad === 'media' ? '🟡' : '⚪'} ${prioridad.label}
          </span>
          <button class="nota-fav-btn${nota.is_favorite ? ' active' : ''}"
            onclick="event.stopPropagation();notas_toggleFavorite('${nota.id}')"
            title="${nota.is_favorite ? 'Quitar de favoritas' : 'Marcar como favorita'}">
            ${nota.is_favorite ? '★' : '☆'}
          </button>
        </div>
      </div>

      <div class="nota-card-body" onclick="openNotaDetalle('${nota.id}')">
        <div class="nota-titulo">${nota.titulo || 'Sin título'}</div>
        ${preview ? `<div class="nota-preview">${highlightMentions(preview)}</div>` : ''}
        ${tags.length ? `
          <div class="nota-tags">
            ${tags.map(t => `<span class="nota-tag">${t}</span>`).join('')}
            ${(nota.etiquetas||[]).length > 3 ? `<span class="nota-tag nota-tag-more">+${(nota.etiquetas||[]).length - 3}</span>` : ''}
          </div>` : ''}
      </div>

      <div class="nota-footer">
        <div class="nota-footer-left">
          <span class="nota-client">👤 ${clientName}</span>
          <span class="nota-date">${date}</span>
        </div>
        <div class="nota-footer-right">
          ${commentCount > 0 ? `<span class="nota-comment-count" title="${commentCount} comentario${commentCount !== 1 ? 's' : ''}">💬 ${commentCount}</span>` : ''}
          ${linkCount > 0    ? `<span class="nota-comment-count" title="${linkCount} enlace${linkCount !== 1 ? 's' : ''}">🔗 ${linkCount}</span>` : ''}
          <span class="nota-estado" style="color:${estado.color};">● ${estado.label}</span>
          <button class="nota-delete-btn" onclick="event.stopPropagation();notas_deleteItem('${nota.id}')" title="Eliminar">✕</button>
        </div>
      </div>
    </div>
  `;
}

// ── Detalle de nota ───────────────────────────────────────

function openNotaDetalle(id) {
  const nota = notas_getById(id);
  if (!nota) return;

  const tipo       = NOTA_TIPOS[nota.tipo]           || NOTA_TIPOS.nota_rapida;
  const prioridad  = NOTA_PRIORIDADES[nota.prioridad] || NOTA_PRIORIDADES.media;
  const estado     = NOTA_ESTADOS[nota.estado]        || NOTA_ESTADOS.abierta;
  const clients    = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const clientName = clients.find(c => c.id === nota.client_id)?.full_name || '—';
  const date       = new Date(nota.created_at).toLocaleDateString('es-CR', { day:'numeric', month:'long', year:'numeric' });

  const commentsHTML = buildCommentsHTML(nota);
  const attachmentsHTML = buildAttachmentsHTML(nota);

  document.getElementById('modal-nota-detalle-body').innerHTML = `
    <div class="nota-detalle">

      <!-- Top -->
      <div class="nota-detalle-top">
        <span class="nota-tipo-badge" style="background:${tipo.bg};color:${tipo.color};border-color:${tipo.border};">
          ${tipo.icon} ${tipo.label}
        </span>
        <button class="nota-fav-btn nota-fav-lg${nota.is_favorite ? ' active' : ''}"
          onclick="notas_toggleFavorite('${nota.id}');renderNotaDetalleComments('${nota.id}')"
          title="${nota.is_favorite ? 'Quitar de favoritas' : 'Marcar como favorita'}">
          ${nota.is_favorite ? '★' : '☆'}
        </button>
      </div>

      <!-- Title -->
      <h2 class="nota-detalle-title">${nota.titulo || 'Sin título'}</h2>

      <!-- Meta -->
      <div class="nota-detalle-meta">
        <span>👤 ${clientName}</span>
        <span>✍️ ${nota.autor || '—'}</span>
        <span>📅 ${date}</span>
        <span style="color:${prioridad.color};">
          ${nota.prioridad === 'critica' ? '🔴' : nota.prioridad === 'alta' ? '🟠' : nota.prioridad === 'media' ? '🟡' : '⚪'} ${prioridad.label}
        </span>
        <span style="color:${estado.color};">● ${estado.label}</span>
      </div>

      <!-- Etiquetas -->
      ${(nota.etiquetas||[]).length ? `
        <div class="nota-tags" style="margin-bottom:16px;">
          ${(nota.etiquetas||[]).map(t => `<span class="nota-tag">${t}</span>`).join('')}
        </div>` : ''}

      <!-- Contenido -->
      <div class="nota-detalle-content">${highlightMentions(nota.contenido || '')}</div>

      <!-- Links / Adjuntos -->
      <div class="nota-detalle-section">
        <div class="nota-detalle-section-title">🔗 Enlace adjunto</div>
        ${attachmentsHTML}
        <div class="nota-link-add-row">
          <input class="nota-input" type="url" id="nd-link-url" placeholder="https://..." style="flex:2;" />
          <input class="nota-input" type="text" id="nd-link-name" placeholder="Nombre del enlace" style="flex:1;" />
          <button class="nota-action-btn" onclick="notas_addAttachment('${nota.id}')">+ Agregar</button>
        </div>
      </div>

      <!-- Acciones futuras -->
      <div class="nota-detalle-section">
        <div class="nota-detalle-section-title">⚡ Acciones</div>
        <div class="nota-acciones-row">
          <button class="nota-accion-btn nota-accion-soon" onclick="showOSToast('Convertir en tarea — Próximamente','os-toast-soon')">
            ✅ Convertir en tarea
          </button>
          <button class="nota-accion-btn nota-accion-soon" onclick="showOSToast('Convertir en Brain — Próximamente','os-toast-soon')">
            🧠 Convertir en Brain
          </button>
          <button class="nota-accion-btn nota-accion-archive${nota.estado === 'archivada' ? ' disabled' : ''}"
            onclick="notas_archiveItem('${nota.id}')">
            📦 ${nota.estado === 'archivada' ? 'Archivada' : 'Archivar'}
          </button>
        </div>
      </div>

      <!-- Comentarios -->
      <div class="nota-detalle-section">
        <div class="nota-detalle-section-title">💬 Comentarios</div>
        <div id="nd-comments-list">${commentsHTML}</div>
        <div class="nota-comment-input-row">
          <textarea class="nota-input nota-comment-input" id="nd-new-comment"
            placeholder="Escribir comentario... Usá @Daniela para mencionar a alguien"
            rows="2"></textarea>
          <button class="nota-action-btn" onclick="notas_addComment('${nota.id}')">Agregar</button>
        </div>
      </div>

    </div>
  `;

  openModal('modal-nota-detalle');
}

function buildCommentsHTML(nota) {
  const comments = nota.comments || [];
  if (!comments.length) return `<div class="nota-no-comments">Sin comentarios todavía.</div>`;
  return comments.map(c => {
    const d = new Date(c.created_at).toLocaleDateString('es-CR', { day:'numeric', month:'short' });
    return `
      <div class="nota-comment">
        <div class="nota-comment-header">
          <span class="nota-comment-author">${c.author_name || 'Admin'}</span>
          <span class="nota-comment-date">${d}</span>
        </div>
        <div class="nota-comment-text">${highlightMentions(c.text || '')}</div>
      </div>`;
  }).join('');
}

function buildAttachmentsHTML(nota) {
  const att = nota.attachments || [];
  if (!att.length) return `<div class="nota-no-comments" style="margin-bottom:8px;">Sin enlaces adjuntos.</div>`;
  return `<div class="nota-attachments-list">${att.map(a =>
    `<a href="${a.url}" target="_blank" rel="noopener" class="nota-link-item">
      🔗 ${a.name || a.url}
      <span style="font-size:10px;color:var(--gray);margin-left:4px;">${a.url.substring(0,40)}${a.url.length > 40 ? '…' : ''}</span>
    </a>`
  ).join('')}</div>`;
}

function renderNotaDetalleComments(id) {
  // Refresh just the star icon when toggling favorite from inside the detalle
  const nota = notas_getById(id);
  if (!nota) return;
  const favBtn = document.querySelector('#modal-nota-detalle-body .nota-fav-lg');
  if (favBtn) {
    favBtn.textContent = nota.is_favorite ? '★' : '☆';
    favBtn.classList.toggle('active', nota.is_favorite);
  }
}

// ── Comentarios ───────────────────────────────────────────

function notas_addComment(notaId) {
  const input = document.getElementById('nd-new-comment');
  const text  = input?.value.trim();
  if (!text) return;

  const nota = notas_getById(notaId);
  if (!nota) return;

  const autor = (typeof currentProfile !== 'undefined' && currentProfile?.full_name)
    || (typeof currentUser !== 'undefined' && currentUser?.email)
    || 'Admin';

  const comment = {
    id:          crypto.randomUUID(),
    author_name: autor,
    text,
    created_at:  new Date().toISOString(),
  };

  nota.comments = [...(nota.comments || []), comment];
  notas_save(nota);

  // Refresh comment list inside modal
  const listEl = document.getElementById('nd-comments-list');
  if (listEl) listEl.innerHTML = buildCommentsHTML(nota);
  if (input) input.value = '';

  // Update comment count badge on card if visible
  notas_renderGrid();
}

// ── Adjuntos / Links ──────────────────────────────────────

function notas_addAttachment(notaId) {
  const urlInput  = document.getElementById('nd-link-url');
  const nameInput = document.getElementById('nd-link-name');
  const url  = urlInput?.value.trim();
  const name = nameInput?.value.trim();

  if (!url) {
    if (urlInput) { urlInput.focus(); urlInput.style.borderColor = 'var(--red)'; setTimeout(() => { urlInput.style.borderColor = ''; }, 1500); }
    return;
  }

  const nota = notas_getById(notaId);
  if (!nota) return;

  nota.attachments = [...(nota.attachments || []), {
    id:         crypto.randomUUID(),
    url,
    name:       name || url,
    type:       'link',
    created_at: new Date().toISOString(),
  }];
  notas_save(nota);

  // Refresh attachments section inside modal
  const detalleEl = document.getElementById('modal-nota-detalle-body');
  if (detalleEl) {
    const attSection = detalleEl.querySelector('.nota-attachments-list, .nota-no-comments');
    if (attSection) attSection.outerHTML = buildAttachmentsHTML(nota);
    const newNoComments = detalleEl.querySelector('.nota-no-comments');
    if (newNoComments) newNoComments.outerHTML = buildAttachmentsHTML(nota);
  }

  if (urlInput)  urlInput.value  = '';
  if (nameInput) nameInput.value = '';
  notas_renderGrid();
}

// ── Favoritos ─────────────────────────────────────────────

function notas_toggleFavorite(id) {
  const nota = notas_getById(id);
  if (!nota) return;
  notas_save({ ...nota, is_favorite: !nota.is_favorite });
  notas_renderGrid();
}

function notas_toggleFavFilter() {
  notasFilter.favorites = !notasFilter.favorites;
  const btn = document.querySelector('.notas-fav-toggle');
  if (btn) {
    btn.classList.toggle('active', notasFilter.favorites);
    btn.textContent = (notasFilter.favorites ? '★' : '☆') + ' Favoritas';
  }
  notas_renderGrid();
}

// ── Archivar ──────────────────────────────────────────────

function notas_archiveItem(id) {
  const nota = notas_getById(id);
  if (!nota || nota.estado === 'archivada') return;
  notas_save({ ...nota, estado: 'archivada' });
  closeModal('modal-nota-detalle');
  notas_renderGrid();
  if (typeof showOSToast === 'function') showOSToast('Nota archivada correctamente');
}

// ── Filtros ───────────────────────────────────────────────

function notas_filterTipo(tipo) {
  notasFilter.tipo = tipo;
  document.querySelectorAll('.notas-tipo-btn').forEach(b => b.classList.remove('active'));
  const btns     = document.querySelectorAll('.notas-tipo-btn');
  const tipoKeys = ['all', ...Object.keys(NOTA_TIPOS)];
  const idx      = tipoKeys.indexOf(tipo);
  if (btns[idx]) btns[idx].classList.add('active');
  notas_renderGrid();
}

function notas_filterClient(clientId) { notasFilter.clientId = clientId; notas_renderGrid(); }
function notas_filterTag(tag)         { notasFilter.tag = tag;            notas_renderGrid(); }
function notas_filterSearch(val)      { notasFilter.search = val.toLowerCase(); notas_renderGrid(); }

// ── Modal nueva nota ──────────────────────────────────────

function openAddNotaModal(presetTipo = '') {
  const clients   = typeof allClientsData !== 'undefined' ? allClientsData : [];
  const preClient = notasFilter.clientId !== 'all' ? notasFilter.clientId : (selectedClientId || '');

  document.getElementById('modal-nueva-nota-body').innerHTML = `
    <div class="nota-form-grid">

      <div class="nota-form-field full">
        <label class="nota-form-label">Título <span class="req">*</span></label>
        <input class="nota-input" type="text" id="nf-titulo" placeholder="Ej: Decisión sobre cambio de proveedor" />
      </div>

      <div class="nota-form-field full">
        <label class="nota-form-label">Contenido <span class="req">*</span></label>
        <textarea class="nota-input nota-textarea" id="nf-contenido" rows="5"
          placeholder="Desarrollá la idea, decisión o aprendizaje... Usá @Daniela para mencionar a alguien."></textarea>
      </div>

      <div class="nota-form-field">
        <label class="nota-form-label">Tipo <span class="req">*</span></label>
        <select class="nota-input" id="nf-tipo">
          ${Object.entries(NOTA_TIPOS).map(([k,v]) =>
            `<option value="${k}" ${k === (presetTipo || 'nota_rapida') ? 'selected' : ''}>${v.icon} ${v.label}</option>`
          ).join('')}
        </select>
      </div>

      <div class="nota-form-field">
        <label class="nota-form-label">Cliente <span class="req">*</span></label>
        <select class="nota-input" id="nf-client">
          <option value="">— Seleccionar —</option>
          ${clients.map(c =>
            `<option value="${c.id}" ${c.id === preClient ? 'selected' : ''}>${c.full_name || c.email || '—'}</option>`
          ).join('')}
        </select>
      </div>

      <div class="nota-form-field">
        <label class="nota-form-label">Prioridad</label>
        <select class="nota-input" id="nf-prioridad">
          ${Object.entries(NOTA_PRIORIDADES).map(([k,v]) =>
            `<option value="${k}" ${k === 'media' ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
      </div>

      <div class="nota-form-field">
        <label class="nota-form-label">Estado</label>
        <select class="nota-input" id="nf-estado">
          ${Object.entries(NOTA_ESTADOS).map(([k,v]) =>
            `<option value="${k}" ${k === 'abierta' ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
      </div>

      <div class="nota-form-field full">
        <label class="nota-form-label">Etiquetas <span style="font-size:10px;color:var(--gray);font-weight:400;">(selección múltiple)</span></label>
        <div class="nota-tag-selector" id="nf-tags">
          ${NOTAS_TAGS.map(tag =>
            `<label class="nota-tag-pick"><input type="checkbox" value="${tag}" />${tag}</label>`
          ).join('')}
        </div>
      </div>

    </div>
    <div class="modal-msg" id="nota-form-msg"></div>
  `;

  openModal('modal-nueva-nota');
}

function saveNota() {
  const titulo    = document.getElementById('nf-titulo')?.value.trim();
  const contenido = document.getElementById('nf-contenido')?.value.trim();
  const clientId  = document.getElementById('nf-client')?.value;
  const tipo      = document.getElementById('nf-tipo')?.value;
  const msg       = document.getElementById('nota-form-msg');

  if (!titulo)    { showMsg(msg, 'error', 'El título es requerido.'); return; }
  if (!contenido) { showMsg(msg, 'error', 'El contenido es requerido.'); return; }
  if (!clientId)  { showMsg(msg, 'error', 'Seleccioná un cliente.'); return; }

  const etiquetas = [...document.querySelectorAll('#nf-tags input:checked')].map(el => el.value);

  notas_save({
    titulo,
    contenido,
    tipo,
    etiquetas,
    client_id:  clientId,
    prioridad:  document.getElementById('nf-prioridad')?.value || 'media',
    estado:     document.getElementById('nf-estado')?.value    || 'abierta',
  });

  closeModal('modal-nueva-nota');
  renderNotasOSView();
}

function notas_deleteItem(id) {
  if (!confirm('¿Eliminar esta nota?')) return;
  notas_delete(id);
  const detalle = document.getElementById('modal-nota-detalle');
  if (detalle && detalle.classList.contains('open')) closeModal('modal-nota-detalle');
  notas_renderGrid();
  const kpiEl = document.querySelector('.notas-kpi-main .notas-kpi-val');
  if (kpiEl) kpiEl.textContent = notas_getAll().length;
}

// ── Exports ───────────────────────────────────────────────

window.renderNotasOSView        = renderNotasOSView;
window.openAddNotaModal         = openAddNotaModal;
window.saveNota                 = saveNota;
window.notas_filterTipo         = notas_filterTipo;
window.notas_filterClient       = notas_filterClient;
window.notas_filterTag          = notas_filterTag;
window.notas_filterSearch       = notas_filterSearch;
window.notas_deleteItem         = notas_deleteItem;
window.openNotaDetalle          = openNotaDetalle;
window.notas_addComment         = notas_addComment;
window.notas_addAttachment      = notas_addAttachment;
window.notas_toggleFavorite     = notas_toggleFavorite;
window.notas_toggleFavFilter    = notas_toggleFavFilter;
window.notas_archiveItem        = notas_archiveItem;
window.renderNotaDetalleComments = renderNotaDetalleComments;
window.NOTA_TIPOS               = NOTA_TIPOS;
