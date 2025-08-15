#!/usr/bin/env python3
"""
Script de configuración inicial para autenticación A2A con GCP
Para el proyecto CatastroAI usando Google ADK
"""

import os
import sys
from pathlib import Path
from customer_service.config import Config
from google.auth import default
from google.auth.exceptions import DefaultCredentialsError


def verificar_variables_entorno():
    """Verifica que las variables de entorno estén configuradas correctamente."""
    print("🔍 Verificando variables de entorno...")
    
    variables_requeridas = [
        'GOOGLE_CLOUD_PROJECT',
        'GOOGLE_CLOUD_LOCATION', 
        'GOOGLE_APPLICATION_CREDENTIALS'
    ]
    
    faltantes = []
    for var in variables_requeridas:
        if not os.getenv(var):
            faltantes.append(var)
    
    if faltantes:
        print(f"❌ Variables faltantes: {', '.join(faltantes)}")
        return False
    
    print("✅ Variables de entorno configuradas correctamente")
    return True


def verificar_credenciales():
    """Verifica que las credenciales de GCP funcionen."""
    print("\n🔐 Verificando credenciales de GCP...")
    
    try:
        credentials, project_id = default()
        print(f"✅ Autenticado correctamente para el proyecto: {project_id}")
        if project_id != "catastrai-deval":
            print(f"⚠️  Nota: Conectado a '{project_id}', esperado 'catastrai-deval'")
        return True, project_id
    except DefaultCredentialsError as e:
        print(f"❌ Error de credenciales: {e}")
        return False, None
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False, None


def verificar_config_adk():
    """Verifica la configuración del ADK."""
    print("\n⚙️ Verificando configuración del ADK...")
    
    try:
        config = Config()
        print(f"✅ Proyecto configurado: {config.CLOUD_PROJECT}")
        print(f"✅ Región configurada: {config.CLOUD_LOCATION}")
        print(f"✅ Vertex AI habilitado: {config.GENAI_USE_VERTEXAI}")
        print(f"✅ Modelo del agente: {config.agent_settings.model}")
        return True
    except Exception as e:
        print(f"❌ Error en configuración ADK: {e}")
        return False


def probar_conexion_vertex_ai():
    """Prueba la conexión con Vertex AI."""
    print("\n🧠 Probando conexión con Vertex AI...")
    
    try:
        from google.cloud import aiplatform
        
        config = Config()
        aiplatform.init(
            project=config.CLOUD_PROJECT,
            location=config.CLOUD_LOCATION
        )
        
        print("✅ Conexión con Vertex AI establecida correctamente")
        return True
    except Exception as e:
        print(f"❌ Error conectando con Vertex AI: {e}")
        return False


def mostrar_siguiente_pasos():
    """Muestra los siguientes pasos para el usuario."""
    print("\n🚀 Configuración completada!")
    print("\nSiguientes pasos:")
    print("1. Ejecutar el agente: poetry run python customer_service/agent.py")
    print("2. Ejecutar pruebas: poetry run pytest")
    print("3. Evaluar el agente: poetry run python -m eval.test_eval")
    print("\n📚 Consulta CLAUDE.md para más comandos disponibles")


def main():
    """Función principal del script de configuración."""
    print("🏗️ Configurando autenticación A2A para CatastroAI")
    print("=" * 50)
    
    # Verificaciones paso a paso
    pasos = [
        verificar_variables_entorno,
        verificar_credenciales,
        verificar_config_adk,
        probar_conexion_vertex_ai
    ]
    
    for paso in pasos:
        if not paso():
            if paso == verificar_credenciales:
                success, _ = paso()
                if not success:
                    print("\n💡 Solución sugerida:")
                    print("1. Verifica que GOOGLE_APPLICATION_CREDENTIALS apunte al archivo JSON correcto")
                    print("2. Verifica que el Service Account tenga los permisos necesarios")
                    return False
            else:
                print(f"\n❌ Fallo en verificación: {paso.__name__}")
                return False
    
    mostrar_siguiente_pasos()
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)