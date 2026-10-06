// ============================================================
// LÓGICA DE LA RIFA — se conecta a Firebase Realtime Database
// ============================================================
// Estructura de datos en Firebase:
//   /rifa/estado/{numero}   -> true si el número ya está ocupado (público)
//   /rifa/reservas/{numero} -> { nombre, telefono, fecha } (solo lectura admin)
//
// Separar "estado" de "reservas" permite que CUALQUIER visitante vea
// en tiempo real qué números están libres/ocupados, sin que pueda leer
// los nombres y teléfonos de otras personas (eso solo lo puede leer
// una cuenta autenticada, ver admin.js y database.rules.json).

const TOTAL_NUMEROS = 100;
const db = firebase.database();

let estadoActual = {};   // { "7": true, "23": true, ... }
let numeroSeleccionado = null;

const gridEl = document.getElementById('grid');
const statsEl = document.getElementById('stats');
const modalOverlay = document.getElementById('modalOverlay');
const modalNumEl = document.getElementById('modalNum');
const inpName = document.getElementById('inpName');
const inpPhone = document.getElementById('inpPhone');
const modalError = document.getElementById('modalError');
const confirmBtn = document.getElementById('confirmBtn');

function pad(n){ return n < 10 ? '0' + n : String(n); }

function renderGrid(){
  let html = '';
  for(let i = 1; i <= TOTAL_NUMEROS; i++){
    if(estadoActual[i]){
      html += `<button class="cell taken" disabled title="Reservado">X</button>`;
    } else {
      html += `<button class="cell available" data-num="${i}">${pad(i)}</button>`;
    }
  }
  gridEl.innerHTML = html;

  gridEl.querySelectorAll('.cell.available').forEach(btn => {
    btn.addEventListener('click', () => abrirModal(Number(btn.dataset.num)));
  });

  const ocupados = Object.keys(estadoActual).filter(k => estadoActual[k]).length;
  statsEl.textContent = `${TOTAL_NUMEROS - ocupados} de ${TOTAL_NUMEROS} números disponibles`;
}

// Escucha cambios en tiempo real: cualquier reserva hecha por
// cualquier persona conectada actualiza esta cuadrícula al instante.
db.ref('rifa/estado').on('value', snapshot => {
  estadoActual = snapshot.val() || {};
  renderGrid();
});

function abrirModal(numero){
  if(estadoActual[numero]) return; // por si acaso ya se ocupó justo antes del click
  numeroSeleccionado = numero;
  modalNumEl.textContent = pad(numero);
  inpName.value = '';
  inpPhone.value = '';
  modalError.textContent = '';
  confirmBtn.disabled = false;
  confirmBtn.textContent = 'Confirmar';
  modalOverlay.classList.add('open');
  setTimeout(() => inpName.focus(), 50);
}

function cerrarModal(){
  modalOverlay.classList.remove('open');
}

async function confirmarReserva(){
  const nombre = inpName.value.trim();
  const telefono = inpPhone.value.trim();

  if(!nombre || !telefono){
    modalError.textContent = 'Completa tu nombre y tu teléfono.';
    return;
  }
  if(telefono.length < 7){
    modalError.textContent = 'Ingresa un número de teléfono válido.';
    return;
  }
  if(estadoActual[numeroSeleccionado]){
    modalError.textContent = 'Ese número ya fue reservado. Elige otro.';
    cerrarModal();
    return;
  }

  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Guardando...';
  modalError.textContent = '';

  // Escritura atómica en dos rutas a la vez: si cualquiera de las dos
  // ya existe (porque alguien más ganó la carrera por este número),
  // Firebase rechaza TODA la actualización gracias a las reglas de
  // seguridad (database.rules.json) — así nunca se duplica un número.
  const updates = {};
  updates[`rifa/estado/${numeroSeleccionado}`] = true;
  updates[`rifa/reservas/${numeroSeleccionado}`] = {
    nombre: nombre,
    telefono: telefono,
    fecha: firebase.database.ServerValue.TIMESTAMP
  };

  try{
    await db.ref().update(updates);
    cerrarModal();
  }catch(err){
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirmar';
    if(err && err.code === 'PERMISSION_DENIED'){
      modalError.textContent = 'Alguien más acaba de reservar este número. Elige otro.';
    } else {
      modalError.textContent = 'No se pudo guardar. Verifica tu conexión e intenta de nuevo.';
      console.error(err);
    }
  }
}

document.getElementById('confirmBtn').addEventListener('click', confirmarReserva);
document.getElementById('cancelBtn').addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', e => { if(e.target === modalOverlay) cerrarModal(); });
