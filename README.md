# 🏗️ CatastroAI - Agente Inteligente para Servicios Catastrales

## 🚀 Pitch del Proyecto

**CatastroAI** es un agente de inteligencia artificial revolucionario diseñado específicamente para modernizar y automatizar los servicios catastrales. Utilizando las capacidades avanzadas de **Gemini 2.5 Flash** y **Google Cloud Platform**, nuestro agente multimodal puede procesar documentos complejos, interpretar imágenes de propiedades, y brindar asistencia especializada para trámites catastrales, valuaciones inmobiliarias y consultas técnicas.

### 🎯 ¿Qué hace CatastroAI?
- **Procesamiento inteligente de documentos** catastrales (PDFs, planos, escrituras)
- **Análisis de imágenes** de propiedades para valuaciones automáticas
- **Asistencia conversacional** para ciudadanos y profesionales del sector
- **Integración con sistemas** existentes de catastro y registro
- **Automatización de procesos** burocráticos complejos

### 💡 ¿Por qué CatastroAI?
En un sector donde la digitalización avanza lentamente, CatastroAI ofrece una solución **moderna, eficiente y accesible** que transforma la experiencia tanto para funcionarios públicos como para ciudadanos, reduciendo tiempos de gestión de semanas a minutos.

---

## 📋 Descripción del Proyecto

Este proyecto implementa un agente de IA especializado en servicios catastrales, construido sobre el **Google Agent Development Kit (ADK)** y potenciado por **Vertex AI**. El agente está diseñado para proporcionar asistencia experta, gestionar consultas complejas, procesar documentación técnica y ofrecer recomendaciones personalizadas en el ámbito catastral e inmobiliario.

## 🔎 Visión General

CatastroAI está diseñado para proporcionar una experiencia fluida y especializada en servicios catastrales. Aprovecha las capacidades de **Gemini 2.5 Flash** para comprender necesidades complejas del sector, ofrecer análisis técnicos precisos, gestionar documentación oficial y brindar recomendaciones expertas. El agente está diseñado para ser profesional, preciso y altamente eficiente, asegurando que los usuarios reciban el mejor servicio posible.

## 📊 Detalles del Agente

Las características principales del Agente CatastroAI incluyen:

| Característica     | Descripción                    |
| ------------------ | ------------------------------ |
| _Tipo de Interacción_ | Conversacional              |
| _Complejidad_      | Avanzada                       |
| _Tipo de Agente_   | Agente Único Especializado     |
| _Componentes_      | Herramientas, Multimodal, Tiempo Real |
| _Sector Vertical_  | Catastro e Inmobiliario        |

### 🏗️ Arquitectura del Agente

![Flujo de Trabajo del Agente CatastroAI](customer_service_workflow.png)

El agente está construido usando una arquitectura **multimodal avanzada**, combinando entradas de texto, imágenes y documentos para proporcionar una experiencia rica e interactiva. Simula interacciones con diversas herramientas y servicios especializados en catastro, incluyendo análisis de propiedades, gestión de documentos, procesamiento de valuaciones y sistemas de consultas técnicas. El agente también utiliza un sistema de gestión de sesiones para mantener contexto entre interacciones y personalizar la experiencia del usuario.

⚠️ **Nota Importante**: Este agente actualmente no está integrado a un backend real y el comportamiento está basado en herramientas simuladas. Si deseas implementar este agente con integración real de backend, necesitarás editar [customer_service/tools.py](./customer_service/tools/tools.py)

Debido a que las herramientas están simuladas, podrías notar que algunos cambios solicitados no se aplicarán. Por ejemplo, documentos recién agregados para análisis no se mostrarán si posteriormente un usuario solicita al agente listar todos los elementos procesados.

### 🌟 Características Principales

- **💬 Asistencia Personalizada Especializada:**
  - Saluda a usuarios recurrentes por nombre y reconoce su historial de consultas.
  - Mantiene un tono profesional, empático y técnicamente preciso.
  
- **🏠 Identificación y Análisis de Propiedades:**
  - Asiste en la identificación de propiedades, incluso desde descripciones vagas.
  - Solicita y utiliza documentos visuales (planos, fotos aéreas) para identificar propiedades con precisión.
  - Proporciona análisis técnicos personalizados basados en propiedades identificadas, necesidades del usuario y ubicación específica.
  - Ofrece alternativas de tramitación si existen mejores opciones disponibles.
  
- **📋 Gestión de Expedientes:**
  - Accede y muestra el contenido de expedientes catastrales del usuario.
  - Modifica estados de tramitación agregando y removiendo documentos basado en recomendaciones técnicas.
  - Informa sobre cambios normativos relevantes y actualizaciones en procesos.
  
