# 🛠️ CatastroAI - Guía para AI Engineers

## 🎯 Overview Técnico

Este documento está dirigido específicamente a **AI Engineers** que necesitan entender, implementar, extender o mantener el agente **CatastroAI**. Aquí encontrarás detalles de implementación, código de ejemplo, configuraciones avanzadas y mejores prácticas.

## 🏗️ Stack Tecnológico

```yaml
Framework: Google Agent Development Kit (ADK) 1.0.0
Primary LLM: Gemini 2.5 Flash (Vertex AI)
Secondary AI: Document AI (Google Cloud)
Language: Python 3.11+
Dependency Manager: Poetry
Deployment: Vertex AI Agent Engine
Authentication: Service Account (A2A)
Project: catastrai-deval
Region: us-central1
```

## 🔧 Configuración de Desarrollo

### Prerequisitos

```bash
# Python & Poetry
python --version  # 3.11+
poetry --version  # 1.4+

# Google Cloud CLI
gcloud --version
gcloud auth login
gcloud config set project catastrai-deval

# Habilitar APIs necesarias
gcloud services enable aiplatform.googleapis.com
gcloud services enable ml.googleapis.com
gcloud services enable documentai.googleapis.com
```

### Setup Local

```bash
# Clonar y setup
git clone <repository>
cd CatastroAI

# Instalar dependencias
poetry install
poetry shell

# Configurar credenciales
cp .env.example .env
# Editar .env con tus credenciales

# Verificar configuración
poetry run python setup_gcp_a2a.py
```

### Variables de Entorno

```bash
# .env para desarrollo
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=catastrai-deval
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./credentials/catastro-ai-credentials.json

# Document AI (opcional)
DOC_AI_PROCESSOR_ID=projects/catastrai-deval/locations/us/processors/YOUR_PROCESSOR_ID
DOC_AI_PROCESSOR_LOCATION=us

# Para desarrollo rápido con AI Studio
GOOGLE_GENAI_USE_VERTEXAI=false
GOOGLE_API_KEY=your-ai-studio-api-key
```

## 🧠 Arquitectura de Código

### Estructura del Proyecto

```
customer_service/
├── __init__.py
├── agent.py                 # Definición principal del agente
├── config.py               # Configuración centralizada
├── prompts.py              # Instrucciones del agente
├── entities/
│   ├── __init__.py
│   └── customer.py         # Modelo de datos del usuario
├── shared_libraries/
│   ├── __init__.py
│   └── callbacks.py        # Callbacks del ciclo de vida
└── tools/
    ├── __init__.py
    └── tools.py            # Herramientas especializadas
```

### Configuración del Agente (`agent.py`)

```python
from google.adk import Agent
from .config import Config
from .prompts import GLOBAL_INSTRUCTION, INSTRUCTION
from .tools.tools import (
    analyze_cadastral_image,
    # ... otras herramientas
)

configs = Config()

root_agent = Agent(
    model=configs.agent_settings.model,  # "gemini-2.5-flash"
    global_instruction=GLOBAL_INSTRUCTION,
    instruction=INSTRUCTION,
    name=configs.agent_settings.name,
    tools=[
        analyze_cadastral_image,
        # ... lista completa de herramientas
    ],
    before_tool_callback=before_tool,
    after_tool_callback=after_tool,
    before_agent_callback=before_agent,
    before_model_callback=rate_limit_callback,
)
```

### Configuración Centralizada (`config.py`)

```python
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import BaseModel, Field

class AgentModel(BaseModel):
    """Configuración del modelo del agente"""
    name: str = Field(default="catastro_ai_agent")
    model: str = Field(default="gemini-2.5-flash")
    secondary_model: str = Field(default="document-ai-specialist")
    description: str = Field(default="Agente híbrido para servicios catastrales")

class Config(BaseSettings):
    """Configuración principal del sistema"""
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_prefix="GOOGLE_",
        case_sensitive=True,
    )
    
    agent_settings: AgentModel = Field(default=AgentModel())
    app_name: str = "catastro_ai_app"
    CLOUD_PROJECT: str = Field(default="catastrai-deval")
    CLOUD_LOCATION: str = Field(default="us-central1")
    GENAI_USE_VERTEXAI: str = Field(default="1")
    API_KEY: str | None = Field(default="")
```

