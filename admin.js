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

// Por seguridad, la sesión NO queda recordada para siempre: se cierra
// sola al cerrar el navegador/pestaña. Así, cualquiera que abra
// admin.html en otro momento (u otro dispositivo) SIEMPRE tiene que
// escribir el correo y la contraseña — nunca entra directo al panel.
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .catch(err => console.error('No se pudo configurar la persistencia de sesión', err));

const loginBox = document.getElementById('loginBox');
const panelBox = document.getElementById('panelBox');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const exportBtn = document.getElementById('exportBtn');
const tablaBody = document.querySelector('#tablaReservas tbody');
const resumenEl = document.getElementById('resumen');

let estadoData = {};
let reservasData = {};
let reservasCache = [];

auth.onAuthStateChanged(user => {
  if(user){
    loginBox.classList.add('hidden');
    panelBox.classList.add('open');
    db.ref('rifa/estado').on('value', snap => { estadoData = snap.val() || {}; combinarYRenderizar(); });
    db.ref('rifa/reservas').on('value', snap => { reservasData = snap.val() || {}; combinarYRenderizar(); });
  } else {
    loginBox.classList.remove('hidden');
    panelBox.classList.remove('open');
    db.ref('rifa/estado').off();
    db.ref('rifa/reservas').off();
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

const resetBtn = document.getElementById('resetBtn');
resetBtn.addEventListener('click', async () => {
  const ok = confirm('Esto borra TODAS las reservas (nombres, teléfonos y estado de pago) y deja los 100 números disponibles otra vez. No se puede deshacer. ¿Continuar?');
  if(!ok) return;

  resetBtn.disabled = true;
  resetBtn.textContent = 'Reiniciando...';

  // Se borra número por número (en una sola actualización atómica) para
  // respetar exactamente las mismas reglas de seguridad ya definidas en
  // database.rules.json, sin tener que volver a pegarlas en Firebase.
  const updates = {};
  for(let i = 1; i <= 100; i++){
    updates[`rifa/estado/${i}`] = null;
    updates[`rifa/reservas/${i}`] = null;
  }

  try{
    await db.ref().update(updates);
    alert('Listo, la rifa quedó en cero.');
  }catch(err){
    alert('No se pudo reiniciar. Intenta de nuevo.');
    console.error(err);
  }finally{
    resetBtn.disabled = false;
    resetBtn.textContent = '🗑️ Reiniciar rifa (borrar todo)';
  }
});

function combinarYRenderizar(){
  reservasCache = Object.keys(reservasData)
    .map(n => ({
      numero: Number(n),
      nombre: reservasData[n].nombre,
      telefono: reservasData[n].telefono,
      fecha: reservasData[n].fecha ? new Date(reservasData[n].fecha).toLocaleString('es-CO') : '',
      // cualquier valor antiguo (p. ej. el booleano true) se trata como "pendiente"
      estadoPago: estadoData[n] === 'pagado' ? 'pagado' : 'pendiente'
    }))
    .sort((a, b) => a.numero - b.numero);

  renderTabla();
}

function renderTabla(){
  resumenEl.textContent = `${reservasCache.length} de 100 números reservados`;

  tablaBody.innerHTML = reservasCache.map(r => `
    <tr>
      <td>${String(r.numero).padStart(2, '0')}</td>
      <td>${escapeHtml(r.nombre)}</td>
      <td>${escapeHtml(r.telefono)}</td>
      <td>${r.fecha}</td>
      <td>
        <select class="estado-select ${r.estadoPago}" data-numero="${r.numero}">
          <option value="pendiente" ${r.estadoPago === 'pendiente' ? 'selected' : ''}>⏳ Pago pendiente</option>
          <option value="pagado" ${r.estadoPago === 'pagado' ? 'selected' : ''}>✅ Pago listo</option>
        </select>
      </td>
    </tr>
  `).join('');

  tablaBody.querySelectorAll('.estado-select').forEach(sel => {
    sel.addEventListener('change', () => cambiarEstadoPago(Number(sel.dataset.numero), sel.value, sel));
  });
}

async function cambiarEstadoPago(numero, nuevoEstado, selectEl){
  selectEl.disabled = true;
  try{
    await db.ref('rifa/estado/' + numero).set(nuevoEstado);
    // el listener en tiempo real se encarga de volver a pintar la tabla
  }catch(err){
    alert('No se pudo actualizar el estado de pago. Intenta de nuevo.');
    console.error(err);
  }finally{
    selectEl.disabled = false;
  }
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
    'Fecha de reserva': r.fecha,
    'Estado de pago': r.estadoPago === 'pagado' ? 'Pago listo' : 'Pago pendiente'
  }));
  const hoja = XLSX.utils.json_to_sheet(filas);
  hoja['!cols'] = [{ wch: 10 }, { wch: 28 }, { wch: 16 }, { wch: 20 }, { wch: 16 }];
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Reservas');
  const fechaArchivo = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(libro, `rifa_reservas_${fechaArchivo}.xlsx`);
});
