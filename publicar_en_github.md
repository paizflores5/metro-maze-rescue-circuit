# Publicar Metro Maze en GitHub Pages

1. Crea un repositorio público llamado, por ejemplo, `metro-maze-rescue-circuit`.
2. Sube el contenido de `demo-juego` a la raíz del repositorio: `index.html`, `styles.css`, `game.js` y `manifest.webmanifest`.
3. Sube el archivo `.github/workflows/deploy-pages.yml` manteniendo esa ruta.
4. Ve a **Settings > Pages** y, en *Build and deployment*, selecciona **GitHub Actions**.
5. Abre la pestaña **Actions**, espera a que termine *Deploy static content to Pages* y copia la URL que GitHub muestra. Usualmente tendrá esta forma: `https://TU-USUARIO.github.io/metro-maze-rescue-circuit/`.

## APK Android

1. Entra a WebIntoApp y pega la URL pública de GitHub Pages.
2. Selecciona Android, revisa el nombre e ícono de la app y genera el APK.
3. Descarga el APK al teléfono. Android solicitará permitir instalación desde el navegador o administrador de archivos que lo descargó; habilítalo solo para esa instalación y confirma.
4. El juego no solicita permisos peligrosos: no usa cámara, ubicación, micrófono, contactos ni archivos.

## Alternativa requerida por el PDF

El PDF propone Tiiny Host. Si el docente pide ese servicio específicamente, comprime los archivos de `demo-juego` en ZIP, súbelo a Tiiny Host y utiliza la URL obtenida en WebIntoApp. El código no cambia.