## 🛠️ Implementación de Herramientas

### Herramienta Básica

```python
from typing import Literal

def basic_tool_example(parameter: str) -> dict:
    """
    Ejemplo de herramienta básica.
    
    Args:
        parameter: Descripción del parámetro
        
    Returns:
        dict: Resultado estructurado
    """
    # Lógica de la herramienta
    result = process_parameter(parameter)
    
    return {
        "status": "success",
        "data": result,
        "message": f"Procesado: {parameter}"
    }
```

### Herramienta con Vertex AI

```python
import vertexai
from vertexai.generative_models import GenerativeModel, Part
from .config import Config

def analyze_cadastral_image(
    image_uri: str,
    analysis_type: Literal["property", "document", "map"] = "property",
    language: str = "es"
) -> dict:
    """
    Analiza imágenes catastrales usando Gemini Vision.
    
    Args:
        image_uri: URI de la imagen (gs://, http://, o base64)
        analysis_type: Tipo de análisis a realizar
        language: Idioma de respuesta
        
    Returns:
        dict: Análisis estructurado de la imagen
    """
    configs = Config()
    
    # Inicializar Vertex AI
    vertexai.init(
        project=configs.CLOUD_PROJECT,
        location=configs.CLOUD_LOCATION
    )
    
    model = GenerativeModel("gemini-2.5-flash")
    
    # Preparar prompt según tipo de análisis
    prompts = {
        "property": "Analiza esta propiedad e identifica características catastrales...",
        "document": "Extrae información de este documento catastral...",
        "map": "Analiza este mapa catastral e identifica linderos..."
    }
    
    try:
        # Procesar imagen
        if image_uri.startswith(('gs://', 'http')):
            image_part = Part.from_uri(image_uri, mime_type="image/jpeg")
        else:
            # Manejar base64 u otros formatos
            image_part = Part.from_data(image_data, mime_type="image/jpeg")
        
        # Generar análisis
        response = model.generate_content([
            prompts[analysis_type],
            image_part
        ])
        
        return {
            "status": "success",
            "analysis_type": analysis_type,
            "result": response.text,
            "confidence": "high",
            "language": language
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "analysis_type": analysis_type
        }
```

### Herramienta con Document AI

```python
from google.cloud import documentai_v1 as documentai
from typing import Dict, Any

def extract_with_document_ai(
    project_id: str,
    location: str,
    processor_id: str,
    file_bytes: bytes,
    mime_type: str = "application/pdf",
) -> Dict[str, Any]:
    """
    Extrae información de documentos usando Document AI.
    
    Args:
        project_id: ID del proyecto GCP
        location: Región del processor (us, eu)
        processor_id: ID del processor de Document AI
        file_bytes: Contenido del archivo en bytes
        mime_type: Tipo MIME del archivo
        
    Returns:
        Dict con texto extraído, entidades y metadatos
    """
    # Inicializar cliente
    client = documentai.DocumentProcessorServiceClient()
    name = client.processor_path(project_id, location, processor_id)
    
    # Crear documento
    raw_document = documentai.RawDocument(
        content=file_bytes, 
        mime_type=mime_type
    )
    
    # Procesar documento
    request = documentai.ProcessRequest(
        name=name, 
        raw_document=raw_document
    )
    
    result = client.process_document(request=request)
    document = result.document
    
    # Extraer entidades
    entities = []
    for entity in document.entities:
        entities.append({
            "type": entity.type_,
            "mention_text": entity.mention_text,
            "confidence": entity.confidence,
            "page_anchor": {
                "page_refs": [
                    {
                        "page": page_ref.page,
                        "bounding_box": page_ref.bounding_box
                    }
                    for page_ref in entity.page_anchor.page_refs
                ]
            } if entity.page_anchor else None
        })
    
    return {
        "text": document.text or "",
        "entities": entities,
        "pages": len(document.pages),
        "confidence": document.text_changes[0].changed_elements[0].confidence if document.text_changes else None
    }
```

### Herramienta Híbrida (Document AI + Gemini)

