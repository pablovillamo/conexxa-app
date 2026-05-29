console.log("[Brain] version 2026-05-26-v2");
// ── Helpers ───────────────────────────────────────────────────────────────────
function getBrainModulo(slug) {
  return BRAIN_MODULOS.find(m => m.slug === slug);
}

function getAllFieldIds(slug) {
  const mod = getBrainModulo(slug);
  if (!mod) return [];
  return mod.secciones.flatMap(s => s.campos.map(c => c.id));
}

function getRequiredFieldIds(slug) {
  const mod = getBrainModulo(slug);
  if (!mod) return [];
  return mod.secciones.flatMap(s => s.campos.filter(c => c.req).map(c => c.id));
}

function countFilledFields(ids) {
  return ids.filter(id => {
    const el = document.getElementById(id);
    return el && el.value.trim().length > 2;
  }).length;
}

// ── Render: nav de módulos ────────────────────────────────────────────────────
function renderBrainNav() {
  const nav = document.getElementById('brain-module-nav');
  if (!nav) return;
  nav.innerHTML = BRAIN_MODULOS.map(mod => {
    const allIds = getAllFieldIds(mod.slug);
    const filled = countFilledFields(allIds);
    const pct = allIds.length ? Math.round((filled / allIds.length) * 100) : 0;
    const active = mod.slug === currentBrainModulo ? ' active' : '';
    return `<button class="brain-mod-btn${active}" onclick="switchBrainModule('${mod.slug}')">
      <span class="brain-mod-icon">${mod.icon}</span>
      <span class="brain-mod-num">${mod.num}</span>
      <span class="brain-mod-label">${mod.nombre}</span>
      <span class="brain-mod-pct">${pct}%</span>
    </button>`;
  }).join('');
}

