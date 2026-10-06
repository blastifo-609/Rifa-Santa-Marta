// ============================================================
// CONFIGURACIÓN DE FIREBASE
// ============================================================
// Ya está con los datos de tu proyecto "rifa-santa-marta".
// Si alguna vez creas un proyecto nuevo, reemplaza estos valores
// por los que te entregue Firebase Console > Configuración del
// proyecto > Tus apps > SDK setup and configuration > Config.
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCu1jK76B-Q1fzRqnpVopbERvFx-k5_5SA",
  authDomain: "rifa-santa-marta.firebaseapp.com",
  databaseURL: "https://rifa-santa-marta-default-rtdb.firebaseio.com",
  projectId: "rifa-santa-marta",
  storageBucket: "rifa-santa-marta.firebasestorage.app",
  messagingSenderId: "194162681720",
  appId: "1:194162681720:web:6fe71ea606adbaadb28a8d",
  measurementId: "G-T9HTP58F5Y"
};

firebase.initializeApp(firebaseConfig);
