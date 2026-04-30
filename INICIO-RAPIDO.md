## 🚀 Guía Rápida - Iniciar el Sistema

### ⚠️ Necesitas 2 terminales abiertas

#### Terminal 1: Backend (Server Java)
```bash
# En la raíz del proyecto
./start-server.bat
```
✓ Espera a ver: `Database is up to date, no changesets to execute`  
✓ Backend en: **http://localhost:8082**

#### Terminal 2: Frontend (React/Vite)
```bash
# En una NUEVA terminal, en la raíz del proyecto
cd traccar-web
npm install  # Solo la primera vez
npm start
```
✓ Espera a ver: `VITE ready in XXX ms`  
✓ Frontend en: **http://localhost:3002**

---

## ✅ Sistema Funcionando

✓ **Backend Java** - Puerto 8082 (API)
✓ **Frontend Web** - Puerto 3002 (Interfaz)
✓ **Base de datos H2** - `database/data/`
✓ **Autenticación** - Session-based
✓ **Checkpoints** - Sistema completo

---

## 📱 Acceso a la App

1. **Abre http://localhost:3002** ← AQUÍ VA (no 8082)
2. Haz clic en **REGISTRARSE**
3. Completa el formulario:
   - Nombre: Tu nombre
   - Email: `usuario@localhost`
   - Contraseña: Tu contraseña
4. ¡Listo! Ya estás dentro como admin

---

## 🔧 Solución de Problemas

**Error: "Unique index or primary key violation"**
```bash
Remove-Item -Force "database/data/database.mv.db"
Remove-Item -Force "database/data/database.trace.db"
# Reinicia el backend con: ./start-server.bat
```

**La app no carga en http://localhost:3002**
- Verifica que npm start esté corriendo en la Terminal 2
- Revisa que no haya errores en la consola del npm

**Puerto 3002 ya está en uso**
- npm automáticamente intenta el siguiente: 3003, 3004, etc.
- Busca en la salida de npm: `Local: http://localhost:XXXX`

**Puerto 8082 ya está en uso**
- Busca el proceso: `netstat -an | findstr :8082`
- Termina el proceso: `taskkill /IM java.exe /F`
