// ============================================================
// CONFIGURACIÓN DE FIREBASE
// ============================================================
// Reemplaza TODOS los valores de abajo por los de TU proyecto.
// Los obtienes en: Firebase Console > (ícono engranaje) Configuración
// del proyecto > pestaña "General" > sección "Tus apps" > app web > "SDK
// setup and configuration" > opción "Config".
//
// IMPORTANTE: databaseURL solo aparece si ya creaste la Realtime
// Database. Si la creaste después de copiar esta configuración,
// ve a Realtime Database en el menú y copia la URL que aparece
// arriba de los datos (algo como
// https://TU-PROYECTO-default-rtdb.firebaseio.com).
// ============================================================

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx"
};

firebase.initializeApp(firebaseConfig);