```python
import json
from vertexai.generative_models import GenerationConfig

def analyze_cadastral_document(
    file_uri: str,
    output_mode: Literal["features", "summary", "ocr"] = "features",
    language: str = "es"
) -> dict:
    """
    Análisis híbrido: Document AI para extracción + Gemini para razonamiento.
    
    Args:
        file_uri: URI del documento
        output_mode: Modo de salida del análisis
        language: Idioma de respuesta
        
    Returns:
        dict: Análisis completo con validación cruzada
    """
    configs = Config()
    
    try:
        # Paso 1: Obtener bytes del archivo
        file_bytes = get_file_bytes(file_uri)
        
        # Paso 2: Extracción con Document AI
        docai_result = extract_with_document_ai(
            project_id=configs.CLOUD_PROJECT,
            location="us",  # Document AI location
            processor_id="YOUR_PROCESSOR_ID",
            file_bytes=file_bytes,
            mime_type="application/pdf"
        )
        
        # Paso 3: Análisis semántico con Gemini
        vertexai.init(
            project=configs.CLOUD_PROJECT,
            location=configs.CLOUD_LOCATION
        )
        
        model = GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""
        Eres un experto en análisis catastral. Analiza el siguiente texto extraído 
        de un documento y genera un JSON estructurado con:
        
        {{
          "document_type": "tipo de documento",
          "owner_name": "nombre del propietario",
          "property_id": "identificador de la propiedad",
          "key_entities": [
            {{"type": "tipo", "value": "valor", "confidence": 0.95}}
          ],
          "checklist": ["item1", "item2"],
          "recommendations": ["recomendación1"],
          "confidence": 0.88
        }}
        
        Texto extraído: {docai_result["text"]}
        Entidades detectadas: {json.dumps(docai_result["entities"], indent=2)}
        """
        
        config = GenerationConfig(
            temperature=0.1,
            top_p=0.9,
            response_mime_type="application/json"
        )
        
        response = model.generate_content([prompt], generation_config=config)
        
        try:
            gemini_analysis = json.loads(response.text)
        except json.JSONDecodeError:
            gemini_analysis = {"raw": response.text, "parse_error": True}
        
        # Paso 4: Validación cruzada
        cross_validation_score = calculate_cross_validation(
            docai_result, gemini_analysis
        )
        
        return {
            "status": "success",
            "docai_extraction": docai_result,
            "gemini_analysis": gemini_analysis,
            "cross_validation_score": cross_validation_score,
            "output_mode": output_mode,
            "processing_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "output_mode": output_mode
        }

def calculate_cross_validation(docai_result: dict, gemini_analysis: dict) -> float:
    """Calcula score de validación cruzada entre Document AI y Gemini"""
    # Implementar lógica de validación cruzada
    # Por ejemplo, comparar entidades extraídas vs analizadas
    score = 0.85  # Placeholder
    return score
```

## 🔄 Callbacks del Ciclo de Vida

```python
import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)

def before_agent(request: Any) -> Any:
    """Se ejecuta antes de procesar cada request del agente"""
    logger.info(f"Iniciando procesamiento de request: {type(request)}")
    # Agregar metadatos, logging, etc.
    return request

def before_tool(tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Se ejecuta antes de cada herramienta"""
    logger.info(f"Ejecutando herramienta: {tool_name}")
    logger.debug(f"Parámetros: {parameters}")
    
    # Validaciones, transformaciones, etc.
    if tool_name == "analyze_cadastral_image":
        # Validaciones específicas para análisis de imágenes
        if not parameters.get("image_uri"):
            raise ValueError("image_uri es requerido")
    
    return parameters

def after_tool(tool_name: str, result: Any) -> Any:
    """Se ejecuta después de cada herramienta"""
    logger.info(f"Resultado de {tool_name}: {type(result)}")
    
    # Post-procesamiento, logging de resultados, etc.
    if isinstance(result, dict) and result.get("status") == "error":
        logger.error(f"Error en {tool_name}: {result.get('error')}")
    
    return result

def rate_limit_callback(request: Any) -> Any:
    """Control de rate limiting para el modelo"""
    # Implementar throttling si es necesario
    # Por ejemplo, delays o circuit breakers
    return request
```

