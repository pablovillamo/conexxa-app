console.log("[Notes] loaded");

// ============================================================ NOTES CRM
function getNotesKey() { return 'notes_' + (selectedClientId || 'unknown'); }

function loadNotes() {
  try {
    const saved = localStorage.getItem(getNotesKey());
    return saved ? JSON.parse(saved) : [];
  } catch(e) { return []; }
}

function renderNotes() {
  const notes = loadNotes();
  const timeline = document.getElementById('note-timeline');
  const metaEl = document.getElementById('note-meta');
  const now = new Date();
  if(metaEl) metaEl.textContent = now.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}) + ' · ' + now.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
  if(!timeline) return;
  if(notes.length === 0) {
    timeline.innerHTML = '<div class="empty-state" style="padding:20px 0;">Sin notas aún. Escribe la primera nota arriba.</div>';
    return;
  }
  timeline.innerHTML = notes.map((n, idx) => `
    <div class="note-item">
      <div class="note-dot-wrap">
        <div class="note-dot"></div>
        ${idx < notes.length-1 ? '<div class="note-line"></div>' : ''}
      </div>
      <div class="note-content">
        <div class="note-content-header">
          <span class="note-author">${n.author || 'Pablo Villalobos'}</span>
          <span class="note-time">${n.date}</span>
        </div>
        <div class="note-text">${n.text}</div>
      </div>
    </div>
  `).reverse().join('');
}

function saveNote() {
  const input = document.getElementById('note-input');
  const text = input?.value?.trim();
  if(!text) return;
  const notes = loadNotes();
  const now = new Date();
  notes.push({
    text,
    author: currentProfile?.full_name || 'Pablo Villalobos',
    date: now.toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'}) + ' · ' + now.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}),
    timestamp: now.toISOString()
  });
  localStorage.setItem(getNotesKey(), JSON.stringify(notes));
  if(input) input.value = '';
  renderNotes();
}
