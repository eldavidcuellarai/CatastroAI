#!/usr/bin/env python3
"""
Backend API para CatastroAI - Conecta frontend con agente híbrido
Proporciona endpoints REST para procesar documentos catastrales
"""

import os
import json
import time
import asyncio
from typing import Dict, Any, Optional
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Importar configuración y agente CatastroAI
from customer_service.config import Config
from customer_service.agent import root_agent

app = FastAPI(
    title="CatastroAI Backend API",
    description="API para procesamiento de documentos catastrales con IA híbrida",
    version="1.0.0"
)

# Configurar CORS para permitir requests del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],  # Frontend Next.js + Cloud Shell
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar configuración
try:
    config = Config()
    print(f"✅ Configuración cargada - Proyecto: {config.CLOUD_PROJECT}")
except Exception as e:
    print(f"❌ Error cargando configuración: {e}")
    config = None

class ExtractionResult(BaseModel):
    """Resultado de extracción de datos"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    processing_time: Optional[float] = None
    message: str

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CatastroAI Backend",
        "version": "1.0.0",
        "config_loaded": config is not None,
        "project": config.CLOUD_PROJECT if config else "No configurado"
    }

@app.post("/extract", response_model=ExtractionResult)
async def extract_data_from_document(
    file: UploadFile = File(...),
    document_type: str = "propiedad"
):
    """
    Extrae datos de un documento catastral usando el agente CatastroAI
    """
    start_time = time.time()
    
    try:
        # Validar archivo
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400, 
                detail="Solo se aceptan archivos PDF"
            )
        
        # Crear directorio temporal si no existe
        temp_dir = Path("temp_uploads")
        temp_dir.mkdir(exist_ok=True)
        
        # Guardar archivo temporal
        temp_file_path = temp_dir / f"temp_{int(time.time())}_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        print(f"📄 Procesando archivo: {file.filename}")
        print(f"📁 Archivo guardado en: {temp_file_path}")
        
        # Simular procesamiento con agente (placeholder)
        # TODO: Integrar con el agente real cuando esté disponible
        await asyncio.sleep(1)  # Simular tiempo de procesamiento
        
        # Datos simulados basados en tipo de documento
        if document_type == "propiedad":
            extracted_data = {
                "folio": "12345-2024",
                "propietario": "María González Rodríguez",
                "direccion": "Av. Reforma 123, Col. Centro, CDMX",
                "superficie": "250.5 m²",
                "valor_catastral": "$2,450,000 MXN",
                "clave_catastral": "015-234-567",
                "uso_suelo": "Habitacional",
                "fecha_registro": "2024-08-15"
            }
        else:  # gravamen
            extracted_data = {
                "folio_gravamen": "GRV-78901-2024",
                "tipo_gravamen": "Hipoteca",
                "monto": "$1,500,000 MXN",
                "acreedor": "Banco Nacional de México",
                "deudor": "Juan Pérez López",
                "fecha_constitucion": "2024-08-15",
                "plazo": "20 años",
                "tasa_interes": "8.5% anual"
            }
        
        # Calcular tiempo de procesamiento
        processing_time = time.time() - start_time
        
        # Limpiar archivo temporal
        try:
            temp_file_path.unlink()
        except:
            pass
        
        return ExtractionResult(
            success=True,
            data=extracted_data,
            confidence=0.92,  # Simulado
            processing_time=processing_time,
            message=f"Documento {document_type} procesado exitosamente con CatastroAI"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error procesando archivo: {e}")
        return ExtractionResult(
            success=False,
            message=f"Error procesando archivo: {str(e)}"
        )

@app.get("/config")
async def get_config():
    """Obtiene información de configuración del sistema"""
    if not config:
        raise HTTPException(status_code=500, detail="Configuración no disponible")
    
    return {
        "project": config.CLOUD_PROJECT,
        "location": config.CLOUD_LOCATION,
        "use_vertex_ai": config.GENAI_USE_VERTEXAI,
        "agent_model": config.agent_settings.model,
        "secondary_model": config.agent_settings.secondary_model
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Iniciando CatastroAI Backend API...")
    print("📍 Frontend disponible en: http://localhost:3000")
    print("🔗 API disponible en: http://localhost:8080")
    print("📋 Documentación en: http://localhost:8080/docs")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8080,
        reload=True
    )