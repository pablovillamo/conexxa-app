console.log("[EditClient] loaded");

// ── Editar cliente ────────────────────────────────────────────────────────────
let ecPhotoFile = null;

async function openEditClientModal() {
  if (!selectedClientId) return;
  ecPhotoFile = null;

  const { data: client, error } = await sb.from('profiles').select('*').eq('id', selectedClientId).single();
  if (error || !client) { alert('No se pudo cargar el cliente.'); return; }

  // Poblar campos
  const s = id => document.getElementById(id);
  s('ec-name').value           = client.full_name || '';
  s('ec-email').value          = client.email || '';
  s('ec-phone').value          = client.phone || '';
  s('ec-industry').value       = client.industry || '';
  s('ec-nicho').value          = client.nicho || '';
  s('ec-business-type').value  = client.business_type || '';
  s('ec-country').value        = client.country_market || '';
  s('ec-website').value        = client.website || '';
  s('ec-instagram').value      = client.instagram || '';
  s('ec-tiktok').value         = client.tiktok || '';
  s('ec-facebook').value       = client.facebook || '';
  s('ec-other-socials').value  = client.other_socials || '';
  s('ec-start-date').value     = client.start_date || '';
  s('ec-end-date').value       = client.end_date || '';
  s('ec-client-status').value  = client.client_status || 'activo';
  s('ec-assigned-to').value    = client.assigned_to || '';
  s('ec-business-status').value= client.business_status || '';
  s('ec-internal-notes').value = client.internal_notes || '';

  // Avatar
  const preview = s('ec-avatar-preview');
  if (client.profile_image_url) {
    preview.innerHTML = `<img src="${client.profile_image_url}" alt="foto" />`;
  } else {
    const initials = (client.full_name || client.email || 'VG').substring(0, 2).toUpperCase();
    preview.innerHTML = initials;
  }

  // Reset indicador
  const ind = s('ec-save-indicator');
  if (ind) { ind.classList.remove('visible', 'error'); }
  const btn = s('ec-save-btn');
  if (btn) { btn.disabled = false; btn.textContent = 'Guardar cambios'; }

  document.getElementById('ec-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeEditClientModal() {
  document.getElementById('ec-modal').classList.remove('open');
  document.body.style.overflow = '';
  ecPhotoFile = null;
}

function ecModalBgClose(e) {
  if (e.target === document.getElementById('ec-modal')) closeEditClientModal();
}

function ecPhotoSelected(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { alert('La imagen no puede superar 2MB.'); return; }
  ecPhotoFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('ec-avatar-preview');
    preview.innerHTML = `<img src="${e.target.result}" alt="preview" />`;
  };
  reader.readAsDataURL(file);
}