## 🚀 Deployment y CI/CD

### Build Process

```bash
# Construir wheel del agente
poetry build --format=wheel --output=deployment

# El archivo generado será:
# deployment/customer_service-0.1.0-py3-none-any.whl
```

### Deployment Script (`deployment/deploy.py`)

```python
import argparse
import logging
import sys
import vertexai
from customer_service.agent import root_agent
from customer_service.config import Config
from vertexai import agent_engines
from vertexai.preview.reasoning_engines import AdkApp

def deploy_agent():
    """Despliega el agente a Vertex AI Agent Engine"""
    configs = Config()
    
    # Configurar Vertex AI
    vertexai.init(
        project=configs.CLOUD_PROJECT,
        location=configs.CLOUD_LOCATION,
        staging_bucket=f"gs://{configs.CLOUD_PROJECT}-adk-customer-service-staging"
    )
    
    # Crear AdkApp
    app = AdkApp(agent=root_agent, enable_tracing=False)
    
    # Desplegar
    remote_app = agent_engines.create(
        app,
        requirements=["./customer_service-0.1.0-py3-none-any.whl"],
        extra_packages=["./customer_service-0.1.0-py3-none-any.whl"]
    )
    
    # Test automático
    session = remote_app.create_session(user_id="test_deployment")
    for event in remote_app.stream_query(
        user_id="test_deployment",
        session_id=session["id"],
        message="Prueba de deployment",
    ):
        if event.get("content", None):
            print(f"✅ Agent deployed: {remote_app.resource_name}")
            return remote_app.resource_name
    
    raise Exception("Deployment test failed")

if __name__ == "__main__":
    resource_name = deploy_agent()
    print(f"🚀 Deployment completado: {resource_name}")
```

### Testing del Deployment

```python
import vertexai
from customer_service.config import Config

def test_deployed_agent(resource_name: str):
    """Prueba el agente desplegado"""
    configs = Config()
    
    vertexai.init(
        project=configs.CLOUD_PROJECT,
        location=configs.CLOUD_LOCATION
    )
    
    # Obtener agente desplegado
    remote_agent = agent_engines.get(resource_name=resource_name)
    
    # Crear sesión de prueba
    session = remote_agent.create_session(user_id="test_user")
    
    # Enviar query de prueba
    test_queries = [
        "Hola, necesito ayuda con un trámite catastral",
        "¿Puedes analizar un documento PDF?",
        "Quiero programar una cita para avalúo"
    ]
    
    for query in test_queries:
        print(f"Testing: {query}")
        for event in remote_agent.stream_query(
            user_id="test_user",
            session_id=session["id"],
            message=query,
        ):
            if event.get("content"):
                print(f"✅ Response: {event['content'][:100]}...")
                break
```

## 🧪 Testing y Evaluación

### Unit Tests

```python
# tests/unit/test_tools.py
import pytest
from customer_service.tools.tools import analyze_cadastral_image

def test_analyze_cadastral_image():
    """Test básico para análisis de imágenes"""
    result = analyze_cadastral_image(
        image_uri="gs://test-bucket/test-image.jpg",
        analysis_type="property"
    )
    
    assert result["status"] == "success"
    assert "result" in result
    assert result["analysis_type"] == "property"

@pytest.mark.asyncio
async def test_document_processing():
    """Test para procesamiento de documentos"""
    # Implementar test con documentos de prueba
    pass
```

### Evaluation Scripts

```python
# eval/test_eval.py
import json
from customer_service.agent import root_agent

def evaluate_agent():
    """Evalúa el rendimiento del agente"""
    test_cases = load_test_cases("eval/test_cases.json")
    results = []
    
    for case in test_cases:
        result = root_agent.run(case["input"])
        score = calculate_score(result, case["expected"])
        results.append({
            "case_id": case["id"],
            "score": score,
            "result": result
        })
    
    return results

def load_test_cases(file_path: str) -> list:
    """Carga casos de prueba desde archivo JSON"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)
```

## 🔧 Configuraciones Avanzadas

### Custom Model Configuration

