// ============================================================
// PANEL DE ADMINISTRADOR
// ============================================================
// La protección real NO es un texto escondido en el código (cualquiera
// puede ver el código fuente de una página), sino un inicio de sesión
// verificado por Firebase Authentication. Tu "contraseña maestra" es
// la contraseña de la cuenta que crees en Firebase (ver README.md,
// paso "Crea tu usuario administrador"). Solo quien inicie sesión con
// ESE correo y ESA contraseña puede leer /rifa/reservas, porque así
// lo exige database.rules.json — no es algo que dependa del frontend.

const db = firebase.database();
const auth = firebase.auth();

const loginBox = document.getElementById('loginBox');
const panelBox = document.getElementById('panelBox');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const exportBtn = document.getElementById('exportBtn');
const tablaBody = document.querySelector('#tablaReservas tbody');
const resumenEl = document.getElementById('resumen');

auth.onAuthStateChanged(user => {
  if(user){
    loginBox.classList.add('hidden');
    panelBox.classList.add('open');
    cargarReservas();
  } else {
    loginBox.classList.remove('hidden');
    panelBox.classList.remove('open');
  }
});

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('adminEmail').value.trim();
  const pass = document.getElementById('adminPass').value;
  try{
    await auth.signInWithEmailAndPassword(email, pass);
  }catch(err){
    loginError.textContent = 'Correo o contraseña incorrectos.';
  }
});

logoutBtn.addEventListener('click', () => auth.signOut());

let reservasCache = [];

async function cargarReservas(){
  const snap = await db.ref('rifa/reservas').once('value');
  const data = snap.val() || {};
  reservasCache = Object.keys(data)
    .map(n => ({
      numero: Number(n),
      nombre: data[n].nombre,
      telefono: data[n].telefono,
      fecha: data[n].fecha ? new Date(data[n].fecha).toLocaleString('es-CO') : ''
    }))
    .sort((a, b) => a.numero - b.numero);

  resumenEl.textContent = `${reservasCache.length} de 100 números reservados`;
  tablaBody.innerHTML = reservasCache.map(r => `
    <tr>
      <td>${String(r.numero).padStart(2, '0')}</td>
      <td>${escapeHtml(r.nombre)}</td>
      <td>${escapeHtml(r.telefono)}</td>
      <td>${r.fecha}</td>
    </tr>
  `).join('');
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

exportBtn.addEventListener('click', () => {
  if(reservasCache.length === 0){
    alert('Todavía no hay números reservados.');
    return;
  }
  const filas = reservasCache.map(r => ({
    'Número': String(r.numero).padStart(2, '0'),
    'Nombre': r.nombre,
    'Teléfono': r.telefono,
    'Fecha de reserva': r.fecha
  }));
  const hoja = XLSX.utils.json_to_sheet(filas);
  hoja['!cols'] = [{ wch: 10 }, { wch: 28 }, { wch: 16 }, { wch: 20 }];
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Reservas');
  const fechaArchivo = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(libro, `rifa_reservas_${fechaArchivo}.xlsx`);
});