async function saveEditClient() {
  if (!selectedClientId) return;
  const s = id => document.getElementById(id);
  const btn = s('ec-save-btn');
  const ind = s('ec-save-indicator');
  const indText = s('ec-save-text');

  btn.disabled = true;
  btn.textContent = 'Guardando...';
  ind.classList.remove('visible', 'error');

  try {
    let imageUrl = null;

    // Subir foto si se seleccionó una
    if (ecPhotoFile) {
      const ext  = ecPhotoFile.name.split('.').pop();
      const path = `${selectedClientId}/avatar.${ext}`;
      const { error: uploadErr } = await sb.storage
        .from('client-avatars')
        .upload(path, ecPhotoFile, { upsert: true, contentType: ecPhotoFile.type });
      if (uploadErr) throw new Error('Error subiendo foto: ' + uploadErr.message);
      const { data: urlData } = sb.storage.from('client-avatars').getPublicUrl(path);
      imageUrl = urlData?.publicUrl || null;
    }

    const updates = {
      full_name:         s('ec-name').value.trim() || null,
      phone:             s('ec-phone').value.trim() || null,
      industry:          s('ec-industry').value.trim() || null,
      nicho:             s('ec-nicho').value.trim() || null,
      business_type:     s('ec-business-type').value.trim() || null,
      country_market:    s('ec-country').value.trim() || null,
      website:           s('ec-website').value.trim() || null,
      instagram:         s('ec-instagram').value.trim() || null,
      tiktok:            s('ec-tiktok').value.trim() || null,
      facebook:          s('ec-facebook').value.trim() || null,
      other_socials:     s('ec-other-socials').value.trim() || null,
      start_date:        s('ec-start-date').value || null,
      end_date:          s('ec-end-date').value || null,
      client_status:     s('ec-client-status').value,
      assigned_to:       s('ec-assigned-to').value.trim() || null,
      business_status:   s('ec-business-status').value.trim() || null,
      internal_notes:    s('ec-internal-notes').value.trim() || null,
      updated_at:        new Date().toISOString(),
    };
    if (imageUrl) updates.profile_image_url = imageUrl;

    const { error: updateErr } = await sb.from('profiles').update(updates).eq('id', selectedClientId);
    if (updateErr) throw new Error(updateErr.message);

    // Actualizar allClientsData en memoria
    const idx = allClientsData.findIndex(c => c.id === selectedClientId);
    if (idx !== -1) allClientsData[idx] = { ...allClientsData[idx], ...updates };

    // Refrescar header del perfil sin cerrar el modal todavía
    ecRefreshDetailHeader({ ...allClientsData[idx] || {}, ...updates, profile_image_url: imageUrl || allClientsData[idx]?.profile_image_url });

    // Éxito
    btn.disabled = false;
    btn.textContent = 'Guardar cambios';
    ind.classList.add('visible');
    indText.textContent = 'Guardado correctamente';
    setTimeout(() => {
      ind.classList.remove('visible');
      closeEditClientModal();
    }, 1600);

  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Guardar cambios';
    ind.classList.add('visible', 'error');
    indText.textContent = err.message || 'Error al guardar';
  }
}

function ecRefreshDetailHeader(client) {
  const avatarEl = document.getElementById('detail-avatar');
  const nameEl   = document.getElementById('detail-client-name');
  const metaEl   = document.getElementById('detail-client-meta');
  if (!avatarEl || !nameEl) return;

  // Avatar — foto o iniciales
  if (client.profile_image_url) {
    avatarEl.innerHTML = `<img src="${client.profile_image_url}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" alt="" />`;
    avatarEl.style.padding = '0';
  } else {
    const initials = (client.full_name || client.email || 'VG').substring(0, 2).toUpperCase();
    avatarEl.innerHTML = initials;
    avatarEl.style.padding = '';
  }

  nameEl.textContent = client.full_name || client.email || '—';

  if (metaEl) {
    const startStr = client.start_date ? new Date(client.start_date).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}) : 'Sin definir';
    const endStr   = client.end_date   ? new Date(client.end_date).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}) : 'Sin definir';
    let dayNum = '—';
    if (client.start_date) {
      const diff = Math.floor((Date.now() - new Date(client.start_date).getTime()) / 86400000) + 1;
      dayNum = Math.min(90, Math.max(1, diff));
    }
    const nicho     = client.nicho     ? `<div class="detail-meta-item">Nicho: <strong>${client.nicho}</strong></div>` : '';
    const industry  = client.industry  ? `<div class="detail-meta-item">Industria: <strong>${client.industry}</strong></div>` : '';
    const statusMap = { activo:'Activo', pausado:'Pausado', pendiente:'Pendiente', completado:'Completado' };
    const statusColor = { activo:'var(--green)', pausado:'var(--amber)', pendiente:'var(--gray)', completado:'#818CF8' };
    const st = client.client_status || 'activo';
    metaEl.innerHTML = `
      ${nicho}${industry}
      <div class="detail-meta-item">Inicio: <strong>${startStr}</strong></div>
      <div class="detail-meta-item">Fin: <strong>${endStr}</strong></div>
      <div class="detail-meta-item mono" style="color:var(--green)">Día ${dayNum} de 90</div>
      <div class="detail-meta-item" style="color:${statusColor[st]||'var(--green)'}">● ${statusMap[st]||st}</div>
    `;
  }
}