```python
# Para usar modelos específicos o configuraciones custom
class CustomConfig(Config):
    """Configuración personalizada"""
    
    def __init__(self):
        super().__init__()
        self.agent_settings.model = "gemini-2.5-flash-001"  # Versión específica
        self.custom_temperature = 0.3
        self.max_tokens = 8192
```

### Environment-Specific Settings

```python
import os
from enum import Enum

class Environment(Enum):
    DEVELOPMENT = "dev"
    STAGING = "staging"
    PRODUCTION = "prod"

def get_config_for_env(env: Environment) -> Config:
    """Retorna configuración según entorno"""
    if env == Environment.DEVELOPMENT:
        return DevConfig()
    elif env == Environment.STAGING:
        return StagingConfig()
    elif env == Environment.PRODUCTION:
        return ProdConfig()
    else:
        raise ValueError(f"Unknown environment: {env}")

class DevConfig(Config):
    CLOUD_PROJECT = "catastrai-dev"
    GENAI_USE_VERTEXAI = "false"  # Usar AI Studio para dev

class ProdConfig(Config):
    CLOUD_PROJECT = "catastrai-prod"
    GENAI_USE_VERTEXAI = "true"   # Usar Vertex AI para prod
```

## 🚨 Troubleshooting

### Errores Comunes

```python
# Error: Credenciales no configuradas
"""
Error: google.auth.exceptions.DefaultCredentialsError

Solución:
1. Verificar GOOGLE_APPLICATION_CREDENTIALS
2. Ejecutar: gcloud auth application-default login
3. Verificar permisos del Service Account
"""

# Error: Processor no encontrado
"""
Error: 404 Document AI processor not found

Solución:
1. Verificar DOC_AI_PROCESSOR_ID
2. Verificar región (us vs eu)
3. Crear processor si no existe
"""

# Error: Rate limiting
"""
Error: 429 Too Many Requests

Solución:
1. Implementar backoff exponencial
2. Configurar rate_limit_callback
3. Usar múltiples API keys si es necesario
"""
```

### Debugging

```python
import logging

# Configurar logging detallado
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Habilitar tracing en ADK
app = AdkApp(agent=root_agent, enable_tracing=True)
```

## 📚 Mejores Prácticas

### 1. Manejo de Errores

```python
def robust_tool_example(parameter: str) -> dict:
    """Ejemplo de herramienta con manejo robusto de errores"""
    try:
        result = process_parameter(parameter)
        return {"status": "success", "data": result}
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        return {"status": "error", "error": "Invalid parameter", "details": str(e)}
    except ExternalAPIError as e:
        logger.error(f"External API error: {e}")
        return {"status": "error", "error": "External service unavailable"}
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return {"status": "error", "error": "Internal error"}
```

### 2. Performance Optimization

```python
from functools import lru_cache
import asyncio

@lru_cache(maxsize=128)
def cached_analysis(document_hash: str) -> dict:
    """Cache resultados de análisis para documentos duplicados"""
    return expensive_analysis(document_hash)

async def async_processing(documents: list) -> list:
    """Procesamiento asíncrono para múltiples documentos"""
    tasks = [process_document(doc) for doc in documents]
    return await asyncio.gather(*tasks)
```

### 3. Monitoring y Observabilidad

```python
import time
from functools import wraps

def monitor_performance(func):
    """Decorator para monitorear performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            logger.info(f"{func.__name__} completed in {time.time() - start_time:.2f}s")
            return result
        except Exception as e:
            logger.error(f"{func.__name__} failed after {time.time() - start_time:.2f}s: {e}")
            raise
    return wrapper
```

## 📞 Contacto para Desarrolladores

**🛠️ Issues Técnicos**: GitHub Issues  
**📧 Arquitectura**: ai-team@catastroai.com  
**📚 Docs Internas**: Confluence/Notion  
**💬 Chat Técnico**: Slack #catastroai-dev  

**🔗 Links Útiles:**
- [ADK Documentation](https://google.github.io/adk-docs/)
- [Vertex AI Docs](https://cloud.google.com/vertex-ai/docs)
- [Document AI Docs](https://cloud.google.com/document-ai/docs)
- [Gemini API Docs](https://ai.google.dev/)

---

*Última actualización: $(date) - v0.1.0*