- **🔧 Servicios Técnicos Especializados:**
  - Sugiere servicios relevantes, como avalúos profesionales o revisiones técnicas.
  - Maneja consultas sobre costos y descuentos, incluyendo comparativas del mercado.
  - Solicita aprobación de supervisores para descuentos cuando sea necesario.
  
- **📅 Programación de Citas:**
  - Programa citas para servicios de valuación, inspecciones o consultas técnicas.
  - Verifica espacios de tiempo disponibles y los presenta al usuario.
  - Confirma detalles de citas y envía confirmaciones/invitaciones de calendario.
  
- **📞 Soporte y Seguimiento:**
  - Envía vía SMS o email instrucciones de seguimiento relevantes a los trámites del usuario.
  - Ofrece códigos QR de descuento para futuras consultas a usuarios leales.
  
- **🛠️ Interacciones Basadas en Herramientas:**
  - El agente interactúa con el usuario utilizando un conjunto de herramientas especializadas.
  - El agente puede usar múltiples herramientas en una sola interacción.
  - El agente puede usar las herramientas para obtener información y modificar el estado de transacción del usuario.
  
- **📈 Evaluación:**
  - El agente puede ser evaluado usando un conjunto de casos de prueba.
  - La evaluación se basa en la capacidad del agente para usar las herramientas y responder a solicitudes del usuario.

#### 📊 Estado del Agente - Información por Defecto del Usuario

El estado de sesión del agente está precargado con datos de muestra del usuario, simulando una conversación real. Idealmente, este estado debería cargarse desde un sistema CRM catastral al inicio de la conversación, utilizando la información del usuario. Esto asume que el agente autentica al usuario o que el usuario ya está autenticado en el sistema. Si este comportamiento necesita modificarse, edita [get_customer(current_customer_id: str) en customer.py](./customer_service/entities/customer.py)

#### 🛠️ Herramientas Especializadas

El agente tiene acceso a las siguientes herramientas especializadas en servicios catastrales:

- `send_call_companion_link(phone_number: str) -> str`: Envía enlace para conexión de video para inspección remota.
- `approve_discount(type: str, value: float, reason: str) -> str`: Aprueba descuentos en servicios (dentro de límites predefinidos).
- `sync_ask_for_approval(type: str, value: float, reason: str) -> str`: Solicita aprobación de descuentos a supervisor.
- `update_salesforce_crm(customer_id: str, details: str) -> dict`: Actualiza registros de usuarios en sistema CRM catastral.
- `access_cart_information(customer_id: str) -> dict`: Recupera el contenido del expediente del usuario.
- `modify_cart(customer_id: str, items_to_add: list, items_to_remove: list) -> dict`: Actualiza el expediente del usuario.
- `get_product_recommendations(property_type: str, customer_id: str) -> dict`: Sugiere servicios adecuados según tipo de propiedad.
- `check_service_availability(service_id: str, office_id: str) -> dict`: Verifica disponibilidad de servicios.
- `schedule_assessment_service(customer_id: str, date: str, time_range: str, details: str) -> dict`: Programa cita para avalúo o inspección.
- `get_available_assessment_times(date: str) -> list`: Recupera horarios disponibles para citas.
- `send_technical_instructions(customer_id: str, property_type: str, delivery_method: str) -> dict`: Envía instrucciones técnicas.
- `generate_qr_code(customer_id: str, discount_value: float, discount_type: str, expiration_days: int) -> dict`: Crea código QR de descuento.

## 🛠️ Configuración e Instalación

### 📎 Prerequisitos

- Python 3.11+
- Poetry (para gestión de dependencias)
- Google ADK SDK (instalado vía Poetry)
- Proyecto de Google Cloud (para integración con Vertex AI Gemini)
- Proyecto GCP configurado: **catastrai-deval**

