# CatastroAI - Test UI

Interfaz de prueba simple para el backend CatastroAI desarrollado con HTML/CSS/JS vanilla.

## 🚀 Características

- ✅ **Interfaz simple** - HTML/CSS/JS puro, sin frameworks
- ✅ **Prueba de conexión** - Verifica estado del backend
- ✅ **Subida de archivos** - Drag & drop para PDFs catastrales
- ✅ **Procesamiento IA** - Conecta con Gemini 2.5 Flash + Document AI
- ✅ **Métricas en tiempo real** - Tiempo de procesamiento y confianza
- ✅ **Responsive** - Funciona en móvil y escritorio

## 📋 Uso

### 1. Ejecutar Backend en GCP Cloud Shell:
```bash
cd CatastroAI
export GOOGLE_CLOUD_PROJECT=catastral-ai-dev
export GOOGLE_APPLICATION_CREDENTIALS=./key-catastro-ai-agent.json
poetry run python backend_api.py
```

### 2. Abrir Frontend Local:
```bash
# Navegar al directorio
cd catastro-test-ui

# Abrir en navegador
start index.html  # Windows
open index.html   # Mac
```

### 3. Configurar URL del Backend:
Edita `app.js` línea 2 con la URL correcta de tu Cloud Shell:
```javascript
const BACKEND_URL = 'https://8080-cs-XXXXXX.cloudshell.dev';
```

## 🧪 Pruebas

1. **Probar Conexión** - Clic en "Probar Conexión"
2. **Subir PDF** - Selecciona un archivo PDF catastral
3. **Procesar** - Clic en "Procesar con IA"
4. **Ver Resultados** - Revisa datos extraídos y métricas

## 🔧 Características Técnicas

- **Frontend**: HTML5 + Tailwind CSS + Vanilla JS
- **Backend**: FastAPI + Vertex AI + Document AI
- **Autenticación**: Service Account (A2A)
- **CORS**: Configurado para desarrollo
- **Tipos soportados**: PDF únicamente

## 📊 Métricas Mostradas

- ✅ **Éxito/Error** del procesamiento
- 📊 **Nivel de confianza** del modelo IA
- ⏱️ **Tiempo de procesamiento** backend
- 🚀 **Tiempo total** cliente
- 📄 **Datos extraídos** en formato JSON

## 🐛 Troubleshooting

**Error de CORS**: Verifica que el backend tenga CORS configurado
**Error 404**: Confirma que la URL del backend sea correcta
**Error de archivo**: Solo archivos PDF son aceptados
**Timeout**: Archivos muy grandes pueden tardar más tiempo