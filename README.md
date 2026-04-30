

## Quick Start (Guía Rápida)

### Requisitos
- Java 11+
- Node.js 16+
- npm

### Pasos para ejecutar el proyecto

#### 1️⃣ **Terminal 1 - Iniciar el servidor Backend**

```bash
# En la carpeta raíz del proyecto
.\start-server.bat
```

**Espera a ver**: `Database is up to date, no changesets to execute`

El backend estará disponible en: **http://localhost:8082**

#### 2️⃣ **Terminal 2 - Iniciar el Frontend**

```bash
# En la carpeta raíz del proyecto, abre una NUEVA terminal
cd traccar-web
npm install  # Solo la primera vez
npm start
```

**Espera a ver**: `VITE ready in XXX ms` y la URL `http://localhost:3002`

#### 3️⃣ **Acceder a la aplicación**

Abre tu navegador en: **http://localhost:3002**

1. Haz clic en **REGISTRARSE**
2. Completa el formulario con:
   - Nombre: Tu nombre
   - Email: `usuario@localhost` (o cualquier email único)
   - Contraseña: Tu contraseña
3. Haz clic en **REGISTRARSE**
4. ¡Ya estás dentro como admin!

#### ⚠️ Solución de problemas

**Error de constraint en la base de datos**
```bash
Remove-Item -Force "database/data/database.mv.db"
Remove-Item -Force "database/data/database.trace.db"
# Reinicia el servidor con: .\start-server.bat
```

**El puerto 3002 ya está en uso**
```bash
npm start  # Automáticamente usará el siguiente puerto disponible
```

---

