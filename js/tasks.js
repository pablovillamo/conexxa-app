console.log("[Tasks] loaded");

// ============================================================ ADMIN CREAR TAREA
function openNewTaskModal() {
  document.getElementById('nt-title').value = '';
  document.getElementById('nt-desc').value = '';
  document.getElementById('nt-module').value = '';
  const in7 = new Date(); in7.setDate(in7.getDate() + 7);
  document.getElementById('nt-due').value = in7.toISOString().split('T')[0];
  openModal('modal-new-task');
}

async function createTask() {
  const title = document.getElementById('nt-title').value.trim();
  const desc = document.getElementById('nt-desc').value.trim();
  const moduleId = document.getElementById('nt-module').value;
  const due = document.getElementById('nt-due').value;
  const msg = document.getElementById('nt-msg');
  if (!title) { showMsg(msg,'error','El título de la tarea es requerido'); return; }
  const btn = document.querySelector('#modal-new-task .btn-primary');
  btn.disabled = true; btn.textContent = 'Creando...';
  const { data: task, error } = await sb.from('tasks').insert({
    client_id: selectedClientId,
    module_id: moduleId || null,
    title,
    description: desc || null,
    due_date: due || null,
    created_by: currentUser.id
  }).select().single();
  if (error) { btn.disabled = false; btn.textContent = 'Asignar y enviar correo'; showMsg(msg,'error', error.message); return; }
  try { await sb.functions.invoke('notify-task', { body: { task_id: task.id } }); } catch(e) { console.log('Email error:', e); }
  btn.disabled = false; btn.textContent = 'Asignar y enviar correo';
  closeModal('modal-new-task');
  await openClientDetail(selectedClientId);
}

// ============================================================ TASK RENDER (cliente)
function renderTaskItem(t) {
  let dueLabel = '';
  if (t.due_date) {
    const due = new Date(t.due_date);
    const today = new Date(); today.setHours(0,0,0,0);
    const isOverdue = due < today && !t.completed;
    const dueStr = due.toLocaleDateString('es-ES',{day:'numeric',month:'long'});
    dueLabel = `<div class="client-task-due ${!isOverdue?'ok':''}" style="${isOverdue?'color:var(--red)':''}">${isOverdue?'⚠ Venció el ':'Vence el '}${dueStr}</div>`;
  }
  return `
    <div class="client-task-row ${t.completed ? 'done' : ''}">
      <div class="client-task-header">
        <div class="client-task-check ${t.completed ? 'done' : ''}" onclick="toggleClientTask('${t.id}', ${!t.completed})">
          <svg viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="client-task-body">
          <div class="client-task-title">${t.title}</div>
          ${t.description ? `<div class="client-task-desc">${t.description}</div>` : ''}
          ${t.modules ? `<div class="client-task-desc" style="margin-top:6px;color:var(--green)">Módulo ${t.modules.number} — ${t.modules.name}</div>` : ''}
          ${dueLabel}
        </div>
      </div>
    </div>
  `;
}

// ============================================================ MODULE / TASK TOGGLES
async function toggleAdminModule(rowId, newValue, moduleId) {
  if (!rowId) {
    await sb.from('client_modules').insert({ client_id: selectedClientId, module_id: parseInt(moduleId), completed: newValue, completed_at: newValue ? new Date().toISOString() : null });
  } else {
    await sb.from('client_modules').update({ completed: newValue, completed_at: newValue ? new Date().toISOString() : null }).eq('id', rowId);
  }
  await openClientDetail(selectedClientId);
}

async function toggleClientModule(rowId, newValue) {
  await sb.from('client_modules').update({ completed: newValue, completed_at: newValue ? new Date().toISOString() : null }).eq('id', rowId);
  await loadClientView();
}

async function toggleClientTask(taskId, newValue) {
  await sb.from('tasks').update({ completed: newValue, completed_at: newValue ? new Date().toISOString() : null }).eq('id', taskId);
  await loadClientView();
}
