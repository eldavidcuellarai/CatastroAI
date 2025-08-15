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
- **Tecnologías**: Google ADK, Vertex AI, Gemini 2.5 Flash
- **Framework**: Python con Poetry
- **Arquitectura**: Agente multimodal para atención al cliente

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
- Este es un proyecto relacionado con catastro e IA
- Mantener la documentación actualizada en español
- Seguir las mejores prácticas de seguridad

---
*Archivo creado automáticamente con Claude Code*