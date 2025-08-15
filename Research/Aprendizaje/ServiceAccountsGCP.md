# Service Accounts en Google Cloud Platform

## ¿Qué es un Service Account?

Un **Service Account** es una cuenta especial diseñada para aplicaciones y servicios, no para usuarios humanos. Es como darle una "identidad" a tu aplicación para que pueda acceder a recursos de Google Cloud de forma segura.

## 🧑‍💻 Comparación: Usuario vs Service Account

| Aspecto | Usuario Normal | Service Account |
|---------|----------------|-----------------|
| **Email** | cristian@gmail.com | catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com |
| **Autenticación** | Contraseña + 2FA | Archivo JSON con claves |
| **Propósito** | Personas que trabajan | Aplicaciones que ejecutan código |
| **Interacción** | Interfaz web/GUI | API calls automáticas |
| **Sesión** | Login/logout manual | Autenticación automática |

## 🔑 ¿Cómo Funciona la Autenticación A2A?

### Flujo de Autenticación Application-to-Application:

```mermaid
graph TD
    A[Tu Aplicación CatastroAI] --> B[Carga credenciales JSON]
    B --> C[Genera JWT firmado]
    C --> D[Envía JWT a Google Cloud]
    D --> E[Google verifica firma]
    E --> F[Devuelve Access Token]
    F --> G[Aplicación usa token para APIs]
```

### En código Python:
```python
from google.auth import default

# 1. Carga automática de credenciales
credentials, project = default()

# 2. La aplicación ya está autenticada
client = aiplatform.gapic.PredictionServiceClient(credentials=credentials)
```

## 🛡️ Principios de Seguridad

### 1. **Principio de Mínimos Privilegios**
```bash
# ❌ MAL: Dar permisos amplios
--role="roles/editor"  # Demasiado poder

# ✅ BIEN: Permisos específicos
--role="roles/aiplatform.user"        # Solo para IA
--role="roles/storage.objectViewer"   # Solo leer archivos
```

### 2. **Rotación de Claves**
```bash
# Crear nueva clave
gcloud iam service-accounts keys create nueva-clave.json \
    --iam-account=catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com

# Eliminar clave antigua
gcloud iam service-accounts keys delete KEY_ID \
    --iam-account=catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com
```

### 3. **Protección del Archivo JSON**
```bash
# Permisos restrictivos
chmod 600 credentials.json

# Nunca subir a Git
echo "credentials/" >> .gitignore
echo "*.json" >> .gitignore

# Variable de entorno segura
export GOOGLE_APPLICATION_CREDENTIALS="/ruta/segura/credentials.json"
```

## 🏗️ Configuración Paso a Paso para CatastroAI

### Paso 1: Crear Service Account
```bash
gcloud iam service-accounts create catastro-ai-agent \
    --project=catastrai-deval \
    --description="Service Account para CatastroAI con ADK" \
    --display-name="CatastroAI Agent SA"
```

**Resultado**: Se crea `catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com`

### Paso 2: Asignar Roles Específicos
```bash
# Para usar Vertex AI y Gemini
gcloud projects add-iam-policy-binding catastrai-deval \
    --member="serviceAccount:catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

# Para desarrollo de ML
gcloud projects add-iam-policy-binding catastrai-deval \
    --member="serviceAccount:catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com" \
    --role="roles/ml.developer"
```

### Paso 3: Generar Credenciales JSON
```bash
# Crear directorio seguro
mkdir -p credentials
chmod 700 credentials

# Generar archivo de credenciales
gcloud iam service-accounts keys create ./credentials/catastro-ai-credentials.json \
    --iam-account=catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com

# Proteger archivo
chmod 600 ./credentials/catastro-ai-credentials.json
```

### Paso 4: Configurar Variables de Entorno
```bash
# En .env
GOOGLE_APPLICATION_CREDENTIALS=./credentials/catastro-ai-credentials.json
GOOGLE_CLOUD_PROJECT=catastrai-deval
GOOGLE_GENAI_USE_VERTEXAI=true
```

## 📊 Roles Comunes para IA y ML

| Rol | Descripción | Cuándo Usar |
|-----|-------------|-------------|
| `roles/aiplatform.user` | Usar Vertex AI | **Siempre para CatastroAI** |
| `roles/ml.developer` | Desarrollar modelos ML | **Para entrenamiento** |
| `roles/storage.objectViewer` | Leer archivos | Cuando necesites leer documentos |
| `roles/storage.objectCreator` | Subir archivos | Cuando guardes resultados |
| `roles/documentai.apiUser` | Document AI | Para procesar PDFs/imágenes |

## 🔍 Monitoreo y Auditoría

### Ver Service Accounts Existentes
```bash
gcloud iam service-accounts list --project=catastrai-deval
```

### Revisar Permisos de un Service Account
```bash
gcloud projects get-iam-policy catastrai-deval \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com"
```

### Logs de Uso
```bash
gcloud logging read "protoPayload.authenticationInfo.principalEmail=catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com" \
    --limit=50 \
    --project=catastrai-deval
```

## 🚨 Problemas Comunes y Soluciones

### Error: "Permission denied"
```bash
# Verificar que el Service Account tenga el rol correcto
gcloud projects get-iam-policy catastrai-deval

# Agregar rol faltante
gcloud projects add-iam-policy-binding catastrai-deval \
    --member="serviceAccount:catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com" \
    --role="roles/ROLE_NECESARIO"
```

### Error: "Credentials not found"
```bash
# Verificar que la variable apunte al archivo correcto
echo $GOOGLE_APPLICATION_CREDENTIALS

# Verificar que el archivo existe
ls -la ./credentials/catastro-ai-credentials.json

# Verificar permisos del archivo
stat ./credentials/catastro-ai-credentials.json
```

### Error: "Project not found"
```bash
# Verificar proyecto configurado
gcloud config get-value project

# Cambiar proyecto activo
gcloud config set project catastrai-deval
```

## 📚 Conceptos Avanzados

### Application Default Credentials (ADC)
Google Cloud busca credenciales en este orden:
1. Variable `GOOGLE_APPLICATION_CREDENTIALS`
2. Credenciales de usuario (`gcloud auth application-default login`)
3. Metadata service (en Compute Engine/Cloud Run)

### JSON Web Tokens (JWT)
El archivo JSON contiene:
```json
{
  "type": "service_account",
  "project_id": "catastrai-deval",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

La `private_key` se usa para firmar JWTs que prueban la identidad del Service Account.

## 🎯 Mejores Prácticas para CatastroAI

1. **Un Service Account por aplicación**
   - No reutilizar entre proyectos diferentes
   - Facilita auditoría y gestión

2. **Rotación regular de claves**
   - Máximo 90 días por clave
   - Automatizar rotación en producción

3. **Monitoreo continuo**
   - Logs de acceso
   - Alertas por uso inusual
   - Revisión periódica de permisos

4. **Entorno de desarrollo vs producción**
   - Service Accounts separados
   - Permisos más restrictivos en producción

## 🔗 Referencias Útiles

- [Documentación oficial de Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Mejores prácticas de seguridad](https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)
- [Vertex AI IAM roles](https://cloud.google.com/vertex-ai/docs/general/access-control)

---

**Documento creado para el proyecto CatastroAI**  
*Fecha: 2025-08-15*  
*Proyecto: catastrai-deval*