// ── Render: formulario de un módulo ──────────────────────────────────────────
function renderBrainForm(slug) {
  const mod = getBrainModulo(slug);
  if (!mod) return;
  const content = document.getElementById('brain-module-content');
  if (!content) return;

  const chevSvg = `<svg class="brain-section-chevron" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  content.innerHTML = mod.secciones.map((sec, si) => {
    const secAllIds  = sec.campos.map(c => c.id);
    const secFilled  = countFilledFields(secAllIds);
    const open       = sec.abierta ? ' open' : '';
    const chevOpen   = sec.abierta ? ' open' : '';

    const camposHtml = buildCamposHtml(sec.campos);

    return `<div class="brain-section" id="brain-sec-${sec.id}">
      <div class="brain-section-header" onclick="toggleBrainSection('${sec.id}')">
        <div class="brain-section-num" id="brain-num-${sec.id}">${String.fromCharCode(65 + si)}</div>
        <div class="brain-section-title">${sec.titulo}</div>
        <div class="brain-section-meta" id="brain-meta-${sec.id}">${secFilled} / ${secAllIds.length}</div>
        <svg class="brain-section-chevron${chevOpen}" id="brain-chev-${sec.id}" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="brain-section-body${open}" id="brain-body-${sec.id}">
        ${camposHtml}
      </div>
    </div>`;
  }).join('');

  // Attach listeners for autosave + progress
  getAllFieldIds(slug).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => { brainUpdate(); brainSaveToLocal(); });
    }
  });

  // Load saved data
  brainLoadFromLocal();
}

function buildCamposHtml(campos) {
  // Group consecutive pairs that aren't 'full' into rows
  let html = '';
  let i = 0;
  while (i < campos.length) {
    const c = campos[i];
    const next = campos[i + 1];
    const isTextarea = c.tipo === 'textarea';
    const nextIsTextarea = next && next.tipo === 'textarea';
    // Put two non-full fields side by side if both are inputs, or both textarea with same rows
    const canPair = next && !c.full && !next.full && c.tipo === next.tipo && (c.tipo === 'input' || (c.rows || 3) === (next.rows || 3));

    if (canPair) {
      html += `<div class="brain-field-row">${buildFieldHtml(c)}${buildFieldHtml(next)}</div>`;
      i += 2;
    } else {
      html += buildFieldHtml(c, true);
      i += 1;
    }
  }
  return html;
}

function buildFieldHtml(campo, full) {
  const reqSpan = campo.req ? ' <span class="req">*</span>' : '';
  const hintHtml = campo.hint ? `<div class="brain-hint">${campo.hint}</div>` : '';
  const fullClass = full ? ' full' : '';
  let inputHtml = '';
  if (campo.tipo === 'textarea') {
    inputHtml = `<textarea class="brain-textarea" id="${campo.id}" rows="${campo.rows || 3}" placeholder="${campo.placeholder || ''}" oninput="brainUpdate()"></textarea>`;
  } else if (campo.tipo === 'select') {
    const opts = (campo.opciones || []).map(o => `<option value="${o}">${o}</option>`).join('');
    inputHtml = `<select class="brain-select" id="${campo.id}" onchange="brainUpdate()"><option value="">Seleccionar...</option>${opts}</select>`;
  } else {
    inputHtml = `<input class="brain-input" id="${campo.id}" type="text" placeholder="${campo.placeholder || ''}" oninput="brainUpdate()" />`;
  }
  return `<div class="brain-field${fullClass}">
    <div class="brain-label">${campo.label}${reqSpan}</div>
    ${hintHtml}
    ${inputHtml}
  </div>`;
}

// ── Switch módulo ─────────────────────────────────────────────────────────────
function switchBrainModule(slug) {
  currentBrainModulo = slug;
  const mod = getBrainModulo(slug);
  if (!mod) return;

  // Reset output state
  brainMasterContent = '';
  const outWrap = document.getElementById('brain-output-wrap');
  const genWrap = document.getElementById('brain-generating');
  if (outWrap) outWrap.classList.remove('visible');
  if (genWrap) genWrap.classList.remove('visible');
  const btnPDF   = document.getElementById('btn-dl-pdf');
  const btnMD    = document.getElementById('btn-dl-md');
  const btnEmail = document.getElementById('btn-send-email');
  if (btnPDF)   btnPDF.disabled   = true;
  if (btnMD)    btnMD.disabled    = true;
  if (btnEmail) btnEmail.disabled = true;
  const badge = document.getElementById('brain-version-badge');
  if (badge) badge.style.display = 'none';

  // Update header
  const eyebrow = document.getElementById('brain-eyebrow');
  const title   = document.getElementById('brain-mod-title');
  const sub     = document.getElementById('brain-mod-sub');
  const genLbl  = document.getElementById('btn-brain-gen-label');
  const outTitle= document.getElementById('brain-output-title');
  if (eyebrow)  eyebrow.textContent  = `Brain Generator · Módulo ${mod.num} de 08`;
  if (title) {
    title.childNodes[0].textContent = mod.fullName + ' ';
  }
  if (sub) sub.textContent = mod.sub;
  if (genLbl) genLbl.textContent = `Generar ${mod.docName}.md con IA`;
  if (outTitle) outTitle.textContent = `${mod.docName.toUpperCase()}.MD — GENERADO`;

  // Re-render form
  renderBrainForm(slug);
  renderBrainNav();
  brainUpdate();
}

// ── Progreso ─────────────────────────────────────────────────────────────────
function brainUpdate() {
  const mod = getBrainModulo(currentBrainModulo);
  if (!mod) return;

  const allIds = getAllFieldIds(currentBrainModulo);
  const filled = countFilledFields(allIds);
  const total  = allIds.length;
  const pct    = total ? Math.round((filled / total) * 100) : 0;

  const fillEl  = document.getElementById('brain-progress-fill');
  const pctEl   = document.getElementById('brain-progress-pct');
  const cntEl   = document.getElementById('brain-progress-count');
  const numEl   = document.getElementById('brain-filled-count');
  const totEl   = document.getElementById('brain-total-count');
  if (fillEl) fillEl.style.width = pct + '%';
  if (pctEl)  pctEl.textContent  = pct + '%';
  if (cntEl)  cntEl.textContent  = filled + ' de ' + total + ' campos';
  if (numEl)  numEl.textContent  = filled;
  if (totEl)  totEl.textContent  = total;

  // Update section counters
  mod.secciones.forEach(sec => {
    const secIds   = sec.campos.map(c => c.id);
    const secFilled= countFilledFields(secIds);
    const metaEl   = document.getElementById('brain-meta-' + sec.id);
    const numEl2   = document.getElementById('brain-num-' + sec.id);
    if (metaEl) metaEl.textContent = secFilled + ' / ' + secIds.length;
    if (numEl2) numEl2.classList.toggle('done-num', secFilled === secIds.length);
  });

  // Update nav percentages
  renderBrainNav();
}

// ── Acordeones ───────────────────────────────────────────────────────────────
function toggleBrainSection(sec) {
  const body = document.getElementById('brain-body-' + sec);
  const chev = document.getElementById('brain-chev-' + sec);
  if (!body) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (chev) chev.classList.toggle('open', !isOpen);
}

// ── Obtener valores del módulo activo ─────────────────────────────────────────
function getBrainModuleValues(slug) {
  const ids = getAllFieldIds(slug);
  const result = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    result[id] = el ? el.value.trim() : '';
  });
  return result;
}

// ── Generar con Claude ────────────────────────────────────────────────────────
async function generateBrainMaster() {
  const mod = getBrainModulo(currentBrainModulo);
  if (!mod) return;

  const v = getBrainModuleValues(currentBrainModulo);
  const reqIds = getRequiredFieldIds(currentBrainModulo);
  const missing = reqIds.filter(id => !v[id] || v[id].length < 3);
  if (missing.length > 0) {
    alert('Completá los campos obligatorios (marcados con *) antes de generar.');
    return;
  }

  const prompt    = buildModulePrompt(currentBrainModulo, v);
  console.log('[Brain] Módulo:', currentBrainModulo, '|', mod.fullName);
  console.log('[Brain] Prompt chars:', prompt.length, '| Prompt tokens ~', Math.round(prompt.length / 4));
  const btnGen    = document.getElementById('btn-brain-gen');
  const btnGenLbl = document.getElementById('btn-brain-gen-label');
  const genWrap   = document.getElementById('brain-generating');
  const genText   = document.getElementById('brain-generating-text');
  const outWrap   = document.getElementById('brain-output-wrap');
  const outContent= document.getElementById('brain-output-content');
  const outTitle  = document.getElementById('brain-output-title');
  const btnPDF    = document.getElementById('btn-dl-pdf');
  const btnMD     = document.getElementById('btn-dl-md');
  const btnEmail  = document.getElementById('btn-send-email');
  const badge     = document.getElementById('brain-version-badge');

  btnGen.disabled = true;
  if (btnGenLbl) btnGenLbl.textContent = 'Generando...';
  genWrap.classList.add('visible');
  outWrap.classList.remove('visible');
  brainMasterContent = '';

  const statusMessages = [
    'La IA está analizando el contexto...',
    `Construyendo ${mod.fullName}...`,
    'Redactando con profundidad estratégica...',
    'Estructurando las secciones del documento...',
    'Finalizando el documento Master...'
  ];
  let si = 0;
  const statusInterval = setInterval(() => {
    si = (si + 1) % statusMessages.length;
    if (genText) genText.textContent = statusMessages[si];
  }, 3000);

  const t0 = Date.now();

  try {
    const invokePromise = fetch(
      'https://crgtdkbobxfbiicuxrfj.supabase.co/functions/v1/generate-brain',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      }
    ).then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      return {
        data,
        error: null
      };
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 140000)
    );

    console.log('[Brain] Invocando generate-brain...');

    const { data, error } = await Promise.race([
      invokePromise,
      timeoutPromise
    ]);
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log('[Brain] Respuesta en', elapsed + 's');
    console.log('[Brain] error obj:', error);
    console.log('[Brain] data keys:', data ? Object.keys(data) : null);
    if (data) {
      console.log('[Brain] data.ok:', data.ok, '| content blocks:', (data.content || []).length);
      console.log('[Brain] model:', data.model, '| stop_reason:', data.stop_reason, '| usage:', data.usage);
    }

    if (error) throw new Error(error.message || 'Error en la Edge Function');
    if (!data) throw new Error('Sin respuesta del servidor');
    if (data.ok === false) throw new Error(data.error || 'Error en el servidor');
    const text = (data.content || []).map(b => b.text || '').join('');
    if (!text) throw new Error('La IA no devolvió contenido');
    if (data.stop_reason === 'max_tokens') {
      console.warn('[Brain] Documento cortado por max_tokens — output limitado a 4096 tokens');
    }
    console.log('[Brain] Output tokens:', data.usage?.output_tokens, '| chars:', text.length);

    brainMasterContent = text;
    outContent.textContent = text;
    outWrap.classList.add('visible');
    if (outTitle) outTitle.textContent = `${mod.docName.toUpperCase()}.MD — GENERADO`;

    if (btnPDF)   btnPDF.disabled   = false;
    if (btnMD)    btnMD.disabled    = false;
    if (btnEmail) btnEmail.disabled = false;
    if (badge) { badge.textContent = 'v1.0'; badge.style.display = 'inline-flex'; }

    const emailEl = document.getElementById('brain-email-to');
    if (emailEl && selectedClientId) {
      const client = (typeof allClientsData !== 'undefined' ? allClientsData : []).find(c => c.id === selectedClientId);
      if (client && client.email) {
        emailEl.value = client.email;
        brainCurrentClientEmail = client.email;
      }
    }
  } catch (err) {
    console.error('[Brain] Error después de', ((Date.now() - t0) / 1000).toFixed(1) + 's:', err.message);
    const elapsed2 = ((Date.now() - t0) / 1000).toFixed(1);
    const isTimeout = err.message === 'TIMEOUT' || (Date.now() - t0) > 130000;
    const msg = isTimeout
      ? `Timeout después de ${elapsed2}s. La Edge Function superó el límite de Supabase (150s). Intentá nuevamente — suele funcionar al segundo intento.`
      : 'Error generando el documento: ' + err.message;
    alert(msg);
  } finally {
    clearInterval(statusInterval);
    genWrap.classList.remove('visible');
    btnGen.disabled = false;
    if (btnGenLbl) btnGenLbl.textContent = 'Regenerar con IA';
  }
}

// ── Descargar .md ─────────────────────────────────────────────────────────────
function downloadBrainMD() {
  if (!brainMasterContent) return;
  const mod = getBrainModulo(currentBrainModulo);
  const v = getBrainModuleValues(currentBrainModulo);
  const nombre = v['bi-nombre'] || v['of-nombre-oferta'] || 'Marca';
  const filename = nombre.replace(/\s+/g, '_') + '_' + (mod ? mod.docName : 'MASTER') + '.md';
  const blob = new Blob([brainMasterContent], { type: 'text/markdown;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Descargar PDF — jsPDF directo desde texto, sin html2canvas ───────────────
async function downloadBrainPDF() {
  if (!brainMasterContent) return;
  const mod    = getBrainModulo(currentBrainModulo);
  const v      = getBrainModuleValues(currentBrainModulo);
  const nombre = v['bi-nombre'] || v['of-nombre-oferta'] || 'Marca';
  const filename = nombre.replace(/\s+/g, '_') + '_' + (mod ? mod.docName : 'MASTER') + '.pdf';
  const rawLines = brainMasterContent.split('\n');

  console.log('[PDF] Iniciando exportación jsPDF texto plano');
  console.log('[PDF] Archivo:', filename);
  console.log('[PDF] Contenido chars:', brainMasterContent.length);
  console.log('[PDF] Líneas totales:', rawLines.length);

  const btnPDF = document.getElementById('btn-dl-pdf');
  if (btnPDF) { btnPDF.disabled = true; btnPDF.textContent = 'Generando PDF...'; }

  try {
    if (typeof window.jspdf === 'undefined') {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }

    const { jsPDF } = window.jspdf;
    const doc      = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const mX       = 20;                                   // margin horizontal
    const mY       = 20;                                   // margin vertical
    const maxW     = doc.internal.pageSize.getWidth() - mX * 2; // 170mm
    const pageH    = doc.internal.pageSize.getHeight();    // 297mm
    const lH       = 6;                                    // line height mm
    let y          = mY;
    let pageCount  = 1;

    // ── helpers ──────────────────────────────────────────────────────────────
    function newPageIfNeeded(needed) {
      if (y + (needed || lH) > pageH - mY) {
        doc.addPage();
        pageCount++;
        y = mY;
      }
    }

    function write(text, fontSize, bold, colorRGB) {
      doc.setFontSize(fontSize);
      doc.setFont(undefined, bold ? 'bold' : 'normal');
      if (colorRGB) doc.setTextColor(...colorRGB);
      else doc.setTextColor(10, 10, 10);
      const wrapped = doc.splitTextToSize(String(text), maxW);
      for (const wl of wrapped) {
        newPageIfNeeded(lH);
        doc.text(wl, mX, y);
        y += lH;
      }
    }

    function hline(colorR, colorG, colorB, width) {
      doc.setDrawColor(colorR || 200, colorG || 200, colorB || 200);
      doc.setLineWidth(width || 0.3);
      doc.line(mX, y, doc.internal.pageSize.getWidth() - mX, y);
    }

    // ── portada ──────────────────────────────────────────────────────────────
    const now      = new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
    const modLabel = mod ? mod.fullName + ' MASTER' : 'MASTER';

    hline(34, 197, 94, 1.2);
    y += 8;

    write('VILLAMO GROWTH', 20, true, [10, 10, 10]);
    y += 2;
    write(modLabel, 14, true, [34, 197, 94]);
    y += 2;
    write('Brain Generator · Módulo ' + (mod ? mod.num : '--') + ' de 08', 9, false, [130, 130, 130]);
    write('Cliente: ' + nombre, 9, false, [130, 130, 130]);
    write('Generado: ' + now, 9, false, [130, 130, 130]);
    write('Documento confidencial de uso interno', 9, false, [130, 130, 130]);
    y += 6;
    hline(34, 197, 94, 0.5);
    y += 10;

    // ── contenido línea por línea ─────────────────────────────────────────────
    for (const rawLine of rawLines) {
      const line = rawLine.trimEnd();

      // Línea vacía → espacio
      if (!line.trim()) { y += 3; continue; }

      // Limpiar markdown inline conservando texto
      const clean = line
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g,     '$1')
        .replace(/`(.+?)`/g,       '$1')
        .replace(/~~(.+?)~~/g,     '$1')
        .replace(/\[(.+?)\]\(.+?\)/g, '$1');

      // H1
      if (line.startsWith('# ')) {
        const text = clean.replace(/^# /, '');
        y += 4;
        newPageIfNeeded(lH + 5);
        write(text, 14, true, [10, 10, 10]);
        hline(34, 197, 94, 0.4);
        y += 5;
        continue;
      }

      // H2
      if (line.startsWith('## ')) {
        const text = clean.replace(/^## /, '');
        y += 3;
        write(text, 12, true, [22, 163, 74]);
        y += 2;
        continue;
      }

      // H3
      if (line.startsWith('### ')) {
        const text = clean.replace(/^### /, '');
        y += 2;
        write(text, 10, true, [10, 10, 10]);
        y += 1;
        continue;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        const text = '  ' + clean.replace(/^> /, '');
        write(text, 10, false, [100, 100, 100]);
        continue;
      }

      // Horizontal rule
      if (/^---+$/.test(line.trim())) {
        y += 2;
        hline(200, 200, 200, 0.2);
        y += 4;
        continue;
      }

      // Lista — viñeta
      if (/^[-*]\s/.test(line)) {
        const text = '• ' + clean.replace(/^[-*]\s+/, '');
        write(text, 10, false, [10, 10, 10]);
        continue;
      }

      // Lista — numerada
      if (/^\d+\.\s/.test(line)) {
        write(clean, 10, false, [10, 10, 10]);
        continue;
      }

      // Párrafo normal
      write(clean, 10, false, [10, 10, 10]);
    }

    // ── pie de página ─────────────────────────────────────────────────────────
    y += 8;
    if (y < pageH - mY) {
      hline(220, 220, 220, 0.2);
      y += 4;
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(170, 170, 170);
      doc.text('Villamo Growth · ' + filename + ' · v1.0 · Confidencial', mX, y);
    }

    console.log('[PDF] Páginas generadas:', pageCount);
    console.log('[PDF] Guardando:', filename);
    doc.save(filename);
    console.log('[PDF] Completado');

  } catch (err) {
    console.error('[PDF] Error:', err.message);
    alert('Error generando PDF: ' + err.message);
  } finally {
    if (btnPDF) {
      btnPDF.disabled = false;
      btnPDF.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><path d="M3 12h10M8 3v7M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg> Descargar PDF';
    }
  }
}

// ── Convertir Markdown a HTML para PDF ───────────────────────────────────────
function mdToHtmlBrain(md, brandName, mod) {
  const now = new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
  const docName = mod ? mod.docName + '.md' : 'MASTER.md';
  const modLabel = mod ? `Brain Generator · Módulo ${mod.num} de 08` : 'Brain Generator';
  // Styles scoped to .pdf-doc so html2canvas captures them correctly
  // regardless of how the browser handles <style> inside a div
  let html = `
  <style>
    .pdf-doc { font-family:Arial,Helvetica,sans-serif; font-size:11pt; color:#0A0A0A; background:#ffffff; line-height:1.7; padding:40px 50px; box-sizing:border-box; }
    .pdf-doc * { box-sizing:border-box; }
    .pdf-doc .cover { padding:20px 0 30px; border-bottom:3px solid #22C55E; margin-bottom:30px; }
    .pdf-doc .cover-brand { font-size:24pt; font-weight:700; color:#0A0A0A; letter-spacing:-0.02em; margin-bottom:6px; }
    .pdf-doc .cover-doc { font-size:14pt; font-weight:600; color:#22C55E; margin-bottom:16px; }
    .pdf-doc .cover-meta { font-size:9pt; color:#888780; }
    .pdf-doc .cover-meta div { margin-bottom:3px; }
    .pdf-doc h1 { font-size:16pt; font-weight:700; color:#0A0A0A; margin:28px 0 10px; padding-bottom:6px; border-bottom:2px solid #22C55E; page-break-after:avoid; }
    .pdf-doc h2 { font-size:12pt; font-weight:700; color:#16A34A; margin:20px 0 8px; page-break-after:avoid; }
    .pdf-doc h3 { font-size:11pt; font-weight:600; color:#0A0A0A; margin:14px 0 6px; page-break-after:avoid; }
    .pdf-doc p { margin:7px 0; color:#0A0A0A; }
    .pdf-doc blockquote { border-left:3px solid #22C55E; padding:8px 14px; margin:12px 0; background:#F0FDF4; font-style:italic; color:#1A1A1A; }
    .pdf-doc ul, .pdf-doc ol { padding-left:20px; margin:7px 0; }
    .pdf-doc li { margin:3px 0; color:#0A0A0A; }
    .pdf-doc strong { font-weight:700; color:#0A0A0A; }
    .pdf-doc em { font-style:italic; }
    .pdf-doc table { width:100%; border-collapse:collapse; margin:12px 0; font-size:10pt; }
    .pdf-doc th { background:#0A0A0A; color:#ffffff; padding:7px 10px; text-align:left; font-weight:700; }
    .pdf-doc td { padding:7px 10px; border-bottom:1px solid #E5E5E3; color:#0A0A0A; }
    .pdf-doc tr:nth-child(even) td { background:#F9F9F8; }
    .pdf-doc del { color:#EF4444; text-decoration:line-through; }
    .pdf-doc code { font-family:Courier,monospace; background:#F3F4F6; padding:1px 4px; border-radius:3px; font-size:9pt; color:#0A0A0A; }
    .pdf-doc .footer { margin-top:36px; padding-top:10px; border-top:1px solid #E5E5E3; font-size:8pt; color:#888780; }
  </style>
  <div class="pdf-doc">
  <div class="cover">
    <div class="cover-brand">VILLAMO GROWTH</div>
    <div class="cover-doc">${docName}</div>
    <div class="cover-meta">
      <div>${modLabel}</div>
      <div>Cliente: ${brandName}</div>
      <div>Generado: ${now}</div>
      <div>Documento confidencial de uso interno</div>
    </div>
  </div>`;

  let body = md
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^\*\*(.+)\*\*$/gm, '<p><strong>$1</strong></p>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> \*\*(.+?)\*\*$/gm, '<blockquote><strong>$1</strong></blockquote>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim() !== '');
      const isHeader = match.includes('---');
      if (isHeader) return '';
      return '<tr>' + cells.map(c => '<td>' + c.trim() + '</td>').join('') + '</tr>';
    })
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #E5E5E3;margin:20px 0;">')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => '<ul>' + m + '</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hupbdl]).+$/gm, m => m ? '<p>' + m + '</p>' : '')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[hul])/g, '$1')
    .replace(/(<\/[hul][^>]*>)<\/p>/g, '$1');

  body = body.replace(/(<tr>.*?<\/tr>\s*)+/gs, m => '<table>' + m + '</table>');

  html += body;
  html += `<div class="footer">Villamo Growth · ${docName} · v1.0 · Confidencial</div>`;
  html += `</div>`; // cierre .pdf-doc
  return html;
}

// ── Copiar output ─────────────────────────────────────────────────────────────
function copyBrainOutput() {
  if (!brainMasterContent) return;
  navigator.clipboard.writeText(brainMasterContent).then(() => {
    const btn = document.querySelector('.brain-output-header .btn-ghost');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '¡Copiado!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }
  });
}

// ── Email modal ───────────────────────────────────────────────────────────────
function openBrainEmailModal() {
  const modal = document.getElementById('brain-email-modal');
  if (!modal) return;
  // Update subject for current module
  const mod = getBrainModulo(currentBrainModulo);
  const subjectEl = document.getElementById('brain-email-subject');
  const bodyEl    = document.getElementById('brain-email-body');
  if (subjectEl && mod) subjectEl.value = `Tu documento ${mod.docName} — Villamo Growth`;
  if (bodyEl && mod) bodyEl.value = `Adjunto encontrás el documento ${mod.docName} construido durante nuestra sesión. Este es el módulo ${mod.num} de tu Brain — ${mod.fullName}.\n\nRevisalo con calma. Cualquier ajuste lo hacemos en la próxima sesión.\n\n— Villamo Growth`;
  modal.classList.add('open');
}

function closeBrainEmailModal() {
  const modal = document.getElementById('brain-email-modal');
  if (modal) modal.classList.remove('open');
}

async function sendBrainEmail() {
  const toEl      = document.getElementById('brain-email-to');
  const subjectEl = document.getElementById('brain-email-subject');
  const bodyEl    = document.getElementById('brain-email-body');
  const to      = toEl      ? toEl.value.trim()      : '';
  const subject = subjectEl ? subjectEl.value.trim() : '';
  const body    = bodyEl    ? bodyEl.value.trim()    : '';

  if (!to) { alert('Ingresá el correo del cliente'); return; }

  const btn = document.querySelector('#brain-email-modal .btn-primary');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const mod = getBrainModulo(currentBrainModulo);
  const v = getBrainModuleValues(currentBrainModulo);
  const clientName = v['bi-nombre'] || v['of-nombre-oferta'] || 'Cliente';
  const filename = clientName.replace(/\s+/g, '_') + '_' + (mod ? mod.docName : 'MASTER') + '.md';

  console.log('[Email] Iniciando envío');
  console.log('[Email] Destino:', to);
  console.log('[Email] Asunto:', subject);
  console.log('[Email] Archivo:', filename);
  console.log('[Email] Contenido chars:', brainMasterContent.length);

  let sent = false;
  try {
    const invokePromise = sb.functions.invoke('send-brain-doc', {
      body: {
        to,
        subject,
        message: body,
        filename,
        brainMasterContent,
        clientName,
        moduleName: mod ? mod.fullName : currentBrainModulo
      }
    });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: la función tardó más de 60 segundos')), 60000)
    );

    console.log('[Email] Invocando send-brain-doc ahora');
    const { data, error } = await Promise.race([invokePromise, timeoutPromise]);
    console.log('[Email] Invoke terminó', { data, error });

    if (error) throw new Error(error.message || 'Error en la Edge Function');
    if (!data || data.ok === false) throw new Error(data?.error || 'Error enviando correo');
    console.log('[Email] Enviado. ID:', data.id);
    sent = true;
    btn.textContent = '¡Enviado!';
    setTimeout(() => closeBrainEmailModal(), 1800);
  } catch (err) {
    console.error('[Email] Error:', err.message);
    alert('Error enviando correo: ' + err.message);
  } finally {
    if (!sent) {
      btn.disabled = false;
      btn.textContent = 'Enviar con adjunto PDF';
    } else {
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Enviar con adjunto PDF';
      }, 1800);
    }
  }
}

// ── Auto-guardar en localStorage por módulo y cliente ────────────────────────
function brainSaveToLocal() {
  if (!selectedClientId) return;
  const data = {};
  getAllFieldIds(currentBrainModulo).forEach(id => {
    const el = document.getElementById(id);
    if (el) data[id] = el.value;
  });
  localStorage.setItem('brain_' + currentBrainModulo + '_' + selectedClientId, JSON.stringify(data));
}

function brainLoadFromLocal() {
  if (!selectedClientId) return;
  const saved = localStorage.getItem('brain_' + currentBrainModulo + '_' + selectedClientId);
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    Object.entries(data).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
    brainUpdate();
  } catch(e) {}
}

// ── Pre-llenar Brain desde el perfil del cliente ──────────────────────────────
function brainPrefillFromProfile(client) {
  // Solo rellena si el campo del Brain está vacío (no sobreescribe trabajo hecho)
  function fillIfEmpty(id, value) {
    const el = document.getElementById(id);
    if (el && !el.value && value) el.value = value;
  }
  // Espera a que el formulario de identidad esté renderizado
  setTimeout(() => {
    fillIfEmpty('bi-nombre',    client.full_name || '');
    fillIfEmpty('bi-industria', client.industry  || '');
    fillIfEmpty('bi-nicho',     client.nicho     || '');
    fillIfEmpty('bi-tipo',      client.business_type  || '');
    fillIfEmpty('bi-pais',      client.country_market || '');
    fillIfEmpty('bi-web',       client.website   || '');
    const redes = [client.instagram, client.tiktok, client.facebook].filter(Boolean).join(' · ');
    fillIfEmpty('bi-redes',     redes);
    fillIfEmpty('bi-estado',    client.business_status || '');
    brainUpdate();
  }, 150);
}

// ── Inicializar Brain al cargar ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  renderBrainNav();
  renderBrainForm('identidad');
  brainUpdate();
});
window.getBrainModulo = getBrainModulo;
window.renderBrainNav = renderBrainNav;
window.renderBrainForm = renderBrainForm;
window.switchBrainModule = switchBrainModule;
window.brainUpdate = brainUpdate;
window.toggleBrainSection = toggleBrainSection;
window.generateBrainMaster = generateBrainMaster;
window.downloadBrainMD = downloadBrainMD;
window.downloadBrainPDF = downloadBrainPDF;
window.copyBrainOutput = copyBrainOutput;
window.openBrainEmailModal = openBrainEmailModal;
window.closeBrainEmailModal = closeBrainEmailModal;
window.sendBrainEmail = sendBrainEmail;
window.brainSaveToLocal = brainSaveToLocal;
window.brainLoadFromLocal = brainLoadFromLocal;
window.brainPrefillFromProfile = brainPrefillFromProfile;
console.log("[Brain] loaded");

