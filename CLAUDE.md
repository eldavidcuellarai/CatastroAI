# Instrucciones para Claude

## Reglas Generales
- Toda la documentación debe estar en español
- Seguir las convenciones de código existentes en el proyecto
- Mantener consistencia en el estilo de codificación
- Priorizar la edición de archivos existentes sobre la creación de nuevos

## Comandos de Desarrollo
- Para ejecutar pruebas: `poetry run pytest`
- Para ejecutar linting: `poetry run pylint customer_service/`
- Para formatear código: `poetry run pyink customer_service/`
- Para evaluar el agente: `poetry run python -m eval.test_eval`
- Para instalar dependencias: `poetry install`

## Estructura del Proyecto
- **Proyecto GCP**: catastrai-deval
- **Región**: us-central1  
- **Tecnologías**: Google ADK, Vertex AI, Gemini 2.5 Flash, Document AI
- **Framework**: Python con Poetry
- **Arquitectura**: Agente híbrido con doble validación (Gemini + Document AI)
- **Especialización**: Servicios catastrales e inmobiliarios

## Configuración GCP A2A
- **Service Account**: catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com
- **Credenciales**: ./credentials/catastro-ai-credentials.json
- **Variables**: Ver archivo .env

## Comandos GCP Específicos
```bash
# Crear Service Account
gcloud iam service-accounts create catastro-ai-agent --project=catastrai-deval

# Generar credenciales
gcloud iam service-accounts keys create ./credentials/catastro-ai-credentials.json --iam-account=catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com

# Verificar configuración
poetry run python setup_gcp_a2a.py
```

## Notas Importantes
- Este es un proyecto especializado en servicios catastrales e inmobiliarios
- **Arquitectura Híbrida**: Gemini 2.5 Flash (motor principal) + Document AI (segundo revisor)
- **Doble Validación**: Todos los documentos críticos son verificados por ambos modelos
- Mantener la documentación actualizada en español
- Seguir las mejores prácticas de seguridad
- El modelo de Document AI está preentrenado para documentos catastrales específicos

---
*Archivo creado automáticamente con Claude Code*