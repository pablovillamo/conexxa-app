console.log("[Auth] loaded");

// ============================================================ AUTH
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t,i) => {
    t.classList.toggle('active', (i===0 && tab==='login') || (i===1 && tab==='register'));
  });
  document.getElementById('auth-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('auth-register').classList.toggle('hidden', tab !== 'register');
}

async function forgotPassword() {
  const email = document.getElementById('login-email').value.trim();
  const msg = document.getElementById('login-msg');
  if (!email) { showMsg(msg, 'error', 'Escribe tu correo arriba primero.'); return; }
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: 'https://app.getconexxa.com' });
  if (error) showMsg(msg, 'error', error.message);
  else showMsg(msg, 'success', '¡Correo enviado! Revisa tu bandeja de entrada.');
}

async function login() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  const msg = document.getElementById('login-msg');
  msg.style.display = 'none';
  if (!email || !pass) { showMsg(msg,'error','Completa todos los campos'); return; }
  const btn = document.querySelector('#auth-login .btn-primary');
  btn.disabled = true; btn.textContent = 'Entrando...';
  const { error } = await sb.auth.signInWithPassword({ email, password: pass });
  btn.disabled = false; btn.textContent = 'Entrar al sistema';
  if (error) showMsg(msg,'error', error.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : error.message);
}

async function register() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value;
  const nicho = document.getElementById('reg-nicho').value.trim();
  const msg = document.getElementById('reg-msg');
  msg.style.display = 'none';
  if (!name || !email || !pass) { showMsg(msg,'error','Completa todos los campos'); return; }
  if (pass.length < 8) { showMsg(msg,'error','La contraseña debe tener mínimo 8 caracteres'); return; }
  const btn = document.querySelector('#auth-register .btn-primary');
  btn.disabled = true; btn.textContent = 'Creando cuenta...';
  const { error } = await sb.auth.signUp({ email, password: pass, options: { data: { full_name: name, nicho, role: 'client' } } });
  btn.disabled = false; btn.textContent = 'Crear mi cuenta';
  if (error) showMsg(msg,'error', error.message);
  else showMsg(msg,'success','¡Cuenta creada! Revisa tu correo para confirmar.');
}

async function logout() { await sb.auth.signOut(); }
