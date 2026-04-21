## 🚀 Guía Rápida - Iniciar el Sistema

### Opción 1: Servidor en ventana separada (RECOMENDADO)
```bash
./start-server.bat
```
- El servidor corre en una ventana separada
- Tu terminal sigue disponible para otros comandos
- Accede a la app: **http://localhost:8082**

### Opción 2: Servidor en la misma terminal
```bash
./run.bat
```
- Ve todos los logs en tiempo real
- La terminal se bloquea mientras el servidor corre
- Presiona `Ctrl+C` para detener

---

## ✅ Sistema Funcionando

✓ Backend Java - Puerto 8082  
✓ Base de datos H2 - target/database  
✓ Registro de usuarios - Primer usuario es admin automático  
✓ Autenticación - Session-based  
✓ Checkpoints - Sistema completo implementado  

---

## 📱 Acceso a la App

1. Abre http://localhost:8082
2. Si es la primera vez:
   - Haz clic en "Register"
   - Email: `tuEmail@localhost`
   - Contraseña: cualquier contraseña
   - ¡Estás dentro automáticamente como admin!

3. Ya puedes usar checkpoints

---

## 🔧 Solución de Problemas

**¿El servidor se apaga solo?**
- No se está apagando, está corriendo bien
- Úsalo con `start-server.bat` para que corra en otra ventana

**¿Puerto 8082 ya está en uso?**
- Busca el proceso Java: `netstat -an | findstr :8082`
- Mátalo: `taskkill /IM java.exe /F`

**¿La app no carga en http://localhost:8082?**
- Verifica que el servidor esté corriendo
- Espera 5 segundos después de iniciar
- Revisa la ventana del servidor en busca de errores
