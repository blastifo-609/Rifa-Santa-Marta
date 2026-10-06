# Gran Rifa Aven Tour — Santa Marta

App web de venta de números de rifa (1–100), con base de datos en tiempo
real (Firebase Realtime Database) y panel de administrador para
exportar las reservas a Excel.

## Archivos del proyecto

```
rifa-app/
├── index.html           Página pública (imagen + cuadrícula de 100 números)
├── admin.html            Panel de administrador (protegido con login)
├── style.css              Estilos (responsivo)
├── firebase-config.js      Aquí pegas la configuración de TU proyecto Firebase
├── app.js                  Lógica de la rifa (tiempo real)
├── admin.js                 Lógica del panel admin (login + exportar Excel)
├── database.rules.json       Reglas de seguridad para Firebase
└── assets/flyer.jpg            Tu imagen promocional (ya incluida)
```

---

## Paso 1 — Crea tu proyecto de Firebase (gratis)

1. Entra a <https://console.firebase.google.com/> e inicia sesión con una
   cuenta de Google.
2. Clic en **"Agregar proyecto"**, ponle un nombre (ej. `rifa-aventour`) y
   termina el asistente (puedes desactivar Google Analytics, no lo
   necesitas).
3. En el menú lateral, entra a **Compilación → Realtime Database** →
   **"Crear base de datos"**. Elige la ubicación más cercana (ej.
   `us-central1`) y empieza en **modo bloqueado** (ya vas a pegar tus
   propias reglas en el paso 3).
4. En el menú lateral, entra a **Compilación → Authentication** → pestaña
   **"Sign-in method"** → activa el proveedor **"Correo electrónico/contraseña"**.
5. En la misma sección de Authentication, ve a la pestaña **"Users"** →
   **"Add user"** → escribe tu correo y una contraseña segura. **Esa
   contraseña es tu "contraseña maestra"** para entrar a `admin.html`.
6. Pega las reglas de seguridad: en Realtime Database → pestaña
   **"Reglas"**, borra lo que haya y pega el contenido completo del
   archivo `database.rules.json` de esta carpeta. Clic en **"Publicar"**.
7. Obtén tu configuración: ícono de engranaje (⚙️) junto a "Project
   Overview" → **"Configuración del proyecto"** → baja hasta **"Tus
   apps"** → clic en el ícono `</>` (Web) → ponle un apodo → **"Registrar
   app"**. Copia el objeto `firebaseConfig` que te muestra.

## Paso 2 — Configura el proyecto

Abre `firebase-config.js` y reemplaza los valores de ejemplo por los
que acabas de copiar de Firebase. Si `databaseURL` no aparece en ese
objeto, cópiala desde la parte de arriba de Realtime Database (se ve
como `https://TU-PROYECTO-default-rtdb.firebaseio.com`).

La imagen de la rifa ya está puesta (`assets/flyer.jpg`). Si quieres
cambiarla, reemplaza ese archivo por el tuyo usando el mismo nombre.

## Paso 3 — Pruébalo en tu computador (opcional)

Como el navegador bloquea Firebase si abres el `index.html` con doble
clic (protocolo `file://`), usa un mini servidor local. Si tienes
Python instalado, desde la carpeta `rifa-app`:

```bash
python3 -m http.server 8000
```

Y abre `http://localhost:8000` en tu navegador.

---

## Paso 4 — Publica el sitio gratis (elige una opción)

### Opción A — Netlify (la más fácil, recomendada)

1. Ve a <https://app.netlify.com/> y crea una cuenta gratis.
2. En el panel, busca el recuadro que dice algo como **"Arrastra tu
   carpeta de proyecto aquí"** (Deploys → "Add new site" → "Deploy
   manually").
3. Arrastra la carpeta `rifa-app` completa (con todos sus archivos
   adentro) a ese recuadro.
4. En segundos Netlify te da un enlace público como
   `https://tu-sitio-123.netlify.app`. Ese es el link que compartes.
5. Opcional: en "Site settings" puedes cambiar el nombre del sitio
   para que el link sea más bonito.

### Opción B — GitHub Pages

1. Crea una cuenta en <https://github.com/> si no tienes.
2. Crea un repositorio nuevo (público), por ejemplo `rifa-aventour`.
3. Sube todos los archivos de `rifa-app` a ese repositorio (puedes
   arrastrarlos desde la página de GitHub con "Add file → Upload
   files").
4. Ve a **Settings → Pages**, en "Source" elige la rama `main` y
   carpeta `/ (root)` → **"Save"**.
5. En uno o dos minutos, tu sitio queda en
   `https://tu-usuario.github.io/rifa-aventour/`.

### Opción C — Vercel

1. Crea una cuenta en <https://vercel.com/> (puedes entrar con GitHub).
2. "Add New… → Project" y sube/conecta la carpeta `rifa-app`.
3. Como es un sitio estático, deja la configuración por defecto y da
   clic en **"Deploy"**. Vercel te entrega un link `https://tu-proyecto.vercel.app`.

---

## Cómo usar el panel de administrador

1. Entra a `tu-link-publicado.com/admin.html`.
2. Inicia sesión con el correo y la contraseña que creaste en el Paso 1.5.
3. Verás la tabla con todos los números reservados, nombres y
   teléfonos. Clic en **"Descargar Excel (.xlsx)"** para bajar el
   archivo completo.

---

## Notas importantes de seguridad

- **La protección real del panel admin es el inicio de sesión de
  Firebase**, no un texto escondido en el código. Nunca pongas una
  contraseña "a mano" dentro de un archivo `.js`: cualquiera puede
  verla abriendo el código fuente de la página.
- Las reglas (`database.rules.json`) evitan que dos personas ganen el
  mismo número al mismo tiempo: si dos escrituras llegan casi juntas,
  Firebase solo acepta la primera y rechaza la segunda automáticamente.
- Los nombres/teléfonos (`/rifa/reservas`) solo los puede leer una
  cuenta autenticada (tú). El público solo recibe qué números están
  libres u ocupados, nunca los datos personales de los demás.
- El plan gratuito de Firebase ("Spark") incluye 1 GB de almacenamiento
  y 10 GB/mes de descarga — de sobra para una rifa de 100 números.
- Si algún día quieres cerrar la rifa, simplemente borra las reglas de
  escritura (`".write": false`) para que no se puedan tomar más
  números, sin borrar los datos.