### 💾 Instalación
1.  **📎 Prerequisitos:**

    Para los pasos de despliegue del Agent Engine, necesitarás
    un Proyecto de Google Cloud. Una vez que hayas creado tu proyecto,
    [instala el Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
    Luego ejecuta el siguiente comando para autenticarte con tu proyecto:
    ```bash
    gcloud auth login
    gcloud config set project catastrai-deval
    ```
    También necesitas habilitar ciertas APIs. Ejecuta el siguiente comando para habilitar
    las APIs requeridas:
    ```bash
    gcloud services enable aiplatform.googleapis.com
    gcloud services enable ml.googleapis.com
    ```

2.  **📋 Clonar el repositorio:**

    ```bash
    git clone [URL_DE_TU_REPOSITORIO]
    cd CatastroAI
    ```

    Para el resto de este tutorial **asegúrate de permanecer en el directorio `CatastroAI`**.

3.  **📦 Instalar dependencias usando Poetry:**

- Si no has instalado poetry antes, ejecuta `pip install poetry` primero. Luego puedes crear tu entorno virtual e instalar todas las dependencias usando:

  **Nota para usuarios de Linux:** Si obtienes un error relacionado con `keyring` durante la instalación, puedes deshabilitarlo ejecutando el siguiente comando:
  ```bash
  poetry config keyring.enabled false
  ```
  Esta es una configuración de una sola vez.

  ```bash
  poetry install
  ```

  Para activar el entorno virtual ejecuta:

  ```bash
  poetry shell
  ```

4.  **🔑 Configurar credenciales de Google Cloud:**

    - Asegúrate de tener el proyecto de Google Cloud **catastrai-deval**.
    - Asegúrate de tener la API de Vertex AI habilitada en tu proyecto.
    - **Copia el archivo de configuración:**
    ```bash
    cp .env.example .env
    ```
    - Edita el archivo `.env` con tu API key real. Alternativamente puedes editar [customer_service/config.py](./customer_service/config.py)

    **Opción A: Vertex AI (Recomendado para producción)**
    ```bash
    # Crear Service Account
    gcloud iam service-accounts create catastro-ai-agent --project=catastrai-deval
    
    # Generar credenciales
    mkdir -p credentials
    gcloud iam service-accounts keys create ./credentials/catastro-ai-credentials.json \
        --iam-account=catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com
    
    # Asignar permisos
    gcloud projects add-iam-policy-binding catastrai-deval \
        --member="serviceAccount:catastro-ai-agent@catastrai-deval.iam.gserviceaccount.com" \
        --role="roles/aiplatform.user"
    ```
    
    **Opción B: Google AI Studio (Más fácil para desarrollo)**
    ```bash
    # Modificar .env para usar AI Studio
    GOOGLE_GENAI_USE_VERTEXAI=false
    GOOGLE_API_KEY=tu-api-key-de-ai-studio
    ```

## 🚀 Ejecutar el Agente

**🔍 Verificación rápida de configuración:**
```bash
poetry run python setup_gcp_a2a.py
```

Puedes ejecutar el agente usando el comando ADK en tu terminal.
Desde el directorio raíz del proyecto:

1.  **💻 Ejecutar agente en CLI:**

    ```bash
    adk run customer_service
    ```

2.  **🌐 Ejecutar agente con ADK Web UI:**
    ```bash
    adk web
    ```
    Selecciona customer_service del dropdown

3.  **📋 Alternativamente, ejecución directa con Poetry:**
    ```bash
    poetry run python customer_service/agent.py
    ```

### 🗣️ Ejemplo de Interacción

Aquí tienes un ejemplo rápido de cómo un usuario podría interactuar con el agente:

**💬 Usuario:**
Hola, necesito ayuda con un trámite catastral

**🤖 CatastroAI:**
¡Hola Carlos! Veo que has sido usuario de nuestros servicios catastrales durante un par de años - ¡apreciamos tu confianza! También veo que tienes algunos documentos en proceso. ¿Cómo puedo ayudarte con tus trámites catastrales hoy?

**💬 Usuario:**
Sí, estoy un poco confundido. Acabo de comprar una propiedad y necesito actualizar los datos catastrales. Tengo algunos documentos pero no estoy seguro si son los correctos para el avalúo.

**🤖 CatastroAI:**
Entiendo perfectamente – puede ser complicado cuando no estás completamente seguro sobre qué documentación necesitas. Vamos a resolverlo juntos. No te preocupes, nos aseguraremos de que tengas toda la documentación correcta. Para ayudarte mejor, ¿podrías compartir una foto o documento de la propiedad? Esto me ayudará a identificar exactamente qué tipo de trámite necesitas.

**💬 Usuario:**
Claro, ¿cómo hago eso?

**🤖 CatastroAI:**
Te acabo de enviar un enlace al número en tu perfil. Solo haz clic en él y abrirá una conexión de video segura.

```tool_code
print(send_call_companion_link(phone_number='+52555123456'))
```

```tool_outputs
{'status': 'success', 'message': 'Enlace enviado a +52555123456'}
```

**💬 Usuario:**
Okay, hice clic en el enlace... ¿puedes ver esto?

**🤖 CatastroAI:**
¡Sí, puedo verte Carlos! ¿Podrías apuntar la cámara hacia los documentos de la propiedad para que pueda analizarlos?

**💬 Usuario:**
¡Por supuesto!
...

## 📋 Evaluación del Agente

Las pruebas de evaluación evalúan el rendimiento general y las capacidades del agente de manera holística.

**🔍 Pasos:**

1.  **🧪 Ejecutar Pruebas de Evaluación:**

    ```bash
    poetry run pytest eval
    ```

    - Este comando ejecuta todos los archivos de prueba dentro del directorio `eval`.

2.  **📈 Evaluación especializada:**

    ```bash
    poetry run python -m eval.test_eval
    ```

## 🧪 Pruebas Unitarias

Las pruebas unitarias se enfocan en probar unidades o componentes individuales del código de forma aislada.

**🔍 Pasos:**

1.  **🎡 Ejecutar Pruebas Unitarias:**

    ```bash
    poetry run pytest tests/unit
    ```

    - Este comando ejecuta todos los archivos de prueba dentro del directorio `tests/unit`.

2.  **📊 Pruebas con cobertura:**

    ```bash
    poetry run pytest tests/unit --cov=customer_service
    ```

## ⚙️ Configuración

Puedes encontrar parámetros adicionales de configuración en [customer_service/config.py](./customer_service/config.py). Esto incluye parámetros como nombre del agente, nombre de la aplicación y modelo LLM utilizado por el agente.

### 📊 Parámetros Principales:
- **Proyecto GCP**: catastrai-deval  
- **Región**: us-central1
- **Modelo**: gemini-2.5-flash
- **Modo**: Vertex AI (Producción) / AI Studio (Desarrollo)

Consulta [CLAUDE.md](./CLAUDE.md) para comandos específicos y configuración detallada.

## 🚀 Despliegue en Google Agent Engine

Para heredar todas las dependencias de tu agente puedes construir el archivo wheel del agente y ejecutar el despliegue.

1.  **📦 Construir archivo WHL del Agente CatastroAI**

    ```bash
    poetry build --format=wheel --output=deployment
    ```

2.  **🌐 Desplegar el agente al motor de agentes**
    Es importante ejecutar deploy.py desde dentro de la carpeta deployment para que las rutas sean correctas

    ```bash
    cd deployment
    python deploy.py
    ```

3.  **🔍 Verificar despliegue**
    ```bash
    poetry run python setup_gcp_a2a.py
    ```

### 🧪 Probar Despliegue

Este fragmento de código es un ejemplo de cómo probar el agente desplegado.

```python
import vertexai
from customer_service.config import Config
from vertexai.preview.reasoning_engines import AdkApp

# Configuración para CatastroAI
configs = Config()

vertexai.init(
    project="catastrai-deval",
    location="us-central1"
)

# Obtener el agente basado en el resource id
agent_engine = vertexai.agent_engines.get('DEPLOYMENT_RESOURCE_NAME') 
# Se ve así: projects/catastrai-deval/locations/us-central1/reasoningEngines/REASONING_ENGINE_ID

# Probar el agente con consulta catastral
for event in remote_agent.stream_query(
    user_id="usuario_catastral_123",
    session_id=session["id"],
    message="Hola, necesito ayuda con un trámite de avalúo",
):
    print(event)
```

## ⚠️ Aviso Legal

Este agente de muestra se proporciona únicamente con fines ilustrativos y no está destinado para uso en producción. Sirve como un ejemplo básico de un agente especializado en servicios catastrales y un punto de partida fundamental para individuos o equipos que desarrollen sus propios agentes.

Esta muestra no ha sido probada rigurosamente, puede contener errores o limitaciones, y no incluye características u optimizaciones típicamente requeridas para un entorno de producción (por ejemplo, manejo robusto de errores, medidas de seguridad, escalabilidad, consideraciones de rendimiento, logging comprehensivo, o opciones de configuración avanzadas).

Los usuarios son únicamente responsables de cualquier desarrollo adicional, pruebas, endurecimiento de seguridad y despliegue de agentes basados en esta muestra. Recomendamos una revisión exhaustiva, pruebas e implementación de salvaguardas apropiadas antes de usar cualquier agente derivado en un sistema en vivo o crítico.

---

## 📞 Contacto y Soporte

**Proyecto**: CatastroAI  
**Versión**: 0.1.0  
**Proyecto GCP**: catastrai-deval  
**Documentación**: Ver [CLAUDE.md](./CLAUDE.md) para configuración detallada  
**Investigación**: Ver [Research/](./Research/) para documentación técnica

🛠️ **Configuración rápida**: Ejecuta `poetry run python setup_gcp_a2a.py` para verificar tu configuración

📚 **Aprende más**: Consulta [Research/Aprendizaje/ServiceAccountsGCP.md](./Research/Aprendizaje/ServiceAccountsGCP.md) para entender Service Accounts