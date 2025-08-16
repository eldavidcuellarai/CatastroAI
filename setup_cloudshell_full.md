# CatastroAI - Setup Completo en Cloud Shell

## 🚀 Ejecutar TODO en Cloud Shell con ADK Web

### 1. **Preparar Entorno en Cloud Shell**

```bash
# Navegar al proyecto
cd ~/CatastroAI

# Verificar estructura
ls -la

# Configurar variables de entorno
export GOOGLE_CLOUD_PROJECT=catastral-ai-dev
export GOOGLE_APPLICATION_CREDENTIALS=./key-catastro-ai-agent.json
```

### 2. **Ejecutar Backend API**

```bash
# Ejecutar backend en background
nohup poetry run python backend_api.py > backend.log 2>&1 &

# Verificar que esté corriendo
ps aux | grep backend_api

# Ver logs en tiempo real
tail -f backend.log
```

### 3. **Ejecutar Frontend Simple en Cloud Shell**

```bash
# Crear servidor HTTP simple para el test UI
cd catastro-test-ui

# Python HTTP server en puerto 3000
python3 -m http.server 3000 > frontend.log 2>&1 &

# O usar Node.js si prefieres
# npx serve -p 3000 . > frontend.log 2>&1 &
```

### 4. **Acceder via Web Preview**

1. **Backend**: Web Preview → Port 8080
2. **Frontend**: Web Preview → Port 3000

### 5. **ADK Web Interface (Alternativa)**

```bash
# Ejecutar interface web del ADK
poetry run adk web

# Esto iniciará la interfaz web en puerto 8080
# Accesible via Web Preview
```

## 🛠️ **Script Automatizado para Cloud Shell**

```bash
#!/bin/bash
# setup_all.sh - Script para ejecutar todo en Cloud Shell

echo "🚀 Configurando CatastroAI en Cloud Shell..."

# Configurar variables
export GOOGLE_CLOUD_PROJECT=catastral-ai-dev
export GOOGLE_APPLICATION_CREDENTIALS=./key-catastro-ai-agent.json

# Verificar credenciales
if [ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "❌ Error: Archivo de credenciales no encontrado"
    echo "📋 Asegúrate de que key-catastro-ai-agent.json existe"
    exit 1
fi

echo "✅ Credenciales encontradas"

# Instalar dependencias si es necesario
poetry install --no-root

# Ejecutar backend
echo "🔄 Iniciando backend..."
nohup poetry run python backend_api.py > logs/backend.log 2>&1 &
BACKEND_PID=$!

# Esperar que el backend inicie
sleep 5

# Verificar que el backend esté corriendo
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend iniciado correctamente (PID: $BACKEND_PID)"
else
    echo "❌ Error iniciando backend"
    exit 1
fi

# Ejecutar frontend simple
echo "🔄 Iniciando frontend..."
cd catastro-test-ui
nohup python3 -m http.server 3000 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "✅ Frontend iniciado correctamente (PID: $FRONTEND_PID)"

# Mostrar información
echo ""
echo "🎉 CatastroAI ejecutándose en Cloud Shell!"
echo ""
echo "📍 URLs de acceso:"
echo "   Backend API: Web Preview → Port 8080"
echo "   Test UI: Web Preview → Port 3000"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs backend: tail -f logs/backend.log"
echo "   Ver logs frontend: tail -f logs/frontend.log"
echo "   Detener todo: ./stop_all.sh"
echo ""
echo "🔍 PIDs de procesos:"
echo "   Backend: $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"

# Guardar PIDs para poder detener después
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid
```

## 🛑 **Script para Detener Todo**

```bash
#!/bin/bash
# stop_all.sh

echo "🛑 Deteniendo CatastroAI..."

# Leer PIDs
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Backend detenido"
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Frontend detenido"
    rm .frontend.pid
fi

echo "🎉 Todos los procesos detenidos"
```

## 📋 **Comandos de Verificación**

```bash
# Ver procesos corriendo
ps aux | grep -E "(backend_api|http.server)"

# Ver puertos en uso
netstat -tulpn | grep -E ":(3000|8080)"

# Probar backend desde Cloud Shell
curl http://localhost:8080/health

# Ver logs
tail -f logs/backend.log
tail -f logs/frontend.log
```

## ⚡ **Ejecución Rápida**

```bash
# Crear directorio de logs
mkdir -p logs

# Hacer scripts ejecutables
chmod +x setup_all.sh stop_all.sh

# Ejecutar todo
./setup_all.sh

# Para detener
./stop_all.sh
